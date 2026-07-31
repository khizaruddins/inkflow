export type UserRole = 'admin' | 'reader';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: UserRole;
  followersCount: number;
  followingCount: number;
  articlesCount: number;
  twitter?: string;
  github?: string;
  website?: string;
  createdAt: string;
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'deleted';
export type PostVisibility = 'public' | 'private' | 'unlisted';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  postCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface PostVersion {
  id: string;
  savedAt: string;
  title: string;
  content: string;
  authorName: string;
}

export interface SEOSettings {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];
  ogImage: string;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: User;
  category: Category;
  tags: Tag[];
  status: PostStatus;
  visibility: PostVisibility;
  readingTimeMinutes: number;
  wordCount: number;
  characterCount: number;
  clapsCount: number;
  viewsCount: number;
  commentsCount: number;
  sharesCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  publishedAt: string | null;
  scheduledAt?: string | null;
  updatedAt: string;
  createdAt: string;
  series?: string;
  toc?: TOCItem[];
  seo: SEOSettings;
  versionHistory?: PostVersion[];
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  clapsCount: number;
  parentId?: string | null;
  replies?: Comment[];
}

export interface AnalyticsSummary {
  totalViews: number;
  viewsTrend: number; // percentage change
  totalPublished: number;
  publishedTrend: number;
  totalClaps: number;
  clapsTrend: number;
  totalSubscribers: number;
  subscribersTrend: number;
  readingTimeHours: number;
  trafficSources: { name: string; value: number; color: string }[];
  countryStats: { country: string; flag: string; views: number }[];
  dailyViews: { date: string; views: number; uniqueVisitors: number }[];
  topArticles: { id: string; title: string; views: number; readingTime: string; claps: number }[];
}

export interface SearchFilterState {
  query: string;
  categorySlug?: string;
  tagSlug?: string;
  authorUsername?: string;
  status?: PostStatus;
  sortBy: 'latest' | 'popular' | 'claps' | 'reading_time';
}
