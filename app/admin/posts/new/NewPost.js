'use client';

import { useSearchParams } from 'next/navigation';
import PostForm from '../../PostForm';

export default function NewPost() {
  const type = useSearchParams().get('type') === 'news' ? 'news' : 'work';
  return (
    <>
      <h1 style={{ marginBottom: 16 }}>{type === 'work' ? '施工例' : 'お知らせ'}を投稿</h1>
      <PostForm type={type} />
    </>
  );
}
