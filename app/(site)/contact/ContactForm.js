'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/app/lib/api';
import { REVIEW } from '@/app/lib/api-error';

export default function ContactForm({ kinds }) {
  const initialKind = useSearchParams().get('kind') === 'recruit' ? '求人への応募' : '';
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setPending(true);
    setError('');
    try {
      await api('contact', { body: { ...data, agree: data.agree === 'on' } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="form-done" role="status">
        <h2>送信が完了しました</h2>
        <p>お問い合わせありがとうございます。内容を確認のうえ、担当者よりご連絡いたします。</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      {REVIEW && (
        <p className="form-error" role="note">
          確認用の画面のため、送信しても会社には届きません。ご連絡はお電話でお願いします。
        </p>
      )}
      <label className="field">
        <span>
          お問い合わせ種別<span className="req">必須</span>
        </span>
        <select name="kind" defaultValue={initialKind} required>
          <option value="" disabled>
            選択してください
          </option>
          {kinds.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>会社名</span>
        <input name="company" autoComplete="organization" maxLength={200} />
      </label>
      <label className="field">
        <span>
          お名前<span className="req">必須</span>
        </span>
        <input name="name" autoComplete="name" required maxLength={100} />
      </label>
      <label className="field">
        <span>電話番号</span>
        <input name="phone" type="tel" autoComplete="tel" maxLength={30} />
      </label>
      <label className="field">
        <span>
          メールアドレス<span className="req">必須</span>
        </span>
        <input name="email" type="email" autoComplete="email" required maxLength={200} />
      </label>
      <label className="field">
        <span>
          お問い合わせ内容<span className="req">必須</span>
        </span>
        <textarea name="message" required maxLength={5000} />
      </label>
      <div className="trap" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" name="agree" required />
        <span>
          <Link href="/privacy/" target="_blank">
            プライバシーポリシー
          </Link>
          に同意する
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button className="btn gold" type="submit" disabled={pending}>
          {pending ? '送信中…' : '送信する'}
        </button>
      </div>
    </form>
  );
}
