import { NextRequest } from "next/server";
import { actor, guard } from "@/lib/request";
import { financeStore } from "@/lib/prisma-finance-store";
import { DomainError } from "@/lib/workflow";
export async function GET(req:NextRequest,ctx:{params:Promise<{studentRef:string}>}){return guard(req,async()=>{const user=actor(req);if(user.role!=="tu_staff"&&user.role!=="tu_verifier")throw new DomainError(403,"Akses ditolak");const studentRef=(await ctx.params).studentRef;if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(studentRef))throw new DomainError(400,"Referensi siswa tidak valid");const charges=await financeStore.charges(studentRef);const rows=await Promise.all(charges.map(async c=>({charge:c,payments:await financeStore.payments(c.id)})));return rows;});}
