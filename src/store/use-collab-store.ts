import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import {
  CollabMode,
  CollabUser,
  CollabSuggestion,
  CollabCollaborator,
  User,
} from '@/types';
import { getSocketServerUrl, CollabService } from '@/services/collab.service';
import { useEditorStore } from './use-editor-store';

interface CollabState {
  socket: Socket | null;
  isConnected: boolean;
  activePostId: string | null;
  collabMode: CollabMode;
  isAuthor: boolean;
  canEdit: boolean;
  activeUsers: CollabUser[];
  typingUsers: Record<string, { name: string; color: string; isTyping: boolean }>;
  collaborators: CollabCollaborator[];
  collabInviteToken: string | null;
  suggestions: CollabSuggestion[];
  pendingSuggestionsCount: number;
  lastRemoteAuthorName: string | null;
  lastRemoteUpdateAt: string | null;

  // Actions
  initCollab: (postId: string, user: User, inviteToken?: string) => Promise<void>;
  leaveCollab: () => void;
  broadcastContent: (
    postId: string,
    content: string,
    title?: string,
    subtitle?: string,
  ) => void;
  broadcastTyping: (postId: string, isTyping: boolean) => void;
  setMode: (postId: string, mode: CollabMode) => Promise<void>;
  loadSuggestions: (postId: string) => Promise<void>;
  submitSuggestion: (
    postId: string,
    params: {
      title?: string;
      originalContent: string;
      suggestedContent: string;
      diffSummary?: string;
    },
  ) => Promise<CollabSuggestion | null>;
  reviewSuggestion: (
    postId: string,
    suggestionId: string,
    action: 'APPROVE' | 'REJECT',
    reviewNote?: string,
  ) => Promise<void>;
}

