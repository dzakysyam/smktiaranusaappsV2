'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { TRACER_ROLE_LABELS, type TracerActor } from '@/lib/tracer-domain';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TS';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export function TracerShell({
  actor,
  humanisPortalUrl,
  children,
}: {
  actor: TracerActor;
  humanisPortalUrl: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isBk = actor.role === 'BK';

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/v1/auth/session', { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="app-shell">
      {open ? (
        <button
          type="button"
          aria-label="Tutup navigasi"
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} aria-label="Navigasi Tracer Study">
        <Link href="/" className="sidebar-brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">TS</span>
          <div>
            <p className="brand-title">Tracer Study</p>
            <p className="brand-sub">SMK Tiara Nusa One</p>
          </div>
        </Link>

        <nav className="sidebar-nav">
          <div>
            <p className="nav-group-label">UMUM</p>
            <ul className="nav-list">
              <li>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={`nav-link ${pathname === '/' ? 'nav-link-active' : ''}`}
                >
                  Dashboard Tracer Study
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="nav-group-label">VERIFIKASI & DATA</p>
            <ul className="nav-list">
              <li>
                <Link
                  href="/verifikasi"
                  onClick={() => setOpen(false)}
                  className={`nav-link ${pathname.startsWith('/verifikasi') ? 'nav-link-active' : ''}`}
                >
                  {isBk ? 'Sistem Verifikasi BK' : 'Pantau Verifikasi Alumni'}
                </Link>
              </li>
              {isBk ? (
                <li>
                  <Link
                    href="/impor"
                    onClick={() => setOpen(false)}
                    className={`nav-link ${pathname.startsWith('/impor') ? 'nav-link-active' : ''}`}
                  >
                    Impor Lulusan Resmi
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <p className="nav-group-label">SISTEM</p>
            <ul className="nav-list">
              <li>
                <a href={`${humanisPortalUrl}/modul/alumni`} className="nav-link">
                  Buka di Humanis Insight
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="row" style={{ gap: '0.6rem', minWidth: 0 }}>
            <span className="user-avatar">{initialsOf(actor.displayName)}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{actor.displayName}</div>
              <div style={{ fontSize: '11px', opacity: 0.65 }}>{actor.role}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost-dark"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
          >
            {loggingOut ? '...' : 'Keluar'}
          </button>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="top-header">
          <div className="row">
            <button
              type="button"
              className="btn btn-secondary mobile-menu-btn"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Tutup' : 'Menu'}
            </button>
            <span className={`badge ${isBk ? 'badge-green' : 'badge-blue'}`}>
              {TRACER_ROLE_LABELS[actor.role]}
            </span>
            <span className="badge badge-yellow">Mode Demo</span>
          </div>

          <div className="row">
            <span className="muted">{actor.displayName}</span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
            >
              Keluar
            </button>
          </div>
        </header>

        <main className="container">{children}</main>
      </div>
    </div>
  );
}
