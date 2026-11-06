# 株式会社山﨑工業 コーポレートサイト（yamazaki-kougyo）

東京都足立区の内装解体業者のコーポレートサイト。施工例とお知らせは、お客さんが `/admin` から自分で投稿する。2026-11-06 新規作成。

参考サイト: https://honma-kaitai.co.jp/ （雰囲気のみ。文言・素材は流用しない）
GitHub: https://github.com/hkazushi/hp-yamazakikougyou （**Public**）

## 技術構成

- 公開先は**レンタルサーバー想定（未契約）**。条件は PHP 7.4 以上（`mbstring` 有効）と Apache 2.4 互換の `.htaccess`
- 画面: Next.js（App Router）+ **JavaScript** の**静的エクスポート**（`output: 'export'` / `trailingSlash: true`）
- 投稿・ログイン・お問い合わせ: **PHP**（`public/api/`）。**データベースは使わない**
- 保存先: 公開フォルダの外の `yk-data/`（`public_html` の隣）。デプロイで上書きしても消えない
- ログイン: `yk-data/config.php` の1アカウント + PHP セッション
- **確認用（Vercel）**: https://hp-yamazakikougyou.vercel.app 。`main` への push で自動デプロイ。PHP が動かないので、`next.config.mjs` が自動で `NEXT_PUBLIC_REVIEW=1` にして `app/lib/review.js` で動く。**ログイン不要、編集内容は見ている人のブラウザ（localStorage）にだけ保存**、noindex、問い合わせは届かない。本番ビルド（環境変数なし）には入らない

### ディレクトリ

| パス | 役割 |
|---|---|
| `app/lib/content.js` | サイトの文言。**文言の修正はまずここ** |
| `app/lib/api.js` | PHP API の呼び出し |
| `app/components/Posts.js` | 施工例・お知らせの読み込み（ブラウザから API を呼ぶ） |
| `app/(site)/` | 公開ページ（`/about`=メッセージ+会社概要 `/strength` `/works` `/news` `/news/detail/?id=` `/recruit` `/contact` `/privacy`。事業内容はトップ内） |
| `app/admin/` | 管理画面の見た目。権限チェックは PHP 側で毎回行う |
| `public/api/index.php` | API 本体（`?action=`） |
| `public/api/lib.php` | 保存（ファイルロック + rename）、セッション、回数制限、通知メール |
| `public/api/image.php` | `yk-data/uploads/` の画像を配信 |
| `deploy/config.sample.php` | `yk-data/config.php` の雛形 |
| `app/globals.css` | 全スタイル（1ファイル。後半が管理画面） |
| `meetings/` `notes/` | 打ち合わせ記録と内部メモ。**Public リポジトリなので `.gitignore` 済み（ローカルのみ）** |

### サーバー上の配置

```text
（ドメインのフォルダ）/
├ public_html/      ← out/ の中身（.htaccess も含める）
└ yk-data/          ← 自動作成。手で置くのは config.php だけ
   ├ config.php     ログインID、パスワードのハッシュ、通知先
   ├ posts.json     施工例・お知らせ
   ├ inquiries.json お問い合わせ（個人情報）
   ├ uploads/       アップロード画像
   ├ sessions/      ログインセッション
   └ rate.json      回数制限の記録
```

`public_html` の隣に置けないサーバーでは、環境変数 `YK_DATA_DIR` で場所を指定する。

---

## 変更後の検証（必須）

```bash
npm run build
npm audit --omit=dev
```

TypeScript も lint も無いので、検証はビルドと実表示。`next dev` では PHP が動かないので、**`out/` を Apache + PHP で確認する**: `comvace-work/.claude/launch.json` の `yamazaki-kougyo`（Docker の `php:8.3-apache` / http://localhost:4320）。データは `yk-data/` を使う。**ビルドしたらコンテナを起動し直す**（`out/` を作り直すとマウントが外れる）。

- 375 / 768 / 1440px で確認する。`document.documentElement.scrollWidth` が画面幅を超えないこと
- 管理画面や API を触ったら、ログイン → 投稿 → 公開ページに反映 → 編集 → 削除 → ログアウトを通す
- ローカルのログイン情報は `.env.local` の `ADMIN_USER` / `ADMIN_PASSWORD`（テスト用）。`yk-data/config.php` にはそのハッシュが入っている
- 通知メールはローカルでは送れない。公開先で実送信を確認する
- API の動作を変えたら `public/api/index.php` と `app/lib/review.js` の両方を直す。確認用は `NEXT_PUBLIC_REVIEW=1 npm run build` して `yamazaki-review-static`（http://localhost:4321）で見る

---

## デプロイ

1. `NEXT_PUBLIC_SITE_URL=https://（本番ドメイン） npm run build`（`NEXT_PUBLIC_REVIEW` を付けない。付けると確認用になる）
2. `out/` の**中身**を `public_html/` にアップロードする。`.htaccess` は隠しファイルなので FTP ソフトの設定に注意
3. **初回だけ** `public_html` の隣に `yk-data/` を作り、`deploy/config.sample.php` を `config.php` として置く。パスワードのハッシュは次のコマンドで作る（Docker が必要。コマンド履歴に残るので、終わったら消す）

```bash
docker run --rm php:8.3-cli php -r 'echo password_hash("ここにパスワード", PASSWORD_DEFAULT), PHP_EOL;'
```

4. https でログイン、投稿、画像アップロード、お問い合わせの実送信を確認する

- **ドメイン直下かサブドメインに置く**。画像や API は `/img/...` `/api/...` の絶対パスなので、サブディレクトリでは壊れる
- `yk-data/` はバックアップ対象。サーバーの自動バックアップに含まれるか確認する
- `posts.json` が無い初回だけ、テスト投稿4件が入る。削除すれば戻らない
- パスワードの変更は `config.php` のハッシュを書き換える（管理画面からは変更できない）

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
- **フォームがエラーになると入力が全部消える（2026-11-06）**: React 19 は `<form action={...}>` の完了後にフォームを自動リセットする。`onSubmit` で `preventDefault` して API を呼ぶ
- **Browser pane でスライドが動かないように見える（2026-11-06）**: pane では `requestAnimationFrame` が止まることがあり、スムーズスクロールとスクロールイベントが発火しない。コードの不具合と決めつけず、`scrollLeft` の直接指定か、ヘッドレス Chromium で確認する
- **Playwright の最新版がインストール済みブラウザを見つけられない（2026-11-06）**: 追加ダウンロードせず `chromium.launch({ executablePath })` で `~/Library/Caches/ms-playwright/chromium-*/` を指定する

---

## 秘密情報

`.env*` と `yk-data/` はコミットしない（`.env.example` のみ可）。`yk-data/inquiries.json` は個人情報なので、公開領域に置かない。
