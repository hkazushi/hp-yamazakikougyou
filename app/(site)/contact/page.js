import { Suspense } from 'react';
import { PageHead } from '@/app/components/Parts';
import { company, inquiryKinds } from '@/app/lib/content';
import ContactForm from './ContactForm';

export const metadata = { title: 'お問い合わせ' };

export default function ContactPage() {
  return (
    <main>
      <PageHead en="CONTACT" title="お問い合わせ" image="/img/gen-yosei.jpg" />
      <section className="section">
        <div className="narrow">
          <div className="tel-box">
            <div>
              <small>お電話でのお問い合わせ</small>
              <br />
              <a href={`tel:${company.tel}`}>{company.tel}</a>
            </div>
            <small>FAX {company.fax}</small>
          </div>
          <Suspense fallback={null}>
            <ContactForm kinds={inquiryKinds} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
