import { randomBytes } from 'node:crypto';
import {
  computeTracerSummary,
  type ActivityStatus,
  type AlumniRecord,
  type MajorRelevance,
  type TracerAggregateSummary,
} from './tracer-domain';

export type ImportGraduateInput = {
  readonly alumniId: string;
  readonly fullName: string;
  readonly graduationYear: number;
  readonly major: string;
};

export type AlumniSelfUpdateInput = {
  readonly activityStatus: ActivityStatus;
  readonly company?: string | null;
  readonly position?: string | null;
  readonly campus?: string | null;
  readonly studyProgram?: string | null;
  readonly profileUrl?: string | null;
  readonly consentGiven: boolean;
};

export type StaffVerifyInput = {
  readonly alumniId: string;
  readonly activityStatus?: ActivityStatus;
  readonly company?: string | null;
  readonly position?: string | null;
  readonly campus?: string | null;
  readonly studyProgram?: string | null;
  readonly majorRelevance: MajorRelevance;
  readonly relevanceReason: string;
  readonly markVerified: boolean;
  readonly actorName: string;
};

export type ReportPushRecord = {
  readonly version: number;
  readonly period: string;
  readonly status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  readonly message: string;
  readonly pushedAt: string;
  readonly pushedBy: string;
};

function createDemoSeeds(): AlumniRecord[] {
  return [
    {
      alumniId: 'ALU-2025-0001',
      fullName: 'Demo Alumni Satu',
      graduationYear: 2025,
      major: 'TJKT',
      updateToken: 'demo-token-alu-2025-0001',
      activityStatus: 'BEKERJA',
      verificationStatus: 'TERVERIFIKASI',
      company: 'PT Jaringan Contoh Nusantara (Data Demo)',
      position: 'Junior Network Support',
      campus: null,
      studyProgram: null,
      profileUrl: null,
      majorRelevance: 'SESUAI',
      relevanceReason: 'Posisi dukungan jaringan sesuai kompetensi keahlian TJKT.',
      consentGiven: true,
      consentAt: '2026-10-12T08:00:00.000Z',
      dataSource: 'FORM_ALUMNI',
      updatedAt: '2026-10-12T08:00:00.000Z',
      verifiedBy: 'Demo Petugas Tracer',
      verifiedAt: '2026-10-13T09:15:00.000Z',
      history: [
        {
          at: '2026-10-01T07:00:00.000Z',
          actor: 'Sistem Impor Sekolah',
          source: 'IMPOR_SEKOLAH',
          summary: 'Lulusan diimpor dengan ID stabil ALU-2025-0001.',
        },
        {
          at: '2026-10-12T08:00:00.000Z',
          actor: 'Alumni (tautan singkat)',
          source: 'FORM_ALUMNI',
          summary: 'Alumni memperbarui status: Bekerja di PT Jaringan Contoh Nusantara.',
        },
        {
          at: '2026-10-13T09:15:00.000Z',
          actor: 'Demo Petugas Tracer',
          source: 'VERIFIKASI_PETUGAS',
          summary: 'Status diverifikasi; kesesuaian jurusan ditetapkan Sesuai.',
        },
      ],
      isDemo: true,
    },
    {
      alumniId: 'ALU-2025-0002',
      fullName: 'Demo Alumni Dua',
      graduationYear: 2025,
      major: 'MPLB',
      updateToken: 'demo-token-alu-2025-0002',
      activityStatus: 'KULIAH',
      verificationStatus: 'BELUM_TERVERIFIKASI',
      company: null,
      position: null,
      campus: 'Politeknik Contoh Negeri (Data Demo)',
      studyProgram: 'Administrasi Bisnis',
      profileUrl: null,
      majorRelevance: 'CUKUP_TERKAIT',
      relevanceReason: 'Program studi administrasi bisnis terkait dengan MPLB (menunggu verifikasi).',
      consentGiven: true,
      consentAt: '2026-11-05T10:30:00.000Z',
      dataSource: 'FORM_ALUMNI',
      updatedAt: '2026-11-05T10:30:00.000Z',
      verifiedBy: null,
      verifiedAt: null,
      history: [
        {
          at: '2026-10-01T07:00:00.000Z',
          actor: 'Sistem Impor Sekolah',
          source: 'IMPOR_SEKOLAH',
          summary: 'Lulusan diimpor dengan ID stabil ALU-2025-0002.',
        },
        {
          at: '2026-11-05T10:30:00.000Z',
          actor: 'Alumni (tautan singkat)',
          source: 'FORM_ALUMNI',
          summary: 'Alumni mengisi formulir singkat: Kuliah di Politeknik Contoh Negeri.',
        },
      ],
      isDemo: true,
    },
    {
      alumniId: 'ALU-2025-0003',
      fullName: 'Demo Alumni Tiga',
      graduationYear: 2025,
      major: 'TJKT',
      updateToken: 'demo-token-alu-2025-0003',
      activityStatus: 'WIRAUSAHA',
      verificationStatus: 'TERVERIFIKASI',
      company: 'Usaha Servis Komputer Mandiri (Data Demo)',
      position: 'Pemilik Usaha',
      campus: null,
      studyProgram: null,
      profileUrl: null,
      majorRelevance: 'SESUAI',
      relevanceReason: 'Usaha servis perangkat komputer sejalan dengan jurusan TJKT.',
      consentGiven: true,
      consentAt: '2026-10-20T14:00:00.000Z',
      dataSource: 'FORM_ALUMNI',
      updatedAt: '2026-10-20T14:00:00.000Z',
      verifiedBy: 'Demo Petugas Tracer',
      verifiedAt: '2026-10-21T08:00:00.000Z',
      history: [
        {
          at: '2026-10-01T07:00:00.000Z',
          actor: 'Sistem Impor Sekolah',
          source: 'IMPOR_SEKOLAH',
          summary: 'Lulusan diimpor dengan ID stabil ALU-2025-0003.',
        },
      ],
      isDemo: true,
    },
    {
      alumniId: 'ALU-2025-0004',
      fullName: 'Demo Alumni Empat',
      graduationYear: 2025,
      major: 'MPLB',
      updateToken: 'demo-token-alu-2025-0004',
      activityStatus: 'BELUM_BEKERJA_KULIAH',
      verificationStatus: 'TERVERIFIKASI',
      company: null,
      position: null,
      campus: null,
      studyProgram: null,
      profileUrl: null,
      majorRelevance: 'BELUM_DAPAT_DINILAI',
      relevanceReason: 'Alumni menyatakan sedang mencari kerja pada periode ini.',
      consentGiven: true,
      consentAt: '2026-11-10T11:00:00.000Z',
      dataSource: 'FORM_ALUMNI',
      updatedAt: '2026-11-10T11:00:00.000Z',
      verifiedBy: 'Demo Petugas Tracer',
      verifiedAt: '2026-11-11T09:00:00.000Z',
      history: [
        {
          at: '2026-10-01T07:00:00.000Z',
          actor: 'Sistem Impor Sekolah',
          source: 'IMPOR_SEKOLAH',
          summary: 'Lulusan diimpor dengan ID stabil ALU-2025-0004.',
        },
      ],
      isDemo: true,
    },
    {
      alumniId: 'ALU-2025-0005',
      fullName: 'Demo Alumni Lima',
      graduationYear: 2025,
      major: 'TJKT',
      updateToken: 'demo-token-alu-2025-0005',
      activityStatus: 'BELUM_DIKETAHUI',
      verificationStatus: 'BELUM_MERESPONS',
      company: null,
      position: null,
      campus: null,
      studyProgram: null,
      profileUrl: null,
      majorRelevance: 'BELUM_DAPAT_DINILAI',
      relevanceReason: null,
      consentGiven: false,
      consentAt: null,
      dataSource: 'IMPOR_SEKOLAH',
      updatedAt: '2026-10-01T07:00:00.000Z',
      verifiedBy: null,
      verifiedAt: null,
      history: [
        {
          at: '2026-10-01T07:00:00.000Z',
          actor: 'Sistem Impor Sekolah',
          source: 'IMPOR_SEKOLAH',
          summary: 'Lulusan diimpor dengan ID stabil ALU-2025-0005; belum merespons.',
        },
      ],
      isDemo: true,
    },
    {
      alumniId: 'ALU-2024-0001',
      fullName: 'Demo Alumni Angkatan Lama',
      graduationYear: 2024,
      major: 'MPLB',
      updateToken: 'demo-token-alu-2024-0001',
      activityStatus: 'KOMBINASI',
      verificationStatus: 'TERVERIFIKASI',
      company: 'Koperasi Sekolah Contoh (Data Demo)',
      position: 'Staf Administrasi',
      campus: 'Universitas Terbuka Contoh (Data Demo)',
      studyProgram: 'Manajemen',
      profileUrl: null,
      majorRelevance: 'SESUAI',
      relevanceReason: 'Bekerja di bidang administrasi sekaligus kuliah manajemen.',
      consentGiven: true,
      consentAt: '2026-09-10T09:00:00.000Z',
      dataSource: 'FORM_ALUMNI',
      updatedAt: '2026-09-10T09:00:00.000Z',
      verifiedBy: 'Demo Petugas Tracer',
      verifiedAt: '2026-09-11T09:00:00.000Z',
      history: [
        {
          at: '2026-09-01T07:00:00.000Z',
          actor: 'Sistem Impor Sekolah',
          source: 'IMPOR_SEKOLAH',
          summary: 'Lulusan diimpor dengan ID stabil ALU-2024-0001.',
        },
      ],
      isDemo: true,
    },
  ];
}

