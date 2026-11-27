import { NextRequest } from "next/server";
import { actor, guard } from "@/lib/request";
import { studentBalance } from "@/lib/finance";
import { financeStore } from "@/lib/prisma-finance-store";
export async function GET(req:NextRequest,ctx:{params:Promise<{studentRef:string}>}){return guard(req,async()=>studentBalance(financeStore,actor(req),(await ctx.params).studentRef));}
