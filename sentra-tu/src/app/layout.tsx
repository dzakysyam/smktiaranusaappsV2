import type { Metadata } from "next";
import Link from "next/link";
import "./style.css";

export const metadata: Metadata = { title: "SENTRA | Tata Usaha SMK Tiara Nusa One", description: "Ruang kerja Tata Usaha SMK Tiara Nusa One" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>
    <a className="skip-link" href="#konten">Lewati navigasi</a>
    <header className="site-header"><div className="header-inner"><Link className="brand" href="/" aria-label="SENTRA, kembali ke beranda"><span className="brand-mark" aria-hidden="true">S</span><span><strong>SENTRA</strong><small>TATA USAHA SMK TIARA NUSA ONE</small></span></Link><nav className="header-nav" aria-label="Navigasi utama"><Link href="/#layanan">Layanan</Link><Link href="/masuk" className="header-login">Masuk</Link></nav></div></header>
    <main id="konten">{children}</main>
    <footer className="site-footer"><span><strong>SENTRA</strong> · Tata Usaha SMK Tiara Nusa One</span><span>Data dan keputusan resmi tetap di aplikasi bidang.</span></footer>
  </body></html>;
}
