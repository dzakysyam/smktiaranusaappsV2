import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  assertSameOrigin,
  readSessionCookieFromRequest,
  verifySessionToken,
} from '@/lib/auth';
import { ACTIVITY_STATUSES, MAJOR_RELEVANCE_VALUES } from '@/lib/tracer-domain';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

const VerifyBodySchema = z.object({
  activityStatus: z.enum(ACTIVITY_STATUSES).optional(),
  company: z.string().trim().max(140).optional().nullable(),
  position: z.string().trim().max(120).optional().nullable(),
  campus: z.string().trim().max(140).optional().nullable(),
  studyProgram: z.string().trim().max(120).optional().nullable(),
  majorRelevance: z.enum(MAJOR_RELEVANCE_VALUES),
  relevanceReason: z.string().trim().max(500).default(''),
  markVerified: z.boolean(),
});

/**
 * PATCH /api/v1/alumni/[alumniId]/verify
 * Hanya BK yang berwenang memverifikasi atau mengoreksi data alumni.
 * Kepala Sekolah bersifat baca saja (ditolak 403 di server).
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ alumniId: string }> },
) {
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
          message: 'Hanya Bimbingan dan Konseling (BK) yang berwenang memverifikasi data Tracer Study.',
        },
      },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = VerifyBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data verifikasi tidak valid.',
          details: parsed.error.issues.map((i) => i.message),
        },
      },
      { status: 400 },
    );
  }

  const { alumniId } = await context.params;
  const updated = getTracerStore().verifyOrCorrect({
    alumniId: decodeURIComponent(alumniId),
    ...parsed.data,
    actorName: actor.displayName,
  });

  if (!updated) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Data alumni tidak ditemukan.' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: updated });
}
