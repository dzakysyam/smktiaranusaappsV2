# Keamanan repo bidang dan SENTRA

Status: kode PHP lama tetap referensi lokal, bukan siap dipublikasi. Nama `.env` di Eraport/Riasec dan dump SQL di beberapa aplikasi terdeteksi tanpa membuka isinya. Kredensial yang pernah tercommit perlu diinventaris dan dirotasi pemilik sekolah. `.gitignore` bukan pembersih history; jangan bypass GitHub push protection. Jangan git add seluruh tree lama, commit/push, atau deploy pada tahap ini.

SENTRA: data demo sintetis, cookie sesi server aman setelah login IdP OIDC standar, validasi role per halaman, API, berkas, dan transisi status; scope layanan dan replay/idempotensi untuk callback. Jangan buat login palsu produksi. Adapter kontrak lokal wajib dikunci pada lingkungan nonproduksi dan tidak mengklaim koneksi Humanis. Secret melalui environment server, bukan source/log/browser.

Temuan audit yang perlu ditangani per domain: Epoint `password_plain` di skema dan penghapusan GET; Riasec penghapusan GET; SPMB grup admin hanya `auth` dan `/clear-c` terbuka; Humanis PHP lama action import tanpa guard role awal. Ini pembacaan statis, bukan bukti eksploitasi. Lakukan audit data produksi dan rotasi melalui pemilik tanpa mengirim nilai rahasia di chat.
