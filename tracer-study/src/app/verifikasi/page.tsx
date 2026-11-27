import { redirect } from 'next/navigation';
import { TracerShell } from '@/components/tracer-shell';
import { VerificationView } from '@/components/verification-view';
import { getCurrentActor } from '@/lib/auth';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

export default async function VerifikasiPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.role === 'SISWA') {
    redirect('/');
  }

  const humanisPortalUrl = process.env.HUMANIS_API_URL?.trim() || 'http://localhost:3000';
  const records = getTracerStore().listAll();

  return (
    <TracerShell actor={actor} humanisPortalUrl={humanisPortalUrl}>
      <VerificationView initialRecords={records} actor={actor} />
    </TracerShell>
  );
}
