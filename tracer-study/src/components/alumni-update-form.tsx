'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABELS,
  type ActivityStatus,
} from '@/lib/tracer-domain';

type AlumniFormInitial = {
  readonly token: string;
  readonly alumniId: string;
  readonly fullName: string;
  readonly graduationYear: number;
  readonly major: string;
  readonly activityStatus: ActivityStatus;
  readonly company: string | null;
  readonly position: string | null;
  readonly campus: string | null;
  readonly studyProgram: string | null;
  readonly profileUrl: string | null;
  readonly consentGiven: boolean;
};

/**
 * Formulir singkat pembaruan status alumni yang nyaman diisi dari HP.
 */
export function AlumniUpdateForm({ initial }: { initial: AlumniFormInitial }) {
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>(initial.activityStatus);
  const [company, setCompany] = useState(initial.company ?? '');
  const [position, setPosition] = useState(initial.position ?? '');
  const [campus, setCampus] = useState(initial.campus ?? '');
  const [studyProgram, setStudyProgram] = useState(initial.studyProgram ?? '');
  const [profileUrl, setProfileUrl] = useState(initial.profileUrl ?? '');
  const [consentGiven, setConsentGiven] = useState(initial.consentGiven);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showWork =
    activityStatus === 'BEKERJA' ||
    activityStatus === 'WIRAUSAHA' ||
    activityStatus === 'KOMBINASI';
  const showStudy = activityStatus === 'KULIAH' || activityStatus === 'KOMBINASI';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/update/${encodeURIComponent(initial.token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          activityStatus,
          company,
          position,
          campus,
          studyProgram,
          profileUrl,
          consentGiven,
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;

      if (!res.ok) {
        setError(body?.error?.message ?? 'Gagal mengirim pembaruan status.');
        return;
      }

      setDone(true);
    } catch {
      setError('Tidak dapat menghubungi server. Coba lagi beberapa saat.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="narrow stack">
      <div className="card stack">
        <div>
          <span className="badge badge-blue">Formulir Singkat Alumni</span>
          <h1 style={{ marginTop: '0.5rem', fontSize: '1.45rem' }}>
            Pembaruan Status Tracer Study
          </h1>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            {initial.fullName} · Angkatan {initial.graduationYear} · Jurusan {initial.major} (ID:{' '}
            {initial.alumniId})
          </p>
        </div>

        {done ? (
          <div className="stack">
            <div className="alert-ok">
              Terima kasih. Pembaruan status Anda telah tersimpan dengan status{' '}
              <strong>Belum terverifikasi</strong> dan akan ditinjau oleh petugas sekolah.
            </div>
            <Link href="/" className="btn btn-secondary">
              Lihat Ringkasan Agregat Sekolah
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="stack" style={{ gap: '0.9rem' }}>
            <div className="field">
              <label htmlFor="alu-status">Status kegiatan saat ini</label>
              <select
                id="alu-status"
                className="select"
                value={activityStatus}
                onChange={(e) => setActivityStatus(e.target.value as ActivityStatus)}
              >
                {ACTIVITY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ACTIVITY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {showWork ? (
              <>
                <div className="field">
                  <label htmlFor="alu-company">Nama perusahaan atau usaha</label>
                  <input
                    id="alu-company"
                    className="input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Contoh: PT Teknologi Nusantara"
                  />
                </div>
                <div className="field">
                  <label htmlFor="alu-position">Posisi atau bidang usaha</label>
                  <input
                    id="alu-position"
                    className="input"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Contoh: Staf IT / Pemilik Usaha"
                  />
                </div>
              </>
            ) : null}

            {showStudy ? (
              <>
                <div className="field">
                  <label htmlFor="alu-campus">Nama perguruan tinggi / kampus</label>
                  <input
                    id="alu-campus"
                    className="input"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    placeholder="Contoh: Politeknik Negeri Jakarta"
                  />
                </div>
                <div className="field">
                  <label htmlFor="alu-prodi">Program studi</label>
                  <input
                    id="alu-prodi"
                    className="input"
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    placeholder="Contoh: Teknik Informatika"
                  />
                </div>
              </>
            ) : null}

            <div className="field">
              <label htmlFor="alu-url">Tautan profil profesional (opsional)</label>
              <input
                id="alu-url"
                type="url"
                className="input"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <label className="row" style={{ alignItems: 'flex-start', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <span>
                Saya menyetujui informasi ini digunakan oleh SMK Tiara Nusa One untuk evaluasi
                Tracer Study dan laporan agregat sekolah.
              </span>
            </label>

            {error ? (
              <div role="alert" className="alert-error">
                {error}
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Kirim Pembaruan Status'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
