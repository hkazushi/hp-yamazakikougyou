'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkCredentials, endSession, requireAdmin, startSession } from './auth';
import { inquiryKinds } from './content';
import { clearHits, clientIp, hit, overLimit } from './ratelimit';
import {
  addInquiry,
  deleteImages,
  deleteInquiry,
  deletePost,
  getPost,
  isOwnImage,
  savePost,
  setInquiryRead,
} from './store';

const text = (v) => (typeof v === 'string' ? v.trim() : '');

function refreshPublic() {
  revalidatePath('/', 'layout');
}

export async function loginAction(_prev, form) {
  const key = `login:${await clientIp()}`;
  if (overLimit(key, 5, 15 * 60 * 1000)) {
    return { error: 'ログインの失敗が続いたため、15分ほど待ってからお試しください。' };
  }
  if (!checkCredentials(text(form.get('user')), String(form.get('password') ?? ''))) {
    hit(key);
    return { error: 'IDまたはパスワードが違います。' };
  }
  clearHits(key);
  await startSession();
  redirect('/admin');
}

export async function logoutAction() {
  await endSession();
  redirect('/admin/login');
}

export async function savePostAction(input) {
  await requireAdmin();
  const type = input.type === 'work' ? 'work' : 'news';
  const title = text(input.title);
  const body = type === 'news' ? text(input.body) : '';
  const images = Array.isArray(input.images) ? input.images.filter(isOwnImage).slice(0, 20) : [];
  const date = text(input.date);

  if (!title) return { error: 'タイトルを入力してください。' };
  if (title.length > 120) return { error: 'タイトルは120文字以内にしてください。' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: '日付を入力してください。' };
  if (type === 'work' && images.length === 0) return { error: '施工例には写真を1枚以上入れてください。' };
  if (type === 'news' && !body && images.length === 0) return { error: '本文か写真を入れてください。' };

  const before = input.id ? await getPost(input.id) : null;
  if (input.id && !before) return { error: 'この投稿は削除されています。' };

  await savePost({ id: input.id || undefined, type, title, body, images, date, published: Boolean(input.published) });
  if (before) await deleteImages(before.images.filter((u) => !images.includes(u)));
  refreshPublic();
  redirect(`/admin?type=${type}&saved=1`);
}

export async function deletePostAction(form) {
  await requireAdmin();
  const post = await getPost(String(form.get('id')));
  if (!post) redirect('/admin');
  await deletePost(post.id);
  await deleteImages(post.images);
  refreshPublic();
  redirect(`/admin?type=${post.type}`);
}

export async function toggleInquiryAction(form) {
  await requireAdmin();
  await setInquiryRead(String(form.get('id')), form.get('read') === '1');
  revalidatePath('/admin', 'layout');
}

export async function deleteInquiryAction(form) {
  await requireAdmin();
  await deleteInquiry(String(form.get('id')));
  revalidatePath('/admin', 'layout');
}

// RESEND_API_KEY と CONTACT_NOTIFY_TO が設定されていれば通知メールを送る。失敗しても受付は成立させる
async function notify(row) {
  const { RESEND_API_KEY, CONTACT_NOTIFY_TO, CONTACT_NOTIFY_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_NOTIFY_TO || !CONTACT_NOTIFY_FROM) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_NOTIFY_FROM,
        to: CONTACT_NOTIFY_TO,
        reply_to: row.email,
        subject: `【HP】${row.kind}（${row.name}様）`,
        text: `種別: ${row.kind}\n会社名: ${row.company}\nお名前: ${row.name}\nTEL: ${row.phone}\nE-mail: ${row.email}\n\n${row.message}`,
      }),
    });
    if (!res.ok) console.error('contact notify failed', res.status);
  } catch (e) {
    console.error('contact notify failed', e.message);
  }
}

export async function contactAction(_prev, form) {
  // ボット用の隠し項目。入っていたら保存せず成功に見せる
  if (text(form.get('website'))) return { ok: true };

  const row = {
    kind: text(form.get('kind')),
    company: text(form.get('company')),
    name: text(form.get('name')),
    phone: text(form.get('phone')),
    email: text(form.get('email')),
    message: text(form.get('message')),
  };
  if (!inquiryKinds.includes(row.kind)) return { error: 'お問い合わせ種別を選択してください。' };
  if (!row.name) return { error: 'お名前を入力してください。' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return { error: 'メールアドレスを正しく入力してください。' };
  if (!row.message) return { error: 'お問い合わせ内容を入力してください。' };
  if (form.get('agree') !== 'on') return { error: 'プライバシーポリシーへの同意が必要です。' };
  if (row.message.length > 5000 || row.name.length > 100 || row.company.length > 200 || row.phone.length > 30 || row.email.length > 200) {
    return { error: '入力内容が長すぎます。' };
  }

  const key = `contact:${await clientIp()}`;
  if (overLimit(key, 5, 10 * 60 * 1000)) {
    return { error: '送信が続いています。時間をおいて再度お試しください。' };
  }
  hit(key);

  try {
    await addInquiry(row);
  } catch (e) {
    console.error('contact save failed', e.message);
    return { error: '送信できませんでした。お手数ですがお電話でお問い合わせください。' };
  }
  await notify(row);
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
