/**
 * URL正規化関数
 * 独自スキーム（instagram://, twitter://等）をWebアクセス可能なURLに変換
 */
export function normalizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    switch (parsedUrl.protocol) {
      case 'instagram:':
        // instagram://media?id=123456789 -> https://instagram.com/p/123456789
        if (parsedUrl.hostname === 'media') {
          const id = parsedUrl.searchParams.get('id');
          if (id) {
            return `https://instagram.com/p/${id}`;
          }
        }
        break;

      case 'twitter:':
        // twitter://status?id=123456789 -> https://x.com/status/123456789
        if (parsedUrl.hostname === 'status') {
          const id = parsedUrl.searchParams.get('id');
          if (id) {
            return `https://x.com/status/${id}`;
          }
        }
        break;

      case 'x:':
        // x://status?id=123456789 -> https://x.com/status/123456789
        if (parsedUrl.hostname === 'status') {
          const id = parsedUrl.searchParams.get('id');
          if (id) {
            return `https://x.com/status/${id}`;
          }
        }
        break;

      case 'youtube:':
        // youtube://watch?v=dQw4w9WgXcQ -> https://youtube.com/watch?v=dQw4w9WgXcQ
        if (parsedUrl.hostname === 'watch') {
          const videoId = parsedUrl.searchParams.get('v');
          if (videoId) {
            return `https://youtube.com/watch?v=${videoId}`;
          }
        }
        break;

      case 'http:':
      case 'https:':
        // すでにHTTP/HTTPSの場合はそのまま返す
        return url;
    }

    // 変換できない場合は元のURLを返す
    return url;
  } catch (error) {
    // URL解析に失敗した場合は元の文字列を返す
    return url;
  }
}

/**
 * URLからアプリ名を抽出する関数
 */
export function extractAppFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    switch (parsedUrl.protocol) {
      case 'instagram:':
        return 'Instagram';

      case 'twitter:':
      case 'x:':
        return 'X';

      case 'youtube:':
        return 'YouTube';

      case 'http:':
      case 'https:':
        // HTTPSの場合はホスト名から判定
        const hostname = parsedUrl.hostname.toLowerCase();

        if (hostname.includes('instagram.com')) {
          return 'Instagram';
        }
        if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
          return 'X';
        }
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
          return 'YouTube';
        }

        return null;

      default:
        return null;
    }
  } catch (error) {
    return null;
  }
}
