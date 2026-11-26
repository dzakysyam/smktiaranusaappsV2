import { PrismaClient } from "@prisma/client";
const db=new PrismaClient();
async function main(){const x=await db.outgoingLetter.upsert({where:{id:"11111111-1111-4111-8111-111111111111"},create:{id:"11111111-1111-4111-8111-111111111111",subject:"Undangan rapat mitra fiktif",recipient:"Mitra simulasi",authorId:"demo-petugas",status:"DRAFT"},update:{}});await db.letterEvent.createMany({data:[{id:"22222222-2222-4222-8222-222222222222",letterId:x.id,action:"CREATE",actorId:"demo-petugas"}],skipDuplicates:true});console.log("Seed sintetis SENTRA tersedia");}
main().finally(()=>db.$disconnect());
