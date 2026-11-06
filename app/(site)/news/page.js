import { Cta, PageHead } from '@/app/components/Parts';
import { NewsFeed } from '@/app/components/Posts';

export const metadata = { title: 'お知らせ' };

export default function NewsPage() {
  return (
    <main>
      <PageHead en="NEWS" title="お知らせ" image="/img/gen-tools.jpg" />
      <section className="section">
        <div className="narrow">
          <NewsFeed />
        </div>
      </section>
      <Cta />
    </main>
  );
}
