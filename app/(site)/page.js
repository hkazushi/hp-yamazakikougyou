import Link from 'next/link';
import { Cta, SecHead } from '@/app/components/Parts';
import { NewsFeed, WorksFeed } from '@/app/components/Posts';
import { businessClosing, businessDetails, businessIntro, flow, services } from '@/app/lib/content';

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
            <Link className="btn" href="/news">
              お知らせ一覧
            </Link>
          </div>
          <NewsFeed limit={4} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="photo-text">
            <div>
              <SecHead en="OUR BUSINESS" title="事業内容" />
              <p className="lead">{businessIntro}</p>
            </div>
            <img className="reveal" src="/img/gen-sorting.jpg" alt="材質ごとに分別された廃材（イメージ）" loading="lazy" />
          </div>
          <ul className="service-grid" style={{ marginTop: 56 }}>
            {services.map((s) => (
              <li key={s.title}>
                <small>{s.en}</small>
                <strong>{s.title}</strong>
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
          <ol className="flow">
            {flow.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ol>
          <p className="lead">{businessClosing}</p>
          <Link className="arrow-link" href="/strength">
            <span className="eyebrow">OUR STRENGTH</span>
            <strong>山﨑工業の5つの強み</strong>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>

      <section className="band">
        <img src="/img/gen-chisel.jpg" alt="" loading="lazy" />
        <div className="wrap">
          <span className="eyebrow">SAFETY FIRST</span>
          <p className="quote">
            ケガなく、全員が
            <br />
            元気に家へ帰る。
          </p>
          <p className="sub">私たちが仕事をするうえで、何より大切にしていることです。</p>
          <p style={{ marginTop: 32 }}>
            <Link className="btn" href="/about">
              代表メッセージを読む
            </Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="head-row">
            <div>
              <SecHead en="WORKS" title="施工例" />
            </div>
            <Link className="btn" href="/works">
              施工例をもっと見る
            </Link>
          </div>
          <WorksFeed limit={3} />
        </div>
      </section>

      <Cta />
    </main>
  );
}
