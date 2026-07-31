import { create } from 'zustand';
import { BlogPost, SEOSettings, PostVersion, PostStatus, PostVisibility } from '@/types';

interface EditorState {
  currentPost: Partial<BlogPost>;
  isAutosaving: boolean;
  lastSavedAt: string | null;
  versions: PostVersion[];
  updateField: <K extends keyof BlogPost>(field: K, value: BlogPost[K]) => void;
  updateSEO: <K extends keyof SEOSettings>(field: K, value: SEOSettings[K]) => void;
  setAutosaving: (status: boolean) => void;
  saveVersion: () => void;
  restoreVersion: (versionId: string) => void;
  resetEditor: (post?: Partial<BlogPost>) => void;
}

const defaultSEOSettings: SEOSettings = {
  slug: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  keywords: [],
  ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
};

const initialPost: Partial<BlogPost> = {
  title: 'Building Next-Generation React 19 Frontend Architectures',
  subtitle: 'A deep dive into Server Components, fine-grained reactivity, and TipTap rich-text integration.',
  slug: 'building-next-generation-react-19-frontend-architectures',
  content: `<h2>The Evolution of Modern Web Applications</h2><p>Over the past decade, frontend development has transitioned from basic server-rendered HTML templates to rich, client-heavy single-page applications. In 2026, React 19 and Next.js App Router have refined this paradigm with seamless Server Components.</p><blockquote>"Great software design balances immediate developer velocity with long-term architectural stability."</blockquote><pre><code class="language-typescript"><span class="text-xs text-muted-foreground block border-b border-border/40 pb-2 mb-3 font-sans">TypeScript ⌄</span><span class="hl-keyword">const</span> typescrip = <span class="hl-string">'helllo'</span>;</code></pre><h3>Key Innovations to Consider</h3><ul><li><strong>Server Action primitives</strong> reducing custom fetch boilerplate.</li><li><strong>Automated asset prefetching</strong> with dynamic edge streaming.</li><li><strong>TipTap extension ecosystem</strong> for real-time rich-text authoring.</li></ul><p>Let us explore how these building blocks unify long-form content publishing with enterprise-grade performance.</p>`,
  excerpt: 'A comprehensive engineering guide on React 19, Next.js Server Components, and TipTap rich text integration.',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  status: 'published' as PostStatus,
  visibility: 'public' as PostVisibility,
  isFeatured: true,
  isPinned: false,
  series: 'Frontend Engineering Masterclass',
  seo: defaultSEOSettings,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  currentPost: initialPost,
  isAutosaving: false,
  lastSavedAt: new Date().toISOString(),
  versions: [
    {
      id: 'ver_1',
      savedAt: new Date(Date.now() - 3600000).toISOString(),
      title: 'Building Next-Generation React 19 Frontend Architectures (v1 Draft)',
      content: '<p>Initial draft outlining React 19 Server Components and state management.</p>',
      authorName: 'Elena Rostova',
    },
    {
      id: 'ver_2',
      savedAt: new Date(Date.now() - 1800000).toISOString(),
      title: 'Building Next-Generation React 19 Frontend Architectures (v2 Polish)',
      content: '<h2>The Evolution of Modern Web Applications</h2><p>Polished introduction and code benchmarks added.</p>',
      authorName: 'Elena Rostova',
    },
  ],

  updateField: (field, value) => {
    set((state) => ({
      currentPost: {
        ...state.currentPost,
        [field]: value,
      },
      lastSavedAt: new Date().toISOString(),
    }));
  },

  updateSEO: (field, value) => {
    set((state) => ({
      currentPost: {
        ...state.currentPost,
        seo: {
          ...defaultSEOSettings,
          ...state.currentPost.seo,
          [field]: value,
        },
      },
      lastSavedAt: new Date().toISOString(),
    }));
  },

  setAutosaving: (isAutosaving) => set({ isAutosaving }),

  saveVersion: () => {
    const post = get().currentPost;
    if (!post.title || !post.content) return;
    const newVer: PostVersion = {
      id: `ver_${Date.now()}`,
      savedAt: new Date().toISOString(),
      title: post.title,
      content: post.content,
      authorName: post.author?.name || 'Author',
    };
    set((state) => ({
      versions: [newVer, ...state.versions],
      lastSavedAt: newVer.savedAt,
    }));
  },

  restoreVersion: (versionId) => {
    const target = get().versions.find((v) => v.id === versionId);
    if (target) {
      set((state) => ({
        currentPost: {
          ...state.currentPost,
          title: target.title,
          content: target.content,
        },
      }));
    }
  },

  resetEditor: (post) => {
    set({
      currentPost: post || initialPost,
      lastSavedAt: new Date().toISOString(),
    });
  },
}));
