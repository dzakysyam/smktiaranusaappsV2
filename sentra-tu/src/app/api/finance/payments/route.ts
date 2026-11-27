import { NextRequest } from "next/server";
import { z } from "zod";
import { actor, guard } from "@/lib/request";
import { recordPayment } from "@/lib/finance";
import { financeStore } from "@/lib/prisma-finance-store";
import { DomainError } from "@/lib/workflow";
const schema=z.object({chargeId:z.string().uuid(),amount:z.number().int().positive().max(2000000000),reference:z.string().min(1).max(100),replacesPaymentId:z.string().uuid().optional(),reason:z.string().trim().min(1).max(200).optional()}).strict();
const statusSchema=z.enum(["PENDING","VERIFIED","REJECTED","VOIDED"]);
export async function POST(req:NextRequest){return guard(req,async()=>{const user=actor(req);if(user.role!=="tu_staff")throw new DomainError(403,"Akses ditolak");if(process.env.FINANCE_MANUAL_ENTRY_ENABLED!=="true")throw new DomainError(503,"Aturan keuangan belum disahkan");const input=schema.safeParse(await req.json());if(!input.success)throw new DomainError(400,"Data pembayaran tidak valid");return recordPayment(financeStore,user,input.data);});}
export async function GET(req:NextRequest){return guard(req,async()=>{if(actor(req).role!=="tu_verifier")throw new DomainError(403,"Akses ditolak");const raw=req.nextUrl.searchParams.get("status")??"PENDING";const status=statusSchema.safeParse(raw);if(!status.success)throw new DomainError(400,"Status pembayaran tidak valid");return financeStore.paymentsByStatus(status.data);});}
