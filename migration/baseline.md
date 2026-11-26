# Baseline UI

Status: GAGAL DIAMBIL, tidak ada screenshot desktop/mobile. Pemeriksaan lingkungan: `php` dan `composer` tidak tersedia, direktori `vendor` dan `node_modules` SPMB tidak tersedia, browser Chromium dan paket Python Playwright tidak tersedia, tidak ada server pada localhost port 80/8000/8080/3000. Tidak memasang dependensi atau membuat screenshot sintetis. Halaman privat juga memerlukan data dan login nyata yang tidak boleh diambil dari dump.

Baseline kode saja: Epoint `includes/sidebar.php` dan `login.php`; Presta `views/layouts/sidebar.php`; Riasec `index.php` dan `asesmen.php`; SPMB `resources/views/layouts/{public,admin,student}.blade.php`; Eraport `views/layouts/sidebar.php`; Humanis PHP `includes/*_sidebar.php`. Teks/tombol yang telah ditemukan ada di inventory.md.

Setelah lingkungan staging aman: jalankan PHP/Composer dan database sintetis, akses halaman publik serta akun sintetis per role, ambil screenshot Playwright pada viewport desktop 1440x900 dan mobile 390x844 untuk landing, dashboard, daftar, detail, form, status, ekspor; catat URL, viewport, hash revisi, console error, dan tombol; bandingkan rancangan baru. Jangan memakai akun siswa sungguhan atau dump produksi.
