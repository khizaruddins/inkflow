import { apiClient } from '@/lib/api-client';
import { getUnlockHeaders } from '@/lib/private-unlock';
import {
  BlogPost,
  SearchFilterState,
  PostStatus,
  Category,
  Tag,
  SEOSettings,
  PrivateLockType,
  PrivateSharedUserEntry,
  PrivateFollowerEntry,
  PrivateSearchUserEntry,
  PrivatePostSettingsData,
  UnlockedPrivatePostResponse,
  PrivateAccessStatus,
} from '@/types';
import { normalizeUser } from './auth.service';

function normalizeStatus(rawStatus: any): PostStatus {
  const s = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : 'draft';
  if (s === 'published') return 'published';
  if (s === 'scheduled') return 'scheduled';
  if (s === 'archived') return 'archived';
  if (s === 'pending_review') return 'pending_review';
  if (s === 'needs_revision') return 'needs_revision';
  if (s === 'rejected') return 'rejected';
  return 'draft';
}

function normalizeLockType(rawType: any): PrivateLockType {
  const val = typeof rawType === 'string' ? rawType.toUpperCase() : 'NONE';
  if (val === 'PIN' || val === 'PASSWORD') return val;
  return 'NONE';
}

export function normalizePost(raw: any): BlogPost {
  if (!raw) return null as any;

  const status = normalizeStatus(raw.status);

  const category: Category = raw.category
    ? {
        id: raw.category.id || raw.category._id || 'cat_default',
        name: raw.category.name || 'General',
        slug: raw.category.slug || 'general',
        description: raw.category.description,
        color: raw.category.color || 'from-primary-500 to-brand-600',
        postCount: raw.category.postCount || 0,
      }
    : {
        id: 'cat_engineering',
        name: 'Engineering',
        slug: 'engineering',
        description: 'System design, React 19, and cloud architectures.',
        color: 'from-blue-500 to-indigo-600',
        postCount: 0,
      };

  const tags: Tag[] = Array.isArray(raw.tags)
    ? raw.tags.map((t: any) => ({
        id: t.id || t._id || 'tag_gen',
        name: t.name || 'Tech',
        slug: t.slug || 'tech',
        postCount: t.postCount || 0,
      }))
    : [];

  const seo: SEOSettings = {
    slug: raw.seo?.slug || raw.slug || 'untitled-post',
    metaTitle: raw.seo?.metaTitle || raw.title || 'Untitled Post',
    metaDescription: raw.seo?.metaDescription || raw.excerpt || '',
    canonicalUrl: raw.seo?.canonicalUrl || `https://inkflow.dev/blog/${raw.slug || 'untitled-post'}`,
    keywords: Array.isArray(raw.seo?.keywords) ? raw.seo.keywords : [],
    ogImage: raw.seo?.ogImage || raw.coverImage || '',
  };

  return {
    id: raw.id || raw._id || `post_${Date.now()}`,
    authorId: raw.authorId || raw.author?.id || raw.author?._id,
    canEdit: raw.canEdit !== undefined ? Boolean(raw.canEdit) : undefined,
    title: raw.title || 'Untitled Post',
    subtitle: raw.subtitle || '',
    slug: raw.slug || 'untitled-post',
    excerpt: raw.excerpt || '',
    content: raw.content || '',
    coverImage: raw.coverImage || '',
    author: normalizeUser(raw.author),
    category,
    tags,
    status,
    visibility:
      raw.isPrivate === true ||
      (typeof raw.visibility === 'string' && raw.visibility.toLowerCase() === 'private')
        ? 'private'
        : typeof raw.visibility === 'string' && raw.visibility.toLowerCase() === 'unlisted'
        ? 'unlisted'
        : 'public',
    reviewFeedback: raw.reviewFeedback ?? null,
    readingTimeMinutes: raw.readingTimeMinutes || 5,
    wordCount: raw.wordCount || 800,
    characterCount: raw.characterCount || 4000,
    clapsCount: raw.clapsCount || 0,
    viewsCount: raw.viewsCount || 0,
    sharesCount: raw.sharesCount || 0,
    commentsCount: raw.commentsCount || (Array.isArray(raw.comments) ? raw.comments.length : 0),
    isFeatured: Boolean(raw.isFeatured),
    isPinned: Boolean(raw.isPinned),
    seo,
    publishedAt: raw.publishedAt || raw.createdAt || new Date().toISOString(),
    scheduledAt: raw.scheduledAt,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    privateLockType: normalizeLockType(raw.lockType ?? raw.privateLockType),
    hasPassword: Boolean(raw.hasPassword ?? raw.requiresPassword),
    requiresPassword: Boolean(raw.requiresPassword ?? raw.hasPassword),
    allowLinkPasswordAccess:
      raw.allowLinkPasswordAccess !== undefined ? Boolean(raw.allowLinkPasswordAccess) : true,
    requirePasswordForGrantedUsers: Boolean(raw.requirePasswordForGrantedUsers),
    requireFollowerToView: Boolean(raw.requireFollowerToView),
    shareToken: raw.shareToken ?? null,
    sharedCount:
      raw.sharedCount ??
      (Array.isArray(raw.sharedWith) ? raw.sharedWith.length : raw._count?.privateAccess ?? 0),
    oneTimeView: Boolean(raw.oneTimeView),
    hasViewed: Boolean(raw.hasViewed),
    accessStatus: raw.accessStatus ?? null,
    isFollowingAuthor:
      raw.isFollowingAuthor !== undefined ? Boolean(raw.isFollowingAuthor) : undefined,
    locked: Boolean(raw.locked),
  };
}

