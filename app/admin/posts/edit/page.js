import { Suspense } from 'react';
import AdminShell from '../../AdminShell';
import EditPost from './EditPost';

export default function EditPostPage() {
  return (
    <AdminShell>
      <Suspense fallback={null}>
        <EditPost />
      </Suspense>
    </AdminShell>
  );
}
