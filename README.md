# Aplikasi Bidang SMK Tiara Nusa One

Repository ini digunakan untuk pengembangan dan pemeliharaan aplikasi bidang SMK Tiara Nusa. Setiap aplikasi dikembangkan sesuai kebutuhan unit kerja, dengan rencana integrasi autentikasi terpusat melalui Humanis Insight.

## Status Repository

Saat ini branch `main` berisi aplikasi **SENTRA**, sistem administrasi Tata Usaha yang dikembangkan dalam direktori [`sentra-tu/`](sentra-tu/).

Aplikasi Epoint, Presta, Riasec, SPMB, dan Eraport belum dimasukkan ke branch ini. Penambahan source code akan dilakukan secara bertahap setelah proses pemeriksaan kode, konfigurasi, dan data yang tidak boleh dipublikasikan.

Humanis Insight versi PHP tetap menjadi referensi sistem sebelumnya. Pengembangan SSO dan RBAC yang baru dilakukan melalui repository terpisah:

[Humanis Insight 2026–2027](https://github.com/dzakysyam/Humanis-Insight-2026-2027)

## SENTRA — Sistem Tata Usaha

SENTRA dikembangkan untuk mendukung proses administrasi Tata Usaha SMK Tiara Nusa.

Implementasi saat ini meliputi:

- Pengelolaan awal surat keluar.
- Laporan Tata Usaha dengan pencatatan versi.
- Riwayat aktivitas pengguna.
- Rancangan pertukaran laporan dengan Humanis Insight.

Aplikasi masih dalam tahap pengembangan. Integrasi SSO belum diterapkan pada server sekolah dan fitur yang tersedia masih membutuhkan pengujian bersama pengguna sebelum digunakan secara operasional.

## Teknologi

Lingkungan pengembangan SENTRA membutuhkan:

- Node.js versi 20.9 atau lebih baru.
- npm.
- PostgreSQL.
- Identity Provider yang mendukung OpenID Connect (OIDC).

SENTRA belum menyediakan Identity Provider lokal. Halaman yang memerlukan autentikasi hanya dapat diuji secara lengkap setelah penyedia OIDC dikonfigurasi.

## Menjalankan Proyek

### 1. Clone repository

```powershell
git clone https://github.com/dzakysyam/smktiaranusaappsV2.git
cd smktiaranusaappsV2
```

Jika repository sudah tersedia secara lokal, perbarui branch `main` dengan:

```powershell
git pull --ff-only origin main
```

### 2. Instal dependensi

```powershell
cd sentra-tu
npm ci
```

### 3. Konfigurasi environment

Siapkan database PostgreSQL khusus pengembangan, kemudian buat file `.env` di direktori `sentra-tu/`.

Variabel environment yang diperlukan:

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | URL koneksi database PostgreSQL |
| `SESSION_KEY` | Kunci sesi 32 byte dalam format heksadesimal |
| `APP_ORIGIN` | URL aplikasi, misalnya `http://localhost:3100` |
| `OIDC_ISSUER` | URL Identity Provider |
| `OIDC_CLIENT_ID` | Identitas klien SENTRA |
| `OIDC_CLIENT_SECRET` | Client secret jika digunakan oleh konfigurasi klien |

Untuk membuat `SESSION_KEY`, jalankan:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Simpan nilai tersebut di `.env` dan jangan memasukkan file environment ke Git.

Daftarkan redirect URI berikut pada Identity Provider:

```text
http://localhost:3100/api/auth/callback
```

Akses Tata Usaha memerlukan role `tu_staff` atau `tu_verifier` pada data UserInfo yang diterima dari Identity Provider.

### 4. Persiapan database

Jalankan dari direktori `sentra-tu/`:

```powershell
npm run db:generate
npm run db:migrate
```

Untuk mengisi data awal pengembangan jika diperlukan:

```powershell
npm run db:seed
```

Jangan menjalankan seed pada database produksi sekolah.

### 5. Jalankan aplikasi

```powershell
npm run dev
```

Akses aplikasi melalui:

http://localhost:3100

Halaman utama dapat dibuka tanpa login. Halaman surat dan laporan membutuhkan autentikasi OIDC yang sudah dikonfigurasi.

## Pengujian

Jalankan seluruh perintah dari direktori `sentra-tu/`.

### TypeScript

```powershell
npm run typecheck
```

### ESLint

```powershell
npm run lint
```

### Pengujian workflow

```powershell
node --import tsx --test tests/workflow.test.ts
```

### Pengujian lengkap

```powershell
npm test
```

`npm test` mencakup pengujian yang menulis data ke database. Gunakan database khusus pengujian yang telah dimigrasikan dan jangan menjalankannya menggunakan database produksi.

## Dokumentasi Proyek

| Dokumen | Keterangan |
| --- | --- |
| [`prd.md`](prd.md) | Kebutuhan produk dan status pengembangan |
| [`migration/inventory.md`](migration/inventory.md) | Inventaris fitur aplikasi lama |
| [`migration/parity.md`](migration/parity.md) | Daftar fitur yang harus dipertahankan selama migrasi |
| [`migration/schema.dbml`](migration/schema.dbml) | Rancangan struktur dan relasi database |

Proposal dan SRS proyek tetap menjadi acuan untuk memvalidasi kebutuhan dan keputusan implementasi.

## Alur Kontribusi

Pengembangan dilakukan melalui branch terpisah. Setiap perubahan diajukan melalui Pull Request sebelum digabungkan ke `main`.

Sebelum melakukan commit:

1. Periksa perubahan dengan `git status -sb`.
2. Tambahkan file yang relevan menggunakan `git add` dengan path spesifik.
3. Periksa staging dengan `git diff --cached --name-only`.
4. Jalankan lint, typecheck, dan pengujian yang relevan.
5. Periksa kesalahan whitespace dengan `git diff --cached --check`.
6. Commit, push branch pengembangan, lalu ajukan Pull Request untuk direview.

Hindari `git add .` jika direktori kerja masih menyimpan source code PHP lama atau file yang belum diperiksa.

File `.env`, kredensial, dump database, data unggahan, `node_modules`, dan hasil build tidak boleh dimasukkan ke repository.

## Rencana Integrasi SSO

Humanis Insight dikembangkan sebagai pusat Single Sign-On (SSO) dan Role-Based Access Control (RBAC) untuk aplikasi sekolah.

SENTRA dan aplikasi bidang lainnya akan diintegrasikan secara bertahap. Masing-masing aplikasi tetap bertanggung jawab memvalidasi sesi dan hak akses pengguna.

Migrasi akun, perubahan mekanisme login, dan penonaktifan autentikasi lama harus diuji di lingkungan pengembangan sebelum diterapkan ke server sekolah.
