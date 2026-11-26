import { NextRequest } from "next/server";import { store } from "@/lib/prisma-store";import { actor,guard } from "@/lib/request";import { createLetter } from "@/lib/workflow";
export async function GET(req:NextRequest){return guard(req,async()=>{actor(req);return store.listLetters()});}
export async function POST(req:NextRequest){return guard(req,async()=>createLetter(store,actor(req),await req.json()));}
