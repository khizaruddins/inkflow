export type UserRole = 'admin' | 'writer' | 'reader' | 'ADMIN' | 'WRITER' | 'READER';
export type UserStatus = 'ACTIVE' | 'PAUSED' | 'SUSPENDED' | 'PENDING_DELETION';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: UserRole;
  status?: UserStatus;
  pausedAt?: string | null;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  deletionRequestedAt?: string | null;
  deletionScheduledAt?: string | null;
  followersCount: number;
  followingCount: number;
  followingUserIds?: string[];
  articlesCount: number;
  twitter?: string;
  github?: string;
  website?: string;
  createdAt: string;
}

export type PostStatus = 'draft' | 'pending_review' | 'needs_revision' | 'published' | 'scheduled' | 'archived' | 'rejected' | 'DRAFT' | 'PENDING_REVIEW' | 'NEEDS_REVISION' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | 'REJECTED';
export type PostVisibility = 'public' | 'private' | 'unlisted' | 'PUBLIC' | 'PRIVATE';
export type PrivateLockType = 'NONE' | 'PIN' | 'PASSWORD';
export type PrivateAccessStatus = 'ACTIVE' | 'CONSUMED' | 'REVOKED';

export interface CreatorApplication {
  id: string;
  userId: string;
  user?: User;
  sampleTitle: string;
  sampleContent: string;
  motivation: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

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

export type Author = User;

export interface BlogPost {
  id: string;
  authorId?: string;
  canEdit?: boolean;
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
  reviewFeedback?: string | null;
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
  // Private story configuration & access state
  privateLockType?: PrivateLockType;
  secretPassword?: string;
  hasPassword?: boolean;
  requiresPassword?: boolean;
  allowLinkPasswordAccess?: boolean;
  requirePasswordForGrantedUsers?: boolean;
  requireFollowerToView?: boolean;
  shareToken?: string | null;
  sharedCount?: number;
  oneTimeView?: boolean;
  hasViewed?: boolean;
  accessStatus?: PrivateAccessStatus | null;
  isFollowingAuthor?: boolean;
  locked?: boolean;
  collabMode?: CollabMode;
  collabInviteToken?: string;
}

export type CollabMode = 'FREE_FLOW' | 'APPROVAL_REQUIRED';
export type CollabSuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CollabUser {
  socketId: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  color: string;
  isAuthor: boolean;
  canEdit: boolean;
  isTyping?: boolean;
}

export interface CollabSuggestion {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    role?: string;
  };
  title?: string;
  originalContent: string;
  suggestedContent: string;
  diffSummary?: string;
  status: CollabSuggestionStatus;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CollabCollaborator {
  id: string;
  userId: string;
  user: User;
  canEdit: boolean;
  createdAt: string;
}

export interface CollabState {
  postId: string;
  title?: string;
  subtitle?: string;
  content?: string;
  collabMode: CollabMode;
  collabInviteToken?: string;
  isAuthor: boolean;
  canEdit: boolean;
  collaborators: CollabCollaborator[];
  pendingSuggestionsCount: number;
}

export interface PrivateSharedUserEntry {
  id?: string;
  userId: string;
  user?: User;
  name?: string;
  username?: string;
  avatar?: string;
  role?: UserRole;
  status: PrivateAccessStatus;
  oneTimeView: boolean;
  hasCustomPassword?: boolean;
  requirePassword?: boolean;
  lockType?: PrivateLockType;
  viewCount: number;
  lastViewedAt?: string | null;
  isFollower?: boolean;
  isFollowing?: boolean;
}

export interface PrivateFollowerEntry {
  userId: string;
  user?: User;
  name?: string;
  username?: string;
  avatar?: string;
  role?: UserRole;
  hasAccess: boolean;
  accessStatus?: PrivateAccessStatus | null;
  oneTimeView?: boolean;
  hasViewed?: boolean;
}

export interface PrivateSearchUserEntry {
  userId: string;
  user?: User;
  name?: string;
  username?: string;
  avatar?: string;
  role?: UserRole;
  bio?: string;
  isFollower: boolean;
  isFollowing: boolean;
  canGrantDirectly: boolean;
  needsFollowBeforeGrant: boolean;
  hasAccess?: boolean;
  accessStatus?: PrivateAccessStatus | null;
}

export interface PrivatePostSettingsData {
  post: BlogPost;
  sharedWith: PrivateSharedUserEntry[];
  followers: PrivateFollowerEntry[];
}

export interface UnlockedPrivatePostResponse {
  unlocked: boolean;
  unlockToken: string;
  oneTimeView: boolean;
  post: BlogPost;
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
  topArticles: {
    id: string;
    title: string;
    slug?: string;
    views: number;
    readingTime: string;
    claps: number;
    commentsCount?: number;
  }[];
}

export interface SearchFilterState {
  query?: string;
  category?: string;
  categorySlug?: string;
  tag?: string;
  tagSlug?: string;
  authorUsername?: string;
  authorId?: string;
  visibility?: PostVisibility | 'ALL';
  status?: PostStatus | 'all' | 'ALL';
  sortBy?: 'latest' | 'popular' | 'claps' | 'reading_time';
}

export type PostReportReason = 'ABUSIVE' | 'INAPPROPRIATE' | 'FALSE_CLAIM' | 'OTHER' | 'abusive' | 'inappropriate' | 'false_claim' | 'other';

export interface PostReport {
  id: string;
  postId: string;
  post?: {
    id: string;
    title: string;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    visibility?: string;
    author?: {
      id: string;
      name: string;
      username: string;
      avatar: string;
      email?: string;
    };
  };
  reporterId: string;
  reporter?: {
    id: string;
    name: string;
    username: string;
    email?: string;
    avatar?: string;
  };
  reason: PostReportReason;
  customNote?: string;
  adminNote?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  user?: User;
  userEmail: string;
  userName: string;
  status: 'PENDING' | 'CANCELLED' | 'COMPLETED';
  requestedAt: string;
  scheduledFor: string;
  isEligibleForTermination?: boolean;
  daysRemaining?: number;
  isOverdue?: boolean;
}
