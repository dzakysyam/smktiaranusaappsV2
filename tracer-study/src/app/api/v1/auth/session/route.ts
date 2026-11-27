import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  TRACER_ROLES,
  TRACER_SESSION_COOKIE,
  assertSameOrigin,
  issueSessionToken,
  readSessionCookieFromRequest,
  verifySessionToken,
  type TracerActor,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  role: z.enum(TRACER_ROLES),
});

const DEMO_ACTORS: Readonly<Record<(typeof TRACER_ROLES)[number], TracerActor>> = {
  KEPALA_SEKOLAH: {
    id: 'demo-user-kepala-sekolah',
    displayName: 'Demo Kepala Sekolah',
    role: 'KEPALA_SEKOLAH',
    alumniId: null,
  },
  BK: {
    id: 'demo-user-bk',
    displayName: 'Demo Bimbingan Konseling',
    role: 'BK',
    alumniId: null,
  },
  SISWA: {
    id: 'demo-user-siswa-1',
    displayName: 'Demo Alumni Dua',
    role: 'SISWA',
    alumniId: 'ALU-2025-0002',
  },
};

export async function GET(request: Request) {
  const actor = verifySessionToken(readSessionCookieFromRequest(request));
  return NextResponse.json({ data: { authenticated: Boolean(actor), actor } });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: { code: 'NOT_AVAILABLE', message: 'Login demo tidak aktif pada produksi.' } },
      { status: 404 },
    );
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: 'CSRF_ORIGIN_MISMATCH', message: 'Asal permintaan tidak cocok.' } },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Role tidak valid.' } },
      { status: 400 },
    );
  }

  const actor = DEMO_ACTORS[parsed.data.role];
  const token = issueSessionToken(actor);
  const response = NextResponse.json({ data: { authenticated: true, actor } });
  response.cookies.set(TRACER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 28_800,
  });
  return response;
}

export async function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(TRACER_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 0,
  });
  return response;
}
