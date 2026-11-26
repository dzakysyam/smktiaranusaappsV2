# Penyelarasan Scope Humanis Insight

## Kesimpulan

Dokumen kerja lama yang mengikuti Proposal v1.1 mengeluarkan pembayaran, siswa, dan modul sekolah terpadu dari scope. Catatan sekolah tanggal 7 November 2026 kemudian menempatkan Humanis Insight, Tracer Study, dan laporan keuangan TU sebagai prioritas. Pemilik proyek juga menyatakan role Siswa akan ditambahkan dan sembilan modul terhubung ke dashboard Kepala Sekolah.

Karena itu, baseline lama sudah tidak cukup untuk development. Permintaan terbaru harus dicatat sebagai perubahan scope dan dicocokkan dengan PRD/SRS final sebelum implementasi produksi. Paket ini menuliskan kebutuhan terbaru dengan label terbuka agar agent tidak mengarang rincian yang belum disepakati.

## Perbandingan sumber

| Sumber | Isi utama | Implikasi |
| --- | --- | --- |
| SRS Kelompok 1 v1.0, 25 Oktober 2026 | Situs publik, kinerja guru, dashboard, akun Siswa/Orang Tua dan Bendahara/TU, pembayaran | Dokumen requirement awal; masih memuat asumsi dan TBD |
| Proposal Revisi v1.1, 2 November 2026 | Portal internal dengan Guru, Kepala Sekolah, Admin; pembayaran dikecualikan | Scope proposal lebih sempit dari SRS |
| Catatan pertemuan sekolah, 7 November 2026 | Prioritas Humanis Insight, Tracer Study, Tata Usaha terutama laporan keuangan; per siswa dan bulanan/semester | Permintaan terbaru yang membuka kembali kebutuhan Tracer dan laporan keuangan |
| Klarifikasi pemilik proyek, 16 November 2026 | Role Siswa akan ada; sembilan modul memberi laporan ke Humanis Insight | Tambahan scope dan prinsip integrasi |
| DESIGN.md v2.1 dan Stitch | Release 1 sampai 3 penuh, Release 4 placeholder; 10 modul dan pengalaman dashboard pusat | Acuan visual, interaksi, dan desain, mengikuti PRD jika bertentangan |
| Repository smktiaranusaapp | Beberapa aplikasi lama dengan database dan login berbeda | Referensi proses, bukan bukti bahwa SSO atau integrasi pusat sudah ada |

## Rencana cakupan sementara

### Release 1

- Login dan RBAC pusat.
- Dashboard Kepala Sekolah sebagai pusat monitoring.
- Humanis Insight untuk penilaian kinerja guru.
- Ringkasan status dari modul yang telah memiliki data dan kontrak integrasi.
- Pusat laporan dan pengumuman internal sesuai izin.

### Release 2

- Keuangan Terpadu, dengan ringkasan pembayaran per siswa dan laporan per bulan atau semester sebagai prioritas.
- Alumni dan Tracer Study, dengan privasi responden dan definisi persentase yang disepakati.

### Release 3

- Tata Usaha, Kurikulum, Sarana dan Prasarana, Humas sesuai DESIGN.md.
- Urutan pengerjaan dapat berubah mengikuti prioritas sekolah yang sudah disepakati.

### Release 4

- Akademik, Kesiswaan, Absensi, Perpustakaan hanya tampil sebagai placeholder “Segera Hadir” sesuai prototipe.
- Dashboard pusat boleh menampilkan status modul, tetapi tidak boleh menampilkan metrik palsu.

## Perubahan yang wajib disetujui

1. Revisi Proposal/SRS yang mencatat Tracer Study dan laporan keuangan per siswa.
2. Nama dan pemilik sembilan modul yang mengirim laporan. Dugaan sementara: Humas/website publik berada di luar sembilan domain pelaporan.
3. Apakah role Siswa hanya untuk melihat profil dan tagihan sendiri, atau juga mengirim bukti pembayaran.
4. Apakah pembayaran dicatat petugas, diimpor, atau menerima unggahan bukti. SRS mengusulkan transfer manual, tetapi Proposal mengecualikan fitur pembayaran.
5. Formula laporan keuangan, termasuk pembagi persentase dan aturan pembayaran sebagian.
6. Sumber data jumlah lulusan tiap angkatan dan proses deduplikasi respons Tracer Study.
7. Apakah website publik lama diganti. Proposal v1.1 dan SRS v1.0 memberikan gambaran yang berbeda.
8. Detail ekspor PowerPoint, termasuk apakah hanya ringkasan Kepala Sekolah dan siapa yang boleh mengunduh.

## Aturan integrasi

- Modul sumber tetap menjadi pemilik data operasionalnya.
- Dashboard pusat menerima ringkasan, bukan salinan bebas seluruh tabel pribadi.
- Setiap ringkasan memiliki periode, sumber, waktu pembaruan, status, dan definisi metrik.
- Kegagalan satu modul tidak boleh membuat data modul lain hilang.
- Data kosong, stale, atau belum terhubung tampil dengan status yang jujur.
- Pengguna yang mengklik detail tetap melewati pemeriksaan RBAC pada backend.
