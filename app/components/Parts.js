import Link from 'next/link';
import Slider from './Slider';

export const formatDate = (d) => String(d).replaceAll('-', '.');

export function PageHead({ en, title, image, position }) {
  return (
    <section className="page-head">
      <img src={image} alt="" style={position ? { objectPosition: position } : undefined} />
      <div className="wrap">
        <span className="eyebrow">{en}</span>
        <h1>{title}</h1>
      </div>
    </section>
  );
}

export function SecHead({ en, title }) {
  return (
    <>
      <span className="eyebrow">{en}</span>
      <h2 className="sec-title">{title}</h2>
    </>
  );
}

// ホバーで文字間隔が広がり、線が伸びる。スマホでも最初から見える
export function More() {
  return (
    <span className="more">
      <span>MORE</span>
      <i aria-hidden="true" />
    </span>
  );
}

export function MoreLink({ href, label }) {
  return (
    <Link className="more-link" href={href} aria-label={label}>
      <More />
    </Link>
  );
}

export function WorkGrid({ posts }) {
  if (!posts.length) return <p className="empty">施工例は準備中です。</p>;
  return (
    <div className="work-grid">
      {posts.map((p) => (
        <article className="work-card" key={p.id}>
          <Slider images={p.images} alt={p.title} />
          <h3>{p.title}</h3>
          <time dateTime={p.date}>{formatDate(p.date)}</time>
        </article>
      ))}
    </div>
  );
}

export function NewsList({ posts }) {
  if (!posts.length) return <p className="empty">お知らせは準備中です。</p>;
  return (
    <ul className="news-list">
      {posts.map((p) => (
        <li key={p.id}>
          <Link href={`/news/detail/?id=${p.id}`}>
            <time dateTime={p.date}>{formatDate(p.date)}</time>
            <span className="title">{p.title}</span>
            {p.images[0] ? <img src={p.images[0]} alt="" loading="lazy" /> : <span />}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Cta() {
  return (
    <section className="cta">
      <Link href="/contact">
        <span className="eyebrow">CONTACT</span>
        <strong>工事のご相談・お見積り</strong>
        <p>元請様・協力業者様からのご連絡もお待ちしております。</p>
        <span className="go">お問い合わせはこちら →</span>
      </Link>
      <Link href="/recruit">
        <span className="eyebrow">RECRUIT</span>
        <strong>一緒に働く仲間を募集中</strong>
        <p>未経験者歓迎。日給12,000円〜（経験者 15,000円〜）。</p>
        <span className="go">求人情報を見る →</span>
      </Link>
    </section>
  );
}
