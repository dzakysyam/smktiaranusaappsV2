import { NextRequest, NextResponse } from "next/server";
import { parseSession } from "./auth";
import { DomainError, type Actor } from "./workflow";
export function actor(req:NextRequest):Actor{const a=parseSession(req.cookies.get("tu_session")?.value);if(!a)throw new DomainError(401,"Sesi diperlukan");return a;}
export function csrf(req:NextRequest){const origin=req.headers.get("origin");if(!origin||origin!==new URL(req.url).origin)throw new DomainError(403,"Origin tidak cocok");}
export function respond(e:unknown){return NextResponse.json({error:e instanceof DomainError?e.message:"Kesalahan server"},{status:e instanceof DomainError?e.status:500});}
export async function guard(req:NextRequest,fn:()=>Promise<unknown>){try{if(req.method!=="GET")csrf(req);return NextResponse.json(await fn());}catch(e){return respond(e);}}
