import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { issueSessionToken, TRACER_SESSION_COOKIE } from '../src/lib/auth';
import { computeTracerSummary } from '../src/lib/tracer-domain';
import { TracerStore } from '../src/lib/tracer-store';
import { GET as getAlumni, POST as postAlumni } from '../src/app/api/v1/alumni/route';
import { PATCH as patchVerify } from '../src/app/api/v1/alumni/[alumniId]/verify/route';
import { GET as getMeBiodata } from '../src/app/api/v1/me/biodata/route';

function cookieHeaderFor(
  role: 'KEPALA_SEKOLAH' | 'BK' | 'SISWA',
  alumniId: string | null = null,
): string {
  const token = issueSessionToken({
    id: `test-${role.toLowerCase()}`,
    displayName: `Demo ${role}`,
    role,
    alumniId,
  });
  return `${TRACER_SESSION_COOKIE}=${token}`;
}

describe('Tracer Study domain dan store', () => {
  it('memisahkan dua alumni dengan nama sama berdasarkan alumniId stabil', () => {
    const store = new TracerStore(false);
    const result = store.importGraduates(
      [
        { alumniId: 'ALU-2026-001', fullName: 'Budi Santoso', graduationYear: 2026, major: 'TJKT' },
        { alumniId: 'ALU-2026-002', fullName: 'Budi Santoso', graduationYear: 2026, major: 'MPLB' },
      ],
      'Demo BK',
    );

    assert.equal(result.created, 2);
    assert.equal(store.listAll().length, 2);

    const first = store.findById('ALU-2026-001');
    const second = store.findById('ALU-2026-002');
    assert.ok(first && second);
    assert.notEqual(first.updateToken, second.updateToken);
    assert.equal(first.major, 'TJKT');
    assert.equal(second.major, 'MPLB');
  });

  it('tidak mencampur alumni belum merespons (BELUM_DIKETAHUI) dengan BELUM_BEKERJA_KULIAH', () => {
    const store = new TracerStore(false);
    store.importGraduates(
      [
        { alumniId: 'ALU-1', fullName: 'Alumni A', graduationYear: 2025, major: 'TJKT' },
        { alumniId: 'ALU-2', fullName: 'Alumni B', graduationYear: 2025, major: 'TJKT' },
        { alumniId: 'ALU-3', fullName: 'Alumni C', graduationYear: 2025, major: 'TJKT' },
      ],
      'Demo BK',
    );

    const a1 = store.findById('ALU-1')!;
    const a2 = store.findById('ALU-2')!;

    store.submitAlumniUpdate(a1.updateToken, {
      activityStatus: 'BEKERJA',
      company: 'PT Contoh',
      position: 'Teknisi',
      consentGiven: true,
    });
    store.submitAlumniUpdate(a2.updateToken, {
      activityStatus: 'BELUM_BEKERJA_KULIAH',
      consentGiven: true,
    });

    const summary = store.getSummary({ graduationYear: 2025 });
    assert.equal(summary.totalGraduates, 3);
    assert.equal(summary.respondedCount, 2);
    assert.equal(summary.unknownCount, 1);
    assert.equal(summary.activityDistribution.BELUM_BEKERJA_KULIAH.count, 1);
    assert.equal(summary.activityDistribution.BELUM_BEKERJA_KULIAH.denominator, 2);
    assert.equal(summary.activityDistribution.BELUM_BEKERJA_KULIAH.percent, 50);
    assert.equal(summary.activityDistribution.BELUM_DIKETAHUI.count, 1);
    assert.equal(summary.activityDistribution.BELUM_DIKETAHUI.denominator, 3);
  });

  it('mengembalikan null untuk persentase saat pembagi nol (tanpa NaN)', () => {
    const summary = computeTracerSummary([], { graduationYear: 2026 });
    assert.equal(summary.totalGraduates, 0);
    assert.equal(summary.responseRate.percent, null);
    assert.equal(summary.verificationRate.percent, null);
    assert.equal(summary.activityDistribution.BEKERJA.percent, null);
    assert.equal(summary.relevanceDistribution.SESUAI.percent, null);
  });

  it('menandai respons alumni sebagai BELUM_TERVERIFIKASI hingga diverifikasi BK dan menyimpan riwayat', () => {
    const store = new TracerStore(false);
    store.importGraduates(
      [{ alumniId: 'ALU-9', fullName: 'Demo Alumni', graduationYear: 2025, major: 'TJKT' }],
      'Demo BK',
    );
    const initial = store.findById('ALU-9')!;

    const submitted = store.submitAlumniUpdate(initial.updateToken, {
      activityStatus: 'KULIAH',
      campus: 'Politeknik Contoh',
      studyProgram: 'Teknik Komputer',
      consentGiven: true,
    });
    assert.equal(submitted?.verificationStatus, 'BELUM_TERVERIFIKASI');
    assert.equal(submitted?.history.length, 2);

    const verified = store.verifyOrCorrect({
      alumniId: 'ALU-9',
      majorRelevance: 'SESUAI',
      relevanceReason: 'Program studi Teknik Komputer linier dengan TJKT.',
      markVerified: true,
      actorName: 'Demo BK',
    });
    assert.equal(verified?.verificationStatus, 'TERVERIFIKASI');
    assert.equal(verified?.verifiedBy, 'Demo BK');
    assert.equal(verified?.history.length, 3);
  });
});

