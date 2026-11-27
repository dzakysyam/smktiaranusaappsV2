/**
 * Domain inti Tracer Study SMK Tiara Nusa One.
 *
 * Aturan bisnis wajib:
 * - Alumni diidentifikasi dengan alumniId internal yang stabil, bukan nama.
 * - Alumni yang belum merespons (BELUM_DIKETAHUI) tidak pernah dicampur
 *   dengan alumni yang menyatakan belum bekerja dan belum kuliah.
 * - Setiap persentase menyertakan pembilang dan pembagi secara eksplisit.
 * - Jika pembagi nol, nilai persentase adalah null (tampil "Belum tersedia").
 */

export const TRACER_ROLES = ['KEPALA_SEKOLAH', 'BK', 'SISWA'] as const;
export type TracerRole = (typeof TRACER_ROLES)[number];

export const TRACER_ROLE_LABELS: Readonly<Record<TracerRole, string>> = {
  KEPALA_SEKOLAH: 'Kepala Sekolah (Baca Saja)',
  BK: 'Bimbingan dan Konseling (Verifikator)',
  SISWA: 'Siswa / Alumni',
};

export type TracerActor = {
  readonly id: string;
  readonly displayName: string;
  readonly role: TracerRole;
  readonly alumniId: string | null;
};

export const ACTIVITY_STATUSES = [
  'BEKERJA',
  'KULIAH',
  'WIRAUSAHA',
  'KOMBINASI',
  'BELUM_BEKERJA_KULIAH',
  'BELUM_DIKETAHUI',
] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const ACTIVITY_STATUS_LABELS: Readonly<Record<ActivityStatus, string>> = {
  BEKERJA: 'Bekerja',
  KULIAH: 'Kuliah',
  WIRAUSAHA: 'Berwirausaha',
  KOMBINASI: 'Kombinasi beberapa kegiatan',
  BELUM_BEKERJA_KULIAH: 'Menyatakan belum bekerja dan belum kuliah',
  BELUM_DIKETAHUI: 'Belum diketahui / belum merespons',
};

