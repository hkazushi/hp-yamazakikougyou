import Link from 'next/link';
import { logoutAction } from '@/app/lib/actions';

export default function AdminShell({ children }) {
  return (
    <div className="admin">
      <header className="admin-top">
        <Link className="left" href="/admin">
          <img src="/img/logo-mark-white.svg" alt="" />
          管理画面
        </Link>
        <nav aria-label="管理メニュー">
          <a href="/" target="_blank" rel="noreferrer">
            サイトを見る
          </a>
          <form action={logoutAction}>
            <button type="submit">ログアウト</button>
          </form>
        </nav>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
