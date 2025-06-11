import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { Button } from 'react-native-paper';

interface OAuthButtonProps {
  strategy: 'oauth_google' | 'oauth_apple';
  children: React.ReactNode;
  style?: any;
  contentStyle?: any;
  labelStyle?: any;
}

WebBrowser.maybeCompleteAuthSession();

export default function OAuthButton({
  strategy,
  children,
  style,
  contentStyle,
  labelStyle,
}: OAuthButtonProps) {
  React.useEffect(() => {
    if (Platform.OS !== 'android') return;

    void WebBrowser.warmUpAsync();
    return () => {
      if (Platform.OS !== 'android') return;

      void WebBrowser.coolDownAsync();
    };
  }, []);

  const { startOAuthFlow } = useOAuth({ strategy });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/', { scheme: 'flash-memo' }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error:', err);
    }
  }, [startOAuthFlow]);

  return (
    <Button
      mode="contained"
      onPress={onPress}
      style={style}
      contentStyle={contentStyle}
      labelStyle={labelStyle}
    >
      {children}
    </Button>
  );
}
