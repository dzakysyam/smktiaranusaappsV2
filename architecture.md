# Arsitektur ekosistem aplikasi bidang

Status: PHP bidang SUDAH ADA, SENTRA SEDANG DIBANGUN, SSO dan Humanis lintas repo RENCANA INTEGRASI. Proposal/SRS asli belum tersedia. Stack SENTRA Node.js, Next.js, TypeScript, Prisma, PostgreSQL adalah keputusan sementara pemilik, bukan standar sekolah yang final.

Epoint, Presta, Riasec, SPMB, Eraport, Humanis PHP lama tetap dalam folder masing-masing. `sentra-tu/` aplikasi mandiri dan pemilik surat/laporan TU. Humanis-Insight-2026-2027 tidak berada dalam working tree ini dan tidak menyimpan transaksi TU. Tidak ada perpindahan database produksi. `migration/inventory.md` dan `migration/parity.md` memuat batas kesetaraan.

Target SSO: OIDC Authorization Code + PKCE dari IdP standar; tiap backend memvalidasi token ID dan sesi serta role setiap request. Deep link URL lama dikembalikan setelah login dan validasi allowlist. Jangan menyebut sesi internal Humanis sebagai penyedia OIDC. Login PHP lama dinonaktifkan per aplikasi hanya setelah tes, persetujuan IT, dan rollback siap.

Target laporan: sumber membuat versi dan outbox; kirim ringkasan + sumber + versi + periode ke Humanis; review Kepala Sekolah di portal; callback terautentikasi ke sumber; keputusan resmi dicatat sumber dan status dikonfirmasi ke portal. Idempotency dan versi mencegah pengulangan/stale; kegagalan terlihat. SENTRA lokal mengimplementasikan adapter kontrak, bukan koneksi produksi ke Humanis. Lihat `migration/api-contract.md`.