/**
 * Penyimpanan Tracer Study in-memory untuk tahap awal pengembangan lokal.
 *
 * shortcut: in-memory store kembali ke seed Data Demo saat restart;
 * migrasikan ke PostgreSQL/Prisma setelah skema produksi Tracer Study disahkan.
 */
export class TracerStore {
  private readonly records = new Map<string, AlumniRecord>();
  private readonly tokenIndex = new Map<string, string>();
  private reportVersion = 0;
  private pushLogs: ReportPushRecord[] = [];

  constructor(seedDemo = true) {
    if (seedDemo) {
      for (const item of createDemoSeeds()) {
        this.records.set(item.alumniId, item);
        this.tokenIndex.set(item.updateToken, item.alumniId);
      }
    }
  }

  listAll(): readonly AlumniRecord[] {
    return [...this.records.values()].sort((a, b) => {
      if (b.graduationYear !== a.graduationYear) {
        return b.graduationYear - a.graduationYear;
      }
      return a.alumniId.localeCompare(b.alumniId);
    });
  }

  findById(alumniId: string): AlumniRecord | null {
    return this.records.get(alumniId) ?? null;
  }

  findByToken(token: string): AlumniRecord | null {
    const id = this.tokenIndex.get(token.trim());
    return id ? (this.records.get(id) ?? null) : null;
  }

