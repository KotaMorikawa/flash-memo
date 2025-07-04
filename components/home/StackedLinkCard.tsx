import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SavedLink } from '@/types';
import { Clock, Tag } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface StackedLinkCardProps {
  link: SavedLink;
  onPress: () => void;
  onLongPress?: () => void;
  stackIndex: number;
  totalItems: number;
}

export default function StackedLinkCard({
  link,
  onPress,
  onLongPress,
  stackIndex,
  totalItems,
}: StackedLinkCardProps) {
  // Calculate stacking offset and rotation for visual depth
  const stackOffset = stackIndex * 2;
  const rotation = (stackIndex % 2 === 0 ? 1 : -1) * (stackIndex * 0.5);
  const scale = 1 - stackIndex * 0.005;
  const opacity = link.isRead ? 0.6 : 1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: stackOffset },
            { translateY: stackOffset },
            { rotate: `${rotation}deg` },
            { scale },
          ],
          opacity,
          zIndex: totalItems - stackIndex,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, link.isRead && styles.readCard]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            {link.thumbnail && (
              <Image
                source={{ uri: link.thumbnail }}
                style={styles.thumbnail}
              />
            )}
            <View style={styles.textContent}>
              <Text
                style={[styles.title, link.isRead && styles.readTitle]}
                numberOfLines={2}
              >
                {link.title}
              </Text>
              <Text style={styles.source} numberOfLines={1}>
                {link.source || 'Web Article'}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.metadata}>
              {link.readingTime && (
                <View style={styles.readingTime}>
                  <Clock size={10} color="#8E8E93" />
                  <Text style={styles.metadataText}>{link.readingTime}min</Text>
                </View>
              )}

              {link.tags.length > 0 && (
                <View style={styles.tags}>
                  <Tag size={10} color="#8E8E93" />
                  <Text style={styles.metadataText} numberOfLines={1}>
                    {link.tags[0]}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.date}>
              {link.createdAt.toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {link.isRead && <View style={styles.readIndicator} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  readCard: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E0E0E0',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 4,
  },
  readTitle: {
    color: '#8E8E93',
  },
  source: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 3,
  },
  date: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  readIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
});
