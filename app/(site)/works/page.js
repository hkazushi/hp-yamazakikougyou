import { Cta, PageHead, WorkGrid } from '@/app/components/Parts';
import { listPosts } from '@/app/lib/store';

export const metadata = { title: '施工例' };
export const dynamic = 'force-dynamic';

export default async function WorksPage() {
  const works = await listPosts({ type: 'work' });
  return (
    <main>
      <PageHead en="WORKS" title="施工例" image="/img/gen-truck.jpg" />
      <section className="section">
        <div className="wrap">
          <WorkGrid posts={works} />
        </div>
      </section>
      <Cta />
    </main>
  );
}
