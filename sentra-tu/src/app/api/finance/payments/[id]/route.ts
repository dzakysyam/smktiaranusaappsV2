import { NextRequest } from "next/server";
import { actor, guard } from "@/lib/request";
import { financeStore } from "@/lib/prisma-finance-store";
import { DomainError } from "@/lib/workflow";
export async function GET(req:NextRequest,ctx:{params:Promise<{id:string}>}){return guard(req,async()=>{const user=actor(req);if(user.role!=="tu_staff"&&user.role!=="tu_verifier")throw new DomainError(403,"Akses ditolak");const id=(await ctx.params).id;const payment=await financeStore.findPayment(id);if(!payment)throw new DomainError(404,"Pembayaran tidak ditemukan");return {payment,history:await financeStore.history(id)};});}
