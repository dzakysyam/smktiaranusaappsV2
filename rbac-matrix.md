# Matriks izin kerja aplikasi bidang

Status kode lama berbeda per aplikasi dan tidak mewarisi role pusat otomatis. `migration/inventory.md` mencatat role yang ditemukan; `migration/rbac.md` mencatat keputusan yang belum disahkan.

| Aksi SENTRA | Petugas TU | Verifikator TU | Kepala Sekolah | Akun tanpa role TU |
| --- | --- | --- | --- | --- |
| Lihat daftar/detail surat | Ya | Ya | Tidak otomatis | Tidak |
| Buat/ajukan surat | Ya, milik sendiri | Tidak | Tidak | Tidak |
| Verifikasi surat | Tidak; pembuat tidak boleh verifikasi sendiri | Ya | Tidak otomatis | Tidak |
| Lihat/buat/ajukan laporan TU | Ya | Baca bila ditugaskan | Baca ringkasan portal kelak | Tidak |
| Review laporan di Humanis | Tidak | Tidak | Rencana, di portal | Tidak |
| Callback keputusan ke TU | Hanya service berizin, bukan pengguna UI | Hanya service berizin | Tidak via sesi TU | Tidak |
| Pembayaran/verifikasi | Menunggu keputusan sekolah | Menunggu keputusan | Menunggu keputusan | Tidak |

Izin dipaksakan di backend terhadap role, pemilik record, status dan versi. Nama role sementara untuk pengujian lokal tidak memberikan kewenangan produksi. Kepala Sekolah melihat ringkasan bukan otomatis mengesahkan transaksi. Peran sekretaris, wali kelas, piket, BK, panitia SPMB mengikuti izin tiap sistem sampai migrasi yang diuji.