describe('RBAC 3 Role Tracer Study (BK, Kepala Sekolah baca saja, Siswa biodata sendiri)', () => {
  it('Kepala Sekolah dapat membaca daftar alumni tetapi ditolak saat memverifikasi atau mengimpor (403)', async () => {
    const kepsekCookie = cookieHeaderFor('KEPALA_SEKOLAH');

    const listRes = await getAlumni(
      new Request('http://localhost:3200/api/v1/alumni', { headers: { cookie: kepsekCookie } }),
    );
    assert.equal(listRes.status, 200);

    const verifyRes = await patchVerify(
      new Request('http://localhost:3200/api/v1/alumni/ALU-2025-0002/verify', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3200',
          cookie: kepsekCookie,
        },
        body: JSON.stringify({
          majorRelevance: 'SESUAI',
          relevanceReason: 'Tes',
          markVerified: true,
        }),
      }),
      { params: Promise.resolve({ alumniId: 'ALU-2025-0002' }) },
    );
    assert.equal(verifyRes.status, 403);

    const importRes = await postAlumni(
      new Request('http://localhost:3200/api/v1/alumni', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3200',
          cookie: kepsekCookie,
        },
        body: JSON.stringify({
          graduates: [{ alumniId: 'ALU-X', fullName: 'X', graduationYear: 2026, major: 'TJKT' }],
        }),
      }),
    );
    assert.equal(importRes.status, 403);
  });

  it('BK dapat memverifikasi data alumni (200)', async () => {
    const bkCookie = cookieHeaderFor('BK');

    const verifyRes = await patchVerify(
      new Request('http://localhost:3200/api/v1/alumni/ALU-2025-0002/verify', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3200',
          cookie: bkCookie,
        },
        body: JSON.stringify({
          majorRelevance: 'CUKUP_TERKAIT',
          relevanceReason: 'Diverifikasi oleh BK.',
          markVerified: true,
        }),
      }),
      { params: Promise.resolve({ alumniId: 'ALU-2025-0002' }) },
    );
    assert.equal(verifyRes.status, 200);
  });

  it('Siswa hanya bisa membuka biodata sendiri (/api/v1/me/biodata) dan ditolak dari daftar alumni (403)', async () => {
    const siswaCookie = cookieHeaderFor('SISWA', 'ALU-2025-0002');

    const ownRes = await getMeBiodata(
      new Request('http://localhost:3200/api/v1/me/biodata', { headers: { cookie: siswaCookie } }),
    );
    assert.equal(ownRes.status, 200);
    const ownBody = (await ownRes.json()) as { data: { alumniId: string } };
    assert.equal(ownBody.data.alumniId, 'ALU-2025-0002');

    const deniedList = await getAlumni(
      new Request('http://localhost:3200/api/v1/alumni', { headers: { cookie: siswaCookie } }),
    );
    assert.equal(deniedList.status, 403);
  });
});
