# Tracer Study - SMK Tiara Nusa One

Aplikasi operasional pelacakan lulusan (Tracer Study) SMK Tiara Nusa One. Data individu alumni dikelola di aplikasi ini; Humanis Insight hanya menerima statistik agregat.

## Fitur Utama (Tahap Awal / Mode Demo)

- **Impor Lulusan Resmi Ber-ID Stabil:** Alumni diidentifikasi dengan `alumniId` unik (bukan nama), sehingga alumni dengan nama sama tidak pernah tertukar atau saling menimpa.
- **Tautan Pembaruan Singkat Ramah HP (`/update/[token]`):** Alumni memperbarui status kegiatan (Bekerja, Kuliah, Berwirausaha, Kombinasi, Menyatakan belum bekerja & belum kuliah, atau Belum diketahui) disertai persetujuan penggunaan data.
- **Verifikasi & Riwayat Perubahan:** Memisahkan status *Terverifikasi*, *Belum Terverifikasi* (respons baru / kandidat usulan), dan *Belum Diketahui* (tidak pernah mencampur belum merespons dengan belum bekerja).
- **Penilaian Kesesuaian Jurusan:** 4 kategori baku (`Sesuai`, `Cukup terkait`, `Tidak sesuai`, `Belum dapat dinilai`) lengkap dengan alasan yang dapat dikoreksi petugas.
- **Dashboard Agregat & Ekspor ke Humanis:** Statistik per angkatan & jurusan dengan pembagi persentase tertulis jelas, plus integrasi pengiriman ringkasan agregat (tanpa PII individu) ke Humanis Insight.

## Cara Menjalankan

```powershell
cd tracer-study
npm install
npm run dev
```

Buka `http://localhost:3200` di browser.

## Pengujian

```powershell
npm run lint
npm run typecheck
npm test
```
