import { Cta, PageHead, SecHead } from '@/app/components/Parts';
import { company, message, profile } from '@/app/lib/content';

export const metadata = { title: '企業情報' };

const emphasized = new Set([message[2], message[6]]);

export default function AboutPage() {
  return (
    <main>
      <PageHead en="COMPANY" title="企業情報" image="/img/gen-team.jpg" />
      <section className="section" id="message">
        <div className="narrow">
          <SecHead en="MESSAGE" title="代表メッセージ" />
          <div className="message" style={{ marginTop: 36 }}>
            {message.map((p) => (
              <p key={p} className={emphasized.has(p) ? 'big' : undefined}>
                {p}
              </p>
            ))}
            <p className="signature">代表取締役　山﨑 光</p>
          </div>
        </div>
      </section>
      <section className="section char" id="profile">
        <div className="narrow">
          <SecHead en="PROFILE" title="会社概要" />
          <dl className="def" style={{ marginTop: 36 }}>
            {profile.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>
                  {k === 'TEL' ? (
                    <a href={`tel:${company.tel}`}>{v}</a>
                  ) : k === 'E-mail' ? (
                    <a href={`mailto:${company.email}`}>{v}</a>
                  ) : (
                    v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <Cta />
    </main>
  );
}
