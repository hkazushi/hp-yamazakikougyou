'use client';

import Link from 'next/link';
import { useAdmin } from './AdminShell';

export default function AdminTabs({ current }) {
  const { unread } = useAdmin();
  const tabs = [
    { key: 'work', href: '/admin/?type=work', label: '施工例' },
    { key: 'news', href: '/admin/?type=news', label: 'お知らせ' },
    { key: 'inquiries', href: '/admin/inquiries/', label: 'お問合せ' },
  ];
  return (
    <nav className="a-tabs" aria-label="編集するもの">
      {tabs.map((t) => (
        <Link key={t.key} href={t.href} aria-current={current === t.key ? 'page' : undefined}>
          {t.label}
          {t.key === 'inquiries' && unread > 0 && <span className="a-badge">{unread}</span>}
        </Link>
      ))}
    </nav>
  );
}
