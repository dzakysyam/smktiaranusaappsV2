import Link from "next/link";

export default function Home() {
  return <div className="landing">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="eyebrow">SISTEM TATA USAHA</span>
        <h1 id="hero-title">Pekerjaan tertata.<br /><span>Layanan lebih jelas.</span></h1>
        <p>SENTRA membantu Tata Usaha SMK Tiara Nusa One mengelola surat keluar, laporan, dan keuangan siswa dalam satu ruang kerja.</p>
        <div className="hero-actions"><Link className="button" href="/masuk">Masuk ke SENTRA <span aria-hidden="true">↗</span></Link><Link className="text-link" href="#layanan">Jelajahi layanan <span aria-hidden="true">↓</span></Link></div>
        <p className="hero-caption">Data operasional dan keputusan resmi tetap dikelola di SENTRA.</p>
      </div>
      <div className="hero-visual" aria-hidden="true"><div className="visual-grid"><span>01 / TATA USAHA</span><div className="visual-monogram">S</div><p>Tertib administrasi.<br />Terjaga jejaknya.</p></div></div>
    </section>
    <section id="layanan" className="services" aria-labelledby="services-title"><div className="section-heading"><span className="eyebrow">RUANG KERJA</span><h2 id="services-title">Satu tempat untuk tugas penting.</h2><p>Setiap fitur operasional memerlukan izin petugas. Beranda ini hanya menampilkan informasi umum.</p></div>
      <div className="service-grid"><article className="service-card"><span className="service-index">01 / ADMINISTRASI</span><h3>Surat keluar</h3><p>Susun draf, ajukan, dan telusuri riwayat verifikasi surat.</p><Link href="/masuk?returnTo=%2Fsurat">Buka surat <span aria-hidden="true">↗</span></Link></article><article className="service-card"><span className="service-index">02 / PELAPORAN</span><h3>Laporan TU</h3><p>Catat laporan berversi dan pantau status sinkronisasi serta keputusan.</p><Link href="/masuk?returnTo=%2Flaporan">Buka laporan <span aria-hidden="true">↗</span></Link></article><article className="service-card"><span className="service-index">03 / KEUANGAN</span><h3>Keuangan siswa</h3><p>Pantau tagihan dan pembayaran terverifikasi sesuai kewenangan petugas.</p><Link href="/masuk?returnTo=%2Fkeuangan">Buka keuangan <span aria-hidden="true">↗</span></Link></article></div>
    </section>
    <section className="identity-strip"><div><span className="eyebrow">AKSES SEKOLAH</span><h2>Masuk tanpa membuat akun TU baru.</h2><p>Autentikasi direncanakan melalui penyedia identitas OIDC sekolah. Humanis Insight saat ini memakai SSO internal; koneksi lintas aplikasi masih menunggu penyedia OIDC bersama.</p></div><Link className="button button-light" href="/masuk">Lihat halaman masuk <span aria-hidden="true">↗</span></Link></section>
  </div>;
}
