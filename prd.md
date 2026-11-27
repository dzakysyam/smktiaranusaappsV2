# Kebutuhan Produk Aplikasi Bidang SMK Tiara Nusa One

## Tentang dokumen ini

Dokumen ini menjelaskan arah pengembangan website bidang dalam repo `smktiaranusaapp`. Isinya disusun dari inventaris kode yang sudah dibuat tim dan kebutuhan yang disampaikan selama pembahasan proyek.

Proposal dan SRS asli belum tersedia di workspace. Karena itu, keputusan yang masih memerlukan persetujuan sekolah ditandai secara terbuka. Saat kedua dokumen tersedia, tim perlu mencocokkan isinya dengan PRD ini sebelum menetapkan ruang lingkup akhir.

## Gambaran produk
Urutan pengembangan terbaru dari sekolah adalah P1 Humanis Insight, P2 Tracer Study, P3 Tata Usaha dengan fokus awal keuangan siswa. Pemilik proyek mengerjakan irisan TU lebih dulu agar siap terhubung ke Humanis, tetapi ini tidak mengubah prioritas sekolah. Humanis mengelola portal, akses, metadata dan monitoring laporan, keputusan serta feedback; data operasional dan laporan resmi tetap di website bidang. Tracer Study menjadi aplikasi bidang tersendiri di repository ini setelah struktur dan sumber data alumni ditetapkan.

Sekolah sudah memiliki beberapa website untuk pekerjaan bidang yang berbeda. Epoint mengelola poin siswa, Presta mengelola presensi, SPMB menangani pendaftaran, dan aplikasi lain menjalankan tugasnya masing-masing. Website tersebut tetap menjadi tempat petugas bekerja dan menyimpan data operasional bidangnya.

Humanis Insight baru akan menggantikan website Humanis Insight versi PHP yang saat ini digunakan sekolah. Setelah fitur dan data yang diperlukan dipindahkan serta versi baru lolos pengujian di server sekolah, layanan PHP lama dinonaktifkan

SSO dan pertukaran laporan antarwebsite masih merupakan target pengembangan. Keduanya belum boleh disebut sebagai integrasi yang sudah berjalan di lingkungan sekolah.

## Aplikasi yang ada dan arah pengembangannya

Daftar berikut mengikuti hasil inventaris kode. Fitur yang tercantum sebagai rencana belum dianggap tersedia hanya karena sudah disebut dalam dokumen desain.

| Aplikasi | Yang ditemukan dalam kode lama | Pekerjaan berikutnya |
| --- | --- | --- |
| Epoint | Data siswa dan kelas, poin pelanggaran dan prestasi, riwayat, laporan, kenaikan, alumni, impor, serta notifikasi Telegram | Cocokkan peran BK, wali kelas, guru, dan OSIS. Tetapkan aturan poin, akses data, serta ringkasan yang boleh dikirim ke Humanis Insight. |
| Presta | Pencatatan presensi, verifikasi, pekerjaan guru piket, finalisasi, dan ekspor | Pastikan alur sekretaris kelas, wali kelas, dan guru piket sesuai dengan izin pada setiap aksi dan rute. |
| Riasec | Asesmen, hasil, dashboard BK, dan data siswa | Tentukan siapa yang boleh melihat hasil asesmen dan apakah akses publik yang ada tetap diperlukan. |
| SPMB | Pendaftaran, OTP, formulir, unggah berkas, bukti pembayaran, verifikasi admin, dan TPA | Tetapkan hubungan data calon siswa dengan siswa aktif serta pembagian tanggung jawab pembayaran antara SPMB dan Tata Usaha. |
| Eraport | Nilai, absensi, rapor, cetak, dan data guru serta siswa | Sepakati format rapor, kewenangan akses, dan penggunaan tanda tangan. |
| Humanis Insight PHP lama | Indikator, laporan kinerja, monitoring, review, ekspor Excel, dan bukti melalui Google Drive | Migrasikan fitur dan data yang masih diperlukan ke Humanis Insight baru, lalu nonaktifkan layanan PHP lama setelah penggantinya berjalan |
| SENTRA | Website Tata Usaha baru yang sedang dibangun | Pertahankan surat keluar dan laporan yang sudah ada; fokus pengembangan berikutnya pada keuangan siswa. Surat masuk, disposisi, dan arsip menyusul sesuai kebutuhan sekolah. |

Humas, Sarpras, dan Tracer Study juga termasuk kebutuhan sekolah. Implementasi website bidangnya belum ditetapkan melalui inventaris ini. Data alumni yang ditemukan di Epoint belum dapat dianggap sebagai Tracer Study karena belum mencatat kondisi lulusan setelah sekolah secara lengkap.

## SENTRA: website Tata Usaha

**SENTRA** adalah nama website Tata Usaha yang baru. Pada antarmuka, nama tersebut disertai keterangan **Tata Usaha SMK Tiara Nusa One** agar pengguna langsung memahami kegunaannya. Kode aplikasi ditempatkan di folder `sentra-tu/`.

SENTRA dipakai petugas TU untuk mengelola pekerjaan sehari-hari. Data surat, arsip, tagihan, pembayaran, dan laporan resmi TU tetap menjadi tanggung jawab aplikasi ini. Humanis Insight menerima informasi yang diperlukan untuk monitoring dan review, bukan salinan seluruh dokumen TU.

### Surat dan arsip

Alur awal surat keluar sudah sedang dibangun di SENTRA: petugas dapat membuat draf, melihat detail, mengajukan surat, dan memeriksa riwayatnya. Surat yang diajukan diverifikasi oleh petugas yang berwenang; aturan pemisahan tugas masih menunggu pengesahan sekolah.

