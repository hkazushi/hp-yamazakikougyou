'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';

export default function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('me')
      .then(() => router.replace('/admin/'))
      .catch(() => {});
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    const { user, password } = Object.fromEntries(new FormData(e.currentTarget));
    setPending(true);
    setError('');
    try {
      await api('login', { body: { user, password } });
      router.replace('/admin/');
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  // 環境変数を直接比較すると、本番ビルドではこの分岐ごと消える
  if (process.env.NEXT_PUBLIC_REVIEW === '1') {
    return (
      <form onSubmit={submit}>
        <p className="a-review" role="note">
          現在は確認用の画面です。本番運用が始まるまで、ログインIDとパスワードは不要です。
        </p>
        <button className="a-btn" type="submit" disabled={pending}>
          {pending ? '移動中…' : 'パスワードなしで入る'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit}>
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
      <label className="a-field">
        <span>ログインID</span>
        <input type="text" name="user" autoComplete="username" autoCapitalize="none" required />
      </label>
      <label className="a-field">
        <span>パスワード</span>
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="a-btn" type="submit" disabled={pending}>
        {pending ? 'ログイン中…' : 'ログイン'}
      </button>
    </form>
  );
}
