import { test } from "node:test";
import assert from "node:assert/strict";
import { FinanceMemoryStore, createCharge, recordPayment, verifyPayment, rejectPayment, voidPayment, studentBalance, financeRecap } from "../src/lib/finance";
const staff = { subject: "petugas", role: "tu_staff" as const };
const verifier = { subject: "pemeriksa", role: "tu_verifier" as const };

test("tagihan dan pembayaran belum diverifikasi tidak menurunkan sisa", async () => {
 const db = new FinanceMemoryStore();
 const charge = await createCharge(db, staff, {studentRef:"SINTETIS-1",kind:"SPP",period:"2026-11",amount:120000});
 const payment = await recordPayment(db, staff, {chargeId:charge.id,amount:50000,reference:"BUKTI-SINTETIS-1"});
 assert.equal(payment.status,"PENDING");
 assert.deepEqual(await studentBalance(db, staff,"SINTETIS-1"),{due:120000,verified:0,pending:50000,remaining:120000});
 await verifyPayment(db,verifier,payment.id);
 assert.deepEqual(await studentBalance(db, staff,"SINTETIS-1"),{due:120000,verified:50000,pending:0,remaining:70000});
 assert.deepEqual(db.events.map(x=>x.action),["CHARGE_CREATED","PAYMENT_RECORDED","PAYMENT_VERIFIED"]);
});

test("aksi keuangan menolak tanpa izin, nilai salah, dan verifikasi sendiri", async () => {
 const db = new FinanceMemoryStore();
 await assert.rejects(createCharge(db,verifier,{studentRef:"S-1",kind:"SPP",period:"2026-11",amount:1}),/forbidden/);
 await assert.rejects(createCharge(db,staff,{studentRef:"S-1",kind:"SPP",period:"2026-11",amount:0}),/nominal/i);
 await assert.rejects(studentBalance(db,{subject:"kepala",role:"principal"},"S-1"),/forbidden/);
 const charge = await createCharge(db,staff,{studentRef:"S-1",kind:"TAHUNAN",period:"2026-2027",amount:100000});
 await assert.rejects(createCharge(db,staff,{studentRef:"S-1",kind:"TAHUNAN",period:"2026-2027",amount:100000}),/conflict/);
 await assert.rejects(recordPayment(db,staff,{chargeId:charge.id,amount:0,reference:"X"}),/nominal/i);
 await assert.rejects(recordPayment(db,staff,{chargeId:charge.id,amount:100001,reference:"X"}),/melebihi/i);
 const payment=await recordPayment(db,staff,{chargeId:charge.id,amount:100000,reference:"B-1"});
 await assert.rejects(verifyPayment(db,staff,payment.id),/forbidden/);
 await assert.rejects(verifyPayment(db,{subject:"petugas",role:"tu_verifier"},payment.id),/forbidden/);
 await verifyPayment(db,verifier,payment.id);
 await assert.rejects(verifyPayment(db,verifier,payment.id),/conflict/);
 await assert.rejects(recordPayment(db,staff,{chargeId:charge.id,amount:1,reference:"B-2"}),/melebihi/i);
});

test("bukti sama dan pembayaran menunggu yang melampaui tagihan ditolak", async () => {
 const db=new FinanceMemoryStore();
 const charge=await createCharge(db,staff,{studentRef:"S-2",kind:"SPMB",period:"2026",amount:100});
 await recordPayment(db,staff,{chargeId:charge.id,amount:70,reference:"BUKTI-1"});
 await assert.rejects(recordPayment(db,staff,{chargeId:charge.id,amount:10,reference:"BUKTI-1"}),/conflict/);
 await assert.rejects(recordPayment(db,staff,{chargeId:charge.id,amount:40,reference:"BUKTI-2"}),/melebihi/i);
});

test("referensi siswa tidak boleh berisi identitas langsung atau path", async () => {
 const db=new FinanceMemoryStore();
 for(const studentRef of ["Nama Siswa", "../siswa", "siswa@email.test"]){
  await assert.rejects(createCharge(db,staff,{studentRef,kind:"SPP",period:"2026-11",amount:100}),/Data tagihan tidak valid/);
 }
});

test("pembayaran ditolak melepas nominal dan alasannya wajib",async()=>{
 const db=new FinanceMemoryStore();
 const charge=await createCharge(db,staff,{studentRef:"S-3",kind:"SPP",period:"2026-11",amount:100000});
 const payment=await recordPayment(db,staff,{chargeId:charge.id,amount:40000,reference:"BUKTI-3"});
 await assert.rejects(rejectPayment(db,staff,payment.id,"tidak sesuai"),/forbidden/);
 await assert.rejects(rejectPayment(db,verifier,payment.id,"   "),/Alasan penolakan wajib/);
 await assert.rejects(rejectPayment(db,{subject:"petugas",role:"tu_verifier"},payment.id,"koreksi"),/forbidden/);
 const rejected=await rejectPayment(db,verifier,payment.id,"nominal tidak sesuai bukti");
 assert.equal(rejected.status,"REJECTED");
 assert.equal(rejected.reason,"nominal tidak sesuai bukti");
 assert.deepEqual(await studentBalance(db,staff,"S-3"),{due:100000,verified:0,pending:0,remaining:100000});
 await assert.rejects(rejectPayment(db,verifier,payment.id,"dua kali"),/conflict/);
 assert.deepEqual(db.events.map(x=>x.action),["CHARGE_CREATED","PAYMENT_RECORDED","PAYMENT_REJECTED"]);
});

