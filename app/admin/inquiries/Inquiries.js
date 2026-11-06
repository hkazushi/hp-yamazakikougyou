'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { useAdmin } from '../AdminShell';
import AdminTabs from '../AdminTabs';

const when = (iso) =>
  new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export default function Inquiries() {
  const { refresh } = useAdmin();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('inquiries')
      .then((res) => setList(res.inquiries))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function run(action, body) {
    try {
      await api(action, { body });
      load();
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  function remove(id) {
    if (window.confirm('このお問い合わせを削除します。元に戻せません。よろしいですか？')) run('inquiry_delete', { id });
  }

  return (
    <>
      <AdminTabs current="inquiries" />
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
      <div className="a-head">
        <h1>お問い合わせ{list && `（${list.length}件）`}</h1>
      </div>
      {list && list.length === 0 && <p className="a-empty">まだお問い合わせはありません。</p>}
      {list && list.length > 0 && (
        <ul className="a-list">
          {list.map((q) => (
            <li className={`a-inq${q.read ? '' : ' unread'}`} key={q.id}>
              <div className="a-inq-head">
                <span>{q.kind}</span>
                <span>{when(q.created_at)}</span>
              </div>
              <h2>
                {q.name} 様{q.company && `（${q.company}）`}
              </h2>
              <dl>
                <dt>メール</dt>
                <dd>
                  <a href={`mailto:${q.email}`}>{q.email}</a>
                </dd>
                {q.phone && (
                  <>
                    <dt>電話</dt>
                    <dd>
                      <a href={`tel:${q.phone}`}>{q.phone}</a>
                    </dd>
                  </>
                )}
              </dl>
              <p className="msg">{q.message}</p>
              <div className="row">
                <button type="button" className="a-btn sub" onClick={() => run('inquiry_read', { id: q.id, read: !q.read })}>
                  {q.read ? '未読に戻す' : '確認済みにする'}
                </button>
                <button type="button" className="a-btn danger" onClick={() => remove(q.id)}>
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
