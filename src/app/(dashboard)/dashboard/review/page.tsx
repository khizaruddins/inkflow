'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ReviewQueuePageSkeleton } from '@/components/skeletons/page-skeletons';
import {
  Check,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  PenSquare,
  Trash2,
  Flag,
} from 'lucide-react';
import { BlogPost } from '@/types';
import { DashboardTabs } from '@/features/dashboard/dashboard-tabs';

type ReviewFilter = 'ALL' | 'PUBLISHED' | 'PENDING_REVIEW' | 'DRAFT';

export default function EditorialReviewPage() {
  const { role, isAuthenticated, isCheckingAuth } = useAuthStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilter>('ALL');

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedActionMode, setSelectedActionMode] = useState<'NEEDS_REVISION' | 'FLAG_IMPROPER' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const isAdmin = String(role || '').toLowerCase() === 'admin';

  const loadPosts = useCallback(async () => {
    if (isCheckingAuth || !isAuthenticated || !isAdmin) return;
    setLoading(true);
    try {
      const list = await BlogService.getPosts({
        status: 'all',
        visibility: 'PUBLIC',
      });
      setPosts(list.filter((p) => p.visibility !== 'private'));
    } catch (err: any) {
      if (err?.status !== 401 && err?.response?.status !== 401) {
        console.error('Error fetching editorial review posts:', err);
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [isCheckingAuth, isAuthenticated, isAdmin]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleReviewAction = async (
    postId: string,
    newStatus: 'PUBLISHED' | 'NEEDS_REVISION' | 'REJECTED' | 'DRAFT',
    actionType?: string
  ) => {
    setBusyId(postId);
    try {
      const updated = await BlogService.reviewPost(postId, {
        status: newStatus,
        ...(feedback.trim() ? { feedback: feedback.trim() } : {}),
        ...(actionType ? { action: actionType } : {}),
      });

      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updated } : p)));
      setSelectedPostId(null);
      setSelectedActionMode(null);
      setFeedback('');

      if (actionType === 'FLAG_IMPROPER' || newStatus === 'DRAFT') {
        showNotice('Post flagged as improper, converted to Draft, and writer notified.');
      } else if (newStatus === 'PUBLISHED') {
        showNotice('Story published.');
      } else {
        showNotice('Editorial feedback saved.');
      }
    } catch (err) {
      console.error('Failed to perform editorial action:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm(`Delete "${post.title}" permanently? This action cannot be undone.`)
        : true;
    if (!confirmed) return;

    setBusyId(post.id);
    try {
      await BlogService.deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      showNotice(`Deleted "${post.title}".`);
    } catch (err) {
      console.error('Failed to delete story:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleResubmit = async (postId: string) => {
    setBusyId(postId);
    try {
      await apiClient.post(`/posts/${postId}/submit`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, status: 'pending_review', reviewFeedback: undefined }
            : p
        )
      );
    } finally {
      setBusyId(null);
    }
  };

  if (!isCheckingAuth && !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Privilege Required
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Only InkFlow platform Administrators have privilege to inspect, edit, flag, or approve editorial submissions.
          </p>
        </div>
      </div>
    );
  }

  const filteredPosts = posts.filter((post) => {
    const normalized = String(post.status || '').toUpperCase();
    if (filter === 'ALL') return true;
    if (filter === 'DRAFT') return normalized === 'DRAFT' || normalized === 'NEEDS_REVISION';
    return normalized === filter;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans space-y-8 min-h-[calc(100vh-14rem)]">
      <DashboardTabs />
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-emerald-600" /> Editorial Review Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review submissions, edit or delete published articles, or flag improper posts to return them to Draft and notify the writer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'ALL', label: `All (${posts.length})` },
              {
                id: 'PUBLISHED',
                label: `Published (${posts.filter((p) => p.status === 'published').length})`,
              },
              {
                id: 'PENDING_REVIEW',
                label: `Pending (${posts.filter((p) => p.status === 'pending_review').length})`,
              },
              {
                id: 'DRAFT',
                label: `Drafts / Revisions (${posts.filter((p) => p.status === 'draft' || p.status === 'needs_revision').length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {statusNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          {statusNotice}
        </div>
      )}

      {isCheckingAuth || loading ? (
        <ReviewQueuePageSkeleton count={4} />
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-2">
          <Check className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-foreground">No matching stories found</p>
          <p className="text-xs text-muted-foreground">
            There are no stories under this filter right now.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPosts.map((post) => {
            const statusUpper = String(post.status || '').toUpperCase();
            const isBusy = busyId === post.id;
            const isExpandedNote = selectedPostId === post.id;

            return (
              <div
                key={post.id}
                className="p-6 sm:p-7 rounded-3xl bg-card border border-border/70 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{post.author?.name}</span>
                      <span>•</span>
                      <span className="capitalize">{post.category?.name}</span>
                      <span>•</span>
                      <span>{post.viewsCount.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{post.clapsCount.toLocaleString()} claps</span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xl font-bold text-foreground hover:text-primary transition-colors block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {post.subtitle || post.excerpt}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start ${
                      statusUpper === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : statusUpper === 'NEEDS_REVISION' || statusUpper === 'DRAFT'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {statusUpper}
                  </span>
                </div>

                {post.reviewFeedback && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-foreground space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" /> Editorial Note:
                    </div>
                    <p className="italic leading-relaxed">{post.reviewFeedback}</p>
                  </div>
                )}

                {isExpandedNote && (
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/40 border border-border/60">
                    <label className="text-xs font-bold text-foreground block">
                      {selectedActionMode === 'FLAG_IMPROPER'
                        ? 'Reason for Flagging as Improper (sent to writer & converted to Draft):'
                        : 'Editorial Notes for Writer:'}
                    </label>
                    <textarea
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={
                        selectedActionMode === 'FLAG_IMPROPER'
                          ? 'Explain why this published story is being returned to Draft...'
                          : 'Add revision notes for the author...'
                      }
                      className="w-full p-2.5 text-xs bg-card border border-border rounded-xl focus:outline-none text-foreground"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedPostId(null);
                          setSelectedActionMode(null);
                          setFeedback('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={isBusy}
                        disabled={isBusy}
                        onClick={() =>
                          handleReviewAction(
                            post.id,
                            selectedActionMode === 'FLAG_IMPROPER' ? 'DRAFT' : 'NEEDS_REVISION',
                            selectedActionMode || undefined
                          )
                        }
                        className="rounded-full text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
                      >
                        {selectedActionMode === 'FLAG_IMPROPER'
                          ? 'Flag as Improper & Revert to Draft'
                          : 'Send Revision Request'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Moderation & Review Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/posts/${post.id}`}>
                      <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5">
                        <PenSquare className="w-3.5 h-3.5" /> Edit Post
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={isBusy}
                      disabled={isBusy}
                      onClick={() => handleDeletePost(post)}
                      className="rounded-full text-xs gap-1.5 text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {statusUpper === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => {
                          setSelectedPostId(post.id);
                          setSelectedActionMode('FLAG_IMPROPER');
                          setFeedback('');
                        }}
                        className="rounded-full text-xs gap-1.5 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/10"
                      >
                        <Flag className="w-3.5 h-3.5" /> Flag as Improper (Convert to Draft)
                      </Button>
                    )}

                    {statusUpper === 'PENDING_REVIEW' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => {
                            setSelectedPostId(post.id);
                            setSelectedActionMode('NEEDS_REVISION');
                            setFeedback('');
                          }}
                          className="rounded-full text-xs gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Request Revisions
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          isLoading={isBusy}
                          disabled={isBusy}
                          onClick={() => handleReviewAction(post.id, 'PUBLISHED')}
                          className="rounded-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve &amp; Publish
                        </Button>
                      </>
                    )}

                    {statusUpper === 'DRAFT' && (
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={isBusy}
                        disabled={isBusy}
                        onClick={() => handleReviewAction(post.id, 'PUBLISHED')}
                        className="rounded-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-3.5 h-3.5" /> Publish Story
                      </Button>
                    )}

                    {statusUpper === 'NEEDS_REVISION' && (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={isBusy}
                        disabled={isBusy}
                        onClick={() => handleResubmit(post.id)}
                        className="rounded-full text-xs gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Resubmit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
