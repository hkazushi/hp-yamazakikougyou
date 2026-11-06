'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { REVIEW } from '@/app/lib/api-error';

const AdminContext = createContext({ unread: 0, refresh: () => {} });
export const useAdmin = () => useContext(AdminContext);

// ログイン確認が済むまで中身を出さない。実際の権限チェックは PHP 側で毎回行う
export default function AdminShell({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    api('me')
      .then((res) => {
        setUnread(res.unread);
        setReady(true);
      })
      .catch((e) => {
        if (e.status === 401) router.replace('/admin/login/');
        else setError(e.message);
      });
  }, [router]);

  useEffect(refresh, [refresh]);

  async function logout() {
    await api('logout', { body: {} }).catch(() => {});
    router.replace('/admin/login/');
  }

  return (
    <div className="admin">
      <header className="admin-top">
        <Link className="left" href="/admin/">
          <img src="/img/logo-mark-white.svg" alt="" />
          管理画面
        </Link>
        <nav aria-label="管理メニュー">
          <a href="/" target="_blank" rel="noreferrer">
            サイトを見る
          </a>
          <button type="button" onClick={logout}>
            ログアウト
          </button>
        </nav>
      </header>
      <main className="admin-main">
        {REVIEW && (
          <p className="a-review" role="note">
            確認用の画面です。投稿や編集の内容は、お使いのブラウザにだけ保存されます。ほかの方には表示されません。
          </p>
        )}
        {error && (
          <p className="a-error" role="alert">
            {error}
          </p>
        )}
        {ready && <AdminContext.Provider value={{ unread, refresh }}>{children}</AdminContext.Provider>}
      </main>
    </div>
  );
}
