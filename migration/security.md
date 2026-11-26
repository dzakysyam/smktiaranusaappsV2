# Gate keamanan

Sudah terdeteksi berdasarkan NAMA file saja: `eraport.smktiaranusa.sch.id/.env`, `riasec.smktiaranusa.sch.id/.env`, `.env.example` beberapa aplikasi, serta dump `irotzkba_*.sql` dan dump Humanis. Tidak dibuka atau dicetak. Riwayat Git sumber terdahulu diketahui terblokir oleh push protection; anggap credential terdampak terekspos. Pemilik sekolah/IT perlu menginventaris lalu merotasi password database, email, OAuth/Drive, bot/API token, encryption key dan akun terkait sesuai temuan internal, tanpa mengirim nilainya di chat/Git. Jangan bypass push protection.

Root `.gitignore` menutup env, credential/token, dump SQL, uploads, file DB, private key, vendor, node_modules. Itu hanya mencegah add berikutnya, BUKAN membersihkan riwayat atau file yang sudah terlacak di upstream. Jangan commit/merge/push clone lama sebelum pemilik memutuskan strategi publikasi repo bersih.

Temuan statis untuk ditindak sebelum migrasi: Epoint `users.password_plain`, penghapusan via GET; Riasec penghapusan siswa via GET; SPMB `/admin` hanya `auth`, `/clear-c` di luar auth; Humanis lama action import tanpa guard awal. Audit endpoint/file langsung semua aplikasi, CSRF, IDOR, ownership, upload MIME/ukuran, log tanpa PII, sesi server dan izin versi. Ini risiko kode, bukan bukti eksploitasi di produksi.

Gate: seed sintetis, izin backend dan tes negatif, audit log, review akses berkas, backup/restore, validasi IdP JWKS dan redirect allowlist, rollback per domain, persetujuan IT atas rotasi serta pembersihan history di luar tahap ini.
