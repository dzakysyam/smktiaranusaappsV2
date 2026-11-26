# Matriks kesetaraan fitur

Status: rancangan uji, belum ada port kode. `Terjaga` berarti syarat migrasi, bukan hasil tes. Pemilik aplikasi tetap menyimpan transaksi.

| Fitur lama dan lokasi | Perilaku terjaga | Rancangan baru (belum dibuat) | Kriteria uji | Tanya IT |
| --- | --- | --- | --- | --- |
| Epoint input/riwayat/skor, `index.php:105-125`, `input_pelanggaran.php` | Skor awal minus poin pelanggaran plus prestasi; histori, kategori, izin BK/OSIS | Domain Epoint + autentikasi pusat, ringkasan agregat ke portal | Nilai/skor/akses setara pada data sintetis, hapus hanya izin dan metode aman | Bobot, periode, pemilik data, retensi? |
| Epoint kenaikan dan alumni, `kelulusan_kenaikan.php`, `alumni.php` | Pilihan massal, arsip lulusan, ekspor | Epoint tetap sistem catatan; alumni dapat menjadi referensi tracer dengan persetujuan | Siswa terpilih berubah status sekali, arsip dapat ditelusuri | Otoritas kelulusan, sumber total lulusan? |
| Presta presensi dan finalisasi, `views/layouts/sidebar.php:63-122` | Input sekretaris, validasi wali/guru, koreksi piket, rekap | Domain Presta + izin server, ringkasan periode | Status berubah per langkah, tak bisa finalisasi oleh role salah | Batas waktu/koreksi dan tahun ajaran? |
| Riasec asesmen, `asesmen.php:198`, `proses/simpan_asesmen.php:21` | Form bertahap, validasi NIS, kirim sekali, BK baca hasil | Riasec pegang respons; identitas/izin yang disahkan | Kirim ganda ditolak, siswa lain tidak membaca hasil | Apakah peserta publik tetap tanpa SSO? |
| SPMB pendaftaran/OTP/berkas, `routes/web.php:80-149` | Form dan status bertahap, verifikasi email, unggah bukti | SPMB pegang pendaftaran/biaya; SSO cutover belakangan | Direct URL privat ditolak; bukti baru PENDING, nominal terverifikasi dihitung terpisah | Calon siswa masuk IdP kapan? |
| SPMB TPA/admin, `routes/web.php:154-288` | Sesi ujian, penilaian, verifikasi, cetak/ekspor | SPMB pegang soal dan hasil, laporan ringkas ke portal | Replay ujian ditolak, akses panitia tepat, file berizin | Siapa boleh ulang ujian/ubah hasil? |
| Eraport nilai/rapor, `index.php:287-328` | Nilai, absensi, pratinjau, cetak rapor, unggah TTD | Eraport pegang nilai dan dokumen resmi | PDF/rekap setara, TTD terbatas, guru bukan wali tidak edit kelas | Format dan legalitas tanda tangan? |
| Humanis PHP KPI/laporan, `pages/pic/pelaporan.php`, `pages/kepsek/tindak_lanjut.php` | Master bidang/KPI, tahap, refleksi, RTL, bukti, keputusan, notifikasi, Excel/cetak | Humanis baru menerima migrasi data yang disetujui; versi KPI/review dan referensi bukti | Rekonsiliasi ID/status/versi, file aman, ekspor hasil setara | Nilai/role/berkas historis mana wajib? |
| TU baru (tidak ada fitur lama) | Surat masuk/keluar, arsip, disposisi; keuangan jenis SPP/SPMB/tahunan; laporan resmi dan status keputusan | Website TU berdiri sendiri, surat/ledger sendiri; hanya snapshot ringkas dan review di Humanis | Draf surat, ajukan laporan v1, review, callback versi cocok, status terkonfirmasi; bukti PENDING bukan terbayar | Nomor surat, kewenangan disposisi, sumber piutang dan verifikator? |
| Login semua aplikasi lama | Direct URL kembali ke tujuan setelah otorisasi, semua halaman/API privat dijaga server | OIDC Authorization Code + PKCE dengan IdP standar; *belum tersedia* | Tanpa role 403, tanpa sesi redirect, callback aman; rollback aplikasi per domain | IdP/hosting/domain/cutover/akun? |

Desain tetap menunggu baseline visual nyata. Jangan klaim paritas lengkap dari tabel ini.
