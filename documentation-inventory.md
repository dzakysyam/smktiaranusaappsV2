# Inventaris asal dan relevansi dokumen Markdown

Inventaris berdasarkan judul, isi, lokasi dan audit kode. Asal “salinan Humanis” merujuk dokumen root yang menggambarkan portal Humanis baru dan sebelumnya disalin pengguna, bukan hasil verifikasi Git origin per file. Dokumen bertanda lintas sistem berisi sebagian aturan yang masih berguna, tetapi tidak otomatis menjadi spesifikasi bidang. Proposal/SRS asli belum ditemukan.

| File root | Asal/kategori | Tindakan |
| --- | --- | --- |
| README.md | salinan Humanis baru | ditulis ulang sebagai pintu repo bidang |
| prd.md | salinan Humanis baru | ditulis ulang untuk bidang dan SENTRA |
| architecture.md | salinan Humanis baru, batas lintas sistem sebagian relevan | ditulis ulang pemilik data dan integrasi |
| api-contract.md | salinan Humanis baru, kontrak lintas sistem relevan | ditulis ulang sesuai adapter TU dan batas draf |
| database-design.md | salinan Humanis baru, konsep kepemilikan relevan | ditulis ulang membedakan skema bidang/portal |
| rbac-matrix.md | salinan Humanis baru | ditulis ulang per aksi TU, portal bukan role otomatis |
| security.md | salinan Humanis baru, temuan keamanan lintas sistem relevan | ditulis ulang guard backend dan history Git |
| design.md | salinan Humanis baru | ditulis ulang sebagai baseline TU, bukan UI portal |
| delivery-plan.md | salinan Humanis baru | ditulis ulang urutan bidang dan gate |
| AGENTS.md | instruksi repo yang sudah disesuaikan, bukan spesifikasi produk | diselaraskan folder SENTRA |
| repository-audit.md | salinan/audit lama yang memetakan beberapa bidang dan portal | referensi historis, verifikasi klaim di `migration/inventory.md` |
| scope-alignment.md, source-of-truth.md | salinan Humanis baru | referensi historis portal saja, bukan keputusan repo ini |
| test-plan.md, stitch-audit.md | salinan rencana tes/desain Humanis baru | referensi historis portal, tidak untuk verifikasi TU |
| skills.md | panduan perkakas bersama yang terbawa dari Humanis | referensi opsional, bukan status fitur |

| File migration/ | Asal/kategori | Status |
| --- | --- | --- |
| README.md, inventory.md, parity.md, baseline.md | audit smktiaranusaapp | inventaris kode lama dan batas baseline |
| prd.md, architecture.md, database.md, schema.dbml, rbac.md | rancangan audit smktiaranusaapp | sementara, DBML bukan migration penuh |
| api-contract.md, security.md, delivery-plan.md | rancangan audit dengan batas lintas sistem | kontrak/syarat integrasi belum disahkan |

Dokumen root historis yang tidak diubah tetap tersedia untuk telusur; `prd.md` dan audit migration adalah acuan kerja saat ini. Status tiap fitur: “sudah ada di kode lama”, “sedang dibangun di SENTRA”, “rencana integrasi”, atau “menunggu keputusan sekolah”.
