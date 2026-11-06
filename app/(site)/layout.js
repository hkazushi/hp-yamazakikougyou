import Link from 'next/link';
import Header from '@/app/components/Header';
import Motion from '@/app/components/Motion';
import { company, nav } from '@/app/lib/content';

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <Motion />
      {children}
      <footer className="site-footer">
        <div className="wrap">
          <div className="foot-main">
            <div>
              <img className="foot-logo" src="/img/logo-full-white.svg" alt="株式会社山﨑工業" />
              <p className="foot-info">
                {company.address}
                <br />
                TEL {company.tel} ／ FAX {company.fax}
                <br />
                解体工事業登録 東京都知事（登-8）第6145号
              </p>
            </div>
            <nav className="foot-nav" aria-label="フッターメニュー">
              {nav.map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                </Link>
              ))}
              <Link href="/contact">お問い合わせ</Link>
              <Link href="/privacy">プライバシーポリシー</Link>
            </nav>
          </div>
          <p className="copyright">© {company.name}</p>
        </div>
      </footer>
    </>
  );
}
