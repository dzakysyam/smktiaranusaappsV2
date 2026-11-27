import { NextRequest } from "next/server";
import { z } from "zod";
import { actor, guard } from "@/lib/request";
import { createCharge } from "@/lib/finance";
import { financeStore } from "@/lib/prisma-finance-store";
import { DomainError } from "@/lib/workflow";
const schema=z.object({studentRef:z.string().trim().min(1).max(100),kind:z.enum(["SPP","SPMB","TAHUNAN"]),period:z.string().trim().min(1).max(40),amount:z.number().int().positive().max(2000000000)}).strict();
export async function POST(req:NextRequest){return guard(req,async()=>{const user=actor(req);if(user.role!=="tu_staff")throw new DomainError(403,"Akses ditolak");if(process.env.FINANCE_MANUAL_ENTRY_ENABLED!=="true")throw new DomainError(503,"Aturan keuangan belum disahkan");const input=schema.safeParse(await req.json());if(!input.success)throw new DomainError(400,"Data tagihan tidak valid");return createCharge(financeStore,user,input.data);});}
export async function GET(req:NextRequest){return guard(req,async()=>{actor(req);const studentRef=req.nextUrl.searchParams.get("studentRef");if(!studentRef||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(studentRef))throw new DomainError(400,"Referensi siswa tidak valid");return financeStore.charges(studentRef);});}