test("pembayaran terverifikasi dapat dibatalkan dan mengembalikan sisa",async()=>{
 const db=new FinanceMemoryStore();
 const charge=await createCharge(db,staff,{studentRef:"S-4",kind:"SPP",period:"2026-11",amount:100000});
 const payment=await recordPayment(db,staff,{chargeId:charge.id,amount:100000,reference:"BUKTI-4"});
 await verifyPayment(db,verifier,payment.id);
 assert.deepEqual(await studentBalance(db,staff,"S-4"),{due:100000,verified:100000,pending:0,remaining:0});
 await assert.rejects(voidPayment(db,staff,payment.id,"salah input"),/forbidden/);
 await assert.rejects(voidPayment(db,{subject:"petugas",role:"tu_verifier"},payment.id,"salah input"),/forbidden/);
 await assert.rejects(voidPayment(db,verifier,payment.id,""),/Alasan pembatalan wajib/);
 const voided=await voidPayment(db,verifier,payment.id,"salah input nominal");
 assert.equal(voided.status,"VOIDED");
 assert.equal(voided.voidedBy,"pemeriksa");
 assert.deepEqual(await studentBalance(db,staff,"S-4"),{due:100000,verified:0,pending:0,remaining:100000});
 await assert.rejects(voidPayment(db,verifier,payment.id,"lagi"),/conflict/);
});

test("koreksi mencatat pembayaran baru menggantikan pembayaran yang ditolak",async()=>{
 const db=new FinanceMemoryStore();
 const charge=await createCharge(db,staff,{studentRef:"S-5",kind:"SPP",period:"2026-11",amount:100000});
 const payment=await recordPayment(db,staff,{chargeId:charge.id,amount:40000,reference:"BUKTI-5A"});
 await rejectPayment(db,verifier,payment.id,"salah nominal");
 await assert.rejects(recordPayment(db,staff,{chargeId:charge.id,amount:40000,reference:"BUKTI-5B",replacesPaymentId:payment.id}),/Alasan koreksi wajib/);
 const corrected=await recordPayment(db,staff,{chargeId:charge.id,amount:100000,reference:"BUKTI-5B",replacesPaymentId:payment.id,reason:"nominal seharusnya 100000"});
 assert.equal(corrected.status,"PENDING");
 assert.equal(corrected.replacesPaymentId,payment.id);
 assert.equal(corrected.reason,"nominal seharusnya 100000");
 await assert.rejects(recordPayment(db,staff,{chargeId:charge.id,amount:1,reference:"BUKTI-5C",replacesPaymentId:payment.id,reason:"ganti lagi"}),/conflict/);
 const other=await createCharge(db,staff,{studentRef:"S-6",kind:"SPP",period:"2026-11",amount:1000});
 await assert.rejects(recordPayment(db,staff,{chargeId:other.id,amount:1,reference:"BUKTI-5D",replacesPaymentId:payment.id,reason:"tagihan lain"}),/tidak ditemukan/);
 assert.deepEqual(db.events.map(x=>x.action),["CHARGE_CREATED","PAYMENT_RECORDED","PAYMENT_REJECTED","PAYMENT_CORRECTED","CHARGE_CREATED"]);
});

test("rekap bulanan dan semester memakai persen dari tagihan periode itu",async()=>{
 const db=new FinanceMemoryStore();
 const a=await createCharge(db,staff,{studentRef:"S-7",kind:"SPP",period:"2026-11",amount:100000});
 await createCharge(db,staff,{studentRef:"S-8",kind:"SPP",period:"2026-11",amount:50000});
 await createCharge(db,staff,{studentRef:"S-9",kind:"TAHUNAN",period:"2026-2027",amount:300000});
 const payment=await recordPayment(db,staff,{chargeId:a.id,amount:100000,reference:"BUKTI-7"});
 await verifyPayment(db,verifier,payment.id);
 const monthly=await financeRecap(db,staff,{scope:"monthly",year:2026});
 const november=monthly.rows.find(x=>x.period==="2026-11");
 assert.deepEqual(november,{period:"2026-11",label:"11/2026",charges:150000,verified:100000,pending:0,remaining:50000,students:2,percent:66.67});
 assert.equal(monthly.rows.find(x=>x.period==="2026-01")?.charges,0);
 assert.deepEqual(monthly.unallocated,[{period:"2026-2027",charges:300000,verified:0,pending:0}]);
 assert.equal(monthly.totals.charges,150000);
 assert.equal(monthly.totals.percent,66.67);
 const semester=await financeRecap(db,staff,{scope:"semester",year:2026});
 const ganjil=semester.rows.find(x=>x.period==="ganjil-2026");
 assert.deepEqual(ganjil,{period:"ganjil-2026",label:"Semester ganjil 2026/2027",charges:150000,verified:100000,pending:0,remaining:50000,students:2,percent:66.67});
 assert.equal(semester.rows.find(x=>x.period==="genap-2026")?.charges,0);
 await assert.rejects(financeRecap(db,staff,{scope:"monthly",year:1999}),/Tahun rekap tidak valid/);
 await assert.rejects(financeRecap(db,{subject:"kepala",role:"principal"},{scope:"monthly",year:2026}),/forbidden/);
});
