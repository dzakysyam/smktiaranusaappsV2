import { PrismaClient, Prisma } from "@prisma/client";
import type { FinanceStore,Charge,ChargeKind,Payment,PaymentStatus,FinanceEvent,ChargeWithPayments } from "./finance";

const prisma=new PrismaClient();
const toPayment=(p:{id:string;chargeId:string;amount:number;reference:string;recordedBy:string;status:string;verifiedBy:string|null;voidedBy:string|null;reason:string|null;replacesPaymentId:string|null}):Payment=>({id:p.id,chargeId:p.chargeId,amount:p.amount,reference:p.reference,recordedBy:p.recordedBy,status:p.status as PaymentStatus,verifiedBy:p.verifiedBy??undefined,voidedBy:p.voidedBy??undefined,reason:p.reason??undefined,replacesPaymentId:p.replacesPaymentId??undefined});
export class PrismaFinanceStore implements FinanceStore {
 constructor(private db:Prisma.TransactionClient|PrismaClient=prisma){}
 async transaction<T>(fn:(db:FinanceStore)=>Promise<T>):Promise<T>{
  if(this.db!==prisma)return fn(this);
  return prisma.$transaction(async tx=>fn(new PrismaFinanceStore(tx)),{isolationLevel:"Serializable"});
 }
 async saveCharge(x:Charge){await this.db.studentCharge.create({data:x});}
 async findCharge(id:string){return this.db.studentCharge.findUnique({where:{id}}) as Promise<Charge|null>;}
 async charges(studentRef:string){return this.db.studentCharge.findMany({where:{studentRef}}) as Promise<Charge[]>;}
 async savePayment(x:Payment){await this.db.studentPayment.upsert({where:{id:x.id},create:x,update:{status:x.status,verifiedBy:x.verifiedBy,voidedBy:x.voidedBy,reason:x.reason,replacesPaymentId:x.replacesPaymentId}});}
 async findPayment(id:string){const x=await this.db.studentPayment.findUnique({where:{id}});return x?toPayment(x):null;}
 async findReference(reference:string){const x=await this.db.studentPayment.findUnique({where:{reference}});return x?toPayment(x):null;}
 async payments(chargeId:string){const a=await this.db.studentPayment.findMany({where:{chargeId}});return a.map(toPayment);}
 async pendingPayments(){const a=await this.db.studentPayment.findMany({where:{status:"PENDING"},orderBy:{createdAt:"asc"},take:100});return a.map(toPayment);}
 async paymentsByStatus(status:PaymentStatus){const a=await this.db.studentPayment.findMany({where:{status},orderBy:{createdAt:"asc"},take:100});return a.map(toPayment);}
 async auditFinance(x:FinanceEvent){await this.db.financeAudit.create({data:x});}
 async history(targetId:string){return this.db.financeAudit.findMany({where:{targetId},orderBy:{createdAt:"asc"}});}
 async chargesWithPayments():Promise<ChargeWithPayments[]>{const a=await this.db.studentCharge.findMany({include:{payments:true}});return a.map(c=>({charge:{id:c.id,studentRef:c.studentRef,kind:c.kind as ChargeKind,period:c.period,amount:c.amount,createdBy:c.createdBy},payments:c.payments.map(toPayment)}));}
}
export const financeStore=new PrismaFinanceStore();
