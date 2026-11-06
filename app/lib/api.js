// PHP API の呼び出し（ブラウザ側のみ）。確認用ビルドでは PHP の代わりに review.js を使う
import { ApiError, REVIEW } from './api-error';
import { reviewApi } from './review';

export { ApiError };

export async function api(action, { params, body, file } = {}) {
  if (REVIEW) return reviewApi(action, { params, body, file });

  const query = new URLSearchParams({ action, ...params });
  const init = {};
  if (body !== undefined || file) {
    init.method = 'POST';
    init.headers = { 'X-YK-Request': '1' };
    if (file) {
      init.body = new FormData();
      init.body.append('file', file, 'photo.jpg');
    } else {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`/api/index.php?${query}`, init);
  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError('サーバーと通信できませんでした。', res.status);
  }
  if (!res.ok) throw new ApiError(json.error || 'エラーが発生しました。', res.status);
  return json;
}
