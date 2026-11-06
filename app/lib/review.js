// 確認用ビルド（Vercel）の API 代わり。PHP が無いので、見ている人のブラウザの中だけで動かす。
// 本番ビルドには入らず、本番のログインは PHP 側で必ず確認する
import { ApiError } from './api-error';

const KEY = 'yk-review-v1';
const AT = '2026-11-06T09:00:00+09:00';

const seed = () => {
  const post = (id, type, title, date, images, body = '') => ({
    id, type, title, body, images, published: true, date, created_at: AT, updated_at: AT,
  });
  return {
    loggedIn: false,
    inquiries: [],
    posts: [
      post('sample-work-1', 'work', 'マンション一室 スケルトン工事（テスト投稿）', '2026-11-03', ['/img/site-1.jpg', '/img/gen-finish.jpg']),
      post('sample-work-2', 'work', 'オフィス 内装解体工事（テスト投稿）', '2026-10-24', ['/img/site-2.jpg', '/img/gen-stacked.jpg']),
      post('sample-news-1', 'news', 'ホームページを公開しました（テスト投稿）', '2026-11-06', [], 'このたび、株式会社山﨑工業のホームページを公開しました。\n施工例やお知らせなどを掲載してまいります。'),
      post('sample-news-2', 'news', '写真付きのお知らせ（テスト投稿）', '2026-10-30', ['/img/gen-entrance.jpg'], 'お知らせは、文章だけでも、写真付きでも投稿できます。'),
    ],
  };
};

let memory = null;

function load() {
  if (memory) return memory;
  try {
    memory = JSON.parse(localStorage.getItem(KEY));
  } catch {
    memory = null;
  }
  memory = memory || seed();
  return memory;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    throw new ApiError('確認用の保存容量を超えました。写真を減らしてお試しください。', 507);
  }
}

const sorted = (posts) =>
  [...posts].sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new ApiError('画像を読み込めませんでした。', 400));
    reader.readAsDataURL(file);
  });

export async function reviewApi(action, { params = {}, body = {}, file } = {}) {
  const db = load();

  if (action === 'posts') {
    const posts = sorted(db.posts).filter((p) => p.published && p.type === params.type);
    return { posts: params.limit ? posts.slice(0, Number(params.limit)) : posts };
  }
  if (action === 'post') {
    const post = db.posts.find((p) => p.id === params.id && p.type === 'news' && p.published);
    if (!post) throw new ApiError('お知らせが見つかりません。', 404);
    return { post };
  }
  if (action === 'contact') {
    db.inquiries.push({ ...body, id: crypto.randomUUID(), read: false, created_at: new Date().toISOString() });
    save();
    return { ok: true };
  }
  if (action === 'login') {
    db.loggedIn = true;
    save();
    return { ok: true };
  }
  if (action === 'logout') {
    db.loggedIn = false;
    save();
    return { ok: true };
  }

  if (!db.loggedIn) throw new ApiError('ログインしてください。', 401);

  switch (action) {
    case 'me':
      return { ok: true, unread: db.inquiries.filter((q) => !q.read).length };
    case 'admin_posts':
      return { posts: sorted(db.posts).filter((p) => p.type === params.type) };
    case 'admin_post': {
      const post = db.posts.find((p) => p.id === params.id);
      if (!post) throw new ApiError('投稿が見つかりません。', 404);
      return { post };
    }
    case 'upload':
      return { url: await readFile(file) };
    case 'save_post': {
      if (!body.title?.trim()) throw new ApiError('タイトルを入力してください。', 400);
      if (body.type === 'work' && !body.images.length) throw new ApiError('施工例には写真を1枚以上入れてください。', 400);
      if (body.type === 'news' && !body.body?.trim() && !body.images.length) throw new ApiError('本文か写真を入れてください。', 400);
      const now = new Date().toISOString();
      const row = { ...body, title: body.title.trim(), body: body.type === 'news' ? body.body.trim() : '', updated_at: now };
      const i = db.posts.findIndex((p) => p.id === body.id);
      if (i >= 0) db.posts[i] = { ...db.posts[i], ...row };
      else db.posts.push({ ...row, id: crypto.randomUUID(), created_at: now });
      save();
      return { ok: true };
    }
    case 'delete_post':
      db.posts = db.posts.filter((p) => p.id !== body.id);
      save();
      return { ok: true };
    case 'inquiries':
      return { inquiries: [...db.inquiries].reverse() };
    case 'inquiry_read': {
      const found = db.inquiries.find((q) => q.id === body.id);
      if (found) found.read = body.read;
      save();
      return { ok: true };
    }
    case 'inquiry_delete':
      db.inquiries = db.inquiries.filter((q) => q.id !== body.id);
      save();
      return { ok: true };
    default:
      throw new ApiError('不正なリクエストです。', 404);
  }
}
