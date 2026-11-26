import { NextRequest } from "next/server";import { store } from "@/lib/prisma-store";import { actor,guard } from "@/lib/request";import { verifyLetter } from "@/lib/workflow";
export async function POST(req:NextRequest,c:{params:Promise<{id:string}>}){return guard(req,async()=>verifyLetter(store,actor(req),(await c.params).id));}
