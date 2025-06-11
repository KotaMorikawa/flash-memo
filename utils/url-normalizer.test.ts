import { normalizeUrl, extractAppFromUrl } from './url-normalizer';

describe('URL Normalizer', () => {
  describe('normalizeUrl', () => {
    test('should normalize Instagram URLs', () => {
      const instagramUrl = 'instagram://media?id=123456789';
      const expected = 'https://instagram.com/p/123456789';
      expect(normalizeUrl(instagramUrl)).toBe(expected);
    });

    test('should normalize Twitter URLs', () => {
      const twitterUrl = 'twitter://status?id=123456789';
      const expected = 'https://x.com/status/123456789';
      expect(normalizeUrl(twitterUrl)).toBe(expected);
    });

    test('should normalize X app URLs', () => {
      const xUrl = 'x://status?id=123456789';
      const expected = 'https://x.com/status/123456789';
      expect(normalizeUrl(xUrl)).toBe(expected);
    });

    test('should normalize YouTube URLs', () => {
      const youtubeUrl = 'youtube://watch?v=dQw4w9WgXcQ';
      const expected = 'https://youtube.com/watch?v=dQw4w9WgXcQ';
      expect(normalizeUrl(youtubeUrl)).toBe(expected);
    });

    test('should return original URL if already HTTP/HTTPS', () => {
      const httpUrl = 'https://example.com/article';
      expect(normalizeUrl(httpUrl)).toBe(httpUrl);
    });

    test('should return original URL if unknown scheme', () => {
      const unknownUrl = 'unknown://something';
      expect(normalizeUrl(unknownUrl)).toBe(unknownUrl);
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrl = 'not-a-url';
      expect(normalizeUrl(malformedUrl)).toBe(malformedUrl);
    });
  });

  describe('extractAppFromUrl', () => {
    test('should extract Instagram app name', () => {
      expect(extractAppFromUrl('instagram://media?id=123')).toBe('Instagram');
      expect(extractAppFromUrl('https://instagram.com/p/123')).toBe(
        'Instagram',
      );
    });

    test('should extract Twitter/X app name', () => {
      expect(extractAppFromUrl('twitter://status?id=123')).toBe('X');
      expect(extractAppFromUrl('x://status?id=123')).toBe('X');
      expect(extractAppFromUrl('https://x.com/status/123')).toBe('X');
    });

    test('should extract YouTube app name', () => {
      expect(extractAppFromUrl('youtube://watch?v=123')).toBe('YouTube');
      expect(extractAppFromUrl('https://youtube.com/watch?v=123')).toBe(
        'YouTube',
      );
    });

    test('should return null for unknown URLs', () => {
      expect(extractAppFromUrl('https://example.com')).toBeNull();
      expect(extractAppFromUrl('unknown://something')).toBeNull();
    });
  });
});
