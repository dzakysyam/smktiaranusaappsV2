import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import Home from "../src/app/page";
import Masuk from "../src/app/masuk/page";
import { NextRequest } from "next/server";
import { GET as startLogin } from "../src/app/api/auth/login/route";

test("beranda publik mengenalkan SENTRA dan menyediakan jalan masuk terpusat", () => {
  const html = renderToStaticMarkup(createElement(Home));
  assert.match(html, /Tata Usaha SMK Tiara Nusa One/);
  assert.match(html, /Surat keluar/);
  assert.match(html, /Keuangan siswa/);
  assert.match(html, /href="\/masuk"/);
  assert.doesNotMatch(html, /type="password"/);
  assert.doesNotMatch(html, /[—–]/);
});

test("halaman masuk mengunci kredensial dan memulai OIDC dari backend", async () => {
  const html = renderToStaticMarkup(await Masuk({ searchParams: Promise.resolve({ returnTo: "/laporan" }) }));
  assert.match(html, /<input[^>]*disabled=""[^>]*name="username"/);
  assert.match(html, /<input[^>]*disabled=""[^>]*name="password"/);
  assert.match(html, /href="\/api\/auth\/login\?returnTo=%2Flaporan"/);
  assert.match(html, /<a[^>]*class="button login-submit"[^>]*href="\/api\/auth\/login\?returnTo=%2Flaporan"/);
  assert.match(html, /%2Fillustrations%2Fpetugas-tu-3d\.png/);
  assert.match(html, /Humanis Insight \(rencana SSO\)/);
  assert.match(html, /Pengalihan belum aktif sampai OIDC sekolah dikonfigurasi/);
  assert.doesNotMatch(html, /<form/);
  assert.doesNotMatch(html, /humanis_session/);
  assert.doesNotMatch(html, /[—–]/);
});

test("tujuan kembali eksternal tidak diteruskan ke alur autentikasi", async () => {
  const html = renderToStaticMarkup(await Masuk({ searchParams: Promise.resolve({ returnTo: "//example.com" }) }));
  assert.match(html, /href="\/api\/auth\/login\?returnTo=%2Fsurat"/);
  assert.doesNotMatch(html, /example\.com/);
});

test("login tanpa penyedia OIDC yang lengkap gagal tertutup, bukan 500", async () => {
  const issuer = process.env.OIDC_ISSUER;
  const clientId = process.env.OIDC_CLIENT_ID;
  try {
    delete process.env.OIDC_ISSUER;
    delete process.env.OIDC_CLIENT_ID;
    const response = await startLogin(new NextRequest("http://localhost:3100/api/auth/login"));
    assert.equal(response.status, 503);
    assert.doesNotMatch(response.headers.get("location") || "", /humanis/i);
  } finally {
    if (issuer === undefined) delete process.env.OIDC_ISSUER; else process.env.OIDC_ISSUER = issuer;
    if (clientId === undefined) delete process.env.OIDC_CLIENT_ID; else process.env.OIDC_CLIENT_ID = clientId;
  }
});
