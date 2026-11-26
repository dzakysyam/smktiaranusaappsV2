# Kontrak aplikasi bidang ke portal Humanis

Status: DRAF. Kontrak lokal SENTRA ada di `sentra-tu/` dan `migration/api-contract.md`; endpoint Humanis baru belum diimplementasikan di working tree ini. Portal adalah repo terpisah. Jangan menyebut mock lokal sebagai sinkronisasi produksi.

Sumber TU memiliki surat dan laporan resmi. Pengajuan membawa `sourceSystem`, `reportId`, `version`, periode, status, ringkasan agregat, `sourceUpdatedAt`, dan referensi bukti opaque; `Idempotency-Key` dan audience layanan wajib. Portal hanya menyimpan snapshot dan review. Keputusan membawa `decisionId`, `reportId`, `version`, aksi setuju/revisi, feedback, dan identitas reviewer. Backend sumber memverifikasi IdP, scope, izin, status dan versi, mencatat audit, baru mengembalikan konfirmasi. Replay identik aman; versi usang 409; kegagalan transport tetap terlihat dan dapat dicoba ulang terbatas. Detail transaksi/berkas tidak dikirim ke portal.

Kontrak bagi Epoint/Presta/Riasec/SPMB/Eraport masih rencana, belum ada endpoint bersama. URL lama dan endpoint privat harus menjaga izin backend setelah cutover.
