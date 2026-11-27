'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABELS,
  MAJOR_RELEVANCE_LABELS,
  VERIFICATION_STATUS_LABELS,
  type ActivityStatus,
  type AlumniRecord,
} from '@/lib/tracer-domain';

/**
 * Halaman Biodata & Formulir Tracer Study khusus role SISWA / Alumni.
 * Siswa hanya dapat melihat dan memperbarui data milik akunnya sendiri.
 */
export function StudentBiodataPage({ initialRecord }: { initialRecord: AlumniRecord }) {
  const router = useRouter();
  const [record, setRecord] = useState<AlumniRecord>(initialRecord);
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>(initialRecord.activityStatus);
  const [company, setCompany] = useState(initialRecord.company ?? '');
  const [position, setPosition] = useState(initialRecord.position ?? '');
  const [campus, setCampus] = useState(initialRecord.campus ?? '');
  const [studyProgram, setStudyProgram] = useState(initialRecord.studyProgram ?? '');
  const [profileUrl, setProfileUrl] = useState(initialRecord.profileUrl ?? '');
  const [consentGiven, setConsentGiven] = useState(initialRecord.consentGiven);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null);

  const showWork =
    activityStatus === 'BEKERJA' ||
    activityStatus === 'WIRAUSAHA' ||
    activityStatus === 'KOMBINASI';
  const showStudy = activityStatus === 'KULIAH' || activityStatus === 'KOMBINASI';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/me/biodata', {
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
        data?: AlumniRecord;
        error?: { message?: string };
      } | null;

      if (!res.ok || !body?.data) {
        setFeedback({
          tone: 'error',
          message: body?.error?.message ?? 'Gagal menyimpan biodata Tracer Study.',
        });
        return;
      }

      setRecord(body.data);
      setFeedback({
        tone: 'ok',
        message:
          'Biodata dan status kegiatan Anda berhasil disimpan. Status saat ini Menunggu Verifikasi oleh BK.',
      });
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await fetch('/api/v1/auth/session', { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="narrow stack">
      <div className="row-between">
        <div>
          <span className="badge badge-blue">Role: Siswa / Alumni</span>
          <h1 style={{ marginTop: '0.4rem', fontSize: '1.5rem' }}>Biodata & Tracer Study Saya</h1>
        </div>
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void handleLogout()}>
          Keluar
        </button>
      </div>

      {/* Ringkasan Identitas & Status Verifikasi BK */}
      <section className="card stack" style={{ gap: '0.75rem' }}>
        <div className="row-between">
          <h2>Identitas Lulusan</h2>
          <span
            className={`badge ${
              record.verificationStatus === 'TERVERIFIKASI'
                ? 'badge-green'
                : record.verificationStatus === 'BELUM_TERVERIFIKASI'
                  ? 'badge-yellow'
                  : ''
            }`}
          >
            {VERIFICATION_STATUS_LABELS[record.verificationStatus]}
          </span>
        </div>

        <div className="grid-2" style={{ gap: '0.65rem', fontSize: '14px' }}>
          <div>
            <div className="muted">ID Alumni</div>
            <div className="tabular" style={{ fontWeight: 700, color: 'var(--navy)' }}>
              {record.alumniId}
            </div>
          </div>
          <div>
            <div className="muted">Nama Lengkap</div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
          </div>
          <div>
            <div className="muted">Tahun Lulus</div>
            <div className="tabular">{record.graduationYear}</div>
          </div>
          <div>
            <div className="muted">Jurusan</div>
            <div>{record.major}</div>
          </div>
        </div>

        {record.verificationStatus === 'TERVERIFIKASI' ? (
          <div className="alert-ok">
            Terverifikasi oleh <strong>{record.verifiedBy ?? 'BK'}</strong> · Kesesuaian jurusan:{' '}
            <strong>{MAJOR_RELEVANCE_LABELS[record.majorRelevance]}</strong>
            {record.relevanceReason ? ` (${record.relevanceReason})` : ''}
          </div>
        ) : null}
      </section>

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={feedback.tone === 'error' ? 'alert-error' : 'alert-ok'}
        >
          {feedback.message}
        </div>
      ) : null}

      {/* Formulir Biodata & Status Kegiatan */}
      <section className="card stack">
        <div>
          <h2>Formulir Status Kegiatan</h2>
          <p className="muted">
            Isi kondisi terbaru Anda setelah lulus. Perubahan akan diperiksa oleh tim Bimbingan dan
            Konseling (BK).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="stack" style={{ gap: '0.9rem' }}>
          <div className="field">
            <label htmlFor="st-status">Status kegiatan saat ini</label>
            <select
              id="st-status"
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
                <label htmlFor="st-company">Nama perusahaan atau usaha</label>
                <input
                  id="st-company"
                  className="input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Contoh: PT Teknologi Nusantara"
                />
              </div>
              <div className="field">
                <label htmlFor="st-position">Posisi atau bidang usaha</label>
                <input
                  id="st-position"
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
                <label htmlFor="st-campus">Nama perguruan tinggi / kampus</label>
                <input
                  id="st-campus"
                  className="input"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  placeholder="Contoh: Politeknik Negeri Jakarta"
                />
              </div>
              <div className="field">
                <label htmlFor="st-prodi">Program studi</label>
                <input
                  id="st-prodi"
                  className="input"
                  value={studyProgram}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  placeholder="Contoh: Teknik Informatika"
                />
              </div>
            </>
          ) : null}

          <div className="field">
            <label htmlFor="st-url">Tautan profil profesional (opsional)</label>
            <input
              id="st-url"
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
              Saya menyetujui data ini digunakan oleh SMK Tiara Nusa One untuk verifikasi BK dan
              laporan agregat Tracer Study sekolah.
            </span>
          </label>

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Menyimpan...' : 'Simpan Biodata & Kirim ke BK'}
          </button>
        </form>
      </section>
    </main>
  );
}
