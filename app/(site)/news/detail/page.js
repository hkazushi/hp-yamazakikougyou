import { Suspense } from 'react';
import { Cta } from '@/app/components/Parts';
import Article from './Article';

export const metadata = { title: 'お知らせ' };

export default function NewsDetail() {
  return (
    <main>
      <section className="section">
        <article className="narrow">
          <Suspense fallback={<p className="empty">読み込み中…</p>}>
            <Article />
          </Suspense>
        </article>
      </section>
      <Cta />
    </main>
  );
}
