import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { seal } from "../src/lib/auth";
import { POST as create, GET as listCharges } from "../src/app/api/finance/charges/route";
import { POST as record, GET as listPending } from "../src/app/api/finance/payments/route";
import { GET as detail } from "../src/app/api/finance/payments/[id]/route";
import { POST as verify } from "../src/app/api/finance/payments/[id]/verify/route";
import { POST as reject } from "../src/app/api/finance/payments/[id]/reject/route";
import { POST as voidPayment } from "../src/app/api/finance/payments/[id]/void/route";
import { GET as balance } from "../src/app/api/finance/students/[studentRef]/route";
import { GET as studentPayments } from "../src/app/api/finance/students/[studentRef]/payments/route";
import { GET as recap } from "../src/app/api/finance/reports/route";
const json=(path:string,body:unknown)=>new NextRequest(`http://localhost:3100${path}`,{method:"POST",headers:{origin:"http://localhost:3100","content-type":"application/json"},body:JSON.stringify(body)});

test("endpoint keuangan menolak akses tanpa sesi",async()=>{
 assert.equal((await create(json("/api/finance/charges",{studentRef:"S",kind:"SPP",period:"2026-11",amount:1}))).status,401);
 assert.equal((await record(json("/api/finance/payments",{chargeId:"x",amount:1,reference:"X"}))).status,401);
 assert.equal((await verify(json("/api/finance/payments/x/verify",{}),{params:Promise.resolve({id:"x"})})).status,401);
 assert.equal((await reject(json("/api/finance/payments/x/reject",{reason:"x"}),{params:Promise.resolve({id:"x"})})).status,401);
 assert.equal((await voidPayment(json("/api/finance/payments/x/void",{reason:"x"}),{params:Promise.resolve({id:"x"})})).status,401);
 assert.equal((await detail(new NextRequest("http://localhost:3100/api/finance/payments/x"),{params:Promise.resolve({id:"x"})})).status,401);
 assert.equal((await balance(new NextRequest("http://localhost:3100/api/finance/students/S"),{params:Promise.resolve({studentRef:"S"})})).status,401);
 assert.equal((await studentPayments(new NextRequest("http://localhost:3100/api/finance/students/S/payments"),{params:Promise.resolve({studentRef:"S"})})).status,401);
 assert.equal((await listCharges(new NextRequest("http://localhost:3100/api/finance/charges?studentRef=S"))).status,401);
 assert.equal((await listPending(new NextRequest("http://localhost:3100/api/finance/payments"))).status,401);
 assert.equal((await recap(new NextRequest("http://localhost:3100/api/finance/reports?scope=monthly&year=2026"))).status,401);
});

test("endpoint mutasi menolak origin lintas situs sebelum akses database",async()=>{
 const request=new NextRequest("http://localhost:3100/api/finance/charges",{method:"POST",headers:{origin:"https://external.example","content-type":"application/json"},body:"{}"});
 assert.equal((await create(request)).status,403);
});

test("input manual tagihan tidak aktif sebelum aturan keuangan disahkan",async()=>{
 const oldKey=process.env.SESSION_KEY,oldFlag=process.env.FINANCE_MANUAL_ENTRY_ENABLED;
 try{
  process.env.SESSION_KEY=randomBytes(32).toString("hex");
  delete process.env.FINANCE_MANUAL_ENTRY_ENABLED;
  const request=json("/api/finance/charges",{studentRef:"S",kind:"SPP",period:"2026-11",amount:100});
  request.cookies.set("tu_session",seal({actor:{subject:"petugas-uji",role:"tu_staff"},expires:Date.now()+60000}));
  assert.equal((await create(request)).status,503);
  const rejectRequest=json("/api/finance/payments/x/reject",{reason:"salah nominal"});
  rejectRequest.cookies.set("tu_session",seal({actor:{subject:"pemeriksa-uji",role:"tu_verifier"},expires:Date.now()+60000}));
  assert.equal((await reject(rejectRequest,{params:Promise.resolve({id:"x"})})).status,503);
 }finally{
  if(oldKey===undefined)delete process.env.SESSION_KEY;else process.env.SESSION_KEY=oldKey;
  if(oldFlag===undefined)delete process.env.FINANCE_MANUAL_ENTRY_ENABLED;else process.env.FINANCE_MANUAL_ENTRY_ENABLED=oldFlag;
 }
});

