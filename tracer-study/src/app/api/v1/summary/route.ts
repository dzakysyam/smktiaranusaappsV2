import { NextResponse } from 'next/server';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/summary
 * Mengembalikan statistik agregat Tracer Study tanpa data pribadi individu alumni.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get('year');
  const majorParam = url.searchParams.get('major');

  const graduationYear =
    yearParam && yearParam !== 'ALL' && /^\d{4}$/.test(yearParam) ? Number(yearParam) : 'ALL';
  const major = majorParam && majorParam !== 'ALL' ? majorParam.trim().toUpperCase() : 'ALL';

  const summary = getTracerStore().getSummary({ graduationYear, major });
  return NextResponse.json({ data: summary }, { headers: { 'cache-control': 'no-store' } });
}
