import { NextRequest } from "next/server";
import { z } from "zod";
import { actor, guard } from "@/lib/request";
import { voidPayment } from "@/lib/finance";
import { financeStore } from "@/lib/prisma-finance-store";
import { DomainError } from "@/lib/workflow";
const schema=z.object({reason:z.string().trim().min(1).max(200)}).strict();
export async function POST(req:NextRequest,ctx:{params:Promise<{id:string}>}){return guard(req,async()=>{const user=actor(req);if(user.role!=="tu_verifier")throw new DomainError(403,"Akses ditolak");if(process.env.FINANCE_MANUAL_ENTRY_ENABLED!=="true")throw new DomainError(503,"Aturan keuangan belum disahkan");const input=schema.safeParse(await req.json());if(!input.success)throw new DomainError(400,"Alasan pembatalan wajib");return voidPayment(financeStore,user,(await ctx.params).id,input.data.reason);});}
