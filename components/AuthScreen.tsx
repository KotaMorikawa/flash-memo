import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OAuthButton from './OAuthButton';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>FlashMemo</Text>
          <Text style={styles.subtitle}>後で読むリストアプリ</Text>
          <Text style={styles.description}>
            他のアプリからリンクをシェアして保存し、{'\n'}
            後でまとめて読むことができます
          </Text>
        </View>

        <View style={styles.authSection}>
          <OAuthButton
            strategy="oauth_google"
            style={styles.googleButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Googleでサインイン
          </OAuthButton>

          <OAuthButton
            strategy="oauth_apple"
            style={styles.appleButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Appleでサインイン
          </OAuthButton>

          <Text style={styles.terms}>
            続行することで、利用規約とプライバシーポリシーに同意したものとみなされます
          </Text>
        </View>
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
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  authSection: {
    width: '100%',
    maxWidth: 320,
  },
  googleButton: {
    backgroundColor: '#4285f4',
    marginBottom: 16,
    borderRadius: 8,
  },
  appleButton: {
    backgroundColor: '#000',
    marginBottom: 24,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