function normalizeSharedEntry(raw: any): PrivateSharedUserEntry {
  const normalizedUser = raw.user ? normalizeUser(raw.user) : undefined;
  return {
    id: raw.id || raw._id,
    userId: raw.userId || normalizedUser?.id || raw.id || '',
    user: normalizedUser,
    name: raw.name || normalizedUser?.name || 'Reader',
    username: raw.username || normalizedUser?.username || 'reader',
    avatar: raw.avatar || normalizedUser?.avatar || '',
    status: (typeof raw.status === 'string' ? raw.status.toUpperCase() : 'ACTIVE') as PrivateAccessStatus,
    oneTimeView: Boolean(raw.oneTimeView),
    hasCustomPassword: Boolean(raw.hasCustomPassword ?? raw.hasPassword),
    requirePassword: Boolean(raw.requirePassword),
    lockType: normalizeLockType(raw.lockType),
    viewCount: Number(raw.viewCount || 0),
    lastViewedAt: raw.lastViewedAt ?? null,
    isFollower: raw.isFollower !== undefined ? Boolean(raw.isFollower) : undefined,
    isFollowing: raw.isFollowing !== undefined ? Boolean(raw.isFollowing) : undefined,
  };
}

function normalizeFollowerEntry(raw: any): PrivateFollowerEntry {
  const normalizedUser = raw.user ? normalizeUser(raw.user) : normalizeUser(raw);
  return {
    userId: raw.userId || normalizedUser?.id || raw.id || '',
    user: normalizedUser,
    name: raw.name || normalizedUser?.name || 'Follower',
    username: raw.username || normalizedUser?.username || 'reader',
    avatar: raw.avatar || normalizedUser?.avatar || '',
    hasAccess: Boolean(raw.hasAccess),
    accessStatus: raw.accessStatus ? (String(raw.accessStatus).toUpperCase() as PrivateAccessStatus) : null,
    oneTimeView: Boolean(raw.oneTimeView),
    hasViewed: Boolean(raw.hasViewed),
  };
}

