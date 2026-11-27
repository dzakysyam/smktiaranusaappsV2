import { randomUUID } from "node:crypto";

export type Role = "tu_staff" | "tu_verifier" | "principal";
export type Actor = { subject: string; role: Role };
export type Letter = { id: string; subject: string; recipient: string; authorId: string; status: "DRAFT" | "SUBMITTED" | "VERIFIED" };
export type LetterAudit = { letterId: string; action: string; actorId: string; createdAt: Date };
export type Summary = { verifiedLetters: number; submittedLetters: number };
export type Report = { id: string; authorId: string; version: number; status: "DRAFT" | "SUBMITTED" | "REVISION" | "APPROVED"; syncStatus: "LOCAL" | "PENDING" | "SENT" | "FAILED"; summary: Summary; feedback?: string };
export type Decision = { id: string; reportId: string; version: number; action: "approve" | "revision"; feedback: string; actor: string };
export type Outbox = { id: string; reportId: string; version: number; action: string; payload: unknown; status: "PENDING" | "SENT" | "FAILED" | "CANCELLED" };
export interface Store {
  transaction<T>(fn: (db: Store) => Promise<T>): Promise<T>;
  saveLetter(x: Letter): Promise<void>; getLetter(id: string): Promise<Letter | null>; listLetters(): Promise<Letter[]>; audit(x: LetterAudit): Promise<void>; history(id: string): Promise<LetterAudit[]>;
  saveReport(x: Report): Promise<void>; getReport(id: string): Promise<Report | null>; listReports(): Promise<Report[]>; saveVersion(x: Report): Promise<void>; versions(id: string): Promise<Report[]>;
  saveOutbox(x: Outbox): Promise<void>; pending(): Promise<Outbox[]>; hasDecision(id: string): Promise<Decision | null>; saveDecision(x: Decision): Promise<void>;
}
export class DomainError extends Error { constructor(public status: number, message: string) { super(message); } }
const deny = () => { throw new DomainError(403, "forbidden"); };
const conflict = () => { throw new DomainError(409, "conflict"); };
export class MemoryStore implements Store {
  letters = new Map<string, Letter>(); reports = new Map<string, Report>(); letterEvents: LetterAudit[] = []; reportVersions = new Map<string, Report[]>(); outbox = new Map<string, Outbox>(); decisions = new Map<string, Decision>();
  async transaction<T>(fn: (db: Store) => Promise<T>): Promise<T> { return fn(this); }
  async saveLetter(x: Letter) { this.letters.set(x.id, { ...x }); } async getLetter(id: string) { return this.letters.get(id) ?? null; } async listLetters() { return [...this.letters.values()]; }
  async audit(x: LetterAudit) { this.letterEvents.push(x); } async history(id: string) { return this.letterEvents.filter(x => x.letterId === id); }
  async saveReport(x: Report) { this.reports.set(x.id, { ...x }); } async getReport(id: string) { return this.reports.get(id) ?? null; } async listReports() { return [...this.reports.values()]; }
  async saveVersion(x: Report) { const a = this.reportVersions.get(x.id) ?? []; a.push({ ...x, summary: { ...x.summary } }); this.reportVersions.set(x.id,a); }
  async versions(id: string) { return this.reportVersions.get(id) ?? []; }
  async saveOutbox(x: Outbox) { this.outbox.set(x.id, { ...x }); } async pending() { return [...this.outbox.values()].filter(x => x.status === "PENDING" || x.status === "FAILED"); }
  async hasDecision(id: string) { return this.decisions.get(id) ?? null; } async saveDecision(x: Decision) { this.decisions.set(x.id,x); }
}
export async function createLetter(db: Store, actor: Actor, input: {subject: string; recipient: string}) {
  if (actor.role !== "tu_staff") deny(); if (!input.subject.trim() || !input.recipient.trim()) throw new DomainError(400,"Isi subjek dan penerima");
  const x: Letter = { id: randomUUID(), subject: input.subject.trim(), recipient: input.recipient.trim(), authorId: actor.subject, status: "DRAFT" };
  return db.transaction(async t => { await t.saveLetter(x); await t.audit({letterId:x.id,action:"CREATE",actorId:actor.subject,createdAt:new Date()}); return x; });
}
export async function submitLetter(db: Store, actor: Actor, id: string) {
  if (actor.role !== "tu_staff") deny();
  return db.transaction(async t => { const x = await t.getLetter(id); if (!x) throw new DomainError(404,"not found"); if (x.authorId !== actor.subject) deny(); if(x.status !== "DRAFT") conflict(); x.status="SUBMITTED"; await t.saveLetter(x); await t.audit({letterId:id,action:"SUBMIT",actorId:actor.subject,createdAt:new Date()}); return x; });
}
export async function verifyLetter(db: Store, actor: Actor, id: string) {
  if(actor.role !== "tu_verifier") deny();
  return db.transaction(async t => { const x = await t.getLetter(id); if(!x) throw new DomainError(404,"not found"); if(x.authorId === actor.subject) deny(); if(x.status!=="SUBMITTED") conflict(); x.status="VERIFIED"; await t.saveLetter(x); await t.audit({letterId:id,action:"VERIFY",actorId:actor.subject,createdAt:new Date()}); return x; });
}
export async function createReport(db: Store, actor: Actor) {
  if(actor.role!=="tu_staff") deny();
  return db.transaction(async t=> { const letters=await t.listLetters(); const x:Report={id:randomUUID(),authorId:actor.subject,version:1,status:"DRAFT",syncStatus:"LOCAL",summary:{verifiedLetters:letters.filter(l=>l.status==="VERIFIED").length,submittedLetters:letters.filter(l=>l.status==="SUBMITTED").length}}; await t.saveReport(x);await t.saveVersion(x);return x; });
}
export async function submitReport(db:Store,actor:Actor,id:string) {
  if(actor.role!=="tu_staff") deny();
  return db.transaction(async t=>{const x=await t.getReport(id);if(!x)throw new DomainError(404,"not found");if(x.authorId!==actor.subject)deny();if(x.status!=="DRAFT"&&x.status!=="REVISION")conflict(); x.status="SUBMITTED";x.syncStatus="PENDING";await t.saveReport(x);await t.saveVersion(x);await t.saveOutbox({id:randomUUID(),reportId:id,version:x.version,action:"SUBMIT",payload:{sourceSystem:"SENTRA",reportId:id,version:x.version,summary:x.summary},status:"PENDING"});return x;});
}
export async function applyDecision(db:Store,x:Decision) {
 if(!x.actor.trim()||!x.id.trim())throw new DomainError(400,"Identitas keputusan wajib");
 return db.transaction(async t=>{const prev=await t.hasDecision(x.id);if(prev){if(JSON.stringify(prev)===JSON.stringify(x))return t.getReport(x.reportId);conflict();}
  const r=await t.getReport(x.reportId);if(!r)throw new DomainError(404,"not found");if(r.version!==x.version||r.status!=="SUBMITTED")conflict();if(x.action==="revision"&&!x.feedback.trim())throw new DomainError(400,"Feedback revisi wajib");
  await t.saveDecision(x);if(x.action==="revision"){r.status="REVISION";r.version++;r.feedback=x.feedback;r.syncStatus="LOCAL";}else{r.status="APPROVED";r.feedback=x.feedback;r.syncStatus="LOCAL";}await t.saveReport(r);await t.saveVersion(r);return r;});
}
export async function flushOutbox(db:Store,send:(payload:unknown, eventId:string)=>Promise<void>) {
 for(const e of await db.pending()) {
  await db.transaction(async t=>{
   const r=await t.getReport(e.reportId);
   if(!r||r.version!==e.version||r.status!=="SUBMITTED"){
    e.status="CANCELLED";await t.saveOutbox(e);return;
   }
   try{await send(e.payload,e.id);e.status="SENT";r.syncStatus="SENT";}
   catch{e.status="FAILED";r.syncStatus="FAILED";}
   await t.saveOutbox(e);await t.saveReport(r);
  });
 }
}
