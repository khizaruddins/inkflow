'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home as HomeIcon,
  Bookmark,
  User,
  FileText,
  BarChart2,
  Sparkles,
  Compass,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { usePostsQuery } from '@/hooks/queries/use-posts-query';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/features/blogs/post-card';
import { HeroArticle } from '@/features/blogs/hero-article';
import { User as UserType } from '@/types';

export default function HomePage() {
  const { isAuthenticated, user, role } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: postsData = [] } = usePostsQuery();
  const posts = isAuthenticated ? postsData : [];

  const [activeTab, setActiveTab] = useState<'for-you' | 'featured' | 'following'>('for-you');

  const handleToggleFollow = async (authorId: string, authorName: string) => {
    if (!user) return;
    try {
      const res = await AuthService.toggleFollowUser(authorId, authorName);
      useAuthStore.setState({
        user: {
          ...user,
          followingUserIds: res.followingUserIds,
          followingCount: res.followingUserIds.length,
        },
      });
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  // --------------------------------------------------------------------------
  // SSR Hydration Safe Guard
  // --------------------------------------------------------------------------
  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 1. UNAUTHENTICATED GUEST STATE: Medium.com Style Minimal Editorial Landing
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#f7f4ed] dark:bg-background text-foreground transition-colors font-serif selection:bg-emerald-500/20">
        {/* Main Hero Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & Subtitle Quote */}
            <div className="lg:col-span-7 space-y-8">
              <h1 className="text-6xl sm:text-8xl font-black font-serif tracking-tight text-foreground leading-[0.98] select-none">
                Human<br />
                stories &amp; ideas
              </h1>

              <p className="text-xl sm:text-2xl text-muted-foreground font-sans font-light max-w-lg leading-relaxed">
                A place to read, write, and deepen your understanding.
              </p>

              <div>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="rounded-full px-10 py-6 text-lg font-sans font-medium bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95 shadow-xl"
                  >
                    Start reading
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Artistic Illustration */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
                  alt="Editorial Illustration"
                  fill
                  className="object-cover rounded-3xl shadow-2xl border border-border/40 mix-blend-multiply dark:mix-blend-normal"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Editorial Footer Links */}
        <footer className="border-t border-border/40 py-6 text-center text-xs font-sans text-muted-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-6">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/blog" className="hover:underline">Blog</Link>
            <Link href="/become-creator" className="hover:underline">Become a Creator</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </footer>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. AUTHENTICATED READER STATE: Live Feed Stream & Role-Gated Nav
  // --------------------------------------------------------------------------
  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];
  const remainingPosts = posts.filter((p) => p.id !== featuredPost?.id);

  // Dynamic Staff Picks from live backend posts
  const staffPicks = posts.slice(0, 3);

  // Dynamic Who to Follow from post authors
  const authorsMap = new Map<string, UserType>();
  posts.forEach((p) => {
    if (p.author && p.author.id && p.author.id !== user?.id) {
      authorsMap.set(p.author.id, p.author);
    }
  });
  const whoToFollow = Array.from(authorsMap.values()).slice(0, 5);

  // Dynamic Topics from post categories & tags
  const topicsSet = new Set<string>();
  posts.forEach((p) => {
    if (p.category?.name) topicsSet.add(p.category.name);
    p.tags?.forEach((t) => topicsSet.add(t.name));
  });
  const topicsList = Array.from(topicsSet);

  const isCreatorOrAdmin = role === 'admin' || role === 'ADMIN' || role === 'writer' || role === 'WRITER';

  const sidebarNavItems = [
    { label: 'Home', href: '/', icon: HomeIcon, active: true },
    { label: 'Library', href: '/library', icon: Bookmark },
    { label: 'Profile', href: '/profile', icon: User },
    ...(isCreatorOrAdmin
      ? [
          { label: 'Stories', href: '/dashboard/posts', icon: FileText },
          { label: 'Stats', href: '/dashboard/analytics', icon: BarChart2 },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Navigation (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 border-r border-border/40 pr-6">
            <nav className="space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                      item.active
                        ? 'bg-muted text-foreground font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {topicsList.length > 0 && (
              <>
                <div className="h-px bg-border/40 my-4" />
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3">
                    Topics
                  </h4>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {topicsList.map((topic) => (
                      <Link
                        key={topic}
                        href={`/search?q=${encodeURIComponent(topic)}`}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/40"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </aside>

          {/* Center Main Stream (6 Cols) */}
          <main className="lg:col-span-6 space-y-8">
            <div className="flex items-center gap-6 border-b border-border/50 pb-3 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('for-you')}
                className={`pb-3 font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'for-you'
                    ? 'text-foreground border-b-2 border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Compass className="w-4 h-4 text-primary" /> For you
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('featured')}
                className={`pb-3 font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'featured'
                    ? 'text-foreground border-b-2 border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-amber-500" /> Featured
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('following')}
                className={`pb-3 font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'following'
                    ? 'text-foreground border-b-2 border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-500" /> Following
              </button>
            </div>

            {/* Displayed Posts */}
            {(() => {
              const followingIds = user?.followingUserIds || [];
              const filtered = posts.filter((post) => {
                if (activeTab === 'featured') return post.isFeatured;
                if (activeTab === 'following') return followingIds.includes(post.author?.id);
                return true;
              });

              if (activeTab === 'following' && filtered.length === 0) {
                return (
                  <div className="p-8 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-3 font-sans my-4">
                    <p className="text-sm font-bold text-foreground">No stories from followed creators yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Follow writers on InkFlow to get their latest stories delivered right here in your Following stream.
                    </p>
                  </div>
                );
              }

              if (activeTab === 'featured' && filtered.length === 0) {
                return (
                  <div className="p-8 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-3 font-sans my-4">
                    <p className="text-sm font-bold text-foreground">No featured stories selected yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      InkFlow editors select top stories to feature here. Check back soon!
                    </p>
                  </div>
                );
              }

              const hero = activeTab === 'for-you' ? filtered.find((p) => p.isFeatured) || filtered[0] : null;
              const stream = activeTab === 'for-you' ? filtered.filter((p) => p.id !== hero?.id) : filtered;

              return (
                <div className="space-y-6 pt-2">
                  {hero && <HeroArticle post={hero} />}
                  {stream.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              );
            })()}
          </main>

          {/* Right Sidebar (3 Cols) */}
          <aside className="lg:col-span-3 space-y-8 pl-0 lg:pl-4">
            {staffPicks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Staff Picks
                </h3>
                <div className="space-y-4">
                  {staffPicks.map((pick) => (
                    <Link
                      key={pick.id}
                      href={`/blog/${pick.slug}`}
                      className="block space-y-1.5 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {pick.author?.avatar && (
                          <Image
                            src={pick.author.avatar}
                            alt={pick.author.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        )}
                        <span className="font-semibold text-foreground">
                          {pick.author?.name || 'Author'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {pick.title}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        {pick.publishedAt
                          ? new Date(pick.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {whoToFollow.length > 0 && (
              <>
                <div className="h-px bg-border/40" />
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Who to follow
                  </h3>
                  <div className="space-y-4">
                    {whoToFollow.map((author) => {
                      const isFollowing = user?.followingUserIds?.includes(author.id);
                      return (
                        <div key={author.id} className="flex items-start justify-between gap-3">
                          <div className="flex gap-2.5">
                            {author.avatar && (
                              <Image
                                src={author.avatar}
                                alt={author.name}
                                width={36}
                                height={36}
                                className="rounded-full mt-0.5 object-cover"
                              />
                            )}
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold text-foreground">{author.name}</h4>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                                {author.bio || `@${author.username}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isFollowing ? 'outline' : 'primary'}
                            onClick={() => handleToggleFollow(author.id, author.name)}
                            className="rounded-full text-[11px] h-7 px-3 shrink-0 cursor-pointer"
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
