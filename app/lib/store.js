// 投稿・お問い合わせ・画像の保存先。
// SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY があれば Supabase、なければ .data/ のファイルに保存する。
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { samplePosts } from './samples';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'media';
const useSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

function sb() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
}

function must({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

async function readDb() {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    return { posts: samplePosts(), inquiries: [] };
  }
}

async function writeDb(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

const byNewest = (a, b) =>
  b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at);

export function todayJst() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());
}

export async function listPosts({ type, publishedOnly = true, limit } = {}) {
  if (useSupabase) {
    let q = sb().from('posts').select('*');
    if (type) q = q.eq('type', type);
    if (publishedOnly) q = q.eq('published', true);
    q = q.order('date', { ascending: false }).order('created_at', { ascending: false });
    if (limit) q = q.limit(limit);
    return must(await q);
  }
  const { posts } = await readDb();
  const found = posts
    .filter((p) => (!type || p.type === type) && (!publishedOnly || p.published))
    .sort(byNewest);
  return limit ? found.slice(0, limit) : found;
}

export async function getPost(id) {
  if (useSupabase) {
    return must(await sb().from('posts').select('*').eq('id', id).maybeSingle());
  }
  const { posts } = await readDb();
  return posts.find((p) => p.id === id) ?? null;
}

export async function savePost(input) {
  const now = new Date().toISOString();
  const row = {
    type: input.type,
    title: input.title,
    body: input.body,
    images: input.images,
    published: input.published,
    date: input.date,
    updated_at: now,
  };
  if (useSupabase) {
    if (input.id) {
      return must(await sb().from('posts').update(row).eq('id', input.id).select().single());
    }
    return must(await sb().from('posts').insert(row).select().single());
  }
  const db = await readDb();
  if (input.id) {
    const i = db.posts.findIndex((p) => p.id === input.id);
    if (i < 0) throw new Error('投稿が見つかりません');
    db.posts[i] = { ...db.posts[i], ...row };
    await writeDb(db);
    return db.posts[i];
  }
  const post = { id: randomUUID(), created_at: now, ...row };
  db.posts.push(post);
  await writeDb(db);
  return post;
}

export async function deletePost(id) {
  if (useSupabase) {
    must(await sb().from('posts').delete().eq('id', id));
    return;
  }
  const db = await readDb();
  db.posts = db.posts.filter((p) => p.id !== id);
  await writeDb(db);
}

export async function uploadImage(buffer, ext, contentType) {
  const name = `${randomUUID()}.${ext}`;
  if (useSupabase) {
    const client = sb();
    must(await client.storage.from(BUCKET).upload(name, buffer, { contentType }));
    return client.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}

// 投稿で使える画像 URL は、サイト同梱の素材か、アップロードしたものだけ
export function isOwnImage(url) {
  if (typeof url !== 'string') return false;
  if (/^\/img\/[\w.-]+$/.test(url) || /^\/uploads\/[\w-]+\.\w+$/.test(url)) return true;
  return Boolean(SUPABASE_URL) && url.startsWith(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`);
}

export async function deleteImages(urls) {
  const names = urls
    .filter((u) => !u.startsWith('/img/'))
    .map((u) => u.split('/').pop())
    .filter(Boolean);
  if (!names.length) return;
  if (useSupabase) {
    must(await sb().storage.from(BUCKET).remove(names));
    return;
  }
  await Promise.all(names.map((n) => fs.rm(path.join(UPLOAD_DIR, n), { force: true })));
}

export async function addInquiry(input) {
  const row = { ...input, read: false };
  if (useSupabase) {
    must(await sb().from('inquiries').insert(row));
    return;
  }
  const db = await readDb();
  db.inquiries.push({ id: randomUUID(), created_at: new Date().toISOString(), ...row });
  await writeDb(db);
}

export async function listInquiries() {
  if (useSupabase) {
    return must(await sb().from('inquiries').select('*').order('created_at', { ascending: false }));
  }
  const { inquiries } = await readDb();
  return [...inquiries].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function setInquiryRead(id, read) {
  if (useSupabase) {
    must(await sb().from('inquiries').update({ read }).eq('id', id));
    return;
  }
  const db = await readDb();
  const found = db.inquiries.find((q) => q.id === id);
  if (found) found.read = read;
  await writeDb(db);
}

export async function deleteInquiry(id) {
  if (useSupabase) {
    must(await sb().from('inquiries').delete().eq('id', id));
    return;
  }
  const db = await readDb();
  db.inquiries = db.inquiries.filter((q) => q.id !== id);
  await writeDb(db);
}