Surat masuk, disposisi, dan pencarian arsip digital tetap dalam backlog setelah fokus keuangan siswa dan integrasi laporan. Format nomor surat, daftar penandatangan, dan masa simpan arsip masih perlu dikonfirmasi kepada sekolah.

### Laporan TU dan review Kepala Sekolah

Petugas TU menyusun laporan dari data yang tercatat di SENTRA. Setiap pengajuan memiliki versi sehingga perubahan setelah permintaan revisi dapat ditelusuri.

Saat laporan diajukan, SENTRA mengirim identitas laporan, periode, versi, status, waktu pembaruan, dan ringkasan yang diizinkan ke Humanis Insight. Kepala Sekolah dapat meninjau laporan, menyetujui, atau meminta revisi disertai catatan. Keputusan dikirim kembali ke SENTRA dan dicatat di sana sebagai bagian dari riwayat laporan. Humanis Insight menampilkan status keputusan setelah SENTRA mengonfirmasinya.

Jika salah satu aplikasi tidak dapat dihubungi, pengguna harus melihat bahwa sinkronisasi belum selesai. Sistem tidak boleh menampilkan persetujuan seolah sudah tercatat resmi ketika aplikasi sumber belum menerimanya.

### Keuangan siswa

Tahap keuangan mencakup SPP, biaya SPMB, dan biaya tahunan. Untuk setiap siswa, petugas perlu melihat jumlah kewajiban, pembayaran yang sudah diverifikasi, dan sisa yang belum dibayar. Sekolah juga membutuhkan rekap pembayaran per bulan dan semester beserta persentasenya.

Bukti pembayaran yang baru diunggah berstatus menunggu verifikasi. Nilainya belum mengurangi sisa kewajiban sampai pembayaran dinyatakan sah. Pada kode SPMB lama, pencatatan bukti dengan nominal `0` tidak dapat dipakai sebagai bukti bahwa tagihan sudah lunas.

Sebelum fitur keuangan dipakai, sekolah perlu menetapkan sumber tagihan, aturan nominal, siapa yang memverifikasi pembayaran, serta cara menangani koreksi dan pembayaran ganda.

## Akses pengguna

Setiap aplikasi bidang tetap memeriksa hak akses pada backend untuk setiap tindakan. Menyembunyikan tombol di layar tidak cukup untuk mencegah pengguna menjalankan aksi yang tidak diizinkan.

Rencana SSO memungkinkan pengguna membuka alamat website bidang secara langsung. Jika belum masuk, pengguna diarahkan ke halaman login pusat. Setelah berhasil masuk dan memiliki izin, pengguna kembali ke halaman yang semula dituju. Penerapan ini memerlukan kesepakatan dengan tim IT mengenai penyedia identitas, domain, dan perubahan pada aplikasi lama.

Izin rinci untuk petugas TU, pemverifikasi, Kepala Sekolah, admin, dan peran lain dicatat dalam matriks RBAC. Akses untuk melihat laporan tidak otomatis memberi hak untuk menyetujui laporan atau memverifikasi pembayaran. Kebutuhan role siswa juga harus diputuskan per aplikasi sebelum aksesnya dibuka.

## Target pekerjaan terdekat
Pengembangan lintas tim mengikuti P1 Humanis (IdP OIDC standar, RBAC server, snapshot laporan dan review), P2 Tracer Study (aplikasi bidang alumni), lalu P3 SENTRA (tagihan dan pembayaran terverifikasi). Irisan TU untuk menyiapkan pengiriman laporan tidak menggantikan urutan ini. Epoint, Eraport, Presta, Riasec, dan SPMB memerlukan audit login dan role masing-masing sebelum adapter login atau laporan dibuat.

Tahap awal dinyatakan selesai ketika tim dapat menjalankan dan menguji alur berikut secara lokal dengan data sintetis:

1. Pengguna yang memiliki izin masuk ke SENTRA dan membuka halaman yang dituju.
2. Petugas membuat serta mengajukan surat keluar.
3. Petugas berwenang memverifikasi surat, sementara pembuat surat tidak dapat memverifikasi miliknya sendiri sesuai aturan yang disepakati.
4. Petugas TU membuat dan mengajukan laporan dengan nomor versi.
5. Kepala Sekolah memberi persetujuan atau meminta revisi dengan catatan.
6. SENTRA mencatat keputusan tersebut, dan status yang ditampilkan Humanis Insight mengikuti hasil yang sudah dikonfirmasi.
7. Pengajuan ganda, keputusan pada versi lama, dan kegagalan sinkronisasi ditangani tanpa menggandakan keputusan atau menghilangkan jejak audit.

Pengujian lokal dengan adapter atau simulasi belum berarti SSO dan pertukaran laporan sudah aktif di website sekolah.

## Keputusan yang masih diperlukan

Sebelum penerapan untuk pengguna sekolah, tim perlu memperoleh proposal dan SRS asli serta keputusan tertulis mengenai:

- Stack akhir dan cara aplikasi bidang akan dijalankan.
- Penyedia identitas SSO, domain, dan alamat pengembalian setelah login.
- Kewenangan setiap peran untuk membuat, memverifikasi, menyetujui, merevisi, dan membatalkan.
- Format nomor surat, penandatangan, serta masa simpan arsip.
- Isi laporan yang perlu dilihat Kepala Sekolah dan data yang boleh dikirim ke Humanis Insight.
- Sumber data siswa, tagihan, dan pembayaran, termasuk tanggung jawab SPMB dan TU.
- Cara memindahkan data lama, waktu peralihan per website, dan langkah pemulihan jika terjadi masalah.

Sementara keputusan stack belum tersedia, pengembangan lokal SENTRA menggunakan Node.js, Next.js, TypeScript, Prisma, dan PostgreSQL sebagai asumsi kerja. Pilihan ini belum merupakan pengesahan dari sekolah.