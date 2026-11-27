import { NextRequest } from "next/server";
import { actor, guard } from "@/lib/request";
import { financeRecap } from "@/lib/finance";
import { financeStore } from "@/lib/prisma-finance-store";
import { DomainError } from "@/lib/workflow";
export async function GET(req:NextRequest){return guard(req,async()=>{const user=actor(req);if(user.role!=="tu_staff"&&user.role!=="tu_verifier")throw new DomainError(403,"Akses ditolak");const scope=req.nextUrl.searchParams.get("scope");if(scope!=="monthly"&&scope!=="semester")throw new DomainError(400,"Jenis rekap tidak valid");const year=Number(req.nextUrl.searchParams.get("year"));if(!Number.isInteger(year))throw new DomainError(400,"Tahun rekap tidak valid");return financeRecap(financeStore,user,{scope,year});});}
