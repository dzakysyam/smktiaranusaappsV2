import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import * as oidc from "openid-client";
import type { Role, Actor } from "./workflow";
const secret = () => {const x=process.env.SESSION_KEY;if(!x||!/^([a-f0-9]{64})$/i.test(x))throw Error("SESSION_KEY wajib 64 digit heksadesimal");return Buffer.from(x,"hex");};
export function seal(data:unknown){const iv=randomBytes(12),c=createCipheriv("aes-256-gcm",secret(),iv),bytes=Buffer.concat([c.update(JSON.stringify(data),"utf8"),c.final()]);return Buffer.concat([iv,c.getAuthTag(),bytes]).toString("base64url");}
export function unseal<T>(value:string):T|null {try{const bytes=Buffer.from(value,"base64url"),d=createDecipheriv("aes-256-gcm",secret(),bytes.subarray(0,12));d.setAuthTag(bytes.subarray(12,28));return JSON.parse(Buffer.concat([d.update(bytes.subarray(28)),d.final()]).toString("utf8")) as T;}catch{return null;}}
export function safeReturn(value:string|null){return value?.startsWith("/")&&!value.startsWith("//")&&!value.includes("\\")?value:"/surat";}
export type Session={actor:Actor; expires:number};
export function parseSession(value:string|undefined):Actor|null{if(!value)return null;const s=unseal<Session>(value);return s&&s.expires>Date.now()&&["tu_staff","tu_verifier"].includes(s.actor.role)?s.actor:null;}
let config:Promise<oidc.Configuration>|undefined;
export function oidcConfig(){return config??=oidc.discovery(new URL(process.env.OIDC_ISSUER!),process.env.OIDC_CLIENT_ID!,process.env.OIDC_CLIENT_SECRET||undefined);}
export function oidcRedirect(){return `${process.env.APP_ORIGIN||"http://localhost:3100"}/api/auth/callback`;}
export function roleFromClaims(claims:Record<string,unknown>):Role|null{const roles=Array.isArray(claims.roles)?claims.roles:[];return roles.includes("tu_staff")?"tu_staff":roles.includes("tu_verifier")?"tu_verifier":null;}
