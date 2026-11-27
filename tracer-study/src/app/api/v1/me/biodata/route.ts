import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  assertSameOrigin,
  readSessionCookieFromRequest,
  verifySessionToken,
} from '@/lib/auth';
import { ACTIVITY_STATUSES } from '@/lib/tracer-domain';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

const BiodataUpdateSchema = z.object({
  activityStatus: z.enum(ACTIVITY_STATUSES),
  company: z.string().trim().max(140).optional().or(z.literal('')),
  position: z.string().trim().max(120).optional().or(z.literal('')),
  campus: z.string().trim().max(140).optional().or(z.literal('')),
  studyProgram: z.string().trim().max(120).optional().or(z.literal('')),
  profileUrl: z
    .string()
    .trim()
    .url('Tautan profil harus berupa URL https yang valid.')
    .max(300)
    .optional()
    .or(z.literal('')),
  consentGiven: z.literal(true, {
    message: 'Persetujuan penggunaan data wajib dicentang sebelum menyimpan.',
  }),
});

/**
 * GET /api/v1/me/biodata
 * Khusus role SISWA: hanya mengembalikan biodata & status milik akun sendiri.
 */
export async function GET(request: Request) {
  const actor = verifySessionToken(readSessionCookieFromRequest(request));
  if (!actor) {
    return NextResponse.json(
      { error: { code: 'NOT_AUTHENTICATED', message: 'Sesi login diperlukan.' } },
      { status: 401 },
    );
  }
  if (actor.role !== 'SISWA' || !actor.alumniId) {
    return NextResponse.json(
      { error: { code: 'ACCESS_DENIED', message: 'Endpoint ini hanya untuk role Siswa / Alumni.' } },
      { status: 403 },
    );
  }

  const record = getTracerStore().findById(actor.alumniId);
  if (!record) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Biodata Anda belum terdaftar.' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: record }, { headers: { 'cache-control': 'no-store' } });
}

/**
 * POST /api/v1/me/biodata
 * Khusus role SISWA: memperbarui biodata & status kegiatan milik sendiri.
 * Status verifikasi otomatis menjadi BELUM_TERVERIFIKASI sampai BK memverifikasi.
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
  if (actor.role !== 'SISWA' || !actor.alumniId) {
    return NextResponse.json(
      { error: { code: 'ACCESS_DENIED', message: 'Endpoint ini hanya untuk role Siswa / Alumni.' } },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = BiodataUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Isian biodata tidak valid.',
        },
      },
      { status: 400 },
    );
  }

  const store = getTracerStore();
  const current = store.findById(actor.alumniId);
  if (!current) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Biodata Anda belum terdaftar.' } },
      { status: 404 },
    );
  }

  const updated = store.submitAlumniUpdate(current.updateToken, {
    activityStatus: parsed.data.activityStatus,
    company: parsed.data.company || null,
    position: parsed.data.position || null,
    campus: parsed.data.campus || null,
    studyProgram: parsed.data.studyProgram || null,
    profileUrl: parsed.data.profileUrl || null,
    consentGiven: parsed.data.consentGiven,
  });

  return NextResponse.json({ data: updated });
}
