'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Bell,
  CheckCircle,
  Users,
  UserPlus,
  GitPullRequest,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/user-dropdown';
import { useAuthStore } from '@/store/use-auth-store';
import { useEditorStore } from '@/store/use-editor-store';
import { useCollabStore } from '@/store/use-collab-store';
import { CollabInviteModal } from '@/components/collab/collab-invite-modal';
import { CollabSuggestionsModal } from '@/components/collab/collab-suggestions-modal';

import { BlogService } from '@/services/blog.service';
import { CollabMode } from '@/types';

interface EditorNavbarProps {
  onPublish: () => void;
  onOpenSEO: () => void;
  isPublished?: boolean;
  hasChanges?: boolean;
  showPublishButton?: boolean;
}

export function EditorNavbar({
  onPublish,
  onOpenSEO,
  isPublished = false,
  hasChanges = false,
  showPublishButton,
}: EditorNavbarProps) {
  const { user, role } = useAuthStore();
  const { saveStatus, currentPost, updateField, setSaveStatus } = useEditorStore();
  const {
    activeUsers,
    typingUsers,
    collabMode,
    isAuthor,
    collabInviteToken,
    suggestions,
    pendingSuggestionsCount,
    setMode,
    reviewSuggestion,
    initCollab,
  } = useCollabStore();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isCreatingDraftForInvite, setIsCreatingDraftForInvite] = useState(false);

  const published = isPublished || currentPost.status === 'published';
  const shouldShowPublish =
    showPublishButton !== undefined ? showPublishButton : (!published || hasChanges);

  const postId = currentPost.id || '';
  const isAdmin = String(role || '').toUpperCase() === 'ADMIN';

  // The author of this story is either the owner (if authorId matches or if it's a new post without id yet) or isAuthor from collab store
  const isPostOwner =
    !currentPost.id ||
    !currentPost.authorId ||
    currentPost.authorId === user?.id ||
    currentPost.author?.id === user?.id ||
    Boolean(isAuthor);

  const canManageCollab = isPostOwner || isAdmin;

  // Handle opening invite modal — if draft hasn't been saved to DB yet, save it first to get an ID & token
  const handleOpenInvite = async () => {
    let targetPostId = currentPost.id;
    if (!targetPostId) {
      setIsCreatingDraftForInvite(true);
      setSaveStatus('saving');
      try {
        const savedDraft = await BlogService.saveDraft({
          ...currentPost,
          title: (currentPost.title || '').trim() || 'Untitled Story',
          subtitle: (currentPost.subtitle || '').trim(),
          content: currentPost.content || '',
          visibility: currentPost.visibility || 'public',
        });
        if (savedDraft?.id) {
          updateField('id', savedDraft.id);
          targetPostId = savedDraft.id;
          if (typeof window !== 'undefined' && !window.location.pathname.includes(savedDraft.id)) {
            window.history.replaceState(null, '', `/dashboard/posts/${savedDraft.id}`);
          }
          if (user) {
            await initCollab(savedDraft.id, user);
          }
          setSaveStatus('saved');
        }
      } catch (e) {
        setSaveStatus('draft');
      }
      setIsCreatingDraftForInvite(false);
    }
    setIsInviteModalOpen(true);
  };

  // Handle toggling mode
  const handleSetMode = async (newMode: CollabMode) => {
    let targetPostId = currentPost.id;
    if (!targetPostId) {
      try {
        const savedDraft = await BlogService.saveDraft({
          ...currentPost,
          title: (currentPost.title || '').trim() || 'Untitled Story',
          subtitle: (currentPost.subtitle || '').trim(),
          content: currentPost.content || '',
          visibility: currentPost.visibility || 'public',
        });
        if (savedDraft?.id) {
          updateField('id', savedDraft.id);
          targetPostId = savedDraft.id;
          if (typeof window !== 'undefined' && !window.location.pathname.includes(savedDraft.id)) {
            window.history.replaceState(null, '', `/dashboard/posts/${savedDraft.id}`);
          }
          if (user) {
            await initCollab(savedDraft.id, user);
          }
        }
      } catch (_) {}
    }
    if (targetPostId) {
      await setMode(targetPostId, newMode);
    }
    setIsModeDropdownOpen(false);
  };

  // Find who is actively typing
  const typingList = Object.values(typingUsers).filter((u) => u.isTyping);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border/40 transition-all">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Left: Brand & Status & Live Presence */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link href="/" className="flex items-center group shrink-0">
            <span className="text-xl sm:text-2xl font-black font-serif tracking-tight text-foreground group-hover:opacity-90 transition-opacity">
              Ink<span className="text-primary font-sans">Flow</span>
            </span>
          </Link>

          <span className="text-xs font-sans text-muted-foreground font-medium border-l border-border pl-3 hidden md:inline truncate max-w-[150px]">
            {published ? 'Published in' : 'Draft in'} {user?.name || currentPost.author?.name || 'Story'}
          </span>

          {/* Save Status Indicator */}
          {saveStatus === 'saving' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-sans font-medium bg-amber-500/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-500/20 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="hidden sm:inline">Saving draft...</span>
              <span className="sm:hidden">Saving...</span>
            </span>
          ) : saveStatus === 'saved' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-medium bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Saved</span>
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground font-sans font-medium px-1.5 py-0.5 shrink-0 hidden sm:inline">
              {published ? 'Published' : 'Draft'}
            </span>
          )}

          {/* Typing Indicator */}
          {typingList.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-primary font-sans font-medium bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 shrink-0 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="truncate max-w-[130px]">
                {typingList[0].name} is typing...
              </span>
            </span>
          )}
        </div>

        {/* Right: Collaboration Stack, Mode, Approvals & Publish Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Collaborators Avatar Stack */}
          {activeUsers.length > 0 && (
            <div className="flex items-center -space-x-1.5 overflow-hidden py-1 px-1.5 bg-muted/30 rounded-full border border-border/50">
              {activeUsers.slice(0, 3).map((u) => (
                <div
                  key={u.socketId}
                  className="relative group cursor-pointer"
                  title={`${u.name} (@${u.username}) ${u.isAuthor ? '• Author' : '• Co-Author'}`}
                >
                  <img
                    src={u.avatar || 'https://ui-avatars.com/api/?name=User'}
                    alt={u.name}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-background border"
                    style={{ borderColor: u.color }}
                  />
                  <span
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background"
                    style={{ backgroundColor: u.color }}
                  />
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-background border border-border">
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Mode Selector Pill (Author / Admin) or Mode Badge (Collaborator) */}
          {canManageCollab ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModeDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  collabMode === 'FREE_FLOW'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                }`}
                title="Click to toggle collaboration mode"
              >
                {collabMode === 'FREE_FLOW' ? (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Free Flow</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Approval Mode</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
              </button>

              {isModeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card rounded-xl border border-border shadow-lg p-1.5 z-50 text-xs">
                  <div className="p-2 border-b border-border/60">
                    <p className="font-semibold text-foreground">Collaboration Mode</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Choose how invited co-authors contribute.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetMode('FREE_FLOW')}
                    className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer ${
                      collabMode === 'FREE_FLOW'
                        ? 'bg-emerald-500/10 text-foreground font-medium'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-semibold">1. Free Flow (Direct Live Edit)</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Multiple people write simultaneously in real-time. Changes save automatically when typing pauses.
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetMode('APPROVAL_REQUIRED')}
                    className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer mt-1 ${
                      collabMode === 'APPROVAL_REQUIRED'
                        ? 'bg-indigo-500/10 text-foreground font-medium'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-semibold">2. Approval Required (Review & Diff)</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Collaborator edits are proposed as revisions. Author inspects before/after diff to approve & merge.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                collabMode === 'FREE_FLOW'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
              }`}
            >
              {collabMode === 'FREE_FLOW' ? (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Free Flow Co-Writing</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Suggestion Mode (Approval)</span>
                </>
              )}
            </div>
          )}

          {/* Pending Diff Reviews Pill Button */}
          {pendingSuggestionsCount > 0 && (
            <button
              type="button"
              onClick={() => setIsSuggestionsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer animate-pulse transition-all"
              title="Review proposed changes from collaborators"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Diff Reviews ({pendingSuggestionsCount})</span>
            </button>
          )}

          {/* Invite Collaborator Button (Author & Admin) */}
          {canManageCollab && (
            <button
              type="button"
              disabled={isCreatingDraftForInvite}
              onClick={handleOpenInvite}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-background hover:bg-muted/50 text-foreground transition-colors cursor-pointer"
              title="Invite co-authors to write in real-time"
            >
              <UserPlus className={`w-3.5 h-3.5 text-primary ${isCreatingDraftForInvite ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">
                {isCreatingDraftForInvite ? 'Connecting...' : 'Invite'}
              </span>
            </button>
          )}

          {/* Publish Pill */}
          {shouldShowPublish && (
            <button
              onClick={onPublish}
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-sans tracking-wide transition-colors cursor-pointer shadow-xs animate-in fade-in duration-150"
            >
              Publish
            </button>
          )}

          <button
            onClick={onOpenSEO}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Story & SEO Settings"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <UserDropdown />
        </div>
      </div>

      {/* Invite Modal */}
      {(currentPost.id || postId) && (
        <CollabInviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          postId={currentPost.id || postId}
          postTitle={currentPost.title}
          collabInviteToken={collabInviteToken}
        />
      )}

      {/* Suggestions & Diff Reviews Modal */}
      {postId && (
        <CollabSuggestionsModal
          isOpen={isSuggestionsModalOpen}
          onClose={() => setIsSuggestionsModalOpen(false)}
          postId={postId}
          isAuthorOrAdmin={canManageCollab}
          suggestions={suggestions}
          onApprove={async (id, note) => {
            await reviewSuggestion(postId, id, 'APPROVE', note);
          }}
          onReject={async (id, note) => {
            await reviewSuggestion(postId, id, 'REJECT', note);
          }}
        />
      )}
    </header>
  );
}
