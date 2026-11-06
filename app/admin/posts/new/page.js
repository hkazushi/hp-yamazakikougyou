import { requireAdmin } from '@/app/lib/auth';
import { todayJst } from '@/app/lib/store';
import AdminShell from '../../AdminShell';
import PostForm from '../../PostForm';

export const dynamic = 'force-dynamic';

export default async function NewPost({ searchParams }) {
  await requireAdmin();
  const type = (await searchParams).type === 'news' ? 'news' : 'work';
  return (
    <AdminShell>
      <h1 style={{ marginBottom: 16 }}>{type === 'work' ? '施工例' : 'お知らせ'}を投稿</h1>
      <PostForm type={type} today={todayJst()} />
    </AdminShell>
  );
}
