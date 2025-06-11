import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useURL } from 'expo-linking';
import { router } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { normalizeUrl } from '@/utils/url-normalizer';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShareScreen() {
  const url = useURL();
  const saveLink = useMutation(api.links.saveLink);
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState('リンクを処理中...');

  useEffect(() => {
    if (url && !isDevelopmentUrl(url)) {
      handleSharedUrl(url);
    } else {
      // 共有URLがない場合はホームに戻る
      router.replace('/(tabs)');
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
      setMessage('URLを解析中...');

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
        setMessage('有効なURLが見つかりませんでした');
        setTimeout(() => router.replace('/(tabs)'), 2000);
        return;
      }

      setMessage('リンクを保存中...');

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

      setMessage('保存完了！ホームに戻ります...');
      setIsProcessing(false);

      // 2秒後にホーム画面に戻る
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    } catch (error) {
      console.error('Error handling shared URL:', error);
      setMessage('エラーが発生しました');
      setIsProcessing(false);

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isProcessing && <ActivityIndicator size="large" color="#007AFF" />}
        <Text style={styles.message}>{message}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});
