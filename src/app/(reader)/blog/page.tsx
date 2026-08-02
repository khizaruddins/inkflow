'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePostsQuery } from '@/hooks/queries/use-posts-query';
import { PostCard } from '@/features/blogs/post-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function BlogPage() {
  const { data: posts = [], isLoading } = usePostsQuery();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Derive unique tags from posts
  const tagsSet = new Set<string>();
  posts.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t.name)));
  const tags = Array.from(tagsSet);

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.tags?.some((t) => t.name === selectedTag))
    : posts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-12">
      {/* Blog Header & Instructions */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <BookOpen className="w-3.5 h-3.5" /> Blogging Guide &amp; Platform Instructions
        </span>
        <h1 className="text-4xl font-extrabold font-serif text-foreground tracking-tight sm:text-5xl">
          How to Start Blogging on InkFlow
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto">
          Everything you need to know about setting up your profile, applying for Creator status, writing technical articles, and navigating the editorial review workflow.
        </p>
      </div>

      {/* Step-by-Step Instructions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3 relative">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            1
          </div>
          <h3 className="text-base font-bold text-foreground">Submit Application</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fill out the Creator application form with your bio, motivation, and a short sample of your technical writing.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3 relative">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            2
          </div>
          <h3 className="text-base font-bold text-foreground">Admin Editorial Review</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Admins review your sample for grammar, formatting, and clarity. Once approved, your account is upgraded to Creator status.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3 relative">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            3
          </div>
          <h3 className="text-base font-bold text-foreground">Write &amp; Publish</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Access the Writer Studio to author rich articles. Submit drafts for review and re-submit after addressing any editorial notes.
          </p>
        </div>
      </div>

      {/* Apply Banner */}
      <div className="p-8 rounded-3xl bg-card border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Want to publish on InkFlow?
          </h3>
          <p className="text-xs text-muted-foreground">
            Submit your written application and content sample to get featured as a verified blogger.
          </p>
        </div>
        <Link
          href="/become-creator"
          className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shrink-0 flex items-center gap-1.5"
        >
          Apply Now <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Explore All Articles Feed */}
      <div className="space-y-6 pt-6 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-serif text-foreground">Explore Published Articles</h2>
            <p className="text-xs text-muted-foreground">Curated long-form stories and technical essays from InkFlow creators.</p>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant={selectedTag === null ? 'default' : 'outline'}
                onClick={() => setSelectedTag(null)}
                className="cursor-pointer text-xs py-1 px-3 rounded-full"
              >
                All Topics
              </Badge>
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className="cursor-pointer text-xs py-1 px-3 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
            Loading published stories...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No articles found matching this topic.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
