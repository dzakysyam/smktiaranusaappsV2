import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ACTIVITY_STATUSES } from '@/lib/tracer-domain';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

const AlumniUpdateSchema = z.object({
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
    message: 'Persetujuan penggunaan data wajib dicentang sebelum mengirim.',
  }),
});

/**
 * GET /api/v1/update/[token]
 * Mengembalikan identitas minimum alumni pemilik token unik.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const record = getTracerStore().findByToken(token);
  if (!record) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Tautan pembaruan tidak valid atau kedaluwarsa.' } },
      { status: 404 },
    );
  }

  return NextResponse.json({
    data: {
      alumniId: record.alumniId,
      fullName: record.fullName,
      graduationYear: record.graduationYear,
      major: record.major,
      activityStatus: record.activityStatus,
      verificationStatus: record.verificationStatus,
      company: record.company,
      position: record.position,
      campus: record.campus,
      studyProgram: record.studyProgram,
      profileUrl: record.profileUrl,
      consentGiven: record.consentGiven,
      updatedAt: record.updatedAt,
    },
  });
}

/**
 * POST /api/v1/update/[token]
 * Alumni mengirim pembaruan status singkat (ramah HP).
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = AlumniUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Isian formulir tidak valid.',
          details: parsed.error.issues.map((i) => i.message),
        },
      },
      { status: 400 },
    );
  }

  const updated = getTracerStore().submitAlumniUpdate(token, {
    activityStatus: parsed.data.activityStatus,
    company: parsed.data.company || null,
    position: parsed.data.position || null,
    campus: parsed.data.campus || null,
    studyProgram: parsed.data.studyProgram || null,
    profileUrl: parsed.data.profileUrl || null,
    consentGiven: parsed.data.consentGiven,
  });

  if (!updated) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Tautan pembaruan tidak valid atau kedaluwarsa.' } },
      { status: 404 },
    );
  }

  return NextResponse.json({
    data: {
      alumniId: updated.alumniId,
      activityStatus: updated.activityStatus,
      verificationStatus: updated.verificationStatus,
      updatedAt: updated.updatedAt,
    },
  });
}
