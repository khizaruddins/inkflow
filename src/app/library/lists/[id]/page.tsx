'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { Lock, Bookmark, MoreHorizontal, ArrowLeft, MessageSquare, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/types';
import { ClapIcon } from '@/components/ui/clap-icon';

export default function ListDetailPage() {
  const params = useParams();
  const { lists, removeFromList } = useBookmarkStore();
  const { user } = useAuthStore();

  const listId = params.id as string;
  const currentList = lists.find((l) => l.id === listId);

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [listStories, setListStories] = useState<BlogPost[]>([]);

  useEffect(() => {
    BlogService.getPosts().then((posts) => {
      if (currentList && currentList.postIds?.length > 0) {
        setListStories(posts.filter((p) => currentList.postIds.includes(p.id)));
      } else {
        setListStories(posts.slice(0, 2));
      }
    });
  }, [currentList]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans space-y-8">
      {/* Back Link */}
      <Link href="/library">
        <Button variant="ghost" size="sm" className="rounded-full gap-1 text-muted-foreground">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Library
        </Button>
      </Link>

      {/* List Header */}
      <div className="space-y-4 border-b border-border/60 pb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {user?.avatar && (
            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
          )}
          <span className="font-semibold text-foreground">{user?.name || 'Reader'}</span>
          <span>•</span>
          <span>{currentList?.updatedAt || 'Recently updated'}</span>
          <span>•</span>
          <span>{listStories.length} stories</span>
          {currentList?.isPrivate && <Lock className="w-3.5 h-3.5 text-muted-foreground/70" />}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {currentList?.name || 'Reading list'}
        </h1>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-3">
            <button className="hover:text-foreground cursor-pointer"><Heart className="w-4 h-4" /></button>
            <button className="hover:text-foreground cursor-pointer"><MessageSquare className="w-4 h-4" /></button>
          </div>
          <button className="hover:text-foreground cursor-pointer"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Stories Stream inside this List */}
      <div className="space-y-8">
        {listStories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No stories in this reading list yet.</p>
          </div>
        ) : (
          listStories.map((story) => (
            <div key={story.id} className="space-y-3 font-sans border-b border-border/40 pb-8">
              {/* Story Note Input Box */}
              <input
                type="text"
                value={notes[story.id] || ''}
                onChange={(e) => setNotes({ ...notes, [story.id]: e.target.value })}
                placeholder="Add a note..."
                className="w-full px-4 py-2.5 text-xs bg-muted/40 border border-border/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground placeholder:text-muted-foreground/50"
              />

              <div className="group flex items-start justify-between gap-6 pt-2">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{story.author?.name || 'Author'}</span>
                    <span>•</span>
                    <span>
                      {story.publishedAt
                        ? new Date(story.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : ''}
                    </span>
                  </div>

                  <Link href={`/blog/${story.slug || story.id}`}>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {story.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {story.subtitle || story.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <ClapIcon className="w-3.5 h-3.5 text-foreground/80" /> {story.clapsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {story.commentsCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromList(listId, story.id)}
                        className="hover:text-foreground cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 fill-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {story.coverImage && (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-28 h-20 sm:w-36 sm:h-24 rounded-xl object-cover border border-border shadow-xs flex-shrink-0"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
