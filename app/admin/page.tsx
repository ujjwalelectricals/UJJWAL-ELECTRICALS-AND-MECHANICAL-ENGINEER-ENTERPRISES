"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Row = {
  id:string; created_at:string; name:string; phone:string; email:string;
  machine_type:string; problem:string; location:string; status:string;
  admin_note:string; photo_urls:string[];
};
const statuses=["New","Contacted","Inspection Scheduled","In Progress","Completed","Closed"];

export default function Admin(){
  const [user,setUser]=useState("");
  const [rows,setRows]=useState<Row[]>([]);
  const [filter,setFilter]=useState("All");
  const [error,setError]=useState("");
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const supabase=createClient();
    let active=true;
    (async()=>{
      const u=await supabase.auth.getUser();
      if(!active)return;
      if(!u.data.user){location.href="/admin/login";return;}
      setUser(u.data.user.email||"");
      setReady(true);
      load();
    })();
    async function load(){
      const r=await fetch("/api/admin/requests");
      const d=await r.json();
      if(!active)return;
      if(!r.ok)setError(d.error||"Unable to load");
      else setRows(d.requests||[]);
    }
    return()=>{active=false;};
  },[]);

  async function load(){
    const r=await fetch("/api/admin/requests");
    const d=await r.json();
    if(!r.ok)setError(d.error||"Unable to load");
    else setRows(d.requests||[]);
  }

  async function save(row:Row){
    const r=await fetch("/api/admin/requests",{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id:row.id,status:row.status,admin_note:row.admin_note})
    });
    if(!r.ok){const d=await r.json();setError(d.error||"Save failed");}
    else await load();
  }

  async function signOut(){
    await createClient().auth.signOut();
    location.href="/admin/login";
  }

  if(!ready)return <section className="admin"><div className="wrap"><div className="form"><h1>Loading dashboard…</h1><p>Checking secure admin access.</p></div></div></section>;

  return <section className="admin"><div className="wrap">
    <div className="adminbar">
      <div><div className="eyebrow">Private backend</div><h1 style={{fontSize:46,margin:"10px 0"}}>Service requests</h1><p>{user}</p></div>
      <button className="btn light" onClick={signOut}>Sign out</button>
    </div>
    {error&&<div className="status err">{error}</div>}
    <div className="finder" style={{marginBottom:16,display:"flex",gap:8,flexWrap:"wrap"}}>
      {["All",...statuses].map(x=><button className={x===filter?"btn":"btn light"} key={x} onClick={()=>setFilter(x)}>{x}</button>)}
    </div>
    <div className="tablewrap"><table className="table">
      <thead><tr><th>Lead</th><th>Machine</th><th>Problem</th><th>Location</th><th>Status / note</th><th>Photos</th><th/></tr></thead>
      <tbody>
      {rows.filter(r=>filter==="All"||r.status===filter).map(r=><tr key={r.id}>
        <td><b>{r.name}</b><br/>{r.phone}<br/>{r.email||"—"}<br/><small>{new Date(r.created_at).toLocaleString()}</small></td>
        <td>{r.machine_type}</td><td>{r.problem}</td><td>{r.location}</td>
        <td>
          <select value={r.status} onChange={e=>setRows(a=>a.map(v=>v.id===r.id?{...v,status:e.target.value}:v))}>{statuses.map(x=><option key={x}>{x}</option>)}</select>
          <textarea value={r.admin_note||""} onChange={e=>setRows(a=>a.map(v=>v.id===r.id?{...v,admin_note:e.target.value}:v))} placeholder="Internal note"/>
        </td>
        <td>{r.photo_urls?.map((u,i)=><a className="pill" key={u} href={u} target="_blank" rel="noreferrer">Photo {i+1}</a>)}</td>
        <td><button className="btn" onClick={()=>save(r)}>Save</button></td>
      </tr>)}
      </tbody>
    </table></div>
  </div></section>;
}