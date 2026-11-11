'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  Star,
  Lock,
  Copy,
  Check,
  Settings,
  Users,
  Share2,
  ExternalLink,
  Eye,
  Shield,
} from 'lucide-react';
import { usePostsQuery, useBulkDeletePostsMutation, useBulkPublishPostsMutation } from '@/hooks/queries';
import { BlogPost, PostStatus } from '@/types';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithSkeleton, Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { formatDate, formatNumber } from '@/lib/utils';
import { PrivatePostSettingsModal } from '@/features/dashboard/private-settings-modal';
import { redirectToLogin, isUnauthorizedError } from '@/lib/auth-redirect';

type DashboardViewTab = 'all' | 'mine' | 'shared' | 'admin-private';

export default function PostsManagementPage() {
  const { user, role, isAuthenticated, isCheckingAuth } = useAuthStore();
  const isAdmin = String(role || '').toLowerCase() === 'admin';
  const isReaderOnly = String(role || 'reader').toLowerCase() === 'reader';

  const [viewTab, setViewTab] = useState<DashboardViewTab>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Private tabs data
  const [privatePosts, setPrivatePosts] = useState<BlogPost[]>([]);
  const [privateLoading, setPrivateLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingsPostId, setSettingsPostId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'mine') {
      setViewTab('mine');
    } else if (tabParam === 'shared') {
      setViewTab('shared');
    } else if (tabParam === 'admin-private' && isAdmin) {
      setViewTab('admin-private');
    } else if (isReaderOnly) {
      setViewTab('mine');
    }
  }, [isAdmin, isReaderOnly]);

  const { data: posts = [], isLoading, isFetching, refetch } = usePostsQuery({
    status: statusFilter as PostStatus,
  });
  const bulkDeleteMutation = useBulkDeletePostsMutation();
  const bulkPublishMutation = useBulkPublishPostsMutation();

  const loadPrivateTabPosts = useCallback(async () => {
    if (viewTab === 'all' || !isAuthenticated || !user) return;
    setPrivateLoading(true);
    try {
      let data: BlogPost[] = [];
      if (viewTab === 'mine') {
        data = await BlogService.getMyPrivatePosts();
      } else if (viewTab === 'shared') {
        data = await BlogService.getSharedWithMePosts();
      } else if (viewTab === 'admin-private' && isAdmin) {
        data = await BlogService.getAdminPrivatePosts();
      }
      setPrivatePosts(data);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToLogin();
        return;
      }
      setPrivatePosts([]);
    } finally {
      setPrivateLoading(false);
    }
  }, [viewTab, isAdmin, isAuthenticated, user]);

  useEffect(() => {
    loadPrivateTabPosts();
  }, [loadPrivateTabPosts]);

  const handleToggleFeature = async (id: string) => {
    try {
      await BlogService.toggleFeaturePost(id);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePrivatePost = async (id: string) => {
    setDeletingId(id);
    try {
      await BlogService.deletePost(id);
      setPrivatePosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyShareUrl = async (post: BlogPost) => {
    if (typeof window === 'undefined' || !post.shareToken) return;
    const path = post.slug
      ? `/blog/${post.slug}?share=${encodeURIComponent(post.shareToken)}`
      : `/private/${encodeURIComponent(post.shareToken)}`;
    const shareUrl = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId((c) => (c === post.id ? null : c)), 2000);
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    await bulkDeleteMutation.mutateAsync(selectedIds);
  };

  const handleBulkPublish = async (selectedIds: string[]) => {
    await bulkPublishMutation.mutateAsync(selectedIds);
  };

  const lockBadgeForPost = (post: BlogPost) => {
    if (post.privateLockType === 'PIN') {
      return (
        <Badge variant="accent" className="text-[10px] gap-1">
          <Lock className="w-2.5 h-2.5" /> PIN
        </Badge>
      );
    }
    if (post.privateLockType === 'PASSWORD' || post.requiresPassword || post.hasPassword) {
      return (
        <Badge variant="warning" className="text-[10px] gap-1">
          <Lock className="w-2.5 h-2.5" /> PASSWORD
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] gap-1">
        <Users className="w-2.5 h-2.5" /> Invited Only
      </Badge>
    );
  };

  const buildPrivateOpenHref = (post: BlogPost) => {
    if (post.slug && post.shareToken) {
      return `/blog/${post.slug}?share=${encodeURIComponent(post.shareToken)}`;
    }
    if (post.shareToken) {
      return `/private/${encodeURIComponent(post.shareToken)}`;
    }
    return `/blog/${post.slug || post.id}`;
  };

  const columns: Column<BlogPost>[] = [
    {
      header: 'Title',
      accessorKey: (row) => (
        <div className="space-y-0.5 max-w-sm">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/posts/${row.id}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
              {row.title}
            </Link>
            {row.visibility === 'private' && (
              <Badge variant="warning" className="text-[10px] gap-1 py-0 px-1.5">
                <Lock className="w-2.5 h-2.5" /> PRIVATE
              </Badge>
            )}
            {row.isFeatured && row.visibility !== 'private' && (
              <Badge variant="accent" className="text-[10px] gap-1 py-0 px-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Featured
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">/blog/{row.slug}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Creator',
      accessorKey: (row) => (
        <Link
          href={`/author/${row.author?.username || 'user'}`}
          className="flex items-center gap-2.5 group hover:opacity-85 transition-opacity"
        >
          <ImageWithSkeleton
            src={row.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={row.author?.name || 'Creator'}
            width={28}
            height={28}
            wrapperClassName="w-7 h-7 rounded-full shrink-0"
            className="w-7 h-7 rounded-full object-cover border border-border"
          />
          <div className="space-y-0.5 max-w-[130px]">
            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {row.author?.name || 'Anonymous Writer'}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono line-clamp-1">
              @{row.author?.username || 'writer'}
            </p>
          </div>
        </Link>
      ),
    },
    {
      header: 'Category',
      accessorKey: (row) => <Badge variant="outline">{row.category.name}</Badge>,
    },
    {
      header: 'Status',
      accessorKey: (row) => {
        const variants: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
          published: 'success',
          draft: 'warning',
          scheduled: 'secondary',
          archived: 'destructive',
        };
        return <Badge variant={variants[row.status] || 'default'}>{row.status.toUpperCase()}</Badge>;
      },
      sortable: true,
    },
    {
      header: 'Views',
      accessorKey: (row) => <span className="font-mono text-xs">{formatNumber(row.viewsCount)}</span>,
      sortable: true,
    },
    {
      header: 'Claps',
      accessorKey: (row) => <span className="font-mono text-xs">{formatNumber(row.clapsCount)}</span>,
      sortable: true,
    },
    {
      header: 'Published Date',
      accessorKey: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.publishedAt)}</span>,
      sortable: true,
    },
    {
      header: 'Actions',
      accessorKey: (row) => (
        <div className="flex items-center gap-1">
          {isAdmin && String(row.visibility || '').toLowerCase() !== 'private' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleToggleFeature(row.id)}
              title={row.isFeatured ? 'Unfeature Story' : 'Feature Story on Homepage'}
              className={row.isFeatured ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground hover:text-amber-500'}
            >
              <Star className={`w-3.5 h-3.5 ${row.isFeatured ? 'fill-amber-500' : ''}`} />
            </Button>
          )}
          {String(row.visibility || '').toLowerCase() === 'private' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSettingsPostId(row.id)}
              title="Settings & Sharing"
            >
              <Settings className="w-3.5 h-3.5 text-amber-500" />
            </Button>
          )}
          <Link href={`/dashboard/posts/${row.id}`}>
            <Button size="icon" variant="ghost" title="Edit Post">
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href={buildPrivateOpenHref(row)} target="_blank">
            <Button size="icon" variant="ghost" title="View Article">
              <Globe className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const topTabs: Array<{ id: DashboardViewTab; label: string; show: boolean }> = [
    { id: 'all', label: 'All Posts', show: !isReaderOnly },
    { id: 'mine', label: 'My Private Blogs', show: true },
    { id: 'shared', label: 'Shared With Me', show: true },
    { id: 'admin-private', label: 'Private Blogs (Admin)', show: isAdmin },
  ];

  if (isCheckingAuth) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-full h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-[calc(100vh-14rem)] font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isReaderOnly ? 'Private Stories' : 'Blog Management'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isReaderOnly
              ? 'Write, lock, and share private blogs or read stories shared with you.'
              : 'Manage public stories, private PIN/password blogs, and reader permissions.'}
          </p>
        </div>

        <Link href="/dashboard/posts/new">
          <Button variant="primary" size="md" className="rounded-full gap-1.5 font-semibold text-xs">
            <Plus className="w-4 h-4" />
            {isReaderOnly ? 'Write Private Blog' : 'Create Post'}
          </Button>
        </Link>
      </div>

      {/* Primary View Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {topTabs
          .filter((t) => t.show)
          .map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                viewTab === tab.id
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.id === 'mine' && <Lock className="w-3.5 h-3.5" />}
              {tab.id === 'shared' && <Share2 className="w-3.5 h-3.5" />}
              {tab.id === 'admin-private' && <Shield className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          ))}
      </div>

      {/* ALL POSTS VIEW */}
      {viewTab === 'all' && !isReaderOnly && (
        <>
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            {['all', 'published', 'draft', 'scheduled', 'archived'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <DataTable
            columns={columns}
            data={posts}
            isLoading={
              isLoading ||
              isFetching ||
              bulkDeleteMutation.isPending ||
              bulkPublishMutation.isPending
            }
            onBulkDelete={handleBulkDelete}
            onBulkPublish={handleBulkPublish}
            searchPlaceholder="Search posts by title, slug, or content..."
          />
        </>
      )}

      {/* MY PRIVATE BLOGS & ADMIN PRIVATE BLOGS VIEWS */}
      {(viewTab === 'mine' || viewTab === 'admin-private') && (
        <div className="space-y-4">
          {privateLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 rounded-3xl" />
              ))}
            </div>
          ) : privatePosts.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border border-dashed border-border text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">
                  {viewTab === 'admin-private' ? 'No private stories on the platform yet' : 'No private blogs yet'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Create a private story protected by a PIN, password, or invited readers list.
                </p>
              </div>
              <Link href="/dashboard/posts/new" className="inline-block">
                <Button variant="primary" size="sm" className="rounded-full gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Create Private Blog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {privatePosts.map((post) => (
                <article
                  key={post.id}
                  className="p-5 rounded-3xl bg-card border border-border/70 hover:border-primary/40 transition-colors flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {lockBadgeForPost(post)}
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Users className="w-2.5 h-2.5" /> Shared with {post.sharedCount ?? 0}
                        </Badge>
                        {post.requireFollowerToView && (
                          <Badge variant="secondary" className="text-[10px]">
                            Followers Only
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatDate(post.updatedAt || post.createdAt)}
                      </span>
                    </div>

                    <div>
                      <Link href={buildPrivateOpenHref(post)} className="hover:text-primary transition-colors">
                        <h2 className="text-lg font-bold text-foreground line-clamp-1">{post.title}</h2>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {post.subtitle || post.excerpt || 'Private story'}
                      </p>
                    </div>

                    {viewTab === 'admin-private' && post.author && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>By</span>
                        <span className="font-semibold text-foreground">{post.author.name}</span>
                        <span className="font-mono">(@{post.author.username})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
                    {post.shareToken && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyShareUrl(post)}
                        className="rounded-xl text-xs gap-1.5"
                      >
                        {copiedId === post.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedId === post.id ? 'Copied' : 'Copy Share URL'}
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setSettingsPostId(post.id)}
                      className="rounded-xl text-xs gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Settings &amp; Sharing
                    </Button>

                    <div className="flex items-center gap-1 ml-auto">
                      <Link href={buildPrivateOpenHref(post)}>
                        <Button type="button" size="icon" variant="ghost" title="Open Private Story">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/posts/${post.id}`}>
                        <Button type="button" size="icon" variant="ghost" title="Edit Story">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        isLoading={deletingId === post.id}
                        disabled={deletingId === post.id}
                        onClick={() => handleDeletePrivatePost(post.id)}
                        title="Delete Private Story"
                        className="text-rose-600 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SHARED WITH ME VIEW */}
      {viewTab === 'shared' && (
        <div className="space-y-4">
          {privateLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-44 rounded-3xl" />
              ))}
            </div>
          ) : privatePosts.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border border-dashed border-border text-center space-y-2">
              <Share2 className="w-8 h-8 text-muted-foreground mx-auto" />
              <h2 className="text-base font-bold text-foreground">No private stories shared with you yet</h2>
              <p className="text-xs text-muted-foreground">
                When authors invite you to read a private blog, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {privatePosts.map((post) => (
                <article
                  key={post.id}
                  className="p-5 rounded-3xl bg-card border border-border/70 flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {post.oneTimeView && (
                        <Badge variant="warning" className="text-[10px]">One-Time View</Badge>
                      )}
                      {post.hasViewed && (
                        <Badge variant="destructive" className="text-[10px]">Used</Badge>
                      )}
                      {post.requiresPassword && (
                        <Badge variant="accent" className="text-[10px] gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          {post.privateLockType === 'PIN' ? 'PIN' : 'PASSWORD'}
                        </Badge>
                      )}
                      <Badge
                        variant={post.isFollowingAuthor ? 'success' : 'outline'}
                        className="text-[10px]"
                      >
                        {post.isFollowingAuthor ? 'Following Author' : 'Not Following'}
                      </Badge>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-foreground line-clamp-1">{post.title}</h2>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {post.subtitle || post.excerpt || 'Private shared story'}
                      </p>
                    </div>

                    {post.author && (
                      <div className="flex items-center gap-2.5 pt-1">
                        <ImageWithSkeleton
                          src={
                            post.author.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={post.author.name}
                          width={24}
                          height={24}
                          wrapperClassName="w-6 h-6 rounded-full shrink-0"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-foreground">{post.author.name}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          @{post.author.username}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-[11px] text-muted-foreground">
                      {post.readingTimeMinutes || 4} min read
                    </span>
                    <Link href={buildPrivateOpenHref(post)}>
                      <Button
                        type="button"
                        size="sm"
                        variant={post.hasViewed && post.oneTimeView ? 'outline' : 'primary'}
                        className="rounded-full text-xs gap-1.5"
                      >
                        {post.hasViewed && post.oneTimeView ? 'View Status' : 'Read Private Story'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Private Settings & Sharing Modal */}
      <PrivatePostSettingsModal
        postId={settingsPostId}
        isOpen={Boolean(settingsPostId)}
        onClose={() => setSettingsPostId(null)}
        onUpdated={() => {
          refetch();
          loadPrivateTabPosts();
        }}
      />
    </div>
  );
}
