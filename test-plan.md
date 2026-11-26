# Rencana Verifikasi Humanis Insight

Dokumen ini menetapkan pemeriksaan yang harus disiapkan. Pemeriksaan berikut belum dijalankan terhadap aplikasi produksi.

## Alur pengguna

- Login, logout, sesi kedaluwarsa, dan reset akun.
- Guru membuat draf, mengirim, melihat status, memperbaiki sesuai status, dan melihat hasil miliknya.
- Kepala Sekolah membuka laporan, memverifikasi, memberi nilai, menetapkan keputusan, serta mengelola keberatan sesuai kebijakan.
- PIC mengirim laporan hanya ke modul yang ditugaskan.
- Bendahara/TU melihat, mencatat, memverifikasi, dan mengoreksi transaksi sesuai role.
- Siswa membuka halaman sendiri dan tidak dapat mengganti ID untuk melihat siswa lain.
- Tracer Study menyaring angkatan, menangani respons ganda, serta menyamarkan kontak.
- Ekspor PDF/Excel dan PowerPoint opsional menerapkan filter dan izin yang sama.

## Uji angka dan data

- Pembayaran sebagian, lunas, menunggak, menunggu verifikasi, pembatalan, dan kelebihan pembayaran.
- Cocokkan total pembayaran terverifikasi dan kekurangan dengan ledger sumber.
- Verifikasi formula persentase bulanan/semester terhadap definisi yang disahkan.
- Tracer Study: responden unik, jumlah total lulusan, pembagi status, dan persentase.
- Data sumber kosong, terlambat, gagal dimuat, dan tidak tersedia tidak menjadi nol palsu.
- Setiap angka dashboard menunjukkan sumber, periode, dan waktu pembaruan.

## Visual dan aksesibilitas

- Screenshot dashboard dan alur kritis pada 1440, 1024, 768, 390, dan 360 CSS pixel.
- Periksa overflow horizontal, tabel, sidebar/drawer, bottom tab bar, dan form panjang.
- Periksa loading, kosong, error, denied, data demo, dan data usang.
- Uji fokus keyboard, label input, urutan tab, aria-live, kontras, pembesaran 200%, dan reduced motion.
- Gunakan screenshot comparison hanya pada lingkungan dan browser baseline yang konsisten.

## Pemeriksaan keamanan

- Coba akses endpoint privat tanpa login.
- Coba akses record milik user lain dengan mengganti identifier.
- Pastikan export, file, role change, konfigurasi tarif, dan verifikasi transaksi memerlukan izin.
- Uji rate limiting pada login, reset, pencarian, upload, export, dan integrasi berbiaya.
- Pastikan server menyimpan secret, input tervalidasi, dan pesan error tidak menampilkan stack trace.
- Scan dependency serta secret sebelum release.
- Penetration testing hanya di target yang diizinkan, idealnya staging.

## Alat

Playwright CLI berguna untuk membuka halaman, mengambil snapshot, dan screenshot. Playwright Test digunakan untuk test otomatis berulang, assertion, dan visual comparison. Screenshot sendiri tidak otomatis membuktikan tampilan benar; buat assertion dan review visual yang sesuai.

## Kriteria selesai

- Tidak ada defect blocker atau high yang belum memiliki mitigasi.
- Akses silang antarrole gagal di UI maupun API.
- Angka laporan cocok dengan aturan bisnis dan memiliki provenance.
- Layout tidak rusak pada ukuran target.
- Temuan keamanan sudah diperbaiki atau diterima tertulis oleh pemilik risiko.
- UAT per role dicatat dan disetujui sekolah.
