import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaFinanceStore } from "../src/lib/prisma-finance-store";
import { createCharge,recordPayment,verifyPayment,rejectPayment,voidPayment,studentBalance,financeRecap } from "../src/lib/finance";
const staff={subject:"petugas-db",role:"tu_staff" as const};
const verifier={subject:"verifikator-db",role:"tu_verifier" as const};

test("PostgreSQL menyimpan tagihan, pembayaran, audit dan sisa setelah verifikasi",async()=>{
 const db=new PrismaFinanceStore();const studentRef=`SINTETIS-${crypto.randomUUID()}`;
 const charge=await createCharge(db,staff,{studentRef,kind:"SPP",period:"2026-11",amount:120000});
 const payment=await recordPayment(db,staff,{chargeId:charge.id,amount:50000,reference:`BUKTI-${crypto.randomUUID()}`});
 assert.deepEqual(await studentBalance(new PrismaFinanceStore(),staff,studentRef),{due:120000,verified:0,pending:50000,remaining:120000});
 await verifyPayment(new PrismaFinanceStore(),verifier,payment.id);
 assert.deepEqual(await studentBalance(new PrismaFinanceStore(),staff,studentRef),{due:120000,verified:50000,pending:0,remaining:70000});
 await assert.rejects(verifyPayment(db,verifier,payment.id),/conflict/);
 await assert.rejects(createCharge(db,staff,{studentRef,kind:"SPP",period:"2026-11",amount:120000}),/conflict/);
 await assert.rejects(recordPayment(db,staff,{chargeId:charge.id,amount:1000,reference:payment.reference}),/conflict/);
 assert.deepEqual((await db.history(charge.id)).map(x=>x.action),["CHARGE_CREATED"]);
 assert.deepEqual((await db.history(payment.id)).map(x=>x.action),["PAYMENT_RECORDED","PAYMENT_VERIFIED"]);
});

test("PostgreSQL menyimpan penolakan, pembatalan, koreksi, dan rekap dari data nyata",async()=>{
 const db=new PrismaFinanceStore();const studentRef=`SINTETIS-${crypto.randomUUID()}`;
 const charge=await createCharge(db,staff,{studentRef,kind:"SPP",period:"2027-05",amount:90000});
 const payment=await recordPayment(db,staff,{chargeId:charge.id,amount:90000,reference:`BUKTI-${crypto.randomUUID()}`});
 await rejectPayment(db,verifier,payment.id,"salah nominal");
 const rejected=await db.findPayment(payment.id);
 assert.equal(rejected?.status,"REJECTED");
 assert.equal(rejected?.reason,"salah nominal");
 const corrected=await recordPayment(db,staff,{chargeId:charge.id,amount:90000,reference:`BUKTI-${crypto.randomUUID()}`,replacesPaymentId:payment.id,reason:"nominal sebenarnya 90000"});
 await verifyPayment(db,verifier,corrected.id);
 await voidPayment(db,verifier,corrected.id,"dibatalkan Petugas");
 const voided=await db.findPayment(corrected.id);
 assert.equal(voided?.status,"VOIDED");
 assert.equal(voided?.voidedBy,"verifikator-db");
 assert.deepEqual(await studentBalance(db,staff,studentRef),{due:90000,verified:0,pending:0,remaining:90000});
 assert.deepEqual((await db.history(corrected.id)).map(x=>x.action),["PAYMENT_CORRECTED","PAYMENT_VERIFIED","PAYMENT_VOIDED"]);
 const recap=await financeRecap(db,staff,{scope:"monthly",year:2027});
 const may=recap.rows.find(x=>x.period==="2027-05");
 assert.equal(may?.charges,90000);
 assert.equal(may?.verified,0);
 assert.equal(may?.percent,0);
});