test("antrean hanya untuk verifikator dan daftar tagihan perlu referensi siswa",async()=>{
 const oldKey=process.env.SESSION_KEY;
 try{
  process.env.SESSION_KEY=randomBytes(32).toString("hex");
  const session=(role:"tu_staff"|"tu_verifier")=>seal({actor:{subject:"aktor-uji",role},expires:Date.now()+60000});
  const pending=new NextRequest("http://localhost:3100/api/finance/payments");pending.cookies.set("tu_session",session("tu_staff"));
  assert.equal((await listPending(pending)).status,403);
  const charges=new NextRequest("http://localhost:3100/api/finance/charges");charges.cookies.set("tu_session",session("tu_staff"));
  assert.equal((await listCharges(charges)).status,400);
  const badRecap=new NextRequest("http://localhost:3100/api/finance/reports?scope=weekly&year=2026");badRecap.cookies.set("tu_session",session("tu_staff"));
  assert.equal((await recap(badRecap)).status,400);
  const badYear=new NextRequest("http://localhost:3100/api/finance/reports?scope=monthly&year=abc");badYear.cookies.set("tu_session",session("tu_staff"));
  assert.equal((await recap(badYear)).status,400);
  const badRef=new NextRequest("http://localhost:3100/api/finance/students/nama%20siswa/payments");badRef.cookies.set("tu_session",session("tu_staff"));
  assert.equal((await studentPayments(badRef,{params:Promise.resolve({studentRef:"nama siswa"})})).status,400);
 }finally{if(oldKey===undefined)delete process.env.SESSION_KEY;else process.env.SESSION_KEY=oldKey;}
});

test("API TU mencatat pembayaran menunggu, lalu verifikator lain mengesahkan",async()=>{
 const oldKey=process.env.SESSION_KEY,oldFlag=process.env.FINANCE_MANUAL_ENTRY_ENABLED;
 try{
  process.env.SESSION_KEY=randomBytes(32).toString("hex");
  process.env.FINANCE_MANUAL_ENTRY_ENABLED="true";
  const session=(subject:string,role:"tu_staff"|"tu_verifier")=>seal({actor:{subject,role},expires:Date.now()+60000});
  const authenticated=(request:NextRequest,subject:string,role:"tu_staff"|"tu_verifier")=>{request.cookies.set("tu_session",session(subject,role));return request;};
  const studentRef=`SINTETIS-${crypto.randomUUID()}`;
  const created=await create(authenticated(json("/api/finance/charges",{studentRef,kind:"SPP",period:"2026-11",amount:120000}),"petugas-uji","tu_staff"));
  assert.equal(created.status,200);
  const charge=await created.json();
  const duplicate=await create(authenticated(json("/api/finance/charges",{studentRef,kind:"SPP",period:"2026-11",amount:120000}),"petugas-uji","tu_staff"));
  assert.equal(duplicate.status,409);
  const listed=await listCharges(authenticated(new NextRequest(`http://localhost:3100/api/finance/charges?studentRef=${studentRef}`),"petugas-uji","tu_staff"));
  assert.equal((await listed.json())[0].id,charge.id);
  const recorded=await record(authenticated(json("/api/finance/payments",{chargeId:charge.id,amount:50000,reference:`BUKTI-${crypto.randomUUID()}`}),"petugas-uji","tu_staff"));
  assert.equal(recorded.status,200);
  const payment=await recorded.json();
  assert.equal(payment.status,"PENDING");
  const duplicatePayment=await record(authenticated(json("/api/finance/payments",{chargeId:charge.id,amount:1,reference:payment.reference}),"petugas-uji","tu_staff"));
  assert.equal(duplicatePayment.status,409);
  const readBalance=()=>balance(authenticated(new NextRequest(`http://localhost:3100/api/finance/students/${studentRef}`),"petugas-uji","tu_staff"),{params:Promise.resolve({studentRef})});
  assert.deepEqual(await (await readBalance()).json(),{due:120000,verified:0,pending:50000,remaining:120000});
  const queue=await listPending(authenticated(new NextRequest("http://localhost:3100/api/finance/payments"),"pemeriksa-uji","tu_verifier"));
  assert.ok((await queue.json()).some((x:{id:string})=>x.id===payment.id));
  const approved=await verify(authenticated(json(`/api/finance/payments/${payment.id}/verify`,{}),"pemeriksa-uji","tu_verifier"),{params:Promise.resolve({id:payment.id})});
  assert.equal(approved.status,200);
  assert.deepEqual(await (await readBalance()).json(),{due:120000,verified:50000,pending:0,remaining:70000});
  const rows=await studentPayments(authenticated(new NextRequest(`http://localhost:3100/api/finance/students/${studentRef}/payments`),"petugas-uji","tu_staff"),{params:Promise.resolve({studentRef})});
  assert.equal((await rows.json())[0].payments[0].status,"VERIFIED");
 }finally{
  if(oldKey===undefined)delete process.env.SESSION_KEY;else process.env.SESSION_KEY=oldKey;
  if(oldFlag===undefined)delete process.env.FINANCE_MANUAL_ENTRY_ENABLED;else process.env.FINANCE_MANUAL_ENTRY_ENABLED=oldFlag;
 }
});

