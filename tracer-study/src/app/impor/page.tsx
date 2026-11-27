import { notFound, redirect } from 'next/navigation';
import { ImportView } from '@/components/import-view';
import { TracerShell } from '@/components/tracer-shell';
import { getCurrentActor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ImporPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.role === 'SISWA') {
    redirect('/');
  }
  if (actor.role !== 'BK') {
    notFound();
  }

  const humanisPortalUrl = process.env.HUMANIS_API_URL?.trim() || 'http://localhost:3000';

  return (
    <TracerShell actor={actor} humanisPortalUrl={humanisPortalUrl}>
      <ImportView />
    </TracerShell>
  );
}
