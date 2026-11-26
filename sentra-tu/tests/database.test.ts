import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaStore } from "../src/lib/prisma-store";
import { createLetter, submitLetter, verifyLetter, createReport, submitReport, applyDecision, flushOutbox } from "../src/lib/workflow";
const db=new PrismaStore();const actor={subject:"demo-petugas",role:"tu_staff" as const};const verifier={subject:"demo-verifikator",role:"tu_verifier" as const};
test("PostgreSQL menyimpan surat, audit, laporan dan keputusan berversi",async()=>{
 const letter=await createLetter(db,actor,{subject:"Contoh sintetis",recipient:"Penerima simulasi"});
 await submitLetter(db,actor,letter.id);await verifyLetter(db,verifier,letter.id);
 assert.deepEqual((await db.history(letter.id)).map(x=>x.action),["CREATE","SUBMIT","VERIFY"]);
 const report=await createReport(db,actor);assert.ok(report.summary.verifiedLetters>=1);
 await submitReport(db,actor,report.id);await flushOutbox(db,async()=>{throw Error("putus");});assert.equal((await db.getReport(report.id))?.syncStatus,"FAILED");
 const decision={id:crypto.randomUUID(),reportId:report.id,version:1,action:"revision" as const,feedback:"Cek ulang contoh",actor:"kepala-simulasi"};
 await applyDecision(db,decision);await applyDecision(db,decision);
 assert.equal((await db.getReport(report.id))?.version,2);
 await assert.rejects(applyDecision(db,{...decision,id:crypto.randomUUID(),action:"approve"}),/conflict/);
 assert.deepEqual((await db.versions(report.id)).map(x=>x.version),[1,2]);
});
