'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { company, nav } from '@/app/lib/content';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="株式会社山﨑工業 トップページ">
          <img className="mark" src="/img/logo-mark-white.svg" alt="" />
          <img className="word" src="/img/logo-wordmark-white.svg" alt="" />
        </Link>
        <nav className="gnav" aria-label="メインメニュー">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={pathname.startsWith(n.href) ? 'page' : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <a className="head-tel" href={`tel:${company.tel}`}>
            <strong>{company.tel}</strong>
            <small>お電話でのお問い合わせ</small>
          </a>
          <Link className="head-cta" href="/contact">
            お問い合わせ
          </Link>
        </nav>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="メニュー">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>
                  {n.label}
                  <small>{n.en}</small>
                </Link>
              </li>
            ))}
          </ul>
          <Link className="btn gold" href="/contact">
            お問い合わせ
          </Link>
          <a className="btn" href={`tel:${company.tel}`}>
            TEL {company.tel}
          </a>
        </nav>
      )}
    </>
  );
}
