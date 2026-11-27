import { StudentBiodataPage } from '@/components/student-biodata-page';
import { TracerDashboardView, TracerLoginGate } from '@/components/tracer-dashboard';
import { TracerShell } from '@/components/tracer-shell';
import { getCurrentActor } from '@/lib/auth';
import { getTracerStore } from '@/lib/tracer-store';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const store = getTracerStore();
  const actor = await getCurrentActor();
  const humanisPortalUrl = process.env.HUMANIS_API_URL?.trim() || 'http://localhost:3000';

  if (!actor) {
    return <TracerLoginGate humanisPortalUrl={humanisPortalUrl} />;
  }

  if (actor.role === 'SISWA' && actor.alumniId) {
    const ownRecord = store.findById(actor.alumniId);
    if (ownRecord) {
      return <StudentBiodataPage initialRecord={ownRecord} />;
    }
  }

  const summary = store.getSummary();

  return (
    <TracerShell actor={actor} humanisPortalUrl={humanisPortalUrl}>
      <TracerDashboardView initialSummary={summary} actor={actor} />
    </TracerShell>
  );
}
