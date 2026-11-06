'use client';

import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { NewsList, WorkGrid } from './Parts';

function usePosts(type, limit) {
  const [state, setState] = useState({ posts: null, error: false });

  useEffect(() => {
    let alive = true;
    api('posts', { params: { type, ...(limit ? { limit } : {}) } })
      .then(({ posts }) => alive && setState({ posts, error: false }))
      .catch(() => alive && setState({ posts: null, error: true }));
    return () => {
      alive = false;
    };
  }, [type, limit]);

  return state;
}

function Status({ error }) {
  return <p className="empty">{error ? '読み込めませんでした。時間をおいて再度お試しください。' : '読み込み中…'}</p>;
}

export function WorksFeed({ limit }) {
  const { posts, error } = usePosts('work', limit);
  return posts ? <WorkGrid posts={posts} /> : <Status error={error} />;
}

export function NewsFeed({ limit }) {
  const { posts, error } = usePosts('news', limit);
  return posts ? <NewsList posts={posts} /> : <Status error={error} />;
}
