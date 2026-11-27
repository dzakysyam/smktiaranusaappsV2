'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABELS,
  MAJOR_RELEVANCE_LABELS,
  MAJOR_RELEVANCE_VALUES,
  type MetricRatio,
  type TracerActor,
  type TracerAggregateSummary,
  type TracerRole,
} from '@/lib/tracer-domain';

function formatPercent(ratio: MetricRatio): string {
  if (ratio.percent === null) {
    return 'Belum tersedia';
  }
  return `${String(ratio.percent).replace('.', ',')}%`;
}

export function TracerLoginGate({ humanisPortalUrl }: { humanisPortalUrl: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginAs(role: TracerRole) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        setError('Gagal membuat sesi lokal.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="narrow stack">
      <section className="card stack">
        <div>
          <span className="badge badge-blue">SSO Humanis Insight · Mode Demo</span>
          <h1 style={{ marginTop: '0.5rem', fontSize: '1.55rem' }}>Masuk ke Tracer Study</h1>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Pilih peran untuk membuka aplikasi Tracer Study SMK Tiara Nusa One. Data agregat
            terhubung otomatis ke Dashboard Tracer Study di Humanis Insight untuk BK dan Kepala
            Sekolah.
          </p>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}

        <div className="stack" style={{ gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            disabled={busy}
            onClick={() => void loginAs('BK')}
          >
            <span>Bimbingan dan Konseling (BK)</span>
            <span style={{ fontWeight: 400, fontSize: '12px', opacity: 0.9 }}>
              Dashboard + Verifikasi & Impor
            </span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            disabled={busy}
            onClick={() => void loginAs('KEPALA_SEKOLAH')}
          >
            <span>Kepala Sekolah</span>
            <span className="muted">Dashboard + Pantau Verifikasi (Baca Saja)</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            disabled={busy}
            onClick={() => void loginAs('SISWA')}
          >
            <span>Siswa / Alumni</span>
            <span className="muted">Halaman Biodata & Formulir Tracer Study</span>
          </button>
        </div>

        <div
          className="row-between"
          style={{ paddingTop: '0.65rem', borderTop: '1px solid var(--border)' }}
        >
          <span className="muted">Portal utama sekolah</span>
          <a
            href={`${humanisPortalUrl}/modul`}
            className="btn btn-secondary"
            style={{ fontSize: '12px' }}
          >
            Humanis Insight
          </a>
        </div>
      </section>
    </main>
  );
}

/**
 * Halaman Dashboard Tracer Study (terpisah dari halaman Sistem Verifikasi).
 * Statistik agregat dibagikan otomatis ke Dashboard Tracer Study di Humanis Insight.
 */
export function TracerDashboardView({
  initialSummary,
  actor,
}: {
  initialSummary: TracerAggregateSummary;
  actor: TracerActor;
}) {
  const [summary, setSummary] = useState<TracerAggregateSummary>(initialSummary);
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [majorFilter, setMajorFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  async function applyFilter(nextYear: string, nextMajor: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/summary?year=${encodeURIComponent(nextYear)}&major=${encodeURIComponent(nextMajor)}`,
      );
      const body = (await res.json().catch(() => null)) as {
        data?: TracerAggregateSummary;
      } | null;
      if (res.ok && body?.data) {
        setSummary(body.data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <h1>Dashboard Tracer Study</h1>
          <p className="muted">
            Ringkasan statistik lulusan per angkatan dan jurusan. Data agregat ini dibaca langsung
            oleh Dashboard Tracer Study di Humanis Insight.
          </p>
        </div>

        <div className="row">
          <select
            aria-label="Filter tahun lulus"
            className="select"
            style={{ width: 'auto' }}
            disabled={loading}
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              void applyFilter(e.target.value, majorFilter);
            }}
          >
            <option value="ALL">Semua Angkatan</option>
            {summary.availableYears.map((y) => (
              <option key={y} value={String(y)}>
                Angkatan {y}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter jurusan"
            className="select"
            style={{ width: 'auto' }}
            disabled={loading}
            value={majorFilter}
            onChange={(e) => {
              setMajorFilter(e.target.value);
              void applyFilter(yearFilter, e.target.value);
            }}
          >
            <option value="ALL">Semua Jurusan</option>
            {summary.availableMajors.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <Link href="/verifikasi" className="btn btn-primary">
            {actor.role === 'BK' ? 'Buka Sistem Verifikasi' : 'Pantau Verifikasi'}
          </Link>
        </div>
      </div>

      {/* 4 Kartu KPI */}
      <section className="grid-4" aria-label="Ringkasan statistik tracer study">
        <div className="card">
          <div className="row-between">
            <span className="muted">Total Lulusan</span>
            <span className="badge badge-blue">Basis Pembagi</span>
          </div>
          <p className="kpi-value tabular">{summary.totalGraduates}</p>
          <p className="muted">Lulusan terdaftar pada filter terpilih</p>
        </div>

        <div className="card">
          <div className="row-between">
            <span className="muted">Terverifikasi BK</span>
            <span className="badge badge-green">{formatPercent(summary.verificationRate)}</span>
          </div>
          <p className="kpi-value tabular">{summary.verifiedCount}</p>
          <p className="muted tabular">
            Pembagi: {summary.verifiedCount} dari {summary.totalGraduates} lulusan
          </p>
        </div>

        <div className="card">
          <div className="row-between">
            <span className="muted">Menunggu Verifikasi</span>
            <span className="badge badge-yellow">Antrean BK</span>
          </div>
          <p className="kpi-value tabular">{summary.unverifiedCount}</p>
          <p className="muted">Formulir siswa/alumni yang perlu ditinjau</p>
        </div>

        <div className="card">
          <div className="row-between">
            <span className="muted">Belum Diketahui</span>
            <span className="badge">
              {formatPercent(summary.activityDistribution.BELUM_DIKETAHUI)}
            </span>
          </div>
          <p className="kpi-value tabular">{summary.unknownCount}</p>
          <p className="muted">Belum merespons (tidak dianggap menganggur)</p>
        </div>
      </section>

      {/* Distribusi Kegiatan & Kesesuaian Jurusan */}
      <section className="grid-2">
        <div className="card stack">
          <div>
            <h2>Distribusi Kegiatan Alumni</h2>
            <p className="muted">
              Persentase kategori kegiatan dihitung dari responden yang sudah menyatakan status.
            </p>
          </div>
          <div className="stack" style={{ gap: '0.75rem' }}>
            {ACTIVITY_STATUSES.map((status) => {
              const item = summary.activityDistribution[status];
              return (
                <div key={status}>
                  <div className="row-between" style={{ fontSize: '13px' }}>
                    <span>{ACTIVITY_STATUS_LABELS[status]}</span>
                    <span className="tabular" style={{ fontWeight: 600 }}>
                      {item.count} / {item.denominator} ({formatPercent(item)})
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${item.percent ?? 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card stack">
          <div>
            <h2>Kesesuaian Jurusan</h2>
            <p className="muted">
              Dinilai dan dapat dikoreksi oleh tim BK dengan alasan yang terdokumentasi.
            </p>
          </div>
          <div className="stack" style={{ gap: '0.75rem' }}>
            {MAJOR_RELEVANCE_VALUES.map((rel) => {
              const item = summary.relevanceDistribution[rel];
              return (
                <div key={rel}>
                  <div className="row-between" style={{ fontSize: '13px' }}>
                    <span>{MAJOR_RELEVANCE_LABELS[rel]}</span>
                    <span className="tabular" style={{ fontWeight: 600 }}>
                      {item.count} / {item.denominator} ({formatPercent(item)})
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${item.percent ?? 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
