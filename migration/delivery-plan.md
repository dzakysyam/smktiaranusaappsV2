# Rencana bertahap dan status nyata
Urutan sekolah terbaru: P1 Humanis Insight (portal, OIDC/RBAC dan monitoring/review), P2 Tracer Study sebagai aplikasi bidang sendiri, P3 SENTRA/TU dengan fokus awal keuangan siswa. Pekerjaan TU untuk menyiapkan pengiriman laporan boleh berjalan lebih awal oleh pemilik proyek, tanpa mengubah prioritas sekolah. Surat masuk, arsip dan disposisi tetap backlog sesudah fokus keuangan. Humanis hanya menyimpan metadata dan keputusan laporan; data operasional, laporan resmi dan transaksi tetap di bidang.

Tahap 1, SUDAH ADA DI KODE LAMA: audit statis `inventory.md` dan matriks kesetaraan `parity.md`; baseline visual belum lengkap. Proposal dan SRS asli tidak ada di workspace. Folder PHP dipertahankan.

Tahap 2, SEDANG DIBANGUN DI SENTRA: aplikasi mandiri `sentra-tu/` dengan draf/ajukan/verifikasi surat, laporan TU berversi, adapter OIDC dan kontrak lokal. Stack sementara Node.js, Next.js, TypeScript, Prisma, PostgreSQL atas keputusan pemilik. Status tes dan penghalang ada di README aplikasi; kode belum otomatis berarti layanan hidup.
Pengirim outbox sekarang memiliki opsi token layanan OIDC, HTTPS, kunci idempotensi dan pemeriksaan receipt versi; belum ada penerima Humanis produksi yang kompatibel. Pengiriman tidak otomatis berjalan tanpa pemanggil endpoint, konfigurasi IdP dan penanganan retry terjadwal.

Tahap 3, RENCANA INTEGRASI: IdP sekolah, Humanis repo lain, review Kepala Sekolah dan konfirmasi sumber, snapshot/balasan idempotent, deep link domain PHP per aplikasi, rekonsiliasi, rollback. Mock adapter bukan integrasi lintas aplikasi hidup.

MENUNGGU KEPUTUSAN SEKOLAH: proposal/SRS, kewenangan surat, aturan nomor/surat, periode dan angka keuangan, IdP/hostname, retensi, data siswa, keamanan rilis. Uji akses langsung, duplikasi, stale versi, transport gagal, browser desktop/mobile, lalu putuskan cutover tiap bidang. Jangan commit, push, deploy atau rotasi pada tahap lokal.
