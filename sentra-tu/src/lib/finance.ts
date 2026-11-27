import { randomUUID } from "node:crypto";
import { DomainError, type Actor } from "./workflow";

export type ChargeKind = "SPP" | "SPMB" | "TAHUNAN";
export type Charge = { id:string; studentRef:string; kind:ChargeKind; period:string; amount:number; createdBy:string };
export type PaymentStatus = "PENDING"|"VERIFIED"|"REJECTED"|"VOIDED";
export type Payment = { id:string; chargeId:string; amount:number; reference:string; recordedBy:string; status:PaymentStatus; verifiedBy?:string; voidedBy?:string; reason?:string; replacesPaymentId?:string };
export type FinanceEvent = { targetId:string; action:string; actorId:string; createdAt:Date };
export type ChargeWithPayments = { charge:Charge; payments:Payment[] };
export type RecapRow = { period:string; label:string; charges:number; verified:number; pending:number; remaining:number; students:number; percent:number };
export type RecapTotal = { charges:number; verified:number; pending:number; remaining:number; students:number; percent:number };
export type RecapUnallocated = { period:string; charges:number; verified:number; pending:number };
export type Recap = { scope:"monthly"|"semester"; label:string; rows:RecapRow[]; totals:RecapTotal; unallocated:RecapUnallocated[]; definitions:{ numerator:string; denominator:string; percentRule:string; periodMapping:string; semesterRule:string; status:string } };
export interface FinanceStore {
 transaction<T>(fn:(db:FinanceStore)=>Promise<T>):Promise<T>;
 saveCharge(x:Charge):Promise<void>; findCharge(id:string):Promise<Charge|null>; charges(studentRef:string):Promise<Charge[]>;
 savePayment(x:Payment):Promise<void>; findPayment(id:string):Promise<Payment|null>; findReference(reference:string):Promise<Payment|null>; payments(chargeId:string):Promise<Payment[]>; pendingPayments():Promise<Payment[]>; paymentsByStatus(status:PaymentStatus):Promise<Payment[]>;
 auditFinance(x:FinanceEvent):Promise<void>;
 chargesWithPayments():Promise<ChargeWithPayments[]>;
 history(targetId:string):Promise<FinanceEvent[]>;
}
export class FinanceMemoryStore implements FinanceStore {
 readonly chargeRows=new Map<string,Charge>(); readonly paymentRows=new Map<string,Payment>(); readonly events:FinanceEvent[]=[];
 async transaction<T>(fn:(db:FinanceStore)=>Promise<T>):Promise<T>{return fn(this);}
 async saveCharge(x:Charge){this.chargeRows.set(x.id,{...x});}
 async findCharge(id:string){return this.chargeRows.get(id)??null;}
 async charges(studentRef:string){return [...this.chargeRows.values()].filter(x=>x.studentRef===studentRef);}
 async savePayment(x:Payment){this.paymentRows.set(x.id,{...x});}
 async findPayment(id:string){return this.paymentRows.get(id)??null;}
 async findReference(reference:string){return [...this.paymentRows.values()].find(x=>x.reference===reference)??null;}
 async payments(chargeId:string){return [...this.paymentRows.values()].filter(x=>x.chargeId===chargeId);}
 async pendingPayments(){return [...this.paymentRows.values()].filter(x=>x.status==="PENDING");}
 async paymentsByStatus(status:PaymentStatus){return [...this.paymentRows.values()].filter(x=>x.status===status);}
 async auditFinance(x:FinanceEvent){this.events.push(x);}
 async chargesWithPayments(){return [...this.chargeRows.values()].map(c=>({charge:{...c},payments:[...this.paymentRows.values()].filter(p=>p.chargeId===c.id).map(p=>({...p}))}));}
 async history(targetId:string){return this.events.filter(x=>x.targetId===targetId).map(x=>({...x}));}
}
const deny=()=>{throw new DomainError(403,"forbidden");};
const conflict=()=>{throw new DomainError(409,"conflict");};
const amountValid=(n:number)=>Number.isSafeInteger(n)&&n>0&&n<=2_000_000_000;
const referenceValid=(value:string)=>/^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/.test(value);
const reasonValid=(value:unknown)=>typeof value==="string"&&value.trim().length>0&&value.trim().length<=200;
const countsAgainstCharge=(status:PaymentStatus)=>status==="PENDING"||status==="VERIFIED";
export async function createCharge(db:FinanceStore,actor:Actor,input:{studentRef:string;kind:ChargeKind;period:string;amount:number}){
 if(actor.role!=="tu_staff")deny();
 if(typeof input.studentRef!=="string"||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(input.studentRef)||!input.period?.trim()||input.period.length>40||!["SPP","SPMB","TAHUNAN"].includes(input.kind))throw new DomainError(400,"Data tagihan tidak valid");
 if(!amountValid(input.amount))throw new DomainError(400,"Nominal tagihan tidak valid");
 return db.transaction(async t=>{
  if((await t.charges(input.studentRef)).some(x=>x.kind===input.kind&&x.period===input.period))conflict();
  const x:Charge={id:randomUUID(),studentRef:input.studentRef,kind:input.kind,period:input.period,amount:input.amount,createdBy:actor.subject};
  await t.saveCharge(x);await t.auditFinance({targetId:x.id,action:"CHARGE_CREATED",actorId:actor.subject,createdAt:new Date()});return x;
 });
}
export async function recordPayment(db:FinanceStore,actor:Actor,input:{chargeId:string;amount:number;reference:string;replacesPaymentId?:string;reason?:string}){
 if(actor.role!=="tu_staff")deny();
 if(!amountValid(input.amount))throw new DomainError(400,"Nominal pembayaran tidak valid");
 if(!referenceValid(input.reference))throw new DomainError(400,"Referensi pembayaran tidak valid");
 if(input.replacesPaymentId&&!reasonValid(input.reason))throw new DomainError(400,"Alasan koreksi wajib");
 return db.transaction(async t=>{
  const charge=await t.findCharge(input.chargeId);if(!charge)throw new DomainError(404,"Tagihan tidak ditemukan");
  if(await t.findReference(input.reference))conflict();
  if(input.replacesPaymentId){
   const replaced=await t.findPayment(input.replacesPaymentId);
   if(!replaced||replaced.chargeId!==charge.id)throw new DomainError(404,"Pembayaran yang dikoreksi tidak ditemukan");
   if(replaced.status!=="REJECTED"&&replaced.status!=="VOIDED")conflict();
   if((await t.payments(charge.id)).some(x=>x.replacesPaymentId===replaced.id))conflict();
  }
  const total=(await t.payments(charge.id)).filter(p=>countsAgainstCharge(p.status)).reduce((sum,p)=>sum+p.amount,0);
  if(total+input.amount>charge.amount)throw new DomainError(409,"Pembayaran melebihi tagihan");
  const x:Payment={id:randomUUID(),chargeId:charge.id,amount:input.amount,reference:input.reference,recordedBy:actor.subject,status:"PENDING",
   ...(input.replacesPaymentId?{replacesPaymentId:input.replacesPaymentId}:{}),
   ...(input.reason?{reason:input.reason.trim()}:{})};
  await t.savePayment(x);await t.auditFinance({targetId:x.id,action:input.replacesPaymentId?"PAYMENT_CORRECTED":"PAYMENT_RECORDED",actorId:actor.subject,createdAt:new Date()});return x;
 });
}
export async function verifyPayment(db:FinanceStore,actor:Actor,id:string){
 if(actor.role!=="tu_verifier")deny();
 return db.transaction(async t=>{
  const x=await t.findPayment(id);if(!x)throw new DomainError(404,"Pembayaran tidak ditemukan");
  if(x.recordedBy===actor.subject)deny();if(x.status!=="PENDING")conflict();
  x.status="VERIFIED";x.verifiedBy=actor.subject;
  await t.savePayment(x);await t.auditFinance({targetId:x.id,action:"PAYMENT_VERIFIED",actorId:actor.subject,createdAt:new Date()});return x;
 });
}
export async function rejectPayment(db:FinanceStore,actor:Actor,id:string,reason:unknown){
 if(actor.role!=="tu_verifier")deny();
 if(!reasonValid(reason))throw new DomainError(400,"Alasan penolakan wajib");
 return db.transaction(async t=>{
  const x=await t.findPayment(id);if(!x)throw new DomainError(404,"Pembayaran tidak ditemukan");
  if(x.recordedBy===actor.subject)deny();if(x.status!=="PENDING")conflict();
  x.status="REJECTED";x.reason=(reason as string).trim();
  await t.savePayment(x);await t.auditFinance({targetId:x.id,action:"PAYMENT_REJECTED",actorId:actor.subject,createdAt:new Date()});return x;
 });
}
export async function voidPayment(db:FinanceStore,actor:Actor,id:string,reason:unknown){
 if(actor.role!=="tu_verifier")deny();
 if(!reasonValid(reason))throw new DomainError(400,"Alasan pembatalan wajib");
 return db.transaction(async t=>{
  const x=await t.findPayment(id);if(!x)throw new DomainError(404,"Pembayaran tidak ditemukan");
  if(x.recordedBy===actor.subject)deny();if(x.status!=="VERIFIED")conflict();
  x.status="VOIDED";x.voidedBy=actor.subject;x.reason=(reason as string).trim();
  await t.savePayment(x);await t.auditFinance({targetId:x.id,action:"PAYMENT_VOIDED",actorId:actor.subject,createdAt:new Date()});return x;
 });
}
export async function studentBalance(db:FinanceStore,actor:Actor,studentRef:string){
 if(actor.role!=="tu_staff"&&actor.role!=="tu_verifier")deny();
 if(typeof studentRef!=="string"||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(studentRef))throw new DomainError(400,"Identitas siswa tidak valid");
 const charges=await db.charges(studentRef);let due=0,verified=0,pending=0;
 for(const x of charges){due+=x.amount;for(const p of await db.payments(x.id)){if(p.status==="VERIFIED")verified+=p.amount;else if(p.status==="PENDING")pending+=p.amount;}}
 return {due,verified,pending,remaining:due-verified};
}
const pad=(n:number)=>String(n).padStart(2,"0");
const monthKey=(year:number,month:number)=>`${year}-${pad(month)}`;
const round2=(n:number)=>Math.round(n*100)/100;
const RECAP_DEFINITIONS={numerator:"jumlah pembayaran berstatus terverifikasi",denominator:"jumlah tagihan pada periode yang dipilih",percentRule:"nilai terverifikasi dibagi tagihan, dibulatkan dua desimal; 0 bila tidak ada tagihan",periodMapping:"tagihan dengan periode bulan (YYYY-MM) dipetakan ke bulan dan semester; tagihan tahunan dan SPMB belum dipetakan sehingga tampil terpisah sebagai belum dialokasikan",semesterRule:"semester ganjil Juli sampai Desember dan semester genap Januari sampai Juni, masih menunggu persetujuan sekolah",status:"provisional, menunggu aturan keuangan dan rumus persen dari sekolah"};
export async function financeRecap(db:FinanceStore,actor:Actor,scope:{scope:"monthly"|"semester";year:number}){
 if(actor.role!=="tu_staff"&&actor.role!=="tu_verifier")deny();
 const year=scope.year;
 if(!Number.isInteger(year)||year<2000||year>2100)throw new DomainError(400,"Tahun rekap tidak valid");
 const buckets=scope.scope==="monthly"
  ?Array.from({length:12},(_,i)=>({period:monthKey(year,i+1),label:`${pad(i+1)}/${year}`,months:[monthKey(year,i+1)]}))
  :[{period:`ganjil-${year}`,label:`Semester ganjil ${year}/${year+1}`,months:[7,8,9,10,11,12].map(m=>monthKey(year,m))},
    {period:`genap-${year}`,label:`Semester genap ${year}/${year+1}`,months:[1,2,3,4,5,6].map(m=>monthKey(year+1,m))}];
 const all=await db.chargesWithPayments();
 const used=new Set(buckets.flatMap(b=>b.months));
 const rows:RecapRow[]=buckets.map(b=>{
  const items=all.filter(x=>b.months.includes(x.charge.period));
  const charges=items.reduce((sum,x)=>sum+x.charge.amount,0);
  const verified=items.reduce((sum,x)=>sum+x.payments.filter(p=>p.status==="VERIFIED").reduce((s,p)=>s+p.amount,0),0);
  const pending=items.reduce((sum,x)=>sum+x.payments.filter(p=>p.status==="PENDING").reduce((s,p)=>s+p.amount,0),0);
  return {period:b.period,label:b.label,charges,verified,pending,remaining:charges-verified,students:new Set(items.map(x=>x.charge.studentRef)).size,percent:charges>0?round2(verified/charges*100):0};
 });
 const unallocatedMap=new Map<string,RecapUnallocated>();
 for(const x of all.filter(x=>!used.has(x.charge.period))){
  const row=unallocatedMap.get(x.charge.period)??{period:x.charge.period,charges:0,verified:0,pending:0};
  row.charges+=x.charge.amount;
  row.verified+=x.payments.filter(p=>p.status==="VERIFIED").reduce((s,p)=>s+p.amount,0);
  row.pending+=x.payments.filter(p=>p.status==="PENDING").reduce((s,p)=>s+p.amount,0);
  unallocatedMap.set(x.charge.period,row);
 }
 const charges=rows.reduce((s,r)=>s+r.charges,0),verified=rows.reduce((s,r)=>s+r.verified,0),pending=rows.reduce((s,r)=>s+r.pending,0);
 return {scope:scope.scope,label:scope.scope==="monthly"?`Rekap bulanan ${year}`:`Rekap semester ${year}/${year+1}`,rows,
  totals:{charges,verified,pending,remaining:charges-verified,students:new Set(all.filter(x=>used.has(x.charge.period)).map(x=>x.charge.studentRef)).size,percent:charges>0?round2(verified/charges*100):0},
  unallocated:[...unallocatedMap.values()].sort((a,b)=>a.period.localeCompare(b.period)),definitions:RECAP_DEFINITIONS};
}