export const VERIFICATION_STATUSES = [
  'BELUM_MERESPONS',
  'BELUM_TERVERIFIKASI',
  'TERVERIFIKASI',
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_STATUS_LABELS: Readonly<Record<VerificationStatus, string>> = {
  BELUM_MERESPONS: 'Belum merespons',
  BELUM_TERVERIFIKASI: 'Belum terverifikasi',
  TERVERIFIKASI: 'Terverifikasi',
};

export const MAJOR_RELEVANCE_VALUES = [
  'SESUAI',
  'CUKUP_TERKAIT',
  'TIDAK_SESUAI',
  'BELUM_DAPAT_DINILAI',
] as const;

export type MajorRelevance = (typeof MAJOR_RELEVANCE_VALUES)[number];

export const MAJOR_RELEVANCE_LABELS: Readonly<Record<MajorRelevance, string>> = {
  SESUAI: 'Sesuai',
  CUKUP_TERKAIT: 'Cukup terkait',
  TIDAK_SESUAI: 'Tidak sesuai',
  BELUM_DAPAT_DINILAI: 'Belum dapat dinilai',
};

export type AlumniChangeEvent = {
  readonly at: string;
  readonly actor: string;
  readonly source: 'IMPOR_SEKOLAH' | 'FORM_ALUMNI' | 'KANDIDAT_PETUGAS' | 'VERIFIKASI_PETUGAS';
  readonly summary: string;
};

export type AlumniRecord = {
  readonly alumniId: string;
  readonly fullName: string;
  readonly graduationYear: number;
  readonly major: string;
  readonly updateToken: string;
  readonly activityStatus: ActivityStatus;
  readonly verificationStatus: VerificationStatus;
  readonly company: string | null;
  readonly position: string | null;
  readonly campus: string | null;
  readonly studyProgram: string | null;
  readonly profileUrl: string | null;
  readonly majorRelevance: MajorRelevance;
  readonly relevanceReason: string | null;
  readonly consentGiven: boolean;
  readonly consentAt: string | null;
  readonly dataSource: 'IMPOR_SEKOLAH' | 'FORM_ALUMNI' | 'KANDIDAT_PETUGAS';
  readonly updatedAt: string;
  readonly verifiedBy: string | null;
  readonly verifiedAt: string | null;
  readonly history: readonly AlumniChangeEvent[];
  readonly isDemo: boolean;
};

export type PublicAlumniSummaryItem = {
  readonly alumniId: string;
  readonly fullName: string;
  readonly graduationYear: number;
  readonly major: string;
  readonly updateToken: string;
  readonly activityStatus: ActivityStatus;
  readonly verificationStatus: VerificationStatus;
  readonly company: string | null;
  readonly position: string | null;
  readonly campus: string | null;
  readonly studyProgram: string | null;
  readonly profileUrl: string | null;
  readonly majorRelevance: MajorRelevance;
  readonly relevanceReason: string | null;
  readonly consentGiven: boolean;
  readonly dataSource: AlumniRecord['dataSource'];
  readonly updatedAt: string;
  readonly verifiedBy: string | null;
  readonly verifiedAt: string | null;
  readonly historyCount: number;
  readonly isDemo: boolean;
};

export type MetricRatio = {
  readonly count: number;
  readonly denominator: number;
  readonly percent: number | null;
  readonly formula: string;
};

export type TracerAggregateSummary = {
  readonly graduationYear: number | 'ALL';
  readonly major: string | 'ALL';
  readonly totalGraduates: number;
  readonly respondedCount: number;
  readonly verifiedCount: number;
  readonly unverifiedCount: number;
  readonly unknownCount: number;
  readonly responseRate: MetricRatio;
  readonly verificationRate: MetricRatio;
  readonly activityDistribution: Readonly<Record<ActivityStatus, MetricRatio>>;
  readonly relevanceDistribution: Readonly<Record<MajorRelevance, MetricRatio>>;
  readonly availableYears: readonly number[];
  readonly availableMajors: readonly string[];
  readonly generatedAt: string;
  readonly isDemo: boolean;
};

function ratio(count: number, denominator: number, formula: string): MetricRatio {
  if (denominator <= 0) {
    return { count, denominator, percent: null, formula };
  }
  return {
    count,
    denominator,
    percent: Math.round((count / denominator) * 1000) / 10,
    formula,
  };
}

/**
 * Hitung agregasi statistik Tracer Study tanpa data pribadi individu.
 * Pembagi untuk setiap persentase dinyatakan eksplisit; pembagi 0 menghasilkan null.
 */
export function computeTracerSummary(
  allRecords: readonly AlumniRecord[],
  filter?: { readonly graduationYear?: number | 'ALL'; readonly major?: string | 'ALL' },
): TracerAggregateSummary {
  const yearFilter = filter?.graduationYear ?? 'ALL';
  const majorFilter = filter?.major ?? 'ALL';

  const availableYears = [...new Set(allRecords.map((r) => r.graduationYear))].sort((a, b) => b - a);
  const availableMajors = [...new Set(allRecords.map((r) => r.major))].sort();

  const scoped = allRecords.filter((record) => {
    if (yearFilter !== 'ALL' && record.graduationYear !== yearFilter) return false;
    if (majorFilter !== 'ALL' && record.major !== majorFilter) return false;
    return true;
  });

  const totalGraduates = scoped.length;
  const verifiedCount = scoped.filter((r) => r.verificationStatus === 'TERVERIFIKASI').length;
  const unverifiedCount = scoped.filter(
    (r) => r.verificationStatus === 'BELUM_TERVERIFIKASI',
  ).length;
  const respondedCount = verifiedCount + unverifiedCount;
  const unknownCount = scoped.filter((r) => r.activityStatus === 'BELUM_DIKETAHUI').length;

  // Pembagi distribusi kegiatan: seluruh alumni yang telah menyatakan status (bukan BELUM_DIKETAHUI)
  const declaredCount = scoped.filter((r) => r.activityStatus !== 'BELUM_DIKETAHUI').length;

  const activityDistribution = {
    BEKERJA: ratio(
      scoped.filter((r) => r.activityStatus === 'BEKERJA').length,
      declaredCount,
      'Jumlah alumni bekerja dibagi total responden yang menyatakan status kegiatan',
    ),
    KULIAH: ratio(
      scoped.filter((r) => r.activityStatus === 'KULIAH').length,
      declaredCount,
      'Jumlah alumni kuliah dibagi total responden yang menyatakan status kegiatan',
    ),
    WIRAUSAHA: ratio(
      scoped.filter((r) => r.activityStatus === 'WIRAUSAHA').length,
      declaredCount,
      'Jumlah alumni berwirausaha dibagi total responden yang menyatakan status kegiatan',
    ),
    KOMBINASI: ratio(
      scoped.filter((r) => r.activityStatus === 'KOMBINASI').length,
      declaredCount,
      'Jumlah alumni kombinasi kegiatan dibagi total responden yang menyatakan status kegiatan',
    ),
    BELUM_BEKERJA_KULIAH: ratio(
      scoped.filter((r) => r.activityStatus === 'BELUM_BEKERJA_KULIAH').length,
      declaredCount,
      'Jumlah alumni yang menyatakan belum bekerja/kuliah dibagi total responden yang menyatakan status',
    ),
    BELUM_DIKETAHUI: ratio(
      unknownCount,
      totalGraduates,
      'Jumlah alumni belum diketahui/belum merespons dibagi total lulusan',
    ),
  } as const;

  const relevanceEvaluatedCount = scoped.filter(
    (r) => r.majorRelevance !== 'BELUM_DAPAT_DINILAI',
  ).length;

  const relevanceDistribution = {
    SESUAI: ratio(
      scoped.filter((r) => r.majorRelevance === 'SESUAI').length,
      relevanceEvaluatedCount,
      'Jumlah alumni sesuai jurusan dibagi total alumni yang sudah dinilai kesesuaiannya',
    ),
    CUKUP_TERKAIT: ratio(
      scoped.filter((r) => r.majorRelevance === 'CUKUP_TERKAIT').length,
      relevanceEvaluatedCount,
      'Jumlah alumni cukup terkait dibagi total alumni yang sudah dinilai kesesuaiannya',
    ),
    TIDAK_SESUAI: ratio(
      scoped.filter((r) => r.majorRelevance === 'TIDAK_SESUAI').length,
      relevanceEvaluatedCount,
      'Jumlah alumni tidak sesuai dibagi total alumni yang sudah dinilai kesesuaiannya',
    ),
    BELUM_DAPAT_DINILAI: ratio(
      scoped.filter((r) => r.majorRelevance === 'BELUM_DAPAT_DINILAI').length,
      totalGraduates,
      'Jumlah alumni belum dapat dinilai dibagi total lulusan',
    ),
  } as const;

  return {
    graduationYear: yearFilter,
    major: majorFilter,
    totalGraduates,
    respondedCount,
    verifiedCount,
    unverifiedCount,
    unknownCount,
    responseRate: ratio(
      respondedCount,
      totalGraduates,
      'Jumlah responden unik dibagi total lulusan pada filter terpilih',
    ),
    verificationRate: ratio(
      verifiedCount,
      totalGraduates,
      'Jumlah alumni terverifikasi dibagi total lulusan pada filter terpilih',
    ),
    activityDistribution,
    relevanceDistribution,
    availableYears,
    availableMajors,
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };
}
