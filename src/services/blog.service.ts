import { apiClient } from '@/lib/api-client';
import { BlogPost, SearchFilterState, PostStatus, Category, Tag, SEOSettings } from '@/types';
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
    seo,
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
      const category = filters?.category || filters?.categorySlug;
      if (category) params.category = category;
      const tag = filters?.tag || filters?.tagSlug;
      if (tag) params.tag = tag;
      if (filters?.status) params.status = filters.status.toUpperCase();
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
      coverImage: dto.coverImage || '',
      categoryId: dto.categoryId || undefined,
      tagIds: dto.tagIds || [],
      status: dto.status?.toUpperCase() || 'PUBLISHED',
      visibility: dto.visibility?.toUpperCase() || 'PUBLIC',
      secretPassword: dto.secretPassword,
    });
    return normalizePost(raw);
  },

  async saveDraft(dto: any): Promise<BlogPost> {
    const raw = await apiClient.post<any>('/posts/draft', {
      id: dto.id,
      title: dto.title?.trim() || 'Untitled',
      subtitle: dto.subtitle?.trim() || 'Untitled Subtitle',
      content: dto.content || '<p></p>',
      coverImage: dto.coverImage || '',
      categoryId: dto.category?.id || dto.categoryId,
      tagIds: dto.tags?.map((t: any) => t.id) || dto.tagIds || [],
    });
    return normalizePost(raw);
  },

  async updatePost(id: string, dto: any): Promise<BlogPost> {
    const raw = await apiClient.post<any>('/posts', {
      id,
      title: dto.title,
      subtitle: dto.subtitle,
      slug: dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: dto.excerpt || dto.title,
      content: dto.content,
      coverImage: dto.coverImage || '',
      categoryId: dto.category?.id || dto.categoryId || undefined,
      tagIds: dto.tags?.map((t: any) => t.id) || dto.tagIds || [],
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

  async getPostClappers(id: string): Promise<Array<{ id: string; count: number; user: { id: string; name: string; username: string; avatar: string } }>> {
    try {
      return await apiClient.get<any[]>(`/posts/${id}/clappers`);
    } catch (err) {
      return [];
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
