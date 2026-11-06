import { Cta, PageHead, SecHead } from '@/app/components/Parts';
import { strengths, vision } from '@/app/lib/content';

export const metadata = { title: '会社の強み' };

export default function StrengthPage() {
  return (
    <main>
      <PageHead en="STRENGTH" title="会社の強み" image="/img/gen-ppe.jpg" />
      <section className="strength-list-page">
        {strengths.map((s, i) => (
          <article className={`strength-row${i % 2 ? ' flip' : ''}`} key={s.no}>
            <div className="strength-media reveal">
              <img src={s.image.src} alt={s.image.alt} loading="lazy" style={{ objectPosition: s.image.position }} />
            </div>
            <div className="strength-text">
              <span className="no">{s.no}</span>
              <h2>{s.title}</h2>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </section>
      <section className="section char">
        <div className="narrow">
          <SecHead en="OUR VISION" title="これから目指す会社像" />
          {vision.map((p) => (
            <p className="lead" key={p}>
              {p}
            </p>
          ))}
        </div>
      </section>
      <Cta />
    </main>
  );
}
