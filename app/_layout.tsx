import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ClerkProvider,
  ClerkLoaded,
  useAuth,
  SignedIn,
  SignedOut,
} from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { tokenCache } from '@/utils/cache';
import AuthScreen from '@/components/AuthScreen';

// 環境変数の存在確認と適切なデフォルト値の設定
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

// Create a Convex client
const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});
const queryClient = new QueryClient();

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <PaperProvider>
                <SignedIn>
                  <Stack screenOptions={{ headerShown: false }} />
                </SignedIn>
                <SignedOut>
                  <AuthScreen />
                </SignedOut>
                <StatusBar style="auto" />
              </PaperProvider>
            </SafeAreaProvider>
          </QueryClientProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
