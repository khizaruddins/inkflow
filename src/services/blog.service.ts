import { apiClient } from '@/lib/api-client';
import { BlogPost, SearchFilterState, PostStatus, Category, Tag } from '@/types';
import { normalizeUser } from './auth.service';

export function normalizePost(raw: any): BlogPost {
  if (!raw) return null as any;

  const status: PostStatus =
    typeof raw.status === 'string' && raw.status.toLowerCase() === 'published'
      ? 'published'
      : typeof raw.status === 'string' && raw.status.toLowerCase() === 'scheduled'
      ? 'scheduled'
      : typeof raw.status === 'string' && raw.status.toLowerCase() === 'archived'
      ? 'archived'
      : 'draft';

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
      };

  const tags: Tag[] = Array.isArray(raw.tags)
    ? raw.tags.map((t: any) => ({
        id: t.id || t._id || 'tag_gen',
        name: t.name || 'Tech',
        slug: t.slug || 'tech',
        postCount: t.postCount || 0,
      }))
    : [];

  return {
    id: raw.id || raw._id || `post_${Date.now()}`,
    title: raw.title || 'Untitled Post',
    subtitle: raw.subtitle || '',
    slug: raw.slug || 'untitled-post',
    excerpt: raw.excerpt || '',
    content: raw.content || '',
    coverImage:
      raw.coverImage ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    author: normalizeUser(raw.author),
    category,
    tags,
    status,
    visibility:
      typeof raw.visibility === 'string' && raw.visibility.toLowerCase() === 'private'
        ? 'private'
        : typeof raw.visibility === 'string' && raw.visibility.toLowerCase() === 'unlisted'
        ? 'unlisted'
        : 'public',
    readingTimeMinutes: raw.readingTimeMinutes || 5,
    wordCount: raw.wordCount || 800,
    characterCount: raw.characterCount || 4000,
    clapsCount: raw.clapsCount || 0,
    viewsCount: raw.viewsCount || 0,
    sharesCount: raw.sharesCount || 0,
    commentsCount: raw.commentsCount || (Array.isArray(raw.comments) ? raw.comments.length : 0),
    isFeatured: Boolean(raw.isFeatured),
    isPinned: Boolean(raw.isPinned),
    publishedAt: raw.publishedAt || raw.createdAt || new Date().toISOString(),
    scheduledAt: raw.scheduledAt,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export const BlogService = {
  async getPosts(filters?: SearchFilterState): Promise<BlogPost[]> {
    try {
      const params: Record<string, string> = {};
      if (filters?.query) params.q = filters.query;
      if (filters?.category) params.category = filters.category;
      if (filters?.status && filters.status !== 'all') params.status = filters.status.toUpperCase();
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

  async getPostBySlugOrId(slugOrId: string): Promise<BlogPost | null> {
    try {
      const raw = await apiClient.get<any>(`/posts/${slugOrId}`);
      if (raw) return normalizePost(raw);
      return null;
    } catch (err: any) {
      if (err?.status === 404 || err?.response?.status === 404 || err?.message?.includes('not found')) {
        return null;
      }
      console.error(`Error fetching post ${slugOrId} from backend:`, err);
      return null;
    }
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    return this.getPostBySlugOrId(slug);
  },

  async createPost(dto: any): Promise<BlogPost> {
    const raw = await apiClient.post<any>('/posts', {
      title: dto.title,
      subtitle: dto.subtitle,
      slug: dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: dto.excerpt || dto.title,
      content: dto.content,
      coverImage:
        dto.coverImage ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      categoryId: dto.categoryId,
      tagIds: dto.tagIds || [],
      status: dto.status?.toUpperCase() || 'PUBLISHED',
      visibility: dto.visibility?.toUpperCase() || 'PUBLIC',
      secretPassword: dto.secretPassword,
    });
    return normalizePost(raw);
  },

  async clapPost(id: string, count: number = 1): Promise<number> {
    try {
      const updated = await apiClient.post<any>(`/posts/${id}/clap`, { count });
      return updated?.clapsCount || count;
    } catch (err) {
      return count;
    }
  },

  async verifyPassword(id: string, password: string): Promise<boolean> {
    try {
      const res = await apiClient.post<{ valid: boolean }>(`/posts/${id}/verify-password`, {
        password,
      });
      return Boolean(res?.valid);
    } catch (err) {
      return false;
    }
  },

  async getCategories(): Promise<Category[]> {
    const posts = await this.getPosts();
    const categoriesMap = new Map<string, Category>();
    posts.forEach((p) => {
      if (p.category) {
        categoriesMap.set(p.category.id, p.category);
      }
    });
    return Array.from(categoriesMap.values());
  },

  async getTags(): Promise<Tag[]> {
    const posts = await this.getPosts();
    const tagsMap = new Map<string, Tag>();
    posts.forEach((p) => {
      p.tags?.forEach((t) => tagsMap.set(t.id, t));
    });
    return Array.from(tagsMap.values());
  },

  async updatePost(id: string, dto: any): Promise<BlogPost> {
    const raw = await apiClient.post<any>(`/posts/${id}`, dto);
    return normalizePost(raw);
  },

  async bulkDeletePosts(ids: string[]): Promise<void> {
    await apiClient.post('/posts/bulk-delete', { ids });
  },

  async bulkPublishPosts(ids: string[]): Promise<void> {
    await apiClient.post('/posts/bulk-publish', { ids });
  },
};
