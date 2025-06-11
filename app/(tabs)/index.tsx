import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Linking,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Filter, RotateCcw, BookOpen, Target } from 'lucide-react-native';
import StackedList from '@/components/home/StackedList';
import ReadLinksList from '@/components/home/ReadLinksList';
import AddLinkModal from '@/components/AddLinkModal';
import TagFilter from '@/components/TagFilter';
import RotatingCarousel from '@/components/home/RotatingCarousel';
import { SavedLink } from '@/types';
import { mockLinks, popularTags } from '@/utils/mockData';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [links, setLinks] = useState<SavedLink[]>(mockLinks);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  const [fanExpandedLinks, setFanExpandedLinks] = useState<SavedLink[]>([]);
  const [showFanExpanded, setShowFanExpanded] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const scrollY = useSharedValue(0);

  const filteredLinks = useMemo(() => {
    let filtered = links;

    // タブによるフィルタリング
    if (activeTab === 'unread') {
      filtered = filtered.filter((link) => !link.isRead);
    } else {
      filtered = filtered.filter((link) => link.isRead);
    }

    // タグによるフィルタリング
    if (selectedTags.length > 0) {
      filtered = filtered.filter((link) =>
        selectedTags.some((tag) => link.tags.includes(tag))
      );
    }

    return filtered;
  }, [links, selectedTags, activeTab]);

  const totalUnreadCount = links.filter((link) => !link.isRead).length;
  const totalReadCount = links.filter((link) => link.isRead).length;
  const totalCount = links.length;
  const progressPercentage =
    totalCount > 0 ? (totalReadCount / totalCount) * 100 : 0;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.9]);
    const translateY = interpolate(scrollY.value, [0, 100], [0, -10]);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLinkPress = (link: SavedLink) => {
    // 未読タブの場合のみ既読にマーク
    if (activeTab === 'unread') {
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, isRead: true } : l))
      );
    }

    Linking.openURL(link.url).catch(() => {
      Alert.alert('Error', 'Could not open the link');
    });
  };

  const handleLinkLongPressStart = (link: SavedLink) => {
    // 同じ日付のリンクを取得してカード展開
    const linkDate = link.createdAt.toISOString().split('T')[0];
    const sameDateLinks = filteredLinks.filter(
      (l) => l.createdAt.toISOString().split('T')[0] === linkDate
    );

    if (sameDateLinks.length > 1) {
      // 複数のカードがある場合は手札展開
      setIsLongPressing(true);
      setFanExpandedLinks(sameDateLinks);
      setShowFanExpanded(true);
    } else {
      // 単独カードの場合は従来のオプション表示
      Alert.alert(
        'Link Options',
        `What would you like to do with "${link.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: link.isRead ? 'Mark as Unread' : 'Mark as Read',
            onPress: () => toggleReadStatus(link.id),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteLink(link.id),
          },
        ]
      );
    }
  };

  const handleLongPressEnd = () => {
    // 長押し終了時にモーダルを閉じる
    setIsLongPressing(false);
    setShowFanExpanded(false);
    setFanExpandedLinks([]);
  };

  const handleFanCardLongPress = (link: SavedLink) => {
    // 手札内のカード長押し時の処理
    Alert.alert(
      'Link Options',
      `What would you like to do with "${link.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: link.isRead ? 'Mark as Unread' : 'Mark as Read',
          onPress: () => toggleReadStatus(link.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteLink(link.id),
        },
      ]
    );
  };

  const toggleReadStatus = (id: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isRead: !link.isRead } : link
      )
    );
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleAddLink = (url: string, tags: string[]) => {
    const newLink: SavedLink = {
      id: Date.now().toString(),
      url,
      title: 'Loading...',
      description: 'Fetching content...',
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: false,
    };

    setLinks((prev) => [newLink, ...prev]);

    setTimeout(() => {
      setLinks((prev) =>
        prev.map((link) =>
          link.id === newLink.id
            ? {
                ...link,
                title: 'New Article from Shared Link',
                description:
                  'This article was added from the share sheet and contains interesting information about the topic.',
                thumbnail:
                  'https://images.pexels.com/photos/261628/pexels-photo-261628.jpeg?auto=compress&cs=tinysrgb&w=400',
                readingTime: 5,
                source: 'Shared Content',
              }
            : link
        )
      );
    }, 2000);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetAllToUnread = () => {
    Alert.alert('Reset Reading Progress', 'Mark all articles as unread?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: () => {
          setLinks((prev) => prev.map((link) => ({ ...link, isRead: false })));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'read' && (
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            {/* Main Header */}
            <View style={styles.headerMain}>
              <View style={styles.titleSection}>
                <View style={styles.titleRow}>
                  <BookOpen
                    size={28}
                    color="#1C1C1E"
                    style={styles.titleIcon}
                  />
                  <Text style={styles.greeting}>Reading Stack</Text>
                </View>
                <Text style={styles.subtitle}>
                  Your curated collection of articles
                </Text>
              </View>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <View style={styles.progressStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{totalUnreadCount}</Text>
                    <Text style={styles.statLabel}>Unread</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{totalReadCount}</Text>
                    <Text style={styles.statLabel}>Read</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{totalCount}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={resetAllToUnread}
                  >
                    <RotateCcw size={16} color="#8E8E93" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.iconButton,
                      showFilters && styles.activeIconButton,
                    ]}
                    onPress={() => setShowFilters(!showFilters)}
                  >
                    <Filter
                      size={16}
                      color={showFilters ? '#007AFF' : '#8E8E93'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(progressPercentage)}% completed
                </Text>
              </View>

              {/* Stack Visualization */}
              <View style={styles.stackVisualization}>
                <View style={styles.stackBars}>
                  {[...Array(Math.min(totalUnreadCount, 8))].map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.stackBar,
                        {
                          height: 4 + index * 2,
                          opacity: 1 - index * 0.1,
                          marginLeft: index * 2,
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.stackLabel}>
                  <Target size={12} color="#8E8E93" />
                  <Text style={styles.stackLabelText}>
                    {totalUnreadCount > 0
                      ? `${totalUnreadCount} articles stacked`
                      : 'Stack cleared!'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Filters */}
            {showFilters && (
              <View style={styles.filtersSection}>
                <TagFilter
                  tags={popularTags}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                />
              </View>
            )}
          </Animated.View>
        )}

        <View style={styles.stackContainer}>
          {activeTab === 'unread' ? (
            filteredLinks.length > 0 ? (
              <StackedList
                links={filteredLinks}
                onLinkPress={handleLinkPress}
                onLinkLongPress={handleLinkLongPressStart}
                onLongPressEnd={handleLongPressEnd}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>未読記事がありません</Text>
                <Text style={styles.emptySubText}>
                  新しい記事を追加してスタックを作りましょう
                </Text>
              </View>
            )
          ) : (
            <ReadLinksList
              links={filteredLinks}
              onLinkPress={handleLinkPress}
              onLinkLongPress={handleLinkLongPressStart}
            />
          )}
        </View>
      </Animated.ScrollView>

      <AddLinkModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddLink}
      />

      <RotatingCarousel
        visible={showFanExpanded}
        links={fanExpandedLinks}
        onClose={() => setShowFanExpanded(false)}
        onCardPress={handleLinkPress}
      />

      {/* Fixed Bottom Tab */}
      <View
        style={[
          styles.bottomTabContainer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <View style={styles.bottomTabWrapper}>
          <TouchableOpacity
            style={[
              styles.bottomTab,
              activeTab === 'unread' && styles.activeBottomTab,
            ]}
            onPress={() => setActiveTab('unread')}
          >
            <Text
              style={[
                styles.bottomTabText,
                activeTab === 'unread' && styles.activeBottomTabText,
              ]}
            >
              未読
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bottomTab,
              activeTab === 'read' && styles.activeBottomTab,
            ]}
            onPress={() => setActiveTab('read')}
          >
            <Text
              style={[
                styles.bottomTabText,
                activeTab === 'read' && styles.activeBottomTabText,
              ]}
            >
              既読
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
    lineHeight: 20,
  },

  progressSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeIconButton: {
    backgroundColor: '#E1F5FE',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    textAlign: 'center',
  },
  stackVisualization: {
    alignItems: 'center',
  },
  stackBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    marginBottom: 8,
  },
  stackBar: {
    width: 16,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  stackLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackLabelText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginLeft: 4,
  },
  filtersSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    marginTop: 8,
    paddingTop: 16,
  },
  stackContainer: {
    paddingTop: 20,
    paddingBottom: 100, // ボトムタブ分のスペースを確保
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 1000,
  },
  bottomTabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    width: 140,
  },
  bottomTab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBottomTab: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeBottomTabText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