function normalizeSearchUserEntry(raw: any): PrivateSearchUserEntry {
  const normalizedUser = raw.user ? normalizeUser(raw.user) : normalizeUser(raw);
  return {
    userId: raw.userId || normalizedUser?.id || raw.id || '',
    user: normalizedUser,
    name: raw.name || normalizedUser?.name || 'User',
    username: raw.username || normalizedUser?.username || 'user',
    avatar: raw.avatar || normalizedUser?.avatar || '',
    bio: raw.bio || normalizedUser?.bio || '',
    isFollower: Boolean(raw.isFollower),
    isFollowing: Boolean(raw.isFollowing),
    canGrantDirectly: Boolean(raw.canGrantDirectly ?? (raw.isFollower || raw.isFollowing)),
    needsFollowBeforeGrant: Boolean(
      raw.needsFollowBeforeGrant ?? (!raw.isFollower && !raw.isFollowing)
    ),
    hasAccess: Boolean(raw.hasAccess),
    accessStatus: raw.accessStatus ? (String(raw.accessStatus).toUpperCase() as PrivateAccessStatus) : null,
  };
}

function buildPostMutationPayload(dto: any, isUpdate = false) {
  const visibility = (dto.visibility || 'PUBLIC').toString().toUpperCase();
  const isPrivate = visibility === 'PRIVATE';
  const trimmedTitle = typeof dto.title === 'string' ? dto.title.trim() : '';
  const trimmedSubtitle = typeof dto.subtitle === 'string' ? dto.subtitle.trim() : '';
  const rawContent = typeof dto.content === 'string' ? dto.content.trim() : '';
  const hasRealContent = rawContent !== '' && rawContent !== '<p></p>';
  const resolvedSlug = dto.seo?.slug?.trim() || dto.slug?.trim();
  const resolvedExcerpt =
    dto.excerpt?.trim() || dto.seo?.metaDescription?.trim() || trimmedSubtitle || trimmedTitle;

  return {
    ...(trimmedTitle ? { title: trimmedTitle } : isUpdate ? {} : { title: 'Untitled' }),
    ...(trimmedSubtitle ? { subtitle: trimmedSubtitle } : isUpdate ? {} : { subtitle: '' }),
    ...(resolvedSlug
      ? { slug: resolvedSlug }
      : !isUpdate && trimmedTitle
      ? { slug: trimmedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
      : {}),
    ...(resolvedExcerpt ? { excerpt: resolvedExcerpt } : {}),
    ...(hasRealContent ? { content: dto.content } : isUpdate ? {} : { content: dto.content || '<p></p>' }),
    ...(dto.coverImage !== undefined ? { coverImage: dto.coverImage || '' } : {}),
    categoryId: dto.category?.id || dto.categoryId || undefined,
    tagIds: dto.tags?.map((t: any) => t.id) || dto.tagIds || [],
    status: dto.status?.toUpperCase() || 'PUBLISHED',
    visibility,
    isPrivate,
    ...(isPrivate
      ? {
          ...(dto.secretPassword?.trim()
            ? {
                secretPassword: dto.secretPassword.trim(),
                password: dto.secretPassword.trim(),
              }
            : {}),
          privateLockType: dto.privateLockType || 'NONE',
          lockType: dto.privateLockType || 'NONE',
          allowLinkPasswordAccess: Boolean(dto.allowLinkPasswordAccess),
          requirePasswordForGrantedUsers: Boolean(dto.requirePasswordForGrantedUsers),
          requireFollowerToView: Boolean(dto.requireFollowerToView),
        }
      : {
          ...(dto.secretPassword !== undefined ? { secretPassword: dto.secretPassword } : {}),
        }),
  };
}

export const BlogService = {
  async getPosts(filters?: SearchFilterState): Promise<BlogPost[]> {
    try {
      const params: Record<string, string> = {};
      if (filters?.query) params.q = filters.query;
      const category = filters?.category || filters?.categorySlug;
      if (category) params.category = category;
      const tag = filters?.tag || filters?.tagSlug;
      if (tag) params.tag = tag;
      if (filters?.status) params.status = filters.status.toUpperCase();
      if (filters?.visibility && String(filters.visibility).toUpperCase() !== 'ALL') {
        params.visibility = String(filters.visibility).toUpperCase();
      }
      if (filters?.authorId) params.authorId = filters.authorId;
      if (filters?.sortBy) params.sort = filters.sortBy;

      const rawList = await apiClient.get<any[]>('/posts', params);
      if (Array.isArray(rawList)) {
        return rawList.map(normalizePost);
      }
      return [];
    } catch (err) {
      console.error('Error fetching posts from backend:', err);
      return [];
    }
  },

  async getPostBySlugOrId(
    slugOrId: string,
    options?: { shareToken?: string; unlockToken?: string }
  ): Promise<BlogPost | null> {
    try {
      const params = options?.shareToken ? { shareToken: options.shareToken } : undefined;
      const headers = getUnlockHeaders(undefined, options?.shareToken, options?.unlockToken);
      const raw = await apiClient.get<any>(`/posts/${encodeURIComponent(slugOrId)}`, params, { headers });
      if (raw) return normalizePost(raw);
      return null;
    } catch (err: any) {
      if (err?.status === 404 || err?.response?.status === 404 || err?.message?.includes('not found')) {
        return null;
      }
      return null;
    }
  },

  async getPostBySlug(
    slug: string,
    options?: { shareToken?: string; unlockToken?: string }
  ): Promise<BlogPost | null> {
    return this.getPostBySlugOrId(slug, options);
  },

  async getPostForEdit(id: string): Promise<BlogPost> {
    const raw = await apiClient.get<any>(`/posts/${encodeURIComponent(id)}/edit`);
    const target = raw?.post || raw;
    const normalized = normalizePost(target);
    return {
      ...normalized,
      ...(typeof target?.title === 'string' ? { title: target.title } : {}),
      canEdit: target?.canEdit !== undefined ? Boolean(target.canEdit) : true,
    };
  },

  async getReaderPost(
    slugOrId: string,
    options?: { shareToken?: string; unlockToken?: string }
  ): Promise<BlogPost> {
    const params = options?.shareToken ? { shareToken: options.shareToken } : undefined;
    const headers = getUnlockHeaders(undefined, options?.shareToken, options?.unlockToken);
    const raw = await apiClient.get<any>(`/posts/${encodeURIComponent(slugOrId)}`, params, { headers });
    return normalizePost(raw);
  },

  async getPrivatePostByShareToken(
    shareToken: string,
    unlockToken?: string
  ): Promise<BlogPost> {
    const headers = getUnlockHeaders(undefined, shareToken, unlockToken);
    const raw = await apiClient.get<any>(
      `/posts/private/share/${encodeURIComponent(shareToken)}`,
      undefined,
      { headers }
    );
    return normalizePost(raw);
  },

  async unlockPrivatePost(
    postId: string,
    payload: { password?: string; pin?: string; shareToken?: string }
  ): Promise<UnlockedPrivatePostResponse> {
    const secret = payload.password ?? payload.pin;
    const body: Record<string, any> = {
      ...(secret ? { password: secret } : {}),
      ...(payload.shareToken ? { shareToken: payload.shareToken } : {}),
    };
    const headers = payload.shareToken ? { 'x-share-token': payload.shareToken } : undefined;
    const raw = await apiClient.post<any>(`/posts/${postId}/unlock`, body, { headers });
    return {
      unlocked: Boolean(raw?.unlocked ?? true),
      unlockToken: raw?.unlockToken || '',
      oneTimeView: Boolean(raw?.oneTimeView),
      post: normalizePost(raw?.post || raw),
    };
  },

  async createPost(dto: any): Promise<BlogPost> {
    if (dto.id) {
      return this.updatePost(dto.id, dto);
    }
    const raw = await apiClient.post<any>('/posts', buildPostMutationPayload(dto, false));
    return normalizePost(raw);
  },

  async saveDraft(dto: any): Promise<BlogPost> {
    const visibility = (dto.visibility || 'PUBLIC').toString().toUpperCase();
    const isPrivate = visibility === 'PRIVATE';
    const hasId = Boolean(dto.id);
    const trimmedTitle = typeof dto.title === 'string' ? dto.title.trim() : '';
    const trimmedSubtitle = typeof dto.subtitle === 'string' ? dto.subtitle.trim() : '';
    const rawContent = typeof dto.content === 'string' ? dto.content.trim() : '';
    const hasRealContent = rawContent !== '' && rawContent !== '<p></p>';

    const raw = await apiClient.post<any>('/posts/draft', {
      ...(hasId ? { id: dto.id } : {}),
      ...(trimmedTitle ? { title: trimmedTitle } : hasId ? {} : { title: 'Untitled' }),
      ...(trimmedSubtitle ? { subtitle: trimmedSubtitle } : hasId ? {} : { subtitle: '' }),
      ...(hasRealContent ? { content: dto.content } : hasId ? {} : { content: '<p></p>' }),
      ...(dto.coverImage !== undefined ? { coverImage: dto.coverImage || '' } : {}),
      ...(dto.category?.id || dto.categoryId ? { categoryId: dto.category?.id || dto.categoryId } : {}),
      ...(dto.tags || dto.tagIds ? { tagIds: dto.tags?.map((t: any) => t.id) || dto.tagIds || [] } : {}),
      visibility,
      isPrivate,
      ...(isPrivate
        ? {
            ...(dto.secretPassword?.trim()
              ? {
                  secretPassword: dto.secretPassword.trim(),
                  password: dto.secretPassword.trim(),
                }
              : {}),
            privateLockType: dto.privateLockType || 'NONE',
            lockType: dto.privateLockType || 'NONE',
            allowLinkPasswordAccess: Boolean(dto.allowLinkPasswordAccess),
            requirePasswordForGrantedUsers: Boolean(dto.requirePasswordForGrantedUsers),
            requireFollowerToView: Boolean(dto.requireFollowerToView),
          }
        : {}),
    });
    return normalizePost(raw);
  },

  async updatePost(id: string, dto: any): Promise<BlogPost> {
    const payload = buildPostMutationPayload(dto, true);
    const encodedId = encodeURIComponent(id);
    try {
      const raw = await apiClient.patch<any>(`/posts/${encodedId}`, payload);
      return normalizePost(raw);
    } catch (err: any) {
      if (
        err?.status === 405 ||
        (err?.status === 404 && String(err?.message || '').includes('Cannot PATCH'))
      ) {
        const raw = await apiClient.put<any>(`/posts/${encodedId}`, payload);
        return normalizePost(raw);
      }
      throw err;
    }
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },

  async clapPost(id: string, count: number = 1, unlockToken?: string): Promise<number> {
    const updated = await apiClient.post<any>(
      `/posts/${id}/clap`,
      { count },
      { headers: getUnlockHeaders(id, undefined, unlockToken) }
    );
    return updated?.clapsCount ?? count;
  },

  async getPostClappers(
    id: string,
    unlockToken?: string
  ): Promise<Array<{ id: string; count: number; user: { id: string; name: string; username: string; avatar: string } }>> {
    const list = await apiClient.get<any[]>(`/posts/${id}/clappers`, undefined, {
      headers: getUnlockHeaders(id, undefined, unlockToken),
    });
    return Array.isArray(list) ? list : [];
  },

  async verifyPassword(
    id: string,
    password: string,
    shareToken?: string
  ): Promise<{
    valid: boolean;
    unlocked?: boolean;
    unlockToken?: string;
    oneTimeView?: boolean;
    post?: BlogPost;
  }> {
    try {
      const res = await apiClient.post<any>(
        `/posts/${id}/verify-password`,
        { password, ...(shareToken ? { shareToken } : {}) },
        shareToken ? { headers: { 'x-share-token': shareToken } } : undefined
      );
      if (res && typeof res === 'object' && res.success === false) {
        return { valid: false };
      }
      const valid = Boolean(res?.valid ?? res?.unlocked ?? res?.success);
      return {
        valid,
        unlocked: Boolean(res?.unlocked),
        unlockToken: res?.unlockToken,
        oneTimeView: Boolean(res?.oneTimeView),
        post: res?.post ? normalizePost(res.post) : undefined,
      };
    } catch (err) {
      return { valid: false };
    }
  },

  // Private Blog Dashboard & Sharing Endpoints
  async getMyPrivatePosts(): Promise<BlogPost[]> {
    const res = await apiClient.get<any>('/posts/private/mine');
    const list = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    return list.map(normalizePost);
  },

  async getSharedWithMePosts(): Promise<BlogPost[]> {
    const res = await apiClient.get<any>('/posts/private/shared-with-me');
    const list = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    return list.map(normalizePost);
  },

  async getAdminPrivatePosts(): Promise<BlogPost[]> {
    const res = await apiClient.get<any>('/posts/private/admin');
    const list = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    return list.map(normalizePost);
  },

  async getPrivateSettings(postId: string): Promise<PrivatePostSettingsData> {
    const res = await apiClient.get<any>(`/posts/${postId}/private-settings`);
    return {
      post: normalizePost(res?.post || res),
      sharedWith: Array.isArray(res?.sharedWith) ? res.sharedWith.map(normalizeSharedEntry) : [],
      followers: Array.isArray(res?.followers) ? res.followers.map(normalizeFollowerEntry) : [],
    };
  },

  async updatePrivateSettings(
    postId: string,
    dto: {
      password?: string;
      lockType?: PrivateLockType;
      removePassword?: boolean;
      allowLinkPasswordAccess?: boolean;
      requirePasswordForGrantedUsers?: boolean;
      requireFollowerToView?: boolean;
      regenerateShareToken?: boolean;
    }
  ): Promise<BlogPost> {
    const res = await apiClient.patch<any>(`/posts/${postId}/private-settings`, dto);
    return normalizePost(res?.post || res);
  },

  async getPrivateAccessFollowers(postId: string, search?: string): Promise<PrivateFollowerEntry[]> {
    const res = await apiClient.get<any>(
      `/posts/${postId}/private-access/followers`,
      search?.trim() ? { search: search.trim() } : undefined
    );
    const list = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    return list.map(normalizeFollowerEntry);
  },

  async searchPrivateAccessUsers(postId: string, search?: string): Promise<PrivateSearchUserEntry[]> {
    const res = await apiClient.get<any>(
      `/posts/${postId}/private-access/users`,
      search?.trim() ? { search: search.trim() } : undefined
    );
    const list = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    return list.map(normalizeSearchUserEntry);
  },

  async getPrivateAccessList(
    postId: string,
    status?: PrivateAccessStatus | 'ALL'
  ): Promise<PrivateSharedUserEntry[]> {
    const res = await apiClient.get<any>(
      `/posts/${postId}/private-access`,
      status && status !== 'ALL' ? { status } : undefined
    );
    const list = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    return list.map(normalizeSharedEntry);
  },

  async grantPrivateAccess(
    postId: string,
    dto: {
      userId?: string;
      usernameOrEmail?: string;
      oneTimeView?: boolean;
      password?: string;
      lockType?: PrivateLockType;
      requirePassword?: boolean;
    }
  ): Promise<PrivateSharedUserEntry> {
    const res = await apiClient.post<any>(`/posts/${postId}/private-access`, dto);
    return normalizeSharedEntry(res?.access || res);
  },

  async updatePrivateAccess(
    postId: string,
    userId: string,
    dto: {
      oneTimeView?: boolean;
      password?: string;
      lockType?: PrivateLockType;
      removePassword?: boolean;
      requirePassword?: boolean;
      resetView?: boolean;
      status?: PrivateAccessStatus;
    }
  ): Promise<PrivateSharedUserEntry> {
    const res = await apiClient.patch<any>(`/posts/${postId}/private-access/${userId}`, dto);
    return normalizeSharedEntry(res?.access || res);
  },

  async revokePrivateAccess(postId: string, userId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}/private-access/${userId}`);
  },

  async getCategories(search?: string): Promise<Category[]> {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const list = await apiClient.get<any[]>(`/categories${q}`);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          color: c.color || 'from-blue-500 to-indigo-600',
          postCount: c.postCount || 0,
        }));
      }
    } catch (err) {
      // Fallback to mockCategories
    }
    if (search && search.trim() !== '') {
      return mockCategories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    }
    return mockCategories;
  },

  async createCategory(name: string): Promise<Category> {
    try {
      const res = await apiClient.post<any>('/categories', { name });
      return {
        id: res.id,
        name: res.name,
        slug: res.slug,
        description: res.description || '',
        color: res.color || 'from-emerald-500 to-teal-600',
        postCount: 0,
      };
    } catch (err) {
      const trimmed = name.trim();
      return {
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: `${trimmed} topic`,
        color: 'from-emerald-500 to-teal-600',
        postCount: 0,
      };
    }
  },

  async getTags(): Promise<Tag[]> {
    const posts = await this.getPosts();
    const tagsMap = new Map<string, Tag>();
    posts.forEach((p) => {
      p.tags?.forEach((t) => tagsMap.set(t.id, t));
    });
    return Array.from(tagsMap.values());
  },

  async toggleFeaturePost(id: string): Promise<BlogPost> {
    const raw = await apiClient.post<any>(`/posts/${id}/feature`);
    return normalizePost(raw);
  },

  async bulkDeletePosts(ids: string[]): Promise<void> {
    await apiClient.post('/posts/bulk-delete', { ids });
  },

  async bulkPublishPosts(ids: string[]): Promise<void> {
    await apiClient.post('/posts/bulk-publish', { ids });
  },
};

export const mockCategories: Category[] = [
  {
    id: 'cat_engineering',
    name: 'Engineering',
    slug: 'engineering',
    description: 'System design, React 19, frontend architecture, and cloud systems.',
    color: 'from-blue-500 to-indigo-600',
    postCount: 14,
  },
  {
    id: 'cat_design',
    name: 'Design Systems',
    slug: 'design-systems',
    description: 'UI/UX design, TailwindCSS, component libraries, and typography.',
    color: 'from-purple-500 to-pink-600',
    postCount: 9,
  },
  {
    id: 'cat_ai',
    name: 'Artificial Intelligence',
    slug: 'ai',
    description: 'LLMs, AI Agents, prompt engineering, and machine learning.',
    color: 'from-emerald-500 to-teal-600',
    postCount: 18,
  },
  {
    id: 'cat_webdev',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Next.js, TypeScript, Node.js backend services, and APIs.',
    color: 'from-amber-500 to-orange-600',
    postCount: 22,
  },
  {
    id: 'cat_career',
    name: 'Career & Writing',
    slug: 'career',
    description: 'Technical writing, developer career growth, and blogging tips.',
    color: 'from-rose-500 to-red-600',
    postCount: 7,
  },
];

export const mockTags: Tag[] = [
  { id: 'tag_react', name: 'React 19', slug: 'react-19', postCount: 12 },
  { id: 'tag_nextjs', name: 'Next.js', slug: 'nextjs', postCount: 15 },
  { id: 'tag_typescript', name: 'TypeScript', slug: 'typescript', postCount: 20 },
  { id: 'tag_tailwindcss', name: 'TailwindCSS', slug: 'tailwindcss', postCount: 8 },
  { id: 'tag_tiptap', name: 'TipTap', slug: 'tiptap', postCount: 5 },
  { id: 'tag_ai_agents', name: 'AI Agents', slug: 'ai-agents', postCount: 10 },
  { id: 'tag_mongodb', name: 'MongoDB', slug: 'mongodb', postCount: 6 },
];
