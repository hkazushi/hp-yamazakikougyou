import Link from 'next/link';
import { Cta, More, MoreLink, SecHead } from '@/app/components/Parts';
import { NewsFeed, WorksFeed } from '@/app/components/Posts';
import { businessClosing, businessDetails, businessIntro, safetyPoints, services } from '@/app/lib/content';

const ICONS = {
  check: (
    <>
      <rect x="6" y="5" width="20" height="23" />
      <path d="M12 3h8v5h-8zM11 17l4 4 7-8" />
    </>
  ),
  helmet: <path d="M3 23h26M6 23v-3a10 10 0 0 1 20 0v3M13 10.5V7h6v3.5" />,
  dust: <path d="M3 11c4-4 7 4 11 0s7 4 11 0M3 18c4-4 7 4 11 0s7 4 11 0M3 25c4-4 7 4 11 0s7 4 11 0" />,
};

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <video className="hero-bg" src="/video/hero.mp4" poster="/img/hero-poster.jpg" autoPlay muted loop playsInline aria-hidden="true" />
        <div className="wrap hero-inner">
          <h1>
            <span className="line">
              <span>
                任せれば、<em>安心</em>。
              </span>
            </span>
            <span className="line">
              <span>そう言われる</span>
            </span>
            <span className="line">
              <span>
                <span className="nb">解体業者で</span>
                <span className="nb">あるために。</span>
              </span>
            </span>
          </h1>
          <span className="hero-rule" aria-hidden="true" />
          <p className="hero-sub">内装解体工事を中心に、丁寧でスピーディーな施工と、整理整頓された現場づくりを徹底しています。</p>
          <div className="hero-actions">
            <Link className="btn gold" href="/contact">
              お問い合わせ
            </Link>
            <Link className="btn" href="/strength">
              会社の強みを見る
            </Link>
          </div>
        </div>
        <span className="scroll-mark" aria-hidden="true">
          SCROLL
        </span>
      </section>

      <section className="section char">
        <div className="wrap">
          <div className="head-row">
            <div>
              <SecHead en="NEWS" title="お知らせ" />
            </div>
            <MoreLink href="/news/" label="お知らせ一覧へ" />
          </div>
          <NewsFeed limit={4} />
        </div>
      </section>

      <section className="section" id="business">
        <div className="wrap">
          <div className="photo-text">
            <div>
              <SecHead en="OUR BUSINESS" title="事業内容" />
              <p className="lead">{businessIntro}</p>
            </div>
            <img className="reveal" src="/img/photo-room.jpg" alt="内装解体後のマンションの室内" loading="lazy" />
          </div>
          <ul className="service-cards">
            {services.map((s) => (
              <li key={s.title}>
                <img src={s.image} alt={s.title} loading="lazy" />
                <div>
                  <small>{s.en}</small>
                  <strong>{s.title}</strong>
                </div>
              </li>
            ))}
          </ul>
          <div className="detail-grid">
            {businessDetails.map((d) => (
              <article key={d.heading}>
                <h3>{d.heading}</h3>
                <p>{d.body}</p>
              </article>
            ))}
          </div>
          <p className="lead">{businessClosing}</p>
          <Link className="arrow-link" href="/strength/">
            <span className="eyebrow">OUR STRENGTH</span>
            <strong>山﨑工業の5つの強み</strong>
            <More />
          </Link>
        </div>
      </section>

      <section className="safety">
        <div className="safety-photo reveal">
          <img src="/img/gen-safety.jpg" alt="ヘルメットを整える職人（イメージ）" loading="lazy" />
        </div>
        <div className="safety-body">
          <SecHead
            en="SAFETY FIRST"
            title={
              <>
                ケガなく、全員が
                <br />
                元気に家へ帰る。
              </>
            }
          />
          <p className="lead">私たちが仕事をするうえで、何より大切にしていることです。</p>
          <ul className="safety-points">
            {safetyPoints.map((p) => (
              <li key={p.title}>
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  {ICONS[p.icon]}
                </svg>
                <div>
                  <strong>{p.title}</strong>
                  <p>{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <MoreLink href="/about/" label="代表メッセージを読む" />
        </div>
      </section>

      <section className="section char">
        <div className="wrap works-split">
          <div>
            <SecHead en="WORKS" title="施工例" />
            <MoreLink href="/works/" label="施工例一覧へ" />
          </div>
          <WorksFeed limit={3} />
        </div>
      </section>

      <Cta />
    </main>
  );
}
