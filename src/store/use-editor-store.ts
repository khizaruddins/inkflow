import { create } from 'zustand';
import { BlogPost, SEOSettings, PostVersion, PostStatus, PostVisibility } from '@/types';

export type SaveStatus = 'draft' | 'saving' | 'saved';

interface EditorState {
  currentPost: Partial<BlogPost>;
  isAutosaving: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  versions: PostVersion[];
  updateField: <K extends keyof BlogPost>(field: K, value: BlogPost[K]) => void;
  updateSEO: <K extends keyof SEOSettings>(field: K, value: SEOSettings[K]) => void;
  setAutosaving: (status: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  saveVersion: () => void;
  restoreVersion: (versionId: string) => void;
  resetEditor: (post?: Partial<BlogPost>, initialSaveStatus?: SaveStatus) => void;
}

const defaultSEOSettings: SEOSettings = {
  slug: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  keywords: [],
  ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
};

export const emptyPost: Partial<BlogPost> = {
  title: '',
  subtitle: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  status: 'draft' as PostStatus,
  visibility: 'public' as PostVisibility,
  isFeatured: false,
  isPinned: false,
  seo: defaultSEOSettings,
};

const initialPost: Partial<BlogPost> = emptyPost;

export const useEditorStore = create<EditorState>((set, get) => ({
  currentPost: initialPost,
  isAutosaving: false,
  saveStatus: 'draft',
  lastSavedAt: new Date().toISOString(),
  versions: [
    {
      id: 'ver_1',
      savedAt: new Date(Date.now() - 3600000).toISOString(),
      title: 'Draft story revision',
      content: '<p>Initial draft notes</p>',
      authorName: 'Author',
    },
  ],

  updateField: (field, value) => {
    set((state) => ({
      currentPost: {
        ...state.currentPost,
        [field]: value,
      },
      saveStatus: field === 'id' ? state.saveStatus : 'draft',
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
      saveStatus: 'draft',
      lastSavedAt: new Date().toISOString(),
    }));
  },

  setAutosaving: (isAutosaving) => set({ isAutosaving, saveStatus: isAutosaving ? 'saving' : get().saveStatus }),
  setSaveStatus: (saveStatus) => set({ saveStatus, isAutosaving: saveStatus === 'saving' }),

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
        saveStatus: 'draft',
      }));
    }
  },

  resetEditor: (post, initialSaveStatus) => {
    set({
      currentPost: post || emptyPost,
      saveStatus: initialSaveStatus !== undefined ? initialSaveStatus : (post?.id ? 'saved' : 'draft'),
      lastSavedAt: new Date().toISOString(),
    });
  },
}));
