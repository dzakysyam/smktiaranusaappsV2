import { NextRequest } from "next/server";
import { actor, guard } from "@/lib/request";
import { verifyPayment } from "@/lib/finance";
import { financeStore } from "@/lib/prisma-finance-store";
import { DomainError } from "@/lib/workflow";
export async function POST(req:NextRequest,ctx:{params:Promise<{id:string}>}){return guard(req,async()=>{const user=actor(req);if(user.role!=="tu_verifier")throw new DomainError(403,"Akses ditolak");if(process.env.FINANCE_MANUAL_ENTRY_ENABLED!=="true")throw new DomainError(503,"Aturan keuangan belum disahkan");return verifyPayment(financeStore,user,(await ctx.params).id);});}
