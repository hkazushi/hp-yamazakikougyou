import { Cta, NewsList, PageHead } from '@/app/components/Parts';
import { listPosts } from '@/app/lib/store';

export const metadata = { title: 'お知らせ' };
export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const news = await listPosts({ type: 'news' });
  return (
    <main>
      <PageHead en="NEWS" title="お知らせ" image="/img/gen-tools.jpg" />
      <section className="section">
        <div className="narrow">
          <NewsList posts={news} />
        </div>
      </section>
      <Cta />
    </main>
  );
}
