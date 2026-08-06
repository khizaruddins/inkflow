'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Eye, Trash2, Globe, CheckCircle, Star } from 'lucide-react';
import { usePostsQuery, useBulkDeletePostsMutation, useBulkPublishPostsMutation } from '@/hooks/queries';
import { BlogPost, PostStatus } from '@/types';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { formatDate, formatNumber } from '@/lib/utils';

export default function PostsManagementPage() {
  const { role } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: posts = [], isLoading, refetch } = usePostsQuery(
    statusFilter !== 'all' ? { status: statusFilter as PostStatus } : undefined
  );
  const bulkDeleteMutation = useBulkDeletePostsMutation();
  const bulkPublishMutation = useBulkPublishPostsMutation();

  const handleToggleFeature = async (id: string) => {
    try {
      await BlogService.toggleFeaturePost(id);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    await bulkDeleteMutation.mutateAsync(selectedIds);
  };

  const handleBulkPublish = async (selectedIds: string[]) => {
    await bulkPublishMutation.mutateAsync(selectedIds);
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
            {row.isFeatured && (
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
          {role === 'admin' && (
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
          <Link href={`/dashboard/posts/${row.id}`}>
            <Button size="icon" variant="ghost" title="Edit Post">
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href={`/blog/${row.slug}`} target="_blank">
            <Button size="icon" variant="ghost" title="View Article">
              <Globe className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Blog Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage, publish, schedule, or archive platform content.
          </p>
        </div>

        {role === 'admin' && (
          <Link href="/dashboard/posts/new">
            <Button variant="primary" size="md" className="rounded-full gap-1.5 font-semibold text-xs">
              <Plus className="w-4 h-4" />
              Create Post
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        {['all', 'published', 'draft', 'scheduled', 'archived'].map((status) => (
          <button
            key={status}
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
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
        searchPlaceholder="Search posts by title, slug, or content..."
      />
    </div>
  );
}
