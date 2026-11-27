import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  assertSameOrigin,
  readSessionCookieFromRequest,
  verifySessionToken,
} from '@/lib/auth';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

const GraduateItemSchema = z.object({
  alumniId: z.string().trim().min(3, 'ID alumni minimal 3 karakter.').max(40),
  fullName: z.string().trim().min(2, 'Nama lulusan minimal 2 karakter.').max(120),
  graduationYear: z.coerce.number().int().min(2000).max(2100),
  major: z.string().trim().min(2, 'Jurusan minimal 2 karakter.').max(40),
});

const ImportBodySchema = z.object({
  graduates: z.array(GraduateItemSchema).min(1).max(200),
});

/**
 * GET /api/v1/alumni
 * Hanya untuk BK dan Kepala Sekolah (baca saja). Role Siswa ditolak 403.
 */
export async function GET(request: Request) {
  const actor = verifySessionToken(readSessionCookieFromRequest(request));
  if (!actor) {
    return NextResponse.json(
      { error: { code: 'NOT_AUTHENTICATED', message: 'Sesi login diperlukan.' } },
      { status: 401 },
    );
  }
  if (actor.role !== 'BK' && actor.role !== 'KEPALA_SEKOLAH') {
    return NextResponse.json(
      { error: { code: 'ACCESS_DENIED', message: 'Role Anda tidak memiliki akses ke daftar alumni.' } },
      { status: 403 },
    );
  }

  const records = getTracerStore().listAll();
  return NextResponse.json({ data: records }, { headers: { 'cache-control': 'no-store' } });
}

/**
 * POST /api/v1/alumni
 * Impor lulusan hanya diizinkan untuk BK. Kepala Sekolah bersifat baca saja.
 */
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: 'CSRF_ORIGIN_MISMATCH', message: 'Asal permintaan tidak cocok.' } },
      { status: 403 },
    );
  }
  const actor = verifySessionToken(readSessionCookieFromRequest(request));
  if (!actor) {
    return NextResponse.json(
      { error: { code: 'NOT_AUTHENTICATED', message: 'Sesi login diperlukan.' } },
      { status: 401 },
    );
  }
  if (actor.role !== 'BK') {
    return NextResponse.json(
      {
        error: {
          code: 'ACCESS_DENIED',
          message: 'Hanya Bimbingan dan Konseling (BK) yang berwenang mengimpor data lulusan.',
        },
      },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ImportBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Format data impor lulusan tidak valid.',
          details: parsed.error.issues.map((i) => i.message),
        },
      },
      { status: 400 },
    );
  }

  const result = getTracerStore().importGraduates(parsed.data.graduates, actor.displayName);
  return NextResponse.json({ data: result }, { status: 201 });
}
