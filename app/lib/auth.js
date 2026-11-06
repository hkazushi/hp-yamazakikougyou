// 管理画面のログイン。ID/パスワードは環境変数、セッションは署名付き Cookie。
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'yk_admin';
const MAX_AGE = 60 * 60 * 24 * 7;

const sha256 = (s) => createHash('sha256').update(s).digest();
const same = (a, b) => timingSafeEqual(sha256(a), sha256(b));

function sign(value) {
  return createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('base64url');
}

// 環境変数が欠けていれば誰もログインできない状態にする
function configured() {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

export function checkCredentials(user, password) {
  if (!configured()) return false;
  const userOk = same(user, process.env.ADMIN_USER);
  const passOk = same(password, process.env.ADMIN_PASSWORD);
  return userOk && passOk;
}

export async function startSession() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  const store = await cookies();
  store.set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!configured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [expires, signature] = raw.split('.');
  if (!expires || !signature || !same(signature, sign(expires))) return false;
  return Number(expires) > Date.now();
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
