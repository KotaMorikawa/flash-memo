import { Doc } from '@/convex/_generated/dataModel';
import { SavedLink } from '@/types';

// ConvexのlinkドキュメントをSavedLink型に変換する関数
export function convertConvexLinkToSavedLink(
  convexLink: Doc<'links'>,
): SavedLink {
  return {
    id: convexLink._id,
    url: convexLink.url,
    title: convexLink.title || 'Untitled',
    description: convexLink.description,
    thumbnail: convexLink.thumbnailUrl,
    tags: convexLink.tags || [],
    createdAt: new Date(convexLink.createdAt),
    updatedAt: new Date(convexLink.updatedAt),
    isRead: convexLink.isRead || false,
    readingTime: convexLink.readingTime,
    source: convexLink.source,
  };
}

// SavedLink配列に変換する関数
export function convertConvexLinksToSavedLinks(
  convexLinks: Doc<'links'>[],
): SavedLink[] {
  return convexLinks.map(convertConvexLinkToSavedLink);
}
