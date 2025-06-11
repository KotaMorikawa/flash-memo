export interface SavedLink {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  readingTime?: number;
  source?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface SearchFilters {
  query: string;
  tags: string[];
  isRead?: boolean;
  sortBy: 'newest' | 'oldest' | 'title' | 'readingTime';
}