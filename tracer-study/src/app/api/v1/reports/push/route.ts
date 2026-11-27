import { NextResponse } from 'next/server';
import {
  assertSameOrigin,
  readSessionCookieFromRequest,
  verifySessionToken,
} from '@/lib/auth';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/reports/push
 * Mengirim HANYA statistik agregat Tracer Study ke Humanis Insight.
 * Hanya BK yang berwenang mengirim laporan bidang; Kepala Sekolah baca saja.
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
          message: 'Hanya BK yang berwenang mengirim ringkasan laporan ke Humanis Insight.',
        },
      },
      { status: 403 },
    );
  }

  const store = getTracerStore();
  const summary = store.getSummary();
  const version = store.nextReportVersion();
  const period = 'annual:2026/2027';
  const now = new Date().toISOString();

  const humanisUrl = process.env.HUMANIS_API_URL?.trim();
  const apiKey = process.env.HUMANIS_FIELD_REPORT_KEY?.trim();

  const payload = {
    sourceId: 'ALUMNI',
    reportId: 'tracer-study-2026-2027',
    period,
    version,
    status: 'SUBMITTED',
    summary: {
      title: `Ringkasan Agregat Tracer Study (${summary.totalGraduates} Lulusan)`,
      metrics: [
        {
          key: 'total_graduates',
          label: 'Total Lulusan',
          value: summary.totalGraduates,
          unit: 'orang',
        },
        {
          key: 'verified_rate',
          label: 'Persentase Terverifikasi',
          value: summary.verificationRate.percent,
          unit: '%',
        },
        {
          key: 'unknown_count',
          label: 'Belum Diketahui',
          value: summary.unknownCount,
          unit: 'orang',
        },
      ],
    },
    updatedAt: now,
  };

  if (!humanisUrl || !apiKey) {
    const entry = {
      version,
      period,
      status: 'PENDING' as const,
      message:
        'HUMANIS_API_URL atau HUMANIS_FIELD_REPORT_KEY belum dikonfigurasi. Payload agregat disiapkan namun belum terkirim ke server Humanis.',
      pushedAt: now,
      pushedBy: actor.displayName,
    };
    store.recordPush(entry);
    return NextResponse.json({ data: { entry, payload } }, { status: 202 });
  }

  try {
    const res = await fetch(`${humanisUrl}/api/v1/field-reports`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-field-report-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const entry = {
        version,
        period,
        status: 'CONFIRMED' as const,
        message: 'Ringkasan agregat diterima oleh endpoint Humanis Insight.',
        pushedAt: now,
        pushedBy: actor.displayName,
      };
      store.recordPush(entry);
      return NextResponse.json({ data: { entry, payload } }, { status: 200 });
    }

    const entry = {
      version,
      period,
      status: 'FAILED' as const,
      message: `Humanis Insight mengembalikan status HTTP ${res.status}.`,
      pushedAt: now,
      pushedBy: actor.displayName,
    };
    store.recordPush(entry);
    return NextResponse.json({ data: { entry, payload } }, { status: 502 });
  } catch {
    const entry = {
      version,
      period,
      status: 'FAILED' as const,
      message: 'Gagal menghubungi server Humanis Insight.',
      pushedAt: now,
      pushedBy: actor.displayName,
    };
    store.recordPush(entry);
    return NextResponse.json({ data: { entry, payload } }, { status: 502 });
  }
}
