import Link from 'next/link';
import { formatDate } from '@/app/components/Parts';
import { requireAdmin } from '@/app/lib/auth';
import { listInquiries, listPosts } from '@/app/lib/store';
import AdminShell from './AdminShell';
import AdminTabs from './AdminTabs';

export const dynamic = 'force-dynamic';

const LABEL = { work: '施工例', news: 'お知らせ' };

export default async function AdminHome({ searchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const type = params.type === 'news' ? 'news' : 'work';
  const [posts, inquiries] = await Promise.all([
    listPosts({ type, publishedOnly: false }),
    listInquiries(),
  ]);

  return (
    <AdminShell>
      <AdminTabs current={type} unread={inquiries.filter((q) => !q.read).length} />
      {params.saved && (
        <p className="a-notice" role="status">
          保存しました。
        </p>
      )}
      <div className="a-head">
        <h1>{LABEL[type]}（{posts.length}件）</h1>
        <Link className="a-btn" href={`/admin/posts/new?type=${type}`}>
          ＋ 新しく投稿
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="a-empty">まだ投稿がありません。「＋ 新しく投稿」から追加できます。</p>
      ) : (
        <ul className="a-list">
          {posts.map((p) => (
            <li className="a-item" key={p.id}>
              {p.images[0] ? (
                <img className="thumb" src={p.images[0]} alt="" loading="lazy" />
              ) : (
                <span className="thumb no-photo">写真なし</span>
              )}
              <div>
                <strong>
                  {p.title}
                  {!p.published && <span className="a-draft">下書き</span>}
                </strong>
                <small>
                  {formatDate(p.date)}
                  {p.images.length > 0 && ` ・ 写真${p.images.length}枚`}
                </small>
              </div>
              <Link className="a-btn sub" href={`/admin/posts/${p.id}`}>
                編集
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
