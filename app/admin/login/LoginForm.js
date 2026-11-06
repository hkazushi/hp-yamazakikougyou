'use client';

import { startTransition, useActionState } from 'react';
import { loginAction } from '@/app/lib/actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  // form の action 属性に渡すと完了後に入力が消えるので、onSubmit から呼ぶ
  function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={submit}>
      {state.error && (
        <p className="a-error" role="alert">
          {state.error}
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
