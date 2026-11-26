# Basis data aplikasi bidang

Status: enam skema lama di dump lokal (metadata tabel diaudit dalam `migration/inventory.md`) SUDAH ADA, tidak berarti menjadi satu database. Jangan memakai dump nyata untuk seed, jangan menyalin nilai atau kredensial. Humanis PHP lama adalah skema terpisah; Humanis baru berada di repo lain.

SENTRA memakai PostgreSQL/Prisma SEMENTARA. Skema surat keluar, status/audit, laporan dan versi/outbox/inbox berada di `sentra-tu/prisma/schema.prisma`, migration dan seed sintetis. `migration/schema.dbml` mencatat desain lintas tahap; tabel surat masuk/disposisi/arsip/keuangan/portal di sana masih RENCANA, bukan seluruhnya telah dibuat. Tidak ada FK antar database portal dan TU.

Keuangan menunggu keputusan: jenis tagihan SPP, SPMB, tahunan; alokasi hanya pembayaran terverifikasi; kekurangan = maks(kewajiban minus terverifikasi, nol). Pembayaran SPMB amount 0 saat bukti masuk adalah PENDING, bukan lunas. Periode, nominal, refund, koreksi, pembulatan, bukti dan sumber siswa harus disahkan sebelum migration finansial.
