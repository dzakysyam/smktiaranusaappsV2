"use client";
import { useState } from "react";
import Link from "next/link";
import type { Actor } from "@/lib/workflow";

type Charge={id:string;studentRef:string;kind:string;period:string;amount:number};
type Payment={id:string;chargeId:string;amount:number;reference:string;recordedBy:string;status:string;reason?:string;replacesPaymentId?:string};
type Row={charge:Charge;payments:Payment[]};
type Balance={due:number;verified:number;pending:number;remaining:number};
type RecapRow={period:string;label:string;charges:number;verified:number;pending:number;remaining:number;students:number;percent:number};
type Recap={scope:string;label:string;rows:RecapRow[];totals:Omit<RecapRow,"period"|"label">;unallocated:{period:string;charges:number;verified:number;pending:number}[];definitions:Record<string,string>};

const rupiah=(n:number)=>`Rp ${new Intl.NumberFormat("id-ID").format(n||0)}`;
const statusLabel:Record<string,string>={PENDING:"Menunggu verifikasi",VERIFIED:"Terverifikasi",REJECTED:"Ditolak",VOIDED:"Dibatalkan"};

export function KeuanganPanel({actor}:{actor:Actor}){
 const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const [studentRef,setStudentRef]=useState("");const [rows,setRows]=useState<Row[]>([]);const [balance,setBalance]=useState<Balance|null>(null);
 const [kind,setKind]=useState("SPP");const [period,setPeriod]=useState("");const [amount,setAmount]=useState("");
 const [chargeId,setChargeId]=useState("");const [reference,setReference]=useState("");const [paymentAmount,setPaymentAmount]=useState("");const [replaces,setReplaces]=useState("");const [reason,setReason]=useState("");
 const [pending,setPending]=useState<Payment[]>([]);const [verified,setVerified]=useState<Payment[]>([]);const [reasons,setReasons]=useState<Record<string,string>>({});
 const [scope,setScope]=useState("monthly");const [year,setYear]=useState(String(new Date().getFullYear()));const [recap,setRecap]=useState<Recap|null>(null);
 const [loading,setLoading]=useState(false);

 async function api(path:string,method="GET",body?:unknown){
  setError("");setNotice("");
  try{const resp=await fetch(`/api/${path}`,{method,headers:{"content-type":"application/json"},body:body?JSON.stringify(body):undefined});
   const text=await resp.text();const x=text?JSON.parse(text):null;
   if(!resp.ok)throw new Error(x?.error||"Permintaan gagal");return x;}
  catch(e){setError(e instanceof Error?e.message:"Kesalahan jaringan");return null;}
 }
 async function loadStudent(ref:string){const target=ref.trim();if(!target)return;setLoading(true);
  const data=await api(`finance/students/${encodeURIComponent(target)}/payments`);
  const saldo=await api(`finance/students/${encodeURIComponent(target)}`);
  setRows(data??[]);setBalance(saldo??null);setLoading(false);}
 async function loadQueue(){if(actor.role!=="tu_verifier")return;
  const antrean=await api("finance/payments?status=PENDING");const sah=await api("finance/payments?status=VERIFIED");
  setPending(antrean??[]);setVerified(sah??[]);}
 async function submitCharge(e:React.FormEvent){e.preventDefault();
  const data=await api("finance/charges","POST",{studentRef:studentRef.trim(),kind,period:period.trim(),amount:Number(amount)});
  if(!data)return;setNotice(`Tagihan ${kind} ${period} untuk ${studentRef.trim()} disimpan.`);setPeriod("");setAmount("");
  await loadStudent(studentRef);}
 async function submitPayment(e:React.FormEvent){e.preventDefault();
  const body:{chargeId:string;amount:number;reference:string;replacesPaymentId?:string;reason?:string}={chargeId,amount:Number(paymentAmount),reference:reference.trim()};
  if(replaces){body.replacesPaymentId=replaces;body.reason=reason.trim();}
  const data=await api("finance/payments","POST",body);
  if(!data)return;setNotice(`Pembayaran ${rupiah(Number(paymentAmount))} dicatat dengan status ${statusLabel[data.status]}.`);setReference("");setPaymentAmount("");setReplaces("");setReason("");
  await loadStudent(studentRef);}
 async function verify(id:string){const data=await api(`finance/payments/${id}/verify`,"POST",{});if(!data)return;setNotice("Pembayaran diverifikasi.");await loadQueue();await loadStudent(studentRef);}
 async function reject(id:string){const data=await api(`finance/payments/${id}/reject`,"POST",{reason:(reasons[id]||"").trim()});if(!data)return;setNotice("Pembayaran ditolak dan alasannya tercatat.");await loadQueue();await loadStudent(studentRef);}
 async function voidPayment(id:string){const data=await api(`finance/payments/${id}/void`,"POST",{reason:(reasons[id]||"").trim()});if(!data)return;setNotice("Pembayaran dibatalkan dan alasannya tercatat.");await loadQueue();await loadStudent(studentRef);}
 async function loadRecap(){const data=await api(`finance/reports?scope=${scope}&year=${year}`);if(data)setRecap(data);}

 const rejected=rows.flatMap(r=>r.payments.filter(p=>p.status==="REJECTED"||p.status==="VOIDED").map(p=>({...p,chargeId:r.charge.id})));
 const openCharge=rows.find(r=>r.charge.id===chargeId);
 const pendingRoom=rows.reduce((sum,r)=>sum+r.payments.filter(p=>p.status==="PENDING").reduce((s,p)=>s+p.amount,0),0);

 return <>
  <h1>Keuangan siswa</h1>
  <p className="muted">Masuk sebagai {actor.role==="tu_staff"?"petugas TU":"pemeriksa"} • {actor.subject}</p>
  <nav><Link href="/surat">Surat keluar</Link><Link href="/laporan">Laporan TU</Link><Link href="/keuangan">Keuangan</Link></nav>
  <p role="alert" className="error">{error}</p>
  <p role="status">{notice}</p>

  <section className="card">
   <h2>Cari siswa</h2>
   <p className="muted">Gunakan referensi siswa resmi dari sumber data, bukan nama atau NISN.</p>
   <form onSubmit={e=>{e.preventDefault();void loadStudent(studentRef);}}>
    <label>Referensi siswa<input required value={studentRef} onChange={e=>setStudentRef(e.target.value)} placeholder="contoh SISWA-0001"/></label>
    <button disabled={loading}>Cari tagihan</button>
   </form>
   {balance?<div className="scroll"><table><caption className="muted">Kewajiban siswa</caption><tbody>
    <tr><th>Total tagihan</th><td>{rupiah(balance.due)}</td></tr>
    <tr><th>Terverifikasi</th><td>{rupiah(balance.verified)}</td></tr>
    <tr><th>Menunggu verifikasi</th><td>{rupiah(balance.pending)}</td></tr>
    <tr><th>Sisa</th><td><strong>{rupiah(balance.remaining)}</strong></td></tr>
   </tbody></table></div>:null}
  </section>

  {actor.role==="tu_staff"?<>
   <section className="card">
    <h2>Buat tagihan</h2>
    <form onSubmit={submitCharge}>
     <label>Referensi siswa<input required value={studentRef} onChange={e=>setStudentRef(e.target.value)}/></label>
     <label>Jenis tagihan<select value={kind} onChange={e=>setKind(e.target.value)}><option value="SPP">SPP bulanan</option><option value="SPMB">SPMB</option><option value="TAHUNAN">Tahunan</option></select></label>
     <label>Periode<input required value={period} onChange={e=>setPeriod(e.target.value)} placeholder="contoh 2026-11"/></label>
     <label>Nominal<input required type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
     <button>Simpan tagihan</button>
    </form>
   </section>

   <section className="card">
    <h2>Catat pembayaran</h2>
    {rows.length===0?<p className="muted">Cari siswa lebih dahulu untuk melihat tagihan yang tersedia.</p>:null}
    <form onSubmit={submitPayment}>
     <label>Tagihan<select required value={chargeId} onChange={e=>setChargeId(e.target.value)}>
      <option value="">pilih tagihan</option>
      {rows.map(r=><option key={r.charge.id} value={r.charge.id}>{r.charge.kind} {r.charge.period} • {rupiah(r.charge.amount)} • sisa {rupiah(r.charge.amount-r.payments.filter(p=>p.status==="PENDING"||p.status==="VERIFIED").reduce((s,p)=>s+p.amount,0))}</option>)}
     </select></label>
     <label>Nominal pembayaran<input required type="number" min="1" step="1" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)}/></label>
     <label>Referensi bukti<input required value={reference} onChange={e=>setReference(e.target.value)} placeholder="contoh BUKTI-2026-11-001"/></label>
     <label>Koreksi pembayaran ditolak
      <select value={replaces} onChange={e=>setReplaces(e.target.value)}>
       <option value="">bukan koreksi</option>
       {rejected.map(p=><option key={p.id} value={p.id}>{statusLabel[p.status]} • {rupiah(p.amount)} • {p.reference}</option>)}
      </select>
     </label>
     {replaces?<label>Alasan koreksi<input required value={reason} onChange={e=>setReason(e.target.value)}/></label>:null}
     {openCharge&&Number(paymentAmount)>openCharge.charge.amount-openCharge.payments.filter(p=>p.status==="PENDING"||p.status==="VERIFIED").reduce((s,p)=>s+p.amount,0)?<p className="error">Nominal melebihi sisa tagihan yang bisa dicatat.</p>:null}
     <button disabled={!chargeId}>Catat pembayaran</button>
    </form>
    {rows.length?<> <h3>Riwayat pembayaran siswa ini</h3><div className="scroll"><table>
     <thead><tr><th>Tagihan</th><th>Nominal</th><th>Referensi</th><th>Status</th><th>Alasan</th></tr></thead>
     <tbody>{rows.flatMap(r=>r.payments.map(p=><tr key={p.id}><td>{r.charge.kind} {r.charge.period}</td><td>{rupiah(p.amount)}</td><td>{p.reference}</td><td>{statusLabel[p.status]??p.status}</td><td>{p.reason??"-"}</td></tr>))}</tbody>
    </table></div></>:null}
   </section>
  </>:null}

  {actor.role==="tu_verifier"?<>
   <section className="card">
    <h2>Antrean verifikasi</h2>
    <button onClick={()=>void loadQueue()}>Muat antrean</button>
    {pending.length===0?<p className="muted">Belum ada pembayaran yang menunggu verifikasi.</p>:null}
    <div className="scroll"><table>
     <thead><tr><th>Nominal</th><th>Referensi</th><th>Dicatat oleh</th><th>Alasan</th><th>Aksi</th></tr></thead>
     <tbody>{pending.map(p=><tr key={p.id}>
      <td>{rupiah(p.amount)}</td><td>{p.reference}</td><td>{p.recordedBy}</td>
      <td><input aria-label="Alasan penolakan" value={reasons[p.id]??""} onChange={e=>setReasons(s=>({...s,[p.id]:e.target.value}))}/></td>
      <td><button onClick={()=>void verify(p.id)}>Verifikasi</button> <button onClick={()=>void reject(p.id)}>Tolak</button></td>
     </tr>)}</tbody>
    </table></div>
   </section>
   <section className="card">
    <h2>Pembayaran terverifikasi</h2>
    <p className="muted">Pembatalan pembayaran terverifikasi mengembalikan nominal ke sisa kewajiban dan wajib beralasan.</p>
    <div className="scroll"><table>
     <thead><tr><th>Nominal</th><th>Referensi</th><th>Alasan pembatalan</th><th>Aksi</th></tr></thead>
     <tbody>{verified.map(p=><tr key={p.id}>
      <td>{rupiah(p.amount)}</td><td>{p.reference}</td>
      <td><input aria-label="Alasan pembatalan" value={reasons[p.id]??""} onChange={e=>setReasons(s=>({...s,[p.id]:e.target.value}))}/></td>
      <td><button onClick={()=>void voidPayment(p.id)}>Batalkan</button></td>
     </tr>)}</tbody>
    </table></div>
   </section>
  </>:null}

  <section className="card">
   <h2>Rekap pembayaran</h2>
   <form onSubmit={e=>{e.preventDefault();void loadRecap();}}>
    <label>Jenis rekap<select value={scope} onChange={e=>setScope(e.target.value)}><option value="monthly">Bulanan</option><option value="semester">Semester</option></select></label>
    <label>Tahun<input required type="number" min="2000" max="2100" value={year} onChange={e=>setYear(e.target.value)}/></label>
    <button>Tampilkan rekap</button>
   </form>
   {recap?<> <h3>{recap.label}</h3><div className="scroll"><table>
    <thead><tr><th>Periode</th><th>Tagihan</th><th>Terverifikasi</th><th>Menunggu</th><th>Sisa</th><th>Siswa</th><th>Persen</th></tr></thead>
    <tbody>{recap.rows.map(r=><tr key={r.period}><td>{r.label}</td><td>{rupiah(r.charges)}</td><td>{rupiah(r.verified)}</td><td>{rupiah(r.pending)}</td><td>{rupiah(r.remaining)}</td><td>{r.students}</td><td>{r.percent}%</td></tr>)}
     <tr><th>Total</th><th>{rupiah(recap.totals.charges)}</th><th>{rupiah(recap.totals.verified)}</th><th>{rupiah(recap.totals.pending)}</th><th>{rupiah(recap.totals.remaining)}</th><th>{recap.totals.students}</th><th>{recap.totals.percent}%</th></tr>
    </tbody>
   </table></div>
   {recap.unallocated.length?<> <h3>Belum dialokasikan ke periode</h3><div className="scroll"><table>
    <thead><tr><th>Periode tagihan</th><th>Tagihan</th><th>Terverifikasi</th><th>Menunggu</th></tr></thead>
    <tbody>{recap.unallocated.map(u=><tr key={u.period}><td>{u.period}</td><td>{rupiah(u.charges)}</td><td>{rupiah(u.verified)}</td><td>{rupiah(u.pending)}</td></tr>)}</tbody>
   </table></div></>:null}
   <h3>Definisi metrik</h3><ul>{Object.entries(recap.definitions).map(([k,v])=><li key={k}><strong>{k}</strong>: {v}</li>)}</ul>
   </>:null}
  </section>

  {pendingRoom>0?<p className="muted">Ada {rupiah(pendingRoom)} menunggu verifikasi untuk siswa ini.</p>:null}
 </>;
}