export const useCollabStore = create<CollabState>((set, get) => ({
  socket: null,
  isConnected: false,
  activePostId: null,
  collabMode: 'FREE_FLOW',
  isAuthor: false,
  canEdit: true,
  activeUsers: [],
  typingUsers: {},
  collaborators: [],
  collabInviteToken: null,
  suggestions: [],
  pendingSuggestionsCount: 0,
  lastRemoteAuthorName: null,
  lastRemoteUpdateAt: null,

  initCollab: async (postId: string, user: User, inviteToken?: string) => {
    const currentSocket = get().socket;
    if (currentSocket && get().activePostId === postId) {
      return;
    }

    if (currentSocket) {
      currentSocket.disconnect();
    }

    let token = '';
    try {
      token = localStorage.getItem('inkflow_access_token') || '';
    } catch (_) {}

    // First fetch server state via REST for instant UI bootstrap
    try {
      const state = await CollabService.getState(postId);
      if (state) {
        set({
          collabMode: state.collabMode || 'FREE_FLOW',
          collabInviteToken: state.collabInviteToken || null,
          isAuthor: state.isAuthor,
          canEdit: state.canEdit,
          collaborators: state.collaborators || [],
          pendingSuggestionsCount: state.pendingSuggestionsCount || 0,
        });
      }
    } catch (_) {}

    const serverUrl = getSocketServerUrl();
    const socket = io(serverUrl, {
      auth: { token },
      query: { token, postId },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
    });

    set({ socket, activePostId: postId });

    socket.on('connect', () => {
      set({ isConnected: true });
      socket.emit('join-room', { postId, token, inviteToken });
    });

    socket.on('connect_error', () => {
      set({ isConnected: false });
    });

    socket.on('room-joined', (data: any) => {
      set({
        collabMode: data.collabMode || 'FREE_FLOW',
        isAuthor: data.isAuthor,
        canEdit: data.canEdit,
        activeUsers: data.activeUsers || [],
        pendingSuggestionsCount: data.pendingSuggestionsCount || 0,
      });
    });

    socket.on('presence-update', (data: { activeUsers: CollabUser[] }) => {
      set({ activeUsers: data.activeUsers || [] });
    });

    socket.on(
      'user-typing',
      (data: { userId: string; name: string; color: string; isTyping: boolean }) => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [data.userId]: {
              name: data.name,
              color: data.color,
              isTyping: data.isTyping,
            },
          },
        }));
      },
    );

    socket.on('content-update', (data: {
      userId: string;
      userName: string;
      content: string;
      title?: string;
      subtitle?: string;
      timestamp?: string;
    }) => {
      // Ignore if sent by self
      if (data.userId === user.id) return;

      const editorStore = useEditorStore.getState();
      if (data.content !== undefined) {
        editorStore.updateField('content', data.content);
      }
      if (data.title !== undefined) {
        editorStore.updateField('title', data.title);
      }
      if (data.subtitle !== undefined) {
        editorStore.updateField('subtitle', data.subtitle);
      }

      set({
        lastRemoteAuthorName: data.userName,
        lastRemoteUpdateAt: data.timestamp || new Date().toISOString(),
      });
    });

    socket.on('mode-updated', (data: { mode: CollabMode }) => {
      set({ collabMode: data.mode });
    });

    socket.on('new-suggestion', (data: { suggestion: CollabSuggestion; pendingSuggestionsCount: number }) => {
      set((state) => ({
        suggestions: [data.suggestion, ...state.suggestions.filter((s) => s.id !== data.suggestion.id)],
        pendingSuggestionsCount: data.pendingSuggestionsCount,
      }));
    });

    socket.on('suggestion-reviewed', (data: {
      suggestionId: string;
      action: 'APPROVE' | 'REJECT';
      reviewNote?: string;
      reviewedBy?: string;
      pendingSuggestionsCount: number;
      mergedContent?: string;
    }) => {
      set((state) => ({
        suggestions: state.suggestions.map((s) =>
          s.id === data.suggestionId
            ? {
                ...s,
                status: data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                reviewNote: data.reviewNote,
              }
            : s,
        ),
        pendingSuggestionsCount: data.pendingSuggestionsCount,
      }));
    });

    socket.on('save-status', (data: { status: 'draft' | 'saving' | 'saved' }) => {
      useEditorStore.getState().setSaveStatus(data.status);
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });
  },

  leaveCollab: () => {
    const { socket, activePostId } = get();
    if (socket && activePostId) {
      socket.emit('leave-room', { postId: activePostId });
      socket.disconnect();
    }
    set({
      socket: null,
      isConnected: false,
      activePostId: null,
      activeUsers: [],
      typingUsers: {},
      suggestions: [],
      pendingSuggestionsCount: 0,
    });
  },

  broadcastContent: (postId: string, content: string, title?: string, subtitle?: string) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('content-change', {
        postId,
        content,
        title,
        subtitle,
      });
    }
  },

  broadcastTyping: (postId: string, isTyping: boolean) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit('typing', { postId, isTyping });
    }
  },

  setMode: async (postId: string, mode: CollabMode) => {
    const { socket, isConnected } = get();
    set({ collabMode: mode });

    try {
      await CollabService.setMode(postId, mode);
      if (socket && isConnected) {
        socket.emit('mode-change', { postId, mode });
      }
    } catch (err) {
      console.error('Failed to change collaboration mode:', err);
    }
  },

  loadSuggestions: async (postId: string) => {
    try {
      const list = await CollabService.listSuggestions(postId);
      const pendingCount = list.filter((s) => s.status === 'PENDING').length;
      set({
        suggestions: list,
        pendingSuggestionsCount: pendingCount,
      });
    } catch (_) {}
  },

  submitSuggestion: async (postId: string, params) => {
    const { socket, isConnected } = get();
    try {
      const created = await CollabService.submitSuggestion(postId, params);
      if (socket && isConnected) {
        socket.emit('submit-suggestion', {
          postId,
          ...params,
        });
      }
      await get().loadSuggestions(postId);
      return created;
    } catch (err) {
      console.error('Failed to submit suggestion:', err);
      return null;
    }
  },

  reviewSuggestion: async (postId, suggestionId, action, reviewNote) => {
    const { socket, isConnected } = get();
    try {
      const result = await CollabService.reviewSuggestion(postId, suggestionId, {
        action,
        reviewNote,
      });

      if (action === 'APPROVE' && result?.mergedContent) {
        useEditorStore.getState().updateField('content', result.mergedContent);
      }

      if (socket && isConnected) {
        socket.emit('review-suggestion', {
          postId,
          suggestionId,
          action,
          reviewNote,
        });
      }

      await get().loadSuggestions(postId);
    } catch (err) {
      console.error('Failed to review suggestion:', err);
    }
  },
}));
