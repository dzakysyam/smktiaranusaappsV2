import { NextRequest } from "next/server";import { store } from "@/lib/prisma-store";import { actor,guard } from "@/lib/request";import { createReport } from "@/lib/workflow";
export async function GET(req:NextRequest){return guard(req,async()=>{actor(req);return store.listReports()});}
export async function POST(req:NextRequest){return guard(req,async()=>createReport(store,actor(req)));}
