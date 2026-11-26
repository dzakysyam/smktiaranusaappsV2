# Instruksi agent repo smktiaranusaapp

Repo ini berisi aplikasi bidang sekolah PHP lama dan SENTRA di `sentra-tu/`. Repo Humanis-Insight-2026-2027 TERPISAH; jangan anggap root ini working tree Humanis. Mulai dari `prd.md`, `migration/inventory.md`, lalu file kode fitur terkait. Jaga konteks ringkas dan gunakan Ponytail hanya jika tersedia.

Proposal dan SRS asli menjadi sumber tertinggi bila tersedia; saat ini tidak ada di workspace. Stack SENTRA Node.js, Next.js, TypeScript, Prisma, PostgreSQL adalah keputusan SEMENTARA pemilik, bukan keputusan sekolah. Catat perubahan scope. Status fitur wajib ditulis “sudah ada di kode lama”, “sedang dibangun di SENTRA”, “rencana integrasi”, atau “menunggu keputusan sekolah”.

Website bidang memegang data dan transaksi sendiri. Humanis baru calon portal SSO, ringkasan dan review lintas bidang. Laporan resmi dan keputusan final tersimpan di sumber. PHP lama tetap referensi; jangan hapus atau menyalin database produksi sebagai seed. Semua halaman/API privat, file dan mutasi memerlukan autentikasi serta otorisasi di backend. Gunakan IdP OIDC standar, tidak membuat login produksi palsu. Uji akses tanpa izin, replay, versi lama, transport gagal.

Jangan baca/print `.env`, token, credentials, dump SQL berisi data, unggahan, dokumen siswa atau tanda tangan. Jangan stage seluruh repo, commit, push, deploy, ubah remote/branch/riwayat tanpa instruksi. Cek staging sebelum dan sesudah. Jika mengubah UI, uji desktop/mobile dan sebutkan hambatan bila browser tidak tersedia. UI/dokumentasi berbahasa Indonesia, tanpa em dash.
