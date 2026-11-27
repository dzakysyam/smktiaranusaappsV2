'use client';

import { useState } from 'react';

export function ImportView() {
  const [importText, setImportText] = useState(
    'ALU-2026-0001,Budi Santoso,2026,TJKT\nALU-2026-0002,Budi Santoso,2026,MPLB',
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null);

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const graduates = importText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [alumniId = '', fullName = '', yearStr = '', major = ''] = line
            .split(',')
            .map((p) => p.trim());
          return { alumniId, fullName, graduationYear: Number(yearStr), major };
        });

      const res = await fetch('/api/v1/alumni', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ graduates }),
      });
      const body = (await res.json().catch(() => null)) as {
        data?: { created: number; updated: number };
        error?: { message?: string };
      } | null;

      if (!res.ok || !body?.data) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal mengimpor lulusan.' });
        return;
      }

      setFeedback({
        tone: 'ok',
        message: `Impor selesai: ${body.data.created} lulusan baru dan ${body.data.updated} diperbarui berdasarkan ID stabil.`,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <div>
        <h1>Impor Lulusan Resmi</h1>
        <p className="muted">
          Tambahkan daftar lulusan menggunakan ID internal stabil (bukan nama), sehingga alumni
          dengan nama sama tetap tercatat sebagai dua entitas terpisah.
        </p>
      </div>

      {feedback ? (
        <div role="status" className={feedback.tone === 'error' ? 'alert-error' : 'alert-ok'}>
          {feedback.message}
        </div>
      ) : null}

      <section className="card">
        <form onSubmit={handleImport} className="stack">
          <div className="field">
            <label htmlFor="imp-csv">
              Daftar Lulusan (format: <code>alumniId,Nama Lengkap,TahunLulus,Jurusan</code>)
            </label>
            <textarea
              id="imp-csv"
              rows={6}
              className="textarea tabular"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Mengimpor...' : 'Impor Lulusan'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
