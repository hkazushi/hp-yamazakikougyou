import Link from 'next/link';
import { PageHead, SecHead } from '@/app/components/Parts';
import { recruit } from '@/app/lib/content';

export const metadata = {
  title: '求人情報',
  description: '解体工を募集中。未経験者歓迎。経験者 日給15,000円〜、未経験者 日給12,000円〜。東京都足立区の株式会社山﨑工業。',
};

export default function RecruitPage() {
  return (
    <main>
      <PageHead en="RECRUIT" title="求人情報" image="/img/gen-recruit.jpg" />
      <section className="section">
        <div className="narrow">
          <SecHead en="JOB DESCRIPTION" title="解体工 募集要項" />
          <p className="lead">しっかり稼ぎたい方、安定した収入を得たい方、未経験から手に職をつけたい方を歓迎します。</p>
          <dl className="def" style={{ marginTop: 36 }}>
            {recruit.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p style={{ marginTop: 40 }}>
            <Link className="btn gold" href={{ pathname: '/contact', query: { kind: 'recruit' } }}>
              この求人に応募する
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
