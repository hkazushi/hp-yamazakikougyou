import { Suspense } from 'react';
import AdminShell from '../../AdminShell';
import NewPost from './NewPost';

export default function NewPostPage() {
  return (
    <AdminShell>
      <Suspense fallback={null}>
        <NewPost />
      </Suspense>
    </AdminShell>
  );
}