test("penolakan dan pembatalan hanya oleh pemeriksa lain dan tercatat di riwayat",async()=>{
 const oldKey=process.env.SESSION_KEY,oldFlag=process.env.FINANCE_MANUAL_ENTRY_ENABLED;
 try{
  process.env.SESSION_KEY=randomBytes(32).toString("hex");
  process.env.FINANCE_MANUAL_ENTRY_ENABLED="true";
  const session=(subject:string,role:"tu_staff"|"tu_verifier")=>seal({actor:{subject,role},expires:Date.now()+60000});
  const authenticated=(request:NextRequest,subject:string,role:"tu_staff"|"tu_verifier")=>{request.cookies.set("tu_session",session(subject,role));return request;};
  const studentRef=`SINTETIS-${crypto.randomUUID()}`;
  const created=await create(authenticated(json("/api/finance/charges",{studentRef,kind:"SPP",period:"2026-12",amount:90000}),"petugas-uji","tu_staff"));
  const charge=await created.json();
  const recorded=await record(authenticated(json("/api/finance/payments",{chargeId:charge.id,amount:90000,reference:`BUKTI-${crypto.randomUUID()}`}),"petugas-uji","tu_staff"));
  const payment=await recorded.json();
  const rejectedByStaff=await reject(authenticated(json(`/api/finance/payments/${payment.id}/reject`,{reason:"salah nominal"}),"petugas-uji","tu_staff"),{params:Promise.resolve({id:payment.id})});
  assert.equal(rejectedByStaff.status,403);
  const rejected=await reject(authenticated(json(`/api/finance/payments/${payment.id}/reject`,{reason:"salah nominal"}),"pemeriksa-uji","tu_verifier"),{params:Promise.resolve({id:payment.id})});
  assert.equal(rejected.status,200);
  assert.equal((await rejected.json()).status,"REJECTED");
  const voidBeforeVerify=await voidPayment(authenticated(json(`/api/finance/payments/${payment.id}/void`,{reason:"percobaan"}),"pemeriksa-uji","tu_verifier"),{params:Promise.resolve({id:payment.id})});
  assert.equal(voidBeforeVerify.status,409);
  const corrected=await record(authenticated(json("/api/finance/payments",{chargeId:charge.id,amount:90000,reference:`BUKTI-${crypto.randomUUID()}`,replacesPaymentId:payment.id,reason:"nominal seharusnya 90000"}),"petugas-uji","tu_staff"));
  assert.equal(corrected.status,200);
  const correction=await corrected.json();
  assert.equal(correction.replacesPaymentId,payment.id);
  const verified=await verify(authenticated(json(`/api/finance/payments/${correction.id}/verify`,{}),"pemeriksa-uji","tu_verifier"),{params:Promise.resolve({id:correction.id})});
  assert.equal(verified.status,200);
  const voided=await voidPayment(authenticated(json(`/api/finance/payments/${correction.id}/void`,{reason:"dibatalkan"}),"pemeriksa-uji","tu_verifier"),{params:Promise.resolve({id:correction.id})});
  assert.equal(voided.status,200);
  assert.equal((await voided.json()).status,"VOIDED");
  const history=await detail(authenticated(new NextRequest(`http://localhost:3100/api/finance/payments/${payment.id}`),"pemeriksa-uji","tu_verifier"),{params:Promise.resolve({id:payment.id})});
  const events=await history.json();
  assert.deepEqual(events.history.map((x:{action:string})=>x.action),["PAYMENT_RECORDED","PAYMENT_REJECTED"]);
  const missing=await detail(authenticated(new NextRequest(`http://localhost:3100/api/finance/payments/${crypto.randomUUID()}`),"petugas-uji","tu_staff"),{params:Promise.resolve({id:crypto.randomUUID()})});
  assert.equal(missing.status,404);
 }finally{
  if(oldKey===undefined)delete process.env.SESSION_KEY;else process.env.SESSION_KEY=oldKey;
  if(oldFlag===undefined)delete process.env.FINANCE_MANUAL_ENTRY_ENABLED;else process.env.FINANCE_MANUAL_ENTRY_ENABLED=oldFlag;
 }
});

test("rekap hanya untuk petugas dan pemeriksa, principal ditolak",async()=>{
 const oldKey=process.env.SESSION_KEY;
 try{
  process.env.SESSION_KEY=randomBytes(32).toString("hex");
  const session=(role:"tu_staff"|"tu_verifier")=>seal({actor:{subject:"aktor-uji",role},expires:Date.now()+60000});
  const monthly=new NextRequest("http://localhost:3100/api/finance/reports?scope=monthly&year=2026");monthly.cookies.set("tu_session",session("tu_staff"));
  const body=await (await recap(monthly)).json();
  assert.equal(body.scope,"monthly");
  assert.equal(body.rows.length,12);
  assert.ok(body.definitions.status.includes("provisional"));
 }finally{if(oldKey===undefined)delete process.env.SESSION_KEY;else process.env.SESSION_KEY=oldKey;}
});
