import { NextResponse } from 'next/server';
import { isAdmin } from '@/app/lib/auth';
import { uploadImage } from '@/app/lib/store';

const MAX_BYTES = 4 * 1024 * 1024; // Vercel の本文上限 4.5MB の内側。ブラウザ側で縮小してから送る

function detect(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return ['jpg', 'image/jpeg'];
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return ['png', 'image/png'];
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return ['webp', 'image/webp'];
  return null;
}

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'ログインしてください。' }, { status: 401 });

  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== req.headers.get('host')) {
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 403 });
  }

  const file = (await req.formData()).get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: '画像がありません。' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: '画像が大きすぎます。' }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detect(buffer);
  if (!kind) return NextResponse.json({ error: 'JPEG / PNG / WebP の画像を選んでください。' }, { status: 415 });

  try {
    return NextResponse.json({ url: await uploadImage(buffer, kind[0], kind[1]) });
  } catch (e) {
    console.error('upload failed', e.message);
    return NextResponse.json({ error: '画像を保存できませんでした。' }, { status: 500 });
  }
}
