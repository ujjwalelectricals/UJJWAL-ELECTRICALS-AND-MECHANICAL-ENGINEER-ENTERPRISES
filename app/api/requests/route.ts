import { NextResponse } from "next/server";
import { z } from "zod";
import { admin } from "@/lib/supabase-admin";
import { site } from "@/lib/data";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9+()\-\s]{8,20}$/),
  email: z.union([z.literal(""), z.string().email()]),
  machineType: z.string().min(2).max(120),
  problem: z.string().min(5).max(2000),
  location: z.string().min(2).max(160),
  preferredContact: z.enum(["Call", "WhatsApp", "Email"]),
  honeypot: z.string().max(0).optional()
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    if (String(form.get("honeypot") || "")) return NextResponse.json({ ok: true });

    const input = Object.fromEntries(
      ["name", "phone", "email", "machineType", "problem", "location", "preferredContact", "honeypot"]
        .map((key) => [key, String(form.get(key) || "")])
    );
    const parsed = schema.safeParse(input);
    if (!parsed.success) return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });

    const db = admin();
    const recent = await db.from("service_requests")
      .select("id")
      .eq("phone", parsed.data.phone)
      .gte("created_at", new Date(Date.now() - 60000).toISOString())
      .limit(1);

    if (recent.data?.length) {
      return NextResponse.json({ error: "A request with this phone number was just submitted." }, { status: 429 });
    }

    const files = form.getAll("photos").filter(
      (item): item is File => item instanceof File && item.size > 0
    );
    if (files.length > 3) {
      return NextResponse.json({ error: "Maximum 3 photos." }, { status: 400 });
    }

    const paths: string[] = [];
    for (const file of files) {
      if (
        file.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      ) {
        return NextResponse.json(
          { error: "Photos must be JPG, PNG or WebP and 5 MB or smaller." },
          { status: 400 }
        );
      }

      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = new Date().toISOString().slice(0, 10) + "/" + crypto.randomUUID() + "." + extension;
      const upload = await db.storage.from("service-uploads").upload(
        path,
        Buffer.from(await file.arrayBuffer()),
        { contentType: file.type }
      );

      if (upload.error) {
        return NextResponse.json(
          { error: "Photo upload failed. Please retry without the photo." },
          { status: 500 }
        );
      }
      paths.push(path);
    }

    const row = {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      machine_type: parsed.data.machineType,
      problem: parsed.data.problem,
      location: parsed.data.location,
      preferred_contact: parsed.data.preferredContact,
      photo_paths: paths,
      status: "New"
    };

    const inserted = await db.from("service_requests").insert(row).select("id").single();
    if (inserted.error) {
      return NextResponse.json({ error: "Could not save the request." }, { status: 500 });
    }

    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM && process.env.LEADS_TO_EMAIL) {
      const emailBody = {
        from: process.env.RESEND_FROM,
        to: [process.env.LEADS_TO_EMAIL],
        subject: "New machine service request - " + parsed.data.machineType,
        html:
          "<h2>New service request</h2>" +
          "<p><b>Name:</b> " + parsed.data.name + "</p>" +
          "<p><b>Phone:</b> " + parsed.data.phone + "</p>" +
          "<p><b>Machine:</b> " + parsed.data.machineType + "</p>" +
          "<p><b>Location:</b> " + parsed.data.location + "</p>" +
          "<p><b>Problem:</b> " + parsed.data.problem + "</p>"
      };

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.RESEND_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailBody)
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, id: inserted.data.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error. Please call " + site.phone + "." }, { status: 500 });
  }
}