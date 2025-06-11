import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, Filter, Import as SortAsc } from 'lucide-react-native';
import LinkCard from '@/components/LinkCard';
import TagFilter from '@/components/TagFilter';
import { SavedLink } from '@/types';
import { mockLinks, popularTags } from '@/utils/mockData';

type SortOption = 'newest' | 'oldest' | 'title' | 'readingTime';

export default function SearchScreen() {
  const [links, setLinks] = useState<SavedLink[]>(mockLinks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showReadFilter, setShowReadFilter] = useState<'all' | 'read' | 'unread'>('all');

  const filteredAndSortedLinks = useMemo(() => {
    let filtered = links;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(link =>
        selectedTags.some(tag => link.tags.includes(tag))
      );
    }

    // Filter by read status
    if (showReadFilter === 'read') {
      filtered = filtered.filter(link => link.isRead);
    } else if (showReadFilter === 'unread') {
      filtered = filtered.filter(link => !link.isRead);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'readingTime':
          return (b.readingTime || 0) - (a.readingTime || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [links, searchQuery, selectedTags, sortBy, showReadFilter]);

  const handleLinkPress = (link: SavedLink) => {
    // Mark as read
    setLinks(prev =>
      prev.map(l =>
        l.id === link.id ? { ...l, isRead: true } : l
      )
    );

    // Open the link
    Linking.openURL(link.url).catch(() => {
      Alert.alert('Error', 'Could not open the link');
    });
  };

  const handleLinkLongPress = (link: SavedLink) => {
    Alert.alert(
      'Link Options',
      `What would you like to do with "${link.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: link.isRead ? 'Mark as Unread' : 'Mark as Read',
          onPress: () => toggleReadStatus(link.id)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteLink(link.id)
        },
      ]
    );
  };

  const toggleReadStatus = (id: string) => {
    setLinks(prev =>
      prev.map(link =>
        link.id === id ? { ...link, isRead: !link.isRead } : link
      )
    );
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const showSortOptions = () => {
    Alert.alert(
      'Sort by',
      'Choose how to sort your links',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Newest first', onPress: () => setSortBy('newest') },
        { text: 'Oldest first', onPress: () => setSortBy('oldest') },
        { text: 'Title A-Z', onPress: () => setSortBy('title') },
        { text: 'Reading time', onPress: () => setSortBy('readingTime') },
      ]
    );
  };

  const showReadOptions = () => {
    Alert.alert(
      'Filter by read status',
      'Choose which links to show',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'All links', onPress: () => setShowReadFilter('all') },
        { text: 'Unread only', onPress: () => setShowReadFilter('unread') },
        { text: 'Read only', onPress: () => setShowReadFilter('read') },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search links, tags, or content..."
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, showFilters && styles.activeControl]}
          onPress={() => setShowFilters(!showFilters)}>
          <Filter size={16} color={showFilters ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.controlText, showFilters && styles.activeControlText]}>
            Filters
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={showSortOptions}>
          <SortAsc size={16} color="#8E8E93" />
          <Text style={styles.controlText}>Sort</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={showReadOptions}>
          <Text style={styles.controlText}>
            {showReadFilter === 'all' ? 'All' : showReadFilter === 'read' ? 'Read' : 'Unread'}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <TagFilter
          tags={popularTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
      )}

      <Text style={styles.resultsCount}>
        {filteredAndSortedLinks.length} result{filteredAndSortedLinks.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: SavedLink }) => (
    <LinkCard
      link={item}
      onPress={() => handleLinkPress(item)}
      onLongPress={() => handleLinkLongPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredAndSortedLinks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContainer: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeControl: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  controlText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 6,
  },
  activeControlText: {
    color: '#FFFFFF',
  },
  resultsCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
});