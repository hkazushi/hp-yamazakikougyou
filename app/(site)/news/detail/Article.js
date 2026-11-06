'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDate } from '@/app/components/Parts';
import { api } from '@/app/lib/api';

export default function Article() {
  const id = useSearchParams().get('id') ?? '';
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api('post', { params: { id } })
      .then((res) => {
        if (!alive) return;
        setPost(res.post);
        document.title = `${res.post.title}｜株式会社山﨑工業`;
      })
      .catch((e) => alive && setError(e.status === 404 ? 'このお知らせは見つかりませんでした。' : e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  const back = (
    <p className="back-link">
      <Link className="btn" href="/news/">
        お知らせ一覧へ
      </Link>
    </p>
  );

  if (error) {
    return (
      <>
        <p className="empty">{error}</p>
        {back}
      </>
    );
  }
  if (!post) return <p className="empty">読み込み中…</p>;

  return (
    <>
      <header className="article-head">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <h1>{post.title}</h1>
      </header>
      {post.body && <p className="article-body">{post.body}</p>}
      {post.images.length > 0 && (
        <div className="article-images">
          {post.images.map((src, i) => (
            <img key={src} src={src} alt={`${post.title}（${i + 1}枚目）`} loading="lazy" />
          ))}
        </div>
      )}
      {back}
    </>
  );
}
