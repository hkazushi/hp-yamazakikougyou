import { PageHead } from '@/app/components/Parts';
import { privacy } from '@/app/lib/content';

export const metadata = { title: 'プライバシーポリシー' };

export default function PrivacyPage() {
  return (
    <main>
      <PageHead en="PRIVACY POLICY" title="プライバシーポリシー" image="/img/gen-texture.jpg" />
      <section className="section">
        <div className="narrow">
          {privacy.map((s) => (
            <section key={s.heading} style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'var(--mincho)', fontSize: 21, fontWeight: 700, color: 'var(--gold)' }}>{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} style={{ marginTop: 8 }}>
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
