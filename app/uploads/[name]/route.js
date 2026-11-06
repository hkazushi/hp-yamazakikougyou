// ローカル保存時の画像配信。Supabase 接続時は Storage の公開 URL を直接使うのでここは通らない
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { UPLOAD_DIR } from '@/app/lib/store';

const TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export async function GET(_req, { params }) {
  const { name } = await params;
  const match = /^[\w-]+\.(jpg|png|webp)$/.exec(name);
  if (!match) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(data, {
      headers: { 'Content-Type': TYPES[match[1]], 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
