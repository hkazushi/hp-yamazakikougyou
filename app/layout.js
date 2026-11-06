import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';

const mincho = Shippori_Mincho_B1({
  weight: ['500', '700', '800'],
  subsets: ['latin'],
  variable: '--font-mincho',
  display: 'swap',
  preload: false,
});
const gothic = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-gothic',
  display: 'swap',
  preload: false,
});

const description =
  '東京都足立区の株式会社山﨑工業。内装解体工事を中心に、原状回復、スケルトン工事、部分改修、斫り、石綿関連工事まで対応。東京都・埼玉県・千葉県・神奈川県の一都三県に対応しています。';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: '株式会社山﨑工業｜内装解体工事', template: '%s｜株式会社山﨑工業' },
  description,
  // 確認用ビルドは検索結果に出さない
  ...(process.env.NEXT_PUBLIC_REVIEW === '1' ? { robots: { index: false, follow: false } } : {}),
  openGraph: {
    title: '株式会社山﨑工業｜内装解体工事',
    description,
    images: ['/img/ogp.png'],
    locale: 'ja_JP',
    type: 'website',
  },
};

export const viewport = { themeColor: '#0b0b0c' };

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${mincho.variable} ${gothic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
