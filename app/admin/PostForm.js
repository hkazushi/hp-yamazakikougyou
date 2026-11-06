'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/app/lib/api';

const MAX_SIDE = 2000;

const todayJst = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());

// スマホの写真は大きいので、送る前にブラウザで縮小する
async function shrink(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('画像を変換できませんでした。'))), 'image/jpeg', 0.85);
  });
}

export default function PostForm({ post, type }) {
  const router = useRouter();
  const isWork = type === 'work';
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [date, setDate] = useState(post?.date ?? todayJst());
  const [published, setPublished] = useState(post?.published ?? true);
  const [images, setImages] = useState(post?.images ?? []);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function addFiles(e) {
    const files = [...e.target.files];
    e.target.value = '';
    setError('');
    setUploading(files.length);
    for (const file of files) {
      try {
        const { url } = await api('upload', { file: await shrink(file) });
        setImages((list) => [...list, url]);
      } catch (err) {
        setError(`${file.name}: ${err.message || 'アップロードできませんでした。'}`);
      }
      setUploading((n) => n - 1);
    }
  }

  function move(i, delta) {
    setImages((list) => {
      const next = [...list];
      const [item] = next.splice(i, 1);
      next.splice(i + delta, 0, item);
      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('save_post', { body: { ...(post ? { id: post.id } : {}), type, title, body, date, published, images } });
      router.push(`/admin/?type=${type}&saved=1`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="a-card" onSubmit={submit}>
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
      <label className="a-field">
        <span>タイトル</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
      </label>
      <label className="a-field">
        <span>日付</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      {!isWork && (
        <label className="a-field">
          <span>本文</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
      )}
      <div className="a-field">
        <span>写真{isWork ? '（1枚以上。左の写真から順に表示）' : '（なくてもOK）'}</span>
        {images.length > 0 && (
          <ul className="a-images">
            {images.map((src, i) => (
              <li className="a-image" key={src}>
                <img src={src} alt={`${i + 1}枚目`} />
                <div>
                  <button type="button" aria-label="前へ" disabled={i === 0} onClick={() => move(i, -1)}>
                    ←
                  </button>
                  <button type="button" aria-label="後ろへ" disabled={i === images.length - 1} onClick={() => move(i, 1)}>
                    →
                  </button>
                  <button type="button" className="rm" onClick={() => setImages(images.filter((u) => u !== src))}>
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <label className="a-add">
          <input type="file" accept="image/*" multiple onChange={addFiles} />
          {uploading > 0 ? `アップロード中…（残り${uploading}枚）` : '＋ 写真を追加'}
        </label>
      </div>
      <label className="a-check">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        サイトに公開する（外すと下書き）
      </label>
      <div className="a-actions">
        <Link className="a-btn sub" href={`/admin/?type=${type}`}>
          戻る
        </Link>
        <button className="a-btn" type="submit" disabled={saving || uploading > 0}>
          {saving ? '保存中…' : '保存する'}
        </button>
      </div>
    </form>
  );
}
