# Aplikasi SMK Tiara Nusa One

Repositori ini berisi beberapa website yang digunakan oleh bidang di SMK Tiara Nusa One: Epoint, Presta, Riasec, SPMB, Eraport, dan Humanis Insight versi PHP. Masing-masing memiliki pekerjaan dan data operasionalnya sendiri.

Kami sedang membangun **SENTRA**, website Tata Usaha, di folder [`sentra-tu/`](sentra-tu/). Pekerjaan awalnya mencakup surat keluar dan laporan TU. Cara menjalankan aplikasi serta batas fitur yang sudah dapat diuji ada di [`sentra-tu/README.md`](sentra-tu/README.md).

Humanis Insight versi PHP dalam repo ini adalah sistem lama. Penggantinya dikembangkan di repo Humanis-Insight-2026-2027 dan akan di-deploy ke server sekolah setelah migrasi serta pengujian selesai. Selama proses itu, kode PHP lama dipertahankan sebagai referensi dan cadangan
## Dokumen proyek

- [`prd.md`](prd.md): kebutuhan produk dan status tiap fitur.
- [`migration/inventory.md`](migration/inventory.md): hasil pemeriksaan aplikasi PHP yang ada.
- [`migration/parity.md`](migration/parity.md): fitur lama yang perlu dipertahankan saat migrasi.

Stack SENTRA saat ini masih menjadi asumsi kerja. Proposal dan SRS asli belum tersedia untuk memastikan keputusan teknis akhir.

## Sebelum membuat commit

Periksa file yang akan masuk ke commit satu per satu. Jangan ikutkan `.env`, kredensial, dump database, berkas unggahan, atau dependensi hasil instalasi. Riwayat aplikasi lama juga perlu diperiksa sebelum dipublikasikan ke repositori baru