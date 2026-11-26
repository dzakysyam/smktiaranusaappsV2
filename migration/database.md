# Desain data konseptual (belum migrasi)

`schema.dbml` adalah ERD DRAF yang dapat ditempel ke dbdiagram.io, tidak dibuat dari dump produksi. DB TU milik TU; Humanis baru mempunyai entitas snapshot/review saja. Identitas `subject` berasal dari IdP, bukan nama, NISN, atau password aplikasi lama. Pisahkan `student_ref` internal dari NISN; penyelarasan ke Epoint/SPMB menunggu sumber master disetujui.

Rumus usulan keuangan: kewajiban = jumlah tagihan sah per kategori/periode; dibayar = alokasi dari transaksi yang VERIFIKASI_DISAHKAN saja; kekurangan = maksimum(kewajiban - dibayar, 0). Bukti baru berstatus MENUNGGU, tidak dihitung. Semester dan tahun ajaran mengikuti kalender yang disahkan; koreksi, refund, kelebihan bayar, keterlambatan, pembulatan dan pembayaran parsial perlu keputusan sebelum menghitung persentase resmi. SPMB payment amount=0 pada unggah bukti tidak dapat dipakai sebagai nominal.

Rancang migration versioned, FK/index/unique, transaksi dan outbox/inbox; seed hanya sintetis. Migrasi data nyata baru sesudah persetujuan pemilik, transformasi teruji, perbandingan total dan aturan retensi. Jangan import dump lama sebagai seed. Riwayat keputusan adalah append-only; laporan sumber menyimpan versi immutable untuk review.
