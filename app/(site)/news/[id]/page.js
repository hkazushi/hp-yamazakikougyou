import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Cta, formatDate } from '@/app/components/Parts';
import { getPost } from '@/app/lib/store';

export const dynamic = 'force-dynamic';

const UUID_OR_SAMPLE = /^([0-9a-f-]{36}|sample-[\w-]+)$/i;

async function load(id) {
  if (!UUID_OR_SAMPLE.test(id)) return null;
  const post = await getPost(id);
  return post && post.type === 'news' && post.published ? post : null;
}

export async function generateMetadata({ params }) {
  const post = await load((await params).id);
  return post ? { title: post.title, description: post.body.slice(0, 100) } : {};
}

export default async function NewsDetail({ params }) {
  const post = await load((await params).id);
  if (!post) notFound();
  return (
    <main>
      <section className="section">
        <article className="narrow">
          <header className="article-head">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <h1>{post.title}</h1>
          </header>
          {post.body && <p className="article-body">{post.body}</p>}
          {post.images.length > 0 && (
            <div className="article-images">
              {post.images.map((src, i) => (
                <img key={src} src={src} alt={`${post.title}（${i + 1}枚目）`} loading="lazy" />
              ))}
            </div>
          )}
          <p className="back-link">
            <Link className="btn" href="/news">
              お知らせ一覧へ
            </Link>
          </p>
        </article>
      </section>
      <Cta />
    </main>
  );
}
