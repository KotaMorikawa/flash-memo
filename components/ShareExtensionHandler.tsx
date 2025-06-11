import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useURL } from 'expo-linking';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { normalizeUrl } from '@/utils/url-normalizer';

interface ShareExtensionHandlerProps {
  children: React.ReactNode;
}

export default function ShareExtensionHandler({
  children,
}: ShareExtensionHandlerProps) {
  const url = useURL();
  const saveLink = useMutation(api.links.saveLink);

  useEffect(() => {
    if (url && !isDevelopmentUrl(url)) {
      handleSharedUrl(url);
    }
  }, [url]);

  const isDevelopmentUrl = (url: string): boolean => {
    return (
      url.startsWith('exp://') ||
      url.startsWith('exps://') ||
      url.startsWith('expo-development://') ||
      url.includes('localhost') ||
      url.includes('192.168.') ||
      url.includes('127.0.0.1')
    );
  };

  const handleSharedUrl = async (sharedUrl: string) => {
    try {
      // URL スキームからデータを抽出
      const urlObject = new URL(sharedUrl);
      const params = new URLSearchParams(urlObject.search);

      let targetUrl = params.get('url') || params.get('text');

      if (!targetUrl) {
        // URL全体がパラメータに含まれている場合
        targetUrl = sharedUrl.replace(/^[^:]+:\/\/[^?]*\?/, '');
        if (targetUrl.startsWith('url=')) {
          targetUrl = decodeURIComponent(targetUrl.substring(4));
        }
      }

      if (!targetUrl || !targetUrl.startsWith('http')) {
        console.log('有効なURLが見つかりませんでした:', sharedUrl);
        return;
      }

      // URLを正規化
      const normalizedUrl = normalizeUrl(targetUrl);

      // 元のアプリを判定
      let originalApp = 'unknown';
      if (
        targetUrl.includes('instagram.com') ||
        targetUrl.includes('instagram://')
      ) {
        originalApp = 'instagram';
      } else if (
        targetUrl.includes('twitter.com') ||
        targetUrl.includes('x.com') ||
        targetUrl.includes('twitter://')
      ) {
        originalApp = 'twitter';
      } else if (
        targetUrl.includes('youtube.com') ||
        targetUrl.includes('youtu.be') ||
        targetUrl.includes('youtube://')
      ) {
        originalApp = 'youtube';
      } else {
        originalApp = 'web';
      }

      // Convexに保存
      await saveLink({
        url: normalizedUrl,
        originalApp: originalApp,
        tags: ['shared'],
      });

      Alert.alert(
        'リンクを保存しました',
        'リンクが正常に保存されました。FlashMemoで確認できます。',
        [{ text: 'OK' }],
      );
    } catch (error) {
      console.error('Error handling shared URL:', error);
      Alert.alert('エラー', 'リンクの保存に失敗しました。', [{ text: 'OK' }]);
    }
  };

  return <>{children}</>;
}
