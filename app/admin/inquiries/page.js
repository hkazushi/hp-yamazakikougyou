import { deleteInquiryAction, toggleInquiryAction } from '@/app/lib/actions';
import { requireAdmin } from '@/app/lib/auth';
import { listInquiries } from '@/app/lib/store';
import AdminShell from '../AdminShell';
import AdminTabs from '../AdminTabs';
import ConfirmButton from '../ConfirmButton';

export const dynamic = 'force-dynamic';

const when = (iso) =>
  new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export default async function InquiriesPage() {
  await requireAdmin();
  const inquiries = await listInquiries();
  return (
    <AdminShell>
      <AdminTabs current="inquiries" unread={inquiries.filter((q) => !q.read).length} />
      <div className="a-head">
        <h1>お問い合わせ（{inquiries.length}件）</h1>
      </div>
      {inquiries.length === 0 ? (
        <p className="a-empty">まだお問い合わせはありません。</p>
      ) : (
        <ul className="a-list">
          {inquiries.map((q) => (
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
                <form action={toggleInquiryAction}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="read" value={q.read ? '0' : '1'} />
                  <button className="a-btn sub" type="submit">
                    {q.read ? '未読に戻す' : '確認済みにする'}
                  </button>
                </form>
                <form action={deleteInquiryAction}>
                  <input type="hidden" name="id" value={q.id} />
                  <ConfirmButton message="このお問い合わせを削除します。元に戻せません。よろしいですか？">削除</ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
