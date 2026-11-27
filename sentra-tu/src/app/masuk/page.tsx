import Link from "next/link";
import Image from "next/image";
import { safeReturn } from "@/lib/auth";

type Props = { searchParams: Promise<{ returnTo?: string | string[] }> };

export default async function Masuk({ searchParams }: Props) {
  const params = await searchParams;
  const target = safeReturn(typeof params.returnTo === "string" ? params.returnTo : null);
  const loginHref = `/api/auth/login?returnTo=${encodeURIComponent(target)}`;

  return <div className="login-page">
    <section className="login-intro" aria-labelledby="login-title">
      <span className="eyebrow">AKSES TERPUSAT</span>
      <h1 id="login-title">Masuk lewat SSO sekolah.</h1>
      <p>Autentikasi berlangsung di penyedia identitas sekolah. Setelah berhasil masuk dan memiliki izin, kamu kembali ke SENTRA.</p>
      <div className="login-guide">
        <Image src="/illustrations/petugas-tu-3d.png" alt="Ilustrasi 3D petugas Tata Usaha" width={256} height={256} priority />
        <div className="login-guide-copy"><strong>Humanis Insight (rencana SSO)</strong><span>Masukkan akun sekolah hanya di halaman penyedia identitas. Pengalihan belum aktif sampai OIDC sekolah dikonfigurasi.</span></div>
      </div>
    </section>
    <section className="login-card" aria-labelledby="login-card-title">
      <div className="login-card-mark" aria-hidden="true">S</div>
      <span className="eyebrow">PORTAL PETUGAS</span>
      <h2 id="login-card-title">Masuk ke SENTRA</h2>
      <p className="muted">Kolom di bawah tidak menerima data. Jangan masukkan kata sandi sekolah di halaman ini.</p>
      <label htmlFor="sentra-username">Nama pengguna</label>
      <input id="sentra-username" name="username" type="text" placeholder="Dikelola di pusat identitas" autoComplete="off" disabled />
      <label htmlFor="sentra-password">Kata sandi</label>
      <input id="sentra-password" name="password" type="password" placeholder="Dikelola di pusat identitas" autoComplete="off" disabled />
      <a className="button login-submit" href={loginHref}>Lanjutkan lewat SSO <span aria-hidden="true">↗</span></a>
      <p className="login-note">Akses hanya untuk petugas berizin. Jika SSO belum dikonfigurasi, tombol menampilkan pemberitahuan dan tidak meminta kata sandi.</p>
      <Link className="text-link" href="/">Kembali ke beranda</Link>
    </section>
  </div>;
}
