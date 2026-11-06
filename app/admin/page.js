import { Suspense } from 'react';
import AdminHome from './AdminHome';
import AdminShell from './AdminShell';

export default function AdminPage() {
  return (
    <AdminShell>
      <Suspense fallback={null}>
        <AdminHome />
      </Suspense>
    </AdminShell>
  );
}
