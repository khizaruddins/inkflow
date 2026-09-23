'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { formatDate } from '@/lib/utils';

export function HeroArticle({ post }: { post: BlogPost }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card via-card to-background p-6 md:p-8 shadow-xl hover:border-primary/30 transition-all duration-300">
      <Spotlight fill="#0284c7" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="accent" className="px-3 py-1 gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Story
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
          </div>

          <Link href={`/blog/${post.slug}`} className="group block space-y-2.5">
            <h1
              className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 sm:line-clamp-3"
              title={post.title}
            >
              {post.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 font-sans leading-relaxed">
              {post.excerpt}
            </p>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/40">
            <div className="flex items-center gap-3">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={38}
                height={38}
                className="rounded-full ring-2 ring-primary/20 object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-foreground line-clamp-1">{post.author.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {post.author.bio ? post.author.bio : 'Writer & Contributor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTimeMinutes} min read
              </span>
              <Link href={`/blog/${post.slug}`}>
                <Button size="sm" variant="primary" className="rounded-full gap-1.5 px-4 shadow-xs">
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 relative group">
          <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/80 shadow-md bg-muted">
              <Image
                src={post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
                alt={post.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
