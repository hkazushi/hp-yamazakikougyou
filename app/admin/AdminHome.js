'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDate } from '@/app/components/Parts';
import { api } from '@/app/lib/api';
import AdminTabs from './AdminTabs';

const LABEL = { work: '施工例', news: 'お知らせ' };

export default function AdminHome() {
  const params = useSearchParams();
  const type = params.get('type') === 'news' ? 'news' : 'work';
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setPosts(null);
    api('admin_posts', { params: { type } })
      .then((res) => alive && setPosts(res.posts))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [type]);

  return (
    <>
      <AdminTabs current={type} />
      {params.get('saved') && (
        <p className="a-notice" role="status">
          保存しました。
        </p>
      )}
      {params.get('deleted') && (
        <p className="a-notice" role="status">
          削除しました。
        </p>
      )}
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
      <div className="a-head">
        <h1>
          {LABEL[type]}
          {posts && `（${posts.length}件）`}
        </h1>
        <Link className="a-btn" href={`/admin/posts/new/?type=${type}`}>
          ＋ 新しく投稿
        </Link>
      </div>
      {posts && posts.length === 0 && <p className="a-empty">まだ投稿がありません。「＋ 新しく投稿」から追加できます。</p>}
      {posts && posts.length > 0 && (
        <ul className="a-list">
          {posts.map((p) => (
            <li className="a-item" key={p.id}>
              {p.images[0] ? (
                <img className="thumb" src={p.images[0]} alt="" loading="lazy" />
              ) : (
                <span className="thumb no-photo">写真なし</span>
              )}
              <div>
                <strong>
                  {p.title}
                  {!p.published && <span className="a-draft">下書き</span>}
                </strong>
                <small>
                  {formatDate(p.date)}
                  {p.images.length > 0 && ` ・ 写真${p.images.length}枚`}
                </small>
              </div>
              <Link className="a-btn sub" href={`/admin/posts/edit/?id=${p.id}`}>
                編集
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
