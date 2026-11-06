import { notFound } from 'next/navigation';
import { deletePostAction } from '@/app/lib/actions';
import { requireAdmin } from '@/app/lib/auth';
import { getPost, todayJst } from '@/app/lib/store';
import AdminShell from '../../AdminShell';
import ConfirmButton from '../../ConfirmButton';
import PostForm from '../../PostForm';

export const dynamic = 'force-dynamic';

const UUID_OR_SAMPLE = /^([0-9a-f-]{36}|sample-[\w-]+)$/i;

export default async function EditPost({ params }) {
  await requireAdmin();
  const { id } = await params;
  const post = UUID_OR_SAMPLE.test(id) ? await getPost(id) : null;
  if (!post) notFound();
  return (
    <AdminShell>
      <h1 style={{ marginBottom: 16 }}>{post.type === 'work' ? '施工例' : 'お知らせ'}を編集</h1>
      <PostForm post={post} type={post.type} today={todayJst()} />
      <form className="a-danger-zone" action={deletePostAction}>
        <input type="hidden" name="id" value={post.id} />
        <ConfirmButton message="この投稿を削除します。元に戻せません。よろしいですか？">この投稿を削除</ConfirmButton>
      </form>
    </AdminShell>
  );
}
