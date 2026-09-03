'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Bookmark } from 'lucide-react';
import { BlogPost } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { formatDate, formatNumber } from '@/lib/utils';
import { ClapIcon } from '@/components/ui/clap-icon';

export function PostCard({ post }: { post: BlogPost }) {
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const saved = isBookmarked(post.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300"
    >
      <div>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted mb-4">
          <Image
            src={post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="default" className="backdrop-blur-md bg-background/80 font-medium">
              {post.category.name}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{formatDate(post.publishedAt)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTimeMinutes} min read
          </span>
        </div>

        <Link href={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
          <h2 className="text-xl font-bold font-sans tracking-tight text-foreground line-clamp-2 mb-2">
            {post.title}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-sans leading-relaxed">
            {post.excerpt}
          </p>
        </Link>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-2">
        <Link href={`/author/${post.author.username}`} className="flex items-center gap-2 group/author">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={28}
            height={28}
            className="rounded-full ring-1 ring-border"
          />
          <span className="text-xs font-medium text-foreground group-hover/author:underline">
            {post.author.name}
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-foreground/80 font-medium font-sans">
            <ClapIcon className="w-3.5 h-3.5 text-foreground/70" />
            {formatNumber(post.clapsCount)}
          </span>
          <button
            onClick={() => toggleBookmark(post.id)}
            className="hover:text-primary transition-colors p-1 rounded-md cursor-pointer"
            aria-label="Bookmark post"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
