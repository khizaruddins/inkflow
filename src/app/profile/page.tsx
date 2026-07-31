'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { BlogService } from '@/services/blog.service';
import { EditProfileModal } from '@/features/users/edit-profile-modal';
import { MoreHorizontal, Bookmark, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { BlogPost } from '@/types';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { lists } = useBookmarkStore();
  const [activeTab, setActiveTab] = useState<'home' | 'reposts' | 'activity' | 'lists' | 'about'>('home');
  const [showEditModal, setShowEditModal] = useState(false);
  const [userStories, setUserStories] = useState<BlogPost[]>([]);

  useEffect(() => {
    BlogService.getPosts().then((posts) => {
      if (user) {
        setUserStories(posts.filter((p) => p.author?.id === user.id || p.author?.email === user.email));
      } else {
        setUserStories(posts.slice(0, 3));
      }
    });
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Feed Content (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {user?.name || 'User Profile'}
            </h1>
            <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Tabs */}
          <div className="flex items-center gap-8 border-b border-border/40 text-sm overflow-x-auto">
            {['home', 'reposts', 'activity', 'lists', 'about'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`pb-3 font-semibold capitalize transition-colors cursor-pointer border-b-2 ${
                  activeTab === t
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* About Tab Content */}
          {activeTab === 'about' ? (
            <div className="space-y-8 py-4 font-sans">
              <div className="p-8 rounded-3xl bg-card border border-border/60 space-y-6 relative">
                <p className="text-lg font-serif text-foreground leading-relaxed">
                  {user?.bio || 'Software Engineer & Tech Writer on InkFlow.'}
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-5 py-1.5 rounded-full border border-foreground text-foreground text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="h-px bg-border/40" />

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>{user?.followersCount || 0} followers</span>
                    <span>•</span>
                    <span>{user?.followingCount || 0} following</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* User Stories Feed */
            <div className="space-y-8">
              {userStories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No published stories yet.</p>
                </div>
              ) : (
                userStories.map((story) => (
                  <article key={story.id} className="group border-b border-border/40 pb-8 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {user?.avatar && (
                        <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                      )}
                      <span className="font-semibold text-foreground">{story.author?.name || user?.name}</span>
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

                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <Link href={`/blog/${story.slug || story.id}`}>
                          <h2 className="text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {story.title}
                          </h2>
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {story.subtitle || story.excerpt}
                        </p>
                      </div>

                      {story.coverImage && (
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-28 h-20 sm:w-36 sm:h-24 rounded-xl object-cover border border-border shadow-xs flex-shrink-0"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                          <Heart className="w-3.5 h-3.5 text-rose-500" /> {story.clapsCount}
                        </span>
                        <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                          <MessageCircle className="w-3.5 h-3.5" /> {story.commentsCount}
                        </span>
                        <span>{story.readingTimeMinutes} min read</span>
                      </div>

                      <button className="hover:text-foreground transition-colors cursor-pointer">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-8 border-l border-border/40 pl-0 lg:pl-8">
          {/* User Profile Card */}
          <div className="space-y-4 font-sans">
            {user?.avatar && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">{user?.name || 'Anonymous Reader'}</h3>
              <p className="text-xs text-muted-foreground">
                {user?.followersCount || 0} followers · {user?.followingCount || 0} following
              </p>
            </div>

            {user?.bio && <p className="text-xs text-muted-foreground leading-relaxed">{user.bio}</p>}

            <button
              onClick={() => setShowEditModal(true)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer block"
            >
              Edit profile
            </button>
          </div>

          {/* Lists Widget */}
          {lists.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-border/40 font-sans">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Lists</h4>
              <div className="space-y-3">
                {lists.slice(0, 3).map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <Link href={`/library/lists/${l.id}`} className="font-semibold text-foreground hover:underline block">
                        {l.name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">
                        {l.postIds.length} {l.postIds.length === 1 ? 'story' : 'stories'} {l.isPrivate && '🔒'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
    </div>
  );
}
