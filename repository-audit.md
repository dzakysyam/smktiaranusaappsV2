# Audit Read-only Repository

**Waktu pemeriksaan:** 16 November 2026. Pemeriksaan statis; aplikasi tidak dijalankan dan tidak ada perubahan yang didorong ke GitHub.

## Repository

| Repository | Kondisi saat diperiksa |
| --- | --- |
| pedroNCA/smktiaranusaapp | HEAD 8091fc7, commit 7 November 2026. Berisi beberapa aplikasi sekolah pada folder/domain yang berbeda |
| dzakysyam/Humanis-Insight-2026-2027 | HEAD 8878693, commit 15 November 2026. Baru berisi README.md |

## Peta aplikasi lama

| Folder | Fungsi yang terlihat |
| --- | --- |
| humanis-insight | PHP/MySQL untuk indikator, laporan kinerja guru, monitoring, Excel, dan cetak |
| spmb.smktiaranusa.sch.id | Aplikasi SPMB dengan dashboard calon siswa, formulir pendaftaran, dan verifikasi biaya pendaftaran |
| epoint.smktiaranusa.sch.id | Administrasi siswa, pelanggaran/prestasi, kelulusan, dan arsip alumni |
| presta | Aplikasi presensi |
| eraport.smktiaranusa.sch.id | Aplikasi e-rapor |
| riasec.smktiaranusa.sch.id | Asesmen minat/bakat siswa |

Aplikasi berada pada folder, konfigurasi, session, dan database yang berbeda. Belum terlihat satu penyedia identitas dan RBAC pusat yang dipakai semua aplikasi. OAuth yang terlihat pada Humanis terkait alur Google Drive, bukan bukti SSO platform lintas aplikasi.

## Kesesuaian fitur

- Humanis lama mempunyai role Kepala Sekolah, Wakil Kepala, Guru/PIC, dan Operator pada skema. Tidak ada role Siswa di Humanis.
- SPMB mempunyai area calon siswa. Akun tersebut mengurus pendaftaran, bukan role Siswa terpadu lintas modul.
- Epoint mempunyai arsip alumni dan ekspor. Audit ini tidak menemukan kuesioner tracer study atau pencatatan hasil karier alumni.
- SPMB mengelola biaya pendaftaran dan verifikasi bukti. Itu belum membuktikan adanya buku tagihan SPP bulanan dan biaya tahunan, tunggakan per siswa, atau laporan semester.
- Humanis lama menyediakan Excel dan cetak browser. Tidak ditemukan ekspor PowerPoint.
- Tidak ada bukti bahwa data antar aplikasi sudah mengalir ke satu dashboard SSO.

## Temuan keamanan yang harus ditangani sebelum memakai kode

Repository sumber dapat di-clone dari URL yang diberikan. Di dalamnya terdapat file konfigurasi environment yang terlacak di Git, termasuk nilai database yang terisi, serta dump SQL dengan data akun dan informasi sekolah/siswa. Nilai rahasia sengaja tidak disalin ke dokumen ini.

Path yang perlu diperiksa oleh pemilik repository:

- eraport.smktiaranusa.sch.id/.env
- riasec.smktiaranusa.sch.id/.env
- humanis-insight/.env.example
- Dump SQL dengan pola irotzkba_*.sql di beberapa aplikasi

Perlakukan credential yang pernah masuk repository sebagai terekspos. Rotasi password dan key terkait, hapus data pribadi dari sumber, tambahkan aturan ignore, dan bersihkan riwayat Git. Menghapus file hanya pada commit terbaru tidak menghapus nilai dari commit lama. Simpan migrasi skema dan seed sintetis, bukan dump produksi.

## Saran pemakaian

- Jangan menyalin seluruh repository lama secara langsung ke repository tim.
- Petakan aturan bisnis dan field terlebih dahulu, lalu migrasikan hanya kode yang disetujui dan data yang sudah disanitasi.
- Repository tim saat ini bersih dari source aplikasi selain README. Gunakan kesempatan ini untuk menetapkan struktur, aturan ignore, CI, secret scanning, dan dokumentasi.
- Audit ini bukan penetration test dan belum memverifikasi kerentanan saat runtime.
