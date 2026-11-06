# 株式会社山﨑工業 コーポレートサイト（yamazaki-kougyo）

東京都足立区の内装解体業者のコーポレートサイト。施工例とお知らせは、お客さんが `/admin` から自分で投稿する。2026-11-06 新規作成。

参考サイト: https://honma-kaitai.co.jp/ （雰囲気のみ。文言・素材は流用しない）

## 技術構成

- Next.js（App Router）+ **JavaScript**（`jsconfig.json`）。サーバーで動かす（静的エクスポートではない）
- 保存先: **Supabase**（Postgres + Storage）。環境変数が無ければ `.data/` のファイルに保存（ローカル確認用）
- ログイン: `ADMIN_USER` / `ADMIN_PASSWORD` の1アカウント + 署名付き Cookie（`app/lib/auth.js`）
- お問い合わせ: 保存して `/admin/inquiries` に表示。`RESEND_API_KEY` 等があれば通知メールも送る
- GitHub: https://github.com/hkazushi/hp-yamazakikougyou （**Public**）
- 公開先は Vercel 想定（`.data/` は Vercel では書き込めないので本番は Supabase 必須）

### ディレクトリ

| パス | 役割 |
|---|---|
| `app/lib/content.js` | サイトの文言。**文言の修正はまずここ** |
| `app/lib/store.js` | 投稿・問い合わせ・画像の保存（Supabase / ファイルの切り替え） |
| `app/lib/actions.js` | Server Actions。管理系は必ず `requireAdmin()` を先頭で呼ぶ |
| `app/lib/samples.js` | ローカル用の初期データ（Supabase 接続時は使わない） |
| `app/(site)/` | 公開ページ（`/about`=メッセージ+会社概要 `/strength` `/works` `/news` `/recruit` `/contact` `/privacy`。事業内容はトップ内） |
| `meetings/` `notes/` | 打ち合わせ記録と内部メモ。**Public リポジトリなので `.gitignore` 済み（ローカルのみ）** |
| `app/admin/` | 管理画面（`/admin` `/admin/login` `/admin/posts/*` `/admin/inquiries`） |
| `app/globals.css` | 全スタイル（1ファイル。後半が管理画面） |
| `supabase/schema.sql` | Supabase の SQL エディタで手動実行 |
| `notes/` | 文言の出典、仮写真のライセンス、掲載前の確認事項、意思決定 |

---

## 変更後の検証（必須）

```bash
npm run build
npm audit --omit=dev
```

TypeScript も lint も無いので、検証はビルドと実表示。`comvace-work/.claude/launch.json` の `yamazaki-kougyo`（`next start` / http://localhost:4320）で確認する。**ビルドし直したらサーバーも再起動する**。

- 375 / 768 / 1440px で確認する。`document.documentElement.scrollWidth` が画面幅を超えないこと
- 管理画面を触ったら、ログイン → 投稿 → 公開ページに反映 → 編集 → 削除 → ログアウトを通す
- ローカルのログイン情報は `.env.local`（テスト用。本番では別の値を使う）

---

## デザインの決まりごと

お客さんの希望イメージは「黒 × チャコール × ゴールド、迫力と高級感」。ただし主力は**内装解体**なので、大型重機を主役にしない。

- 色は `:root` の変数のみ。見出しは明朝（ロゴに合わせる）、本文はゴシック。角丸、影は公開側で使わない
- ロゴは PDF 内の JPEG をトレースした SVG。`public/img/logo-*.svg`（白 / 黒、マーク / 社名 / 縦組み）
- 写真は支給の5枚（`site-*` `worker-*` `back`）と、Gemini で生成した `gen-*`。フリー素材は使わない（出典・用途は `notes/content-sources.md`）
- **同じ画像をサイト内の複数箇所で使わない**（ユーザー指定。施工例がトップと一覧に出るのは同じ投稿なので例外）。共通パーツ（`Cta`）に写真を入れると全ページで重複するので入れない
- 会社の強みは写真を画面端まで大きく出し、CSS で全てモノクロに統一する
- トップは動画（`public/video/hero.mp4`）。生成画像3枚を ffmpeg でズームさせたもので、実動画が届けば差し替える
- 画像を追加生成するときは `.env.local` の `GEN_API_KEY`（Gemini。`gemini-3-pro-image` の 2K が綺麗。Veo は使えない）。スクリプトは残していないので、その都度書く
- 事業内容と代表メッセージは独立ページにしない（通話で決定。`meetings/2026-11-06.md`）

---

## 過去に実際に踏んだ罠（再発防止）

- **ffmpeg のズーム動画が細かく揺れる（2026-11-06）**: `zoompan` は切り出し位置を整数に丸めるので、ゆっくりズームすると画面がガタつく。入力を `scale=7680:-2` に拡大してから `zoompan`、最後に `scale=1280:720` で縮小する

- **フォームがエラーになると入力が全部消える（2026-11-06）**: React 19 は `<form action={...}>` の完了後にフォームを自動リセットする。ログインの ID やお問い合わせ本文が消える。`onSubmit` で `preventDefault` し `startTransition(() => action(new FormData(form)))` で呼ぶ
- **Browser pane でスライドが動かないように見える（2026-11-06）**: pane では `requestAnimationFrame` が止まることがあり、スムーズスクロールとスクロールイベントが発火しない。コードの不具合と決めつけず、`scrollLeft` の直接指定か、ヘッドレス Chromium で確認する
- **Playwright の最新版がインストール済みブラウザを見つけられない（2026-11-06）**: 追加ダウンロードせず `chromium.launch({ executablePath })` で `~/Library/Caches/ms-playwright/chromium-*/` を指定する

---

## 秘密情報

`.env*` はコミットしない（`.env.example` のみ可）。`SUPABASE_SERVICE_ROLE_KEY` はサーバー専用で、`NEXT_PUBLIC_` を付けない。
