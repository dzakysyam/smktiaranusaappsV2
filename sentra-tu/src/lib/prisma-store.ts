import { PrismaClient, Prisma } from "@prisma/client";
import type { Store, Letter, LetterAudit, Report, Decision, Outbox, Summary } from "./workflow";
const prisma = new PrismaClient();
export class PrismaStore implements Store {
 constructor(private db: Prisma.TransactionClient | PrismaClient = prisma) {}
 async transaction<T>(fn:(db:Store)=>Promise<T>):Promise<T>{
  if(this.db !== prisma) return fn(this);
  return prisma.$transaction(async tx=>fn(new PrismaStore(tx)),{isolationLevel:"Serializable"});
 }
 async saveLetter(x:Letter){await this.db.outgoingLetter.upsert({where:{id:x.id},create:{...x},update:{status:x.status}});}
 async getLetter(id:string){const x=await this.db.outgoingLetter.findUnique({where:{id}});return x?{id:x.id,subject:x.subject,recipient:x.recipient,authorId:x.authorId,status:x.status as Letter["status"]}:null;}
 async listLetters(){const a=await this.db.outgoingLetter.findMany({orderBy:{createdAt:"desc"}});return a.map(x=>({id:x.id,subject:x.subject,recipient:x.recipient,authorId:x.authorId,status:x.status as Letter["status"]}));}
 async audit(x:LetterAudit){await this.db.letterEvent.create({data:x});}
 async history(id:string){return this.db.letterEvent.findMany({where:{letterId:id},orderBy:{createdAt:"asc"}});}
 async saveReport(x:Report){await this.db.tuReport.upsert({where:{id:x.id},create:{id:x.id,authorId:x.authorId,version:x.version,status:x.status,syncStatus:x.syncStatus},update:{version:x.version,status:x.status,syncStatus:x.syncStatus}});}
 async getReport(id:string){const x=await this.db.tuReport.findUnique({where:{id},include:{versions:{orderBy:{createdAt:"desc"}}}});if(!x)return null;const v=x.versions.find(v=>v.number===x.version)??x.versions.at(-1);return {id:x.id,authorId:x.authorId,version:x.version,status:x.status as Report["status"],syncStatus:x.syncStatus as Report["syncStatus"],summary:(v?.summary??{verifiedLetters:0,submittedLetters:0}) as Summary,feedback:v?.feedback??undefined};}
 async listReports():Promise<Report[]>{const x=await this.db.tuReport.findMany({orderBy:{createdAt:"desc"}});return (await Promise.all(x.map(r=>this.getReport(r.id)))).filter((r):r is NonNullable<typeof r>=>r!==null);}
 async saveVersion(x:Report){await this.db.reportVersion.upsert({where:{reportId_number:{reportId:x.id,number:x.version}},create:{reportId:x.id,number:x.version,status:x.status,summary:x.summary,feedback:x.feedback},update:{status:x.status,summary:x.summary,feedback:x.feedback}});}
 async versions(id:string){const a=await this.db.reportVersion.findMany({where:{reportId:id},orderBy:{number:"asc"}});return a.map(x=>({id:x.reportId,authorId:"",version:x.number,status:x.status as Report["status"],syncStatus:"LOCAL" as const,summary:x.summary as Summary,feedback:x.feedback??undefined}));}
 async saveOutbox(x:Outbox){await this.db.integrationEvent.upsert({where:{id:x.id},create:{id:x.id,reportId:x.reportId,version:x.version,action:x.action,payload:x.payload as Prisma.InputJsonValue,status:x.status},update:{status:x.status,attempts:{increment:1}}});}
 async pending(){const a=await this.db.integrationEvent.findMany({where:{status:{in:["PENDING","FAILED"]}},orderBy:{createdAt:"asc"}});return a.map(x=>({id:x.id,reportId:x.reportId,version:x.version,action:x.action,payload:x.payload,status:x.status as Outbox["status"]}));}
 async hasDecision(id:string){const x=await this.db.appliedDecision.findUnique({where:{id}});return x?{id:x.id,reportId:x.reportId,version:x.version,action:x.action as Decision["action"],feedback:x.feedback,actor:x.actorId}:null;}
 async saveDecision(x:Decision){await this.db.appliedDecision.create({data:{id:x.id,reportId:x.reportId,version:x.version,action:x.action,feedback:x.feedback,actorId:x.actor}});}
}
export const store=new PrismaStore();
