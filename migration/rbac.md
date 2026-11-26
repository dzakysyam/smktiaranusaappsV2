# Matriks izin DRAF (semua pemeriksaan di backend)

V = lihat, C = buat/ubah milik domain, A = setujui, R = minta revisi, - = tidak. Peta role harus disahkan IT; Kepala Sekolah melihat bukan otomatis memverifikasi transaksi.

| Aksi | TU petugas | TU verifikator* | Kepala Sekolah | Admin portal | Siswa |
| --- | --- | --- | --- | --- | --- |
| Surat masuk/keluar dan arsip TU | V,C | V | V ringkasan berizin | - | - |
| Disposisi TU | V,C sesuai penugasan | V | V / arahan jika disetujui | - | - |
| Buat dan ajukan laporan TU | V,C | V,C* | V | - | - |
| Lihat ringkasan lintas bidang | V TU | V TU | V lintas bidang | V metadata izin | - |
| Review laporan TU di Humanis | - | - | A,R,umpan balik | - | - |
| Verifikasi pembayaran siswa | - | A* | - / A* bila IT menetapkan | - | - |
| Tagihan dan transaksi siswa | V,C sesuai penugasan* | V | V agregat saja | - | V milik sendiri jika disetujui |
| Lihat bukti/dokumen privat | izin eksplisit per objek | izin eksplisit | izin eksplisit bila sah | - | milik sendiri bila sah |

* Belum diputuskan: role verifikator, pemisahan tugas TU vs Kepala Sekolah, pengesahan laporan, hak Siswa, batas dokumen. Aksi transaksi memakai role + penugasan + status + kepemilikan + versi di server; hanya menu/UI tidak cukup. Login dan service-to-service dibedakan, event audit menyimpan actor, action, target, waktu, requestId. Aplikasi lama mempunyai role berbeda (lihat inventory.md), jangan disamakan lewat nama.