  getSummary(filter?: {
    readonly graduationYear?: number | 'ALL';
    readonly major?: string | 'ALL';
  }): TracerAggregateSummary {
    return computeTracerSummary(this.listAll(), filter);
  }

  /**
   * Impor daftar lulusan menggunakan alumniId stabil (bukan nama).
   * Dua alumni dengan nama sama tetap tersimpan terpisah bila alumniId berbeda.
   */
  importGraduates(
    items: readonly ImportGraduateInput[],
    actorName: string,
  ): { created: number; updated: number; records: AlumniRecord[] } {
    const now = new Date().toISOString();
    let created = 0;
    let updated = 0;
    const touched: AlumniRecord[] = [];

    for (const item of items) {
      const id = item.alumniId.trim().toUpperCase();
      const existing = this.records.get(id);

      if (existing) {
        const next: AlumniRecord = {
          ...existing,
          fullName: item.fullName.trim(),
          graduationYear: item.graduationYear,
          major: item.major.trim().toUpperCase(),
          updatedAt: now,
          history: [
            ...existing.history,
            {
              at: now,
              actor: actorName,
              source: 'IMPOR_SEKOLAH',
              summary: 'Pembaruan data pokok lulusan melalui impor resmi.',
            },
          ],
        };
        this.records.set(id, next);
        touched.push(next);
        updated += 1;
      } else {
        const token = `trc-${randomBytes(12).toString('base64url')}`;
        const next: AlumniRecord = {
          alumniId: id,
          fullName: item.fullName.trim(),
          graduationYear: item.graduationYear,
          major: item.major.trim().toUpperCase(),
          updateToken: token,
          activityStatus: 'BELUM_DIKETAHUI',
          verificationStatus: 'BELUM_MERESPONS',
          company: null,
          position: null,
          campus: null,
          studyProgram: null,
          profileUrl: null,
          majorRelevance: 'BELUM_DAPAT_DINILAI',
          relevanceReason: null,
          consentGiven: false,
          consentAt: null,
          dataSource: 'IMPOR_SEKOLAH',
          updatedAt: now,
          verifiedBy: null,
          verifiedAt: null,
          history: [
            {
              at: now,
              actor: actorName,
              source: 'IMPOR_SEKOLAH',
              summary: `Lulusan diimpor dengan ID stabil ${id}.`,
            },
          ],
          isDemo: true,
        };
        this.records.set(id, next);
        this.tokenIndex.set(token, id);
        touched.push(next);
        created += 1;
      }
    }

    return { created, updated, records: touched };
  }

