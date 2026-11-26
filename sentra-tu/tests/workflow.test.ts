import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryStore, createLetter, submitLetter, verifyLetter, createReport, submitReport, applyDecision, flushOutbox } from "../src/lib/workflow";

const petugas = { subject: "demo-petugas", role: "tu_staff" as const };
const verifikator = { subject: "demo-verifikator", role: "tu_verifier" as const };
const kepala = { subject: "demo-kepala", role: "principal" as const };

test("surat draf diajukan dan diverifikasi petugas lain dengan audit", async () => {
  const db = new MemoryStore();
  const letter = await createLetter(db, petugas, { subject: "Undangan rapat contoh", recipient: "Mitra fiktif" });
  assert.equal(letter.status, "DRAFT");
  await submitLetter(db, petugas, letter.id);
  await verifyLetter(db, verifikator, letter.id);
  assert.equal((await db.getLetter(letter.id))?.status, "VERIFIED");
  assert.deepEqual((await db.history(letter.id)).map(x => x.action), ["CREATE", "SUBMIT", "VERIFY"]);
});

test("izin backend, pengajuan ganda, dan pemisahan verifikator", async () => {
  const db = new MemoryStore();
  await assert.rejects(createLetter(db, kepala, { subject: "Contoh", recipient: "Mitra" }), /forbidden/);
  const letter = await createLetter(db, petugas, { subject: "Contoh", recipient: "Mitra" });
  await assert.rejects(submitLetter(db, verifikator, letter.id), /forbidden/);
  await submitLetter(db, petugas, letter.id);
  await assert.rejects(submitLetter(db, petugas, letter.id), /conflict/);
  await assert.rejects(verifyLetter(db, petugas, letter.id), /forbidden/);
});

test("laporan bersumber surat TU dan versi lama ditolak, replay aman", async () => {
  const db = new MemoryStore();
  const letter = await createLetter(db, petugas, { subject: "Rapat", recipient: "Mitra" });
  await submitLetter(db, petugas, letter.id);
  await verifyLetter(db, verifikator, letter.id);
  const report = await createReport(db, petugas);
  assert.equal(report.summary.verifiedLetters, 1);
  await submitReport(db, petugas, report.id);
  await assert.rejects(submitReport(db, petugas, report.id), /conflict/);
  await applyDecision(db, { id: "decision-1", reportId: report.id, version: 1, action: "revision", feedback: "Perbaiki uraian", actor: "kepala" });
  await applyDecision(db, { id: "decision-1", reportId: report.id, version: 1, action: "revision", feedback: "Perbaiki uraian", actor: "kepala" });
  assert.equal((await db.getReport(report.id))?.version, 2);
  await assert.rejects(applyDecision(db, { id: "decision-2", reportId: report.id, version: 1, action: "approve", feedback: "", actor: "kepala" }), /conflict/);
});

test("gagal kirim keputusan mempertahankan status sinkronisasi", async () => {
  const db = new MemoryStore();
  const report = await createReport(db, petugas);
  await submitReport(db, petugas, report.id);
  await flushOutbox(db, async () => { throw new Error("offline"); });
  assert.equal((await db.getReport(report.id))?.syncStatus, "FAILED");
});
