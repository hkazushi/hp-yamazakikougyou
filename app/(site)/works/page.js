import { Cta, PageHead } from '@/app/components/Parts';
import { WorksFeed } from '@/app/components/Posts';

export const metadata = { title: '施工例' };

export default function WorksPage() {
  return (
    <main>
      <PageHead en="WORKS" title="施工例" image="/img/gen-truck.jpg" />
      <section className="section">
        <div className="wrap">
          <WorksFeed />
        </div>
      </section>
      <Cta />
    </main>
  );
}
