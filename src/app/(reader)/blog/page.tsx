'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePostsQuery } from '@/hooks/queries/use-posts-query';
import { PostCard } from '@/features/blogs/post-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/use-auth-store';
import { Lock } from 'lucide-react';

export default function AllBlogsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: posts = [], isLoading } = usePostsQuery();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground font-serif">Authentication Required</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Please sign in to explore curated long-form stories, technical essays, and architecture blueprints.
        </p>
        <Link href="/login">
          <Button variant="primary" size="lg" className="rounded-full px-6">
            Sign In to Explore
          </Button>
        </Link>
      </div>
    );
  }

  // Derive unique tags from posts
  const tagsSet = new Set<string>();
  posts.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t.name)));
  const tags = Array.from(tagsSet);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-serif">
          Explore All Articles
        </h1>
        <p className="text-base text-muted-foreground font-sans">
          Curated long-form stories, technical essays, and architecture blueprints.
        </p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border/60">
          <span className="text-xs font-semibold text-muted-foreground mr-2">Topics &amp; Tags:</span>
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-xs py-1 px-3">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading stories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
