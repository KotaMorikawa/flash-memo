import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import AddLinkModal from '@/components/AddLinkModal';

export default function AddScreen() {
  const [showAddModal, setShowAddModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // このタブがフォーカスされたらモーダルを開く
      setShowAddModal(true);
    }, [])
  );

  const handleModalClose = () => {
    setShowAddModal(false);
    // モーダルを閉じたらHomeタブに戻る
    router.replace('/(tabs)');
  };

  const handleSave = (url: string, tags: string[]) => {
    // TODO: ここで実際のリンク保存処理を実装
    // 現在はHome画面の状態管理を使用する必要がある
    console.log('Saving link:', url, tags);
    handleModalClose();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content} />

      <AddLinkModal
        visible={showAddModal}
        onClose={handleModalClose}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
});
