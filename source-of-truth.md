# Acuan dan Status Keputusan

## Urutan acuan

1. Keputusan terbaru yang disampaikan langsung oleh pemilik proyek dan sekolah, termasuk catatan pertemuan 7 November 2026 dan klarifikasi pemilik tentang sembilan modul.
2. PRD Humanis Insight v1.0 yang disebut dalam bahan Stitch. PRD lengkap belum ada di berkas yang dapat diperiksa pada sesi ini. Bagian PRD yang dikutip di DESIGN.md hanya bukti parsial.
3. SRS Kelompok 1 v1.0 tanggal 25 Oktober 2026 sebagai rancangan requirement, bukan bukti persetujuan final.
4. Proposal Pengembangan Humanis Insight Revisi v1.1 tanggal 2 November 2026 untuk batas proposal dan pendekatan teknis. Ketentuan proposal yang bertentangan dengan arahan sekolah terbaru harus dicatat sebagai perubahan scope.
5. DESIGN.md v2.1 dan ekspor Google Stitch sebagai sumber visual serta interaksi. Bila bertentangan dengan PRD, ikuti PRD.
6. Repository smktiaranusaapp sebagai referensi implementasi sistem lama, bukan sumber kebijakan bisnis.

## Keputusan yang sudah disampaikan

| Keputusan | Status |
| --- | --- |
| Humanis Insight menjadi pusat monitoring Kepala Sekolah | Dikonfirmasi pemilik proyek |
| Sembilan modul bidang terhubung ke pusat monitoring | Dikonfirmasi pemilik proyek; daftar final modul perlu dipastikan |
| Prioritas sekolah: Humanis Insight, Tracer Study, Tata Usaha terutama laporan keuangan | Catatan pertemuan sekolah tanggal 7 November 2026 |
| Keuangan menampilkan total pembayaran dan kekurangan tiap siswa | Permintaan sekolah |
| Laporan keuangan tersedia per bulan atau semester dengan persentase | Permintaan sekolah; definisi persentase belum disahkan |
| Ekspor laporan Humanis Insight ke PowerPoint | Opsional bila memungkinkan |
| Role Siswa akan ditambahkan | Keputusan pemilik proyek; hak detail belum dirumuskan |
| Release 1 sampai 3 didesain penuh, Release 4 berupa placeholder | Arahan prototipe |
| Menu sidebar memiliki tiga grup dan modul sekolah dibuka dari Portal Modul | Keputusan pemilik proyek |
| Setiap modul mengirim ringkasan yang dapat dipantau Kepala Sekolah | Arahan integrasi |

## Sumber yang belum tersedia atau belum disahkan

- PRD lengkap v1.0 yang disebut oleh DESIGN.md.
- Daftar final sembilan modul yang mengirim laporan. Interpretasi sementara: Humas adalah modul website publik terpisah, sedangkan sembilan modul operasional lainnya memberi ringkasan ke dashboard. Jangan mengunci interpretasi ini sebelum daftar dikonfirmasi.
- Revisi proposal atau berita acara yang memasukkan perubahan dari pertemuan 7 November.
- Definisi role Siswa, termasuk apakah akun orang tua diperlukan dan apakah siswa dapat melihat atau mengunggah pembayaran.
- Cara input dan verifikasi pembayaran, apakah manual, impor, atau terhubung ke layanan pembayaran.
- Formula resmi persentase laporan keuangan dan tracer study.
- Field tracer study, sumber data final, jumlah lulusan per angkatan, masa retensi, dan persetujuan penggunaan data.
- Template, isi, dan kebutuhan format PowerPoint.
- Hosting produksi, pemilik database, mekanisme SSO lintas aplikasi, serta jadwal refresh laporan.

## Aturan agent

- Jika dua sumber bertentangan, jelaskan konfliknya di scope-alignment.md dan jangan diam-diam memilih asumsi yang mengubah hak pengguna atau transaksi.
- Contoh dan angka pada layar Stitch adalah data demo sampai dibuktikan dengan sumber produksi.
- Kode lama boleh dipelajari untuk pemetaan alur. Dilarang menyalin file .env, credential, dump data nyata, atau database produksi ke repository tim.
