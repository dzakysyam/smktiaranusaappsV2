import Link from 'next/link';
import { AlumniUpdateForm } from '@/components/alumni-update-form';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

export default async function AlumniUpdatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = getTracerStore().findByToken(token);

  if (!record) {
    return (
      <main className="narrow">
        <div className="card stack">
          <h1>Tautan Tidak Ditemukan</h1>
          <p className="muted">
            Tautan pembaruan Tracer Study tidak valid atau sudah tidak aktif. Hubungi petugas
            sekolah untuk mendapatkan tautan terbaru.
          </p>
          <div>
            <Link href="/" className="btn btn-secondary">
              Kembali ke Beranda Tracer Study
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AlumniUpdateForm
      initial={{
        token: record.updateToken,
        alumniId: record.alumniId,
        fullName: record.fullName,
        graduationYear: record.graduationYear,
        major: record.major,
        activityStatus: record.activityStatus,
        company: record.company,
        position: record.position,
        campus: record.campus,
        studyProgram: record.studyProgram,
        profileUrl: record.profileUrl,
        consentGiven: record.consentGiven,
      }}
    />
  );
}
