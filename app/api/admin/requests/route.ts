import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";
import { admin, isAdminEmail } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function authorized() {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getUser();
  return isAdminEmail(data.user?.email);
}

export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = admin();
  const result = await db.from("service_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (result.error) return NextResponse.json({ error: "Unable to load requests" }, { status: 500 });

  const requests = await Promise.all((result.data || []).map(async (row) => {
    const paths = Array.isArray(row.photo_paths) ? row.photo_paths : [];
    const signed = paths.length
      ? await db.storage.from("service-uploads").createSignedUrls(paths, 3600)
      : { data: [] };

    return {
      ...row,
      photo_urls: (signed.data || []).map((item) => item.signedUrl || undefined).filter(Boolean)
    };
  }));

  return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
  if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const allowed = ["New", "Contacted", "Inspection Scheduled", "In Progress", "Completed", "Closed"];

  if (!allowed.includes(body.status) || typeof body.id !== "string") {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const result = await admin().from("service_requests").update({
    status: body.status,
    admin_note: String(body.admin_note || "").slice(0, 2000),
    updated_at: new Date().toISOString()
  }).eq("id", body.id);

  if (result.error) return NextResponse.json({ error: "Unable to save" }, { status: 500 });

  return NextResponse.json({ ok: true });
}