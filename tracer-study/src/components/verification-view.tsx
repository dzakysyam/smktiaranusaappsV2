'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABELS,
  MAJOR_RELEVANCE_LABELS,
  MAJOR_RELEVANCE_VALUES,
  VERIFICATION_STATUS_LABELS,
  type ActivityStatus,
  type AlumniRecord,
  type MajorRelevance,
  type TracerActor,
} from '@/lib/tracer-domain';

/**
 * Halaman Sistem Verifikasi Formulir Alumni (terpisah dari Dashboard).
 * - BK: dapat memverifikasi, mengoreksi kesesuaian jurusan, dan membuka Form HP.
 * - Kepala Sekolah: baca saja (dapat melihat detail & riwayat perubahan).
 */
export function VerificationView({
  initialRecords,
  actor,
}: {
  initialRecords: readonly AlumniRecord[];
  actor: TracerActor;
}) {
  const [records, setRecords] = useState<readonly AlumniRecord[]>(initialRecords);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AlumniRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null);

  const [editActivity, setEditActivity] = useState<ActivityStatus>('BEKERJA');
  const [editRelevance, setEditRelevance] = useState<MajorRelevance>('BELUM_DAPAT_DINILAI');
  const [editReason, setEditReason] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editCampus, setEditCampus] = useState('');

  const isBk = actor.role === 'BK';

  async function reload() {
    const res = await fetch('/api/v1/alumni');
    const body = (await res.json().catch(() => null)) as { data?: AlumniRecord[] } | null;
    if (res.ok && body?.data) {
      setRecords(body.data);
    }
  }

  async function saveVerification(markVerified: boolean) {
    if (!selected) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/alumni/${encodeURIComponent(selected.alumniId)}/verify`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          activityStatus: editActivity,
          company: editCompany || null,
          campus: editCampus || null,
          majorRelevance: editRelevance,
          relevanceReason: editReason,
          markVerified,
        }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menyimpan.' });
        return;
      }
      setSelected(null);
      setFeedback({
        tone: 'ok',
        message: markVerified
          ? 'Status alumni diverifikasi oleh BK; statistik dashboard otomatis diperbarui.'
          : 'Koreksi dicatat dengan status Belum terverifikasi.',
      });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  const visible = records.filter((rec) => {
    if (statusFilter !== 'ALL' && rec.verificationStatus !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      rec.fullName.toLowerCase().includes(q) ||
      rec.alumniId.toLowerCase().includes(q) ||
      rec.major.toLowerCase().includes(q)
    );
  });

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <h1>{isBk ? 'Sistem Verifikasi Formulir Alumni' : 'Pantau Verifikasi Alumni'}</h1>
          <p className="muted">
            {isBk
              ? 'Tinjau isian formulir siswa/alumni dan tetapkan verifikasi BK. Perubahan langsung tercermin di Dashboard Tracer Study.'
              : 'Mode baca saja bagi Kepala Sekolah untuk meninjau status verifikasi dan riwayat perubahan.'}
          </p>
        </div>

        <div className="row">
          <select
            aria-label="Filter status verifikasi"
            className="select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="BELUM_TERVERIFIKASI">Menunggu Verifikasi</option>
            <option value="TERVERIFIKASI">Terverifikasi</option>
            <option value="BELUM_MERESPONS">Belum Merespons</option>
          </select>
          <input
            type="search"
            className="input"
            style={{ width: '210px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, ID, jurusan..."
            aria-label="Cari alumni"
          />
        </div>
      </div>

      {feedback ? (
        <div role="status" className={feedback.tone === 'error' ? 'alert-error' : 'alert-ok'}>
          {feedback.message}
        </div>
      ) : null}

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID & Nama</th>
                <th>Angkatan / Jurusan</th>
                <th>Status Kegiatan</th>
                <th>Status Verifikasi</th>
                <th>Kesesuaian Jurusan</th>
                {isBk ? <th>Tautan HP</th> : null}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((rec) => (
                <tr key={rec.alumniId}>
                  <td>
                    <div className="tabular" style={{ fontWeight: 700, color: 'var(--navy)' }}>
                      {rec.alumniId}
                    </div>
                    <div>{rec.fullName}</div>
                  </td>
                  <td className="tabular">
                    {rec.graduationYear} · {rec.major}
                  </td>
                  <td>
                    <div>{ACTIVITY_STATUS_LABELS[rec.activityStatus]}</div>
                    {rec.company ? <div className="muted">{rec.company}</div> : null}
                    {rec.campus ? <div className="muted">{rec.campus}</div> : null}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        rec.verificationStatus === 'TERVERIFIKASI'
                          ? 'badge-green'
                          : rec.verificationStatus === 'BELUM_TERVERIFIKASI'
                            ? 'badge-yellow'
                            : ''
                      }`}
                    >
                      {VERIFICATION_STATUS_LABELS[rec.verificationStatus]}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-lavender">
                      {MAJOR_RELEVANCE_LABELS[rec.majorRelevance]}
                    </span>
                    {rec.relevanceReason ? (
                      <div className="muted" style={{ marginTop: '0.25rem' }}>
                        {rec.relevanceReason}
                      </div>
                    ) : null}
                  </td>
                  {isBk ? (
                    <td>
                      <Link
                        href={`/update/${rec.updateToken}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '12px' }}
                      >
                        Form HP
                      </Link>
                    </td>
                  ) : null}
                  <td>
                    <button
                      type="button"
                      className={isBk ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '12px' }}
                      onClick={() => {
                        setSelected(rec);
                        setEditActivity(rec.activityStatus);
                        setEditRelevance(rec.majorRelevance);
                        setEditReason(rec.relevanceReason ?? '');
                        setEditCompany(rec.company ?? '');
                        setEditCampus(rec.campus ?? '');
                      }}
                    >
                      {isBk ? 'Verifikasi' : 'Lihat Detail'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <section className="card stack" style={{ borderColor: 'var(--navy)', borderWidth: '2px' }}>
          <div className="row-between">
            <h2>
              {isBk ? 'Verifikasi BK' : 'Detail Alumni (Baca Saja)'}: {selected.fullName} (
              {selected.alumniId})
            </h2>
            <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
              Tutup
            </button>
          </div>

          {isBk ? (
            <>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="v-act">Status Kegiatan</label>
                  <select
                    id="v-act"
                    className="select"
                    value={editActivity}
                    onChange={(e) => setEditActivity(e.target.value as ActivityStatus)}
                  >
                    {ACTIVITY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ACTIVITY_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="v-rel">Kesesuaian Jurusan</label>
                  <select
                    id="v-rel"
                    className="select"
                    value={editRelevance}
                    onChange={(e) => setEditRelevance(e.target.value as MajorRelevance)}
                  >
                    {MAJOR_RELEVANCE_VALUES.map((r) => (
                      <option key={r} value={r}>
                        {MAJOR_RELEVANCE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="v-comp">Perusahaan / Usaha</label>
                  <input
                    id="v-comp"
                    className="input"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="v-camp">Kampus</label>
                  <input
                    id="v-camp"
                    className="input"
                    value={editCampus}
                    onChange={(e) => setEditCampus(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="v-reason">Alasan Penilaian Kesesuaian Jurusan</label>
                <textarea
                  id="v-reason"
                  rows={2}
                  className="textarea"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                />
              </div>

              <div className="row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={busy}
                  onClick={() => void saveVerification(false)}
                >
                  Simpan Belum Terverifikasi
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => void saveVerification(true)}
                >
                  Tetapkan Terverifikasi
                </button>
              </div>
            </>
          ) : (
            <div className="grid-2" style={{ fontSize: '14px' }}>
              <div>
                <div className="muted">Status Kegiatan</div>
                <div style={{ fontWeight: 600 }}>
                  {ACTIVITY_STATUS_LABELS[selected.activityStatus]}
                </div>
              </div>
              <div>
                <div className="muted">Kesesuaian Jurusan</div>
                <div style={{ fontWeight: 600 }}>
                  {MAJOR_RELEVANCE_LABELS[selected.majorRelevance]}
                </div>
              </div>
              <div>
                <div className="muted">Perusahaan / Kampus</div>
                <div>{selected.company ?? selected.campus ?? 'Belum tersedia'}</div>
              </div>
              <div>
                <div className="muted">Alasan Penilaian BK</div>
                <div>{selected.relevanceReason ?? 'Belum ada catatan'}</div>
              </div>
            </div>
          )}

          <div>
            <h3>Riwayat Perubahan ({selected.history.length})</h3>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', fontSize: '13px' }}>
              {selected.history.map((evt, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                  <strong>{evt.actor}</strong> ({evt.source}): {evt.summary}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
