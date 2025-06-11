import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  User,
  Settings,
  Download,
  Share,
  Bell,
  Moon,
  Trash2,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [offlineReadingEnabled, setOfflineReadingEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert('サインアウト', 'サインアウトしてもよろしいですか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'サインアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            console.error('サインアウトエラー:', err);
            Alert.alert(
              'エラー',
              'サインアウトに失敗しました。もう一度お試しください。',
            );
          }
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'すべてのデータを削除',
      '保存されたすべてのリンクが完全に削除されます。この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'すべて削除',
          style: 'destructive',
          onPress: () => {
            // Handle clear data
            console.log('Clearing all data...');
          },
        },
      ],
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'データのエクスポート',
      '保存されたすべてのリンクをJSONファイルとしてエクスポートします。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'エクスポート',
          onPress: () => {
            // Handle export
            console.log('Exporting data...');
          },
        },
      ],
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    showChevron = false,
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && <ChevronRight size={20} color="#8E8E93" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <User size={32} color="#007AFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.email}>
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>設定</Text>
          <View style={styles.settingsGroup}>
            {renderSettingItem(
              <Bell size={20} color="#FF9500" />,
              '通知',
              '新機能について通知を受け取る',
              undefined,
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />,
            )}

            {renderSettingItem(
              <Moon size={20} color="#5856D6" />,
              'ダークモード',
              'ダークテーマを使用する',
              undefined,
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />,
            )}

            {renderSettingItem(
              <Download size={20} color="#34C759" />,
              'オフライン読み取り',
              '記事をダウンロードしてオフラインで読む',
              undefined,
              <Switch
                value={offlineReadingEnabled}
                onValueChange={setOfflineReadingEnabled}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />,
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データとプライバシー</Text>
          <View style={styles.settingsGroup}>
            {renderSettingItem(
              <Share size={20} color="#007AFF" />,
              'データのエクスポート',
              '保存されたすべてのリンクをダウンロード',
              handleExportData,
              undefined,
              true,
            )}

            {renderSettingItem(
              <Trash2 size={20} color="#FF3B30" />,
              'すべてのデータを削除',
              '保存されたすべてのリンクを完全に削除',
              handleClearData,
              undefined,
              true,
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>
          <View style={styles.settingsGroup}>
            {renderSettingItem(
              <Settings size={20} color="#8E8E93" />,
              'アカウント設定',
              'アカウントの設定を管理',
              () => console.log('Account settings'),
              undefined,
              true,
            )}

            {renderSettingItem(
              <LogOut size={20} color="#FF3B30" />,
              'サインアウト',
              'アカウントからサインアウト',
              handleSignOut,
              undefined,
              true,
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>
            © 2024 Read Later App. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