  /**
   * Pembaruan status oleh alumni melalui tautan singkat ramah HP.
   * Respons baru berstatus BELUM_TERVERIFIKASI sampai dikonfirmasi petugas.
   */
  submitAlumniUpdate(token: string, input: AlumniSelfUpdateInput): AlumniRecord | null {
    const existing = this.findByToken(token);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const next: AlumniRecord = {
      ...existing,
      activityStatus: input.activityStatus,
      verificationStatus:
        input.activityStatus === 'BELUM_DIKETAHUI' ? 'BELUM_MERESPONS' : 'BELUM_TERVERIFIKASI',
      company: input.company?.trim() || null,
      position: input.position?.trim() || null,
      campus: input.campus?.trim() || null,
      studyProgram: input.studyProgram?.trim() || null,
      profileUrl: input.profileUrl?.trim() || null,
      consentGiven: input.consentGiven,
      consentAt: input.consentGiven ? now : existing.consentAt,
      dataSource: 'FORM_ALUMNI',
      updatedAt: now,
      verifiedBy: null,
      verifiedAt: null,
      history: [
        ...existing.history,
        {
          at: now,
          actor: 'Alumni (tautan singkat)',
          source: 'FORM_ALUMNI',
          summary: `Alumni memperbarui status kegiatan: ${input.activityStatus}.`,
        },
      ],
    };

    this.records.set(existing.alumniId, next);
    return next;
  }

  /**
   * Verifikasi atau koreksi kesesuaian jurusan oleh petugas berwenang.
   */
  verifyOrCorrect(input: StaffVerifyInput): AlumniRecord | null {
    const existing = this.records.get(input.alumniId);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const nextActivity = input.activityStatus ?? existing.activityStatus;
    const nextVerification = input.markVerified
      ? 'TERVERIFIKASI'
      : nextActivity === 'BELUM_DIKETAHUI'
        ? 'BELUM_MERESPONS'
        : 'BELUM_TERVERIFIKASI';

    const next: AlumniRecord = {
      ...existing,
      activityStatus: nextActivity,
      verificationStatus: nextVerification,
      company: input.company !== undefined ? input.company?.trim() || null : existing.company,
      position: input.position !== undefined ? input.position?.trim() || null : existing.position,
      campus: input.campus !== undefined ? input.campus?.trim() || null : existing.campus,
      studyProgram:
        input.studyProgram !== undefined ? input.studyProgram?.trim() || null : existing.studyProgram,
      majorRelevance: input.majorRelevance,
      relevanceReason: input.relevanceReason.trim() || null,
      dataSource: input.markVerified ? existing.dataSource : 'KANDIDAT_PETUGAS',
      updatedAt: now,
      verifiedBy: input.markVerified ? input.actorName : null,
      verifiedAt: input.markVerified ? now : null,
      history: [
        ...existing.history,
        {
          at: now,
          actor: input.actorName,
          source: input.markVerified ? 'VERIFIKASI_PETUGAS' : 'KANDIDAT_PETUGAS',
          summary: input.markVerified
            ? `Diverifikasi (${nextActivity}, kesesuaian: ${input.majorRelevance}).`
            : `Kandidat/koreksi dicatat (${nextActivity}, belum terverifikasi).`,
        },
      ],
    };

    this.records.set(existing.alumniId, next);
    return next;
  }

  nextReportVersion(): number {
    this.reportVersion += 1;
    return this.reportVersion;
  }

  recordPush(entry: ReportPushRecord): void {
    this.pushLogs = [entry, ...this.pushLogs].slice(0, 20);
  }

  listPushLogs(): readonly ReportPushRecord[] {
    return this.pushLogs;
  }
}

const globalStore = globalThis as typeof globalThis & { __tracerStore?: TracerStore };

export function getTracerStore(): TracerStore {
  if (!globalStore.__tracerStore) {
    globalStore.__tracerStore = new TracerStore(true);
  }
  return globalStore.__tracerStore;
}
