// インスタンス内メモリの簡易制限。総当たりやスパムを遅らせるためのもの
import { headers } from 'next/headers';

const buckets = new Map();

export async function clientIp() {
  const h = await headers();
  return (h.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
}

export function overLimit(key, max, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  buckets.set(key, hits);
  return hits.length >= max;
}

export function hit(key) {
  buckets.set(key, [...(buckets.get(key) || []), Date.now()]);
}

export function clearHits(key) {
  buckets.delete(key);
}
