import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import {
  TRACER_ROLES,
  TRACER_ROLE_LABELS,
  type TracerActor,
  type TracerRole,
} from './tracer-domain';

export const TRACER_SESSION_COOKIE = 'tracer_session';
export { TRACER_ROLES, TRACER_ROLE_LABELS, type TracerActor, type TracerRole };

type SessionPayload = {
  readonly sub: string;
  readonly name: string;
  readonly role: TracerRole;
  readonly alumniId: string | null;
  readonly exp: number;
};

const globalSecret = globalThis as typeof globalThis & { __tracerEphemeralSecret?: string };

function getSecret(): string {
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 32) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET wajib diisi minimal 32 karakter pada produksi.');
  }
  if (!globalSecret.__tracerEphemeralSecret) {
    globalSecret.__tracerEphemeralSecret = randomBytes(32).toString('base64url');
  }
  return globalSecret.__tracerEphemeralSecret;
}

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

export function issueSessionToken(actor: TracerActor, ttlSeconds = 28_800): string {
  const payload: SessionPayload = {
    sub: actor.id,
    name: actor.displayName,
    role: actor.role,
    alumniId: actor.alumniId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body, getSecret())}`;
}

export function verifySessionToken(token: string | undefined): TracerActor | null {
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx <= 0) return null;
  const body = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const expected = Buffer.from(sign(body, getSecret()));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (
      typeof parsed.sub !== 'string' ||
      typeof parsed.name !== 'string' ||
      !(TRACER_ROLES as readonly string[]).includes(parsed.role) ||
      (parsed.alumniId !== null && typeof parsed.alumniId !== 'string') ||
      typeof parsed.exp !== 'number' ||
      parsed.exp * 1000 <= Date.now()
    ) {
      return null;
    }
    return {
      id: parsed.sub,
      displayName: parsed.name,
      role: parsed.role,
      alumniId: parsed.alumniId,
    };
  } catch {
    return null;
  }
}

export function readSessionCookieFromRequest(request: Request): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === TRACER_SESSION_COOKIE) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

export async function getCurrentActor(): Promise<TracerActor | null> {
  const store = await cookies();
  return verifySessionToken(store.get(TRACER_SESSION_COOKIE)?.value);
}

export function assertSameOrigin(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }
  const allowed = process.env.APP_ORIGIN?.trim() || 'http://localhost:3200';
  const origin = request.headers.get('origin');
  if (origin) {
    return origin === allowed;
  }
  return request.headers.get('sec-fetch-site') !== 'cross-site';
}
