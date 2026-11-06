// ローカル確認用の初期データ。Supabase 接続時は使われない（本番は空から始まる）。
// お客さんに見せるときのテスト投稿なので、実運用では削除してもらう
export function samplePosts() {
  const at = '2026-11-06T00:00:00.000Z';
  const base = { body: '', published: true, created_at: at, updated_at: at };
  return [
    { ...base, id: 'sample-work-1', type: 'work', title: 'マンション一室 スケルトン工事（テスト投稿）', date: '2026-11-03', images: ['/img/site-1.jpg', '/img/gen-finish.jpg'] },
    { ...base, id: 'sample-work-2', type: 'work', title: 'オフィス 内装解体工事（テスト投稿）', date: '2026-10-24', images: ['/img/site-2.jpg', '/img/gen-stacked.jpg'] },
    { ...base, id: 'sample-news-1', type: 'news', title: 'ホームページを公開しました（テスト投稿）', date: '2026-11-06', images: [], body: 'このたび、株式会社山﨑工業のホームページを公開しました。\n施工例やお知らせなどを掲載してまいります。' },
    { ...base, id: 'sample-news-2', type: 'news', title: '写真付きのお知らせ（テスト投稿）', date: '2026-10-30', images: ['/img/gen-entrance.jpg'], body: 'お知らせは、文章だけでも、写真付きでも投稿できます。' },
  ];
}
