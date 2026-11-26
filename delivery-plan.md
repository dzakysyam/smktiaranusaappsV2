# Pengiriman ekosistem aplikasi bidang

1. SUDAH ADA: audit statis folder PHP dalam `migration/inventory.md`, kesetaraan awal `migration/parity.md`; aplikasi PHP tidak dihapus. Proposal/SRS asli belum ada.
2. SEDANG DIBANGUN: SENTRA di `sentra-tu/` dengan stack sementara Node.js/Next.js/TypeScript/Prisma/PostgreSQL, irisan surat keluar dan laporan. Bukti berjalan serta tes dicatat setelah eksekusi, bukan diasumsikan dari dokumen.
3. RENCANA INTEGRASI: IdP OIDC sekolah, portal Humanis di repo terpisah, callback keputusan dua arah, cutover URL aplikasi bidang per domain, rekonsiliasi status dan rollback. Mock adapter bukan dua aplikasi hidup.
4. MENUNGGU KEPUTUSAN: proposal/SRS, role/verifikator, aturan surat dan laporan, nominal serta sumber tagihan, laporan keuangan bulanan/semester, hosting, IdP, retensi, sembilan modul yang melapor. Lanjut pekerjaan lokal yang tidak bergantung pada keputusan tersebut dengan seed sintetis.

Gate setiap rilis: baseline UI nyata, tes role dan record, kontrak antar aplikasi, migrasi data yang disetujui, keamanan Git, review pemilik domain, backup/rollback. Tidak commit, push atau deploy pada tahap lokal ini.
