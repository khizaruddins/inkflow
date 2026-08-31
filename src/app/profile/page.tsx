'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { BlogService } from '@/services/blog.service';
import { ActivityService, ActivityLogItem } from '@/services/activity.service';
import { ApplicationService } from '@/services/application.service';
import { UserService } from '@/services/user.service';
import { AuthService } from '@/services/auth.service';
import { EditProfileModal } from '@/features/users/edit-profile-modal';
import { UserListModal } from '@/components/users/user-list-modal';
import { ClapIcon } from '@/components/ui/clap-icon';
import {
  MoreHorizontal,
  Bookmark,
  Heart,
  MessageCircle,
  Clock,
  Sparkles,
  UserPlus,
  FileCheck,
  Users,
  UserCheck,
  Loader2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { BlogPost, CreatorApplication, User as UserType } from '@/types';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { lists } = useBookmarkStore();
  const [activeTab, setActiveTab] = useState<'home' | 'following' | 'activity' | 'lists' | 'about'>('home');
  const [showEditModal, setShowEditModal] = useState(false);
  const [userStories, setUserStories] = useState<BlogPost[]>([]);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [application, setApplication] = useState<CreatorApplication | null>(null);

  // Following tab state
  const [followingList, setFollowingList] = useState<UserType[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Followers & Following Popup Modal State
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
  const [modalUsers, setModalUsers] = useState<UserType[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const isCreatorOrAdmin =
    user?.role === 'admin' ||
    user?.role === 'ADMIN' ||
    user?.role === 'writer' ||
    user?.role === 'WRITER';

  useEffect(() => {
    BlogService.getPosts().then((posts) => {
      if (user) {
        setUserStories(posts.filter((p) => p.author?.id === user.id || p.author?.email === user.email));
      } else {
        setUserStories(posts.slice(0, 3));
      }
    });

    setActivities(ActivityService.getActivities());

    if (user) {
      ApplicationService.getMyStatus().then((app) => {
        setApplication(app);
      });

      setLoadingFollowing(true);
      UserService.getUserFollowing(user.id)
        .then((list) => setFollowingList(list))
        .finally(() => setLoadingFollowing(false));
    }
  }, [user]);

  const handleOpenFollowersModal = async () => {
    if (!user) return;
    setModalType('followers');
    setModalLoading(true);
    try {
      const followers = await UserService.getUserFollowers(user.id);
      setModalUsers(followers);
    } catch {
      setModalUsers([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenFollowingModal = async () => {
    if (!user) return;
    setModalType('following');
    setModalLoading(true);
    try {
      const following = await UserService.getUserFollowing(user.id);
      setModalUsers(following);
    } catch {
      setModalUsers([]);
    } finally {
      setModalLoading(false);
    }
  };

  const getAvatarUrl = (avatar?: string, name: string = 'User') => {
    if (avatar && avatar.trim().length > 0) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Feed Content (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {user?.name || 'User Profile'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Role: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user?.role?.toUpperCase() || 'READER'}</span>
              </p>
            </div>
            <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Tabs */}
          <div className="flex items-center gap-8 border-b border-border/40 text-sm overflow-x-auto">
            {(['home', 'following', 'activity', 'lists', 'about'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 font-semibold capitalize transition-colors cursor-pointer border-b-2 ${
                  activeTab === t
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'home' && isCreatorOrAdmin ? 'Stories' : t}
                {t === 'following' && ` (${followingList.length})`}
              </button>
            ))}
          </div>

          {/* Tab 1: Home / Stories */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              {userStories.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-card border border-border/60 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No published stories yet</p>
                  {!isCreatorOrAdmin && (
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Readers can bookmark articles, follow favorite writers, and create custom lists. Apply to become a creator to publish stories online.
                    </p>
                  )}
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
                          : 'Draft'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Link href={`/blog/${story.slug}`}>
                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {story.title}
                        </h2>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {story.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 hover:text-foreground cursor-pointer">
                          <ClapIcon className="w-3.5 h-3.5 text-foreground/80" /> {story.clapsCount}
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

          {/* Tab 2: Following Writers List */}
          {activeTab === 'following' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" /> Writers You Follow ({followingList.length})
                </h3>

                {loadingFollowing ? (
                  <div className="py-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Loading following list...
                  </div>
                ) : followingList.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground space-y-2">
                    <Users className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm font-semibold text-foreground">You are not following any writers yet</p>
                    <p className="text-xs text-muted-foreground">
                      Discover writers on the Home or Explore page to follow their latest work.
                    </p>
                    <Link href="/" className="inline-block pt-2">
                      <Button variant="outline" size="sm" className="rounded-full text-xs">
                        Browse Writers on Home
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {followingList.map((author) => (
                      <div
                        key={author.id}
                        className="p-4 rounded-2xl bg-muted/40 border border-border/40 hover:border-border/80 transition-all flex items-start justify-between gap-3 group"
                      >
                        <Link href={`/author/${author.username}`} className="flex items-start gap-3 min-w-0">
                          <img
                            src={getAvatarUrl(author.avatar, author.name)}
                            alt={author.name}
                            className="w-10 h-10 rounded-full object-cover border border-border/60 shrink-0 mt-0.5"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {author.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground truncate">
                              @{author.username}
                            </p>
                            <p className="text-[11px] text-muted-foreground/80 line-clamp-1">
                              {author.bio || 'Writer on InkFlow'}
                            </p>
                          </div>
                        </Link>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const res = await AuthService.toggleFollowUser(author.id, author.name);
                            useAuthStore.setState({
                              user: {
                                ...user!,
                                followingUserIds: res.followingUserIds,
                                followingCount: res.followingUserIds.length,
                              },
                            });
                            setFollowingList((prev) => prev.filter((item) => item.id !== author.id));
                          }}
                          className="rounded-full text-[10px] h-6 px-2.5 shrink-0 hover:text-red-500 hover:border-red-500/40 cursor-pointer"
                        >
                          Following
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Dynamic Activity Log */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="p-8 rounded-3xl bg-card border border-border/60 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" /> Recent Platform Activity
                </h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  {activities.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No recent activity logged yet.</p>
                  ) : (
                    activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-2xl bg-muted/40 flex items-center justify-between gap-4 border border-border/30 hover:border-border/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {act.type === 'follow' && <UserPlus className="w-4 h-4 text-emerald-500 shrink-0" />}
                          {act.type === 'application' && <FileCheck className="w-4 h-4 text-amber-500 shrink-0" />}
                          {act.type === 'join' && <Sparkles className="w-4 h-4 text-primary shrink-0" />}
                          {(act.type === 'clap' || act.type === 'bookmark') && <Heart className="w-4 h-4 text-rose-500 shrink-0" />}
                          <span className="text-foreground font-medium">{act.text}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 shrink-0">
                          {act.timestamp || 'Recent'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Lists */}
          {activeTab === 'lists' && (
            <div className="space-y-4 font-sans">
              {lists.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-2">
                  <p className="text-sm font-medium">No custom lists created yet</p>
                  <Link href="/library" className="text-xs text-emerald-600 hover:underline">
                    Create a list in your library →
                  </Link>
                </div>
              ) : (
                lists.map((l) => (
                  <div key={l.id} className="p-6 rounded-3xl bg-card border border-border/60 flex items-center justify-between">
                    <div className="space-y-1">
                      <Link href={`/library/lists/${l.id}`} className="text-lg font-bold text-foreground hover:underline">
                        {l.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {l.postIds.length} stories {l.isPrivate && '🔒 Private'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 5: About */}
          {activeTab === 'about' && (
            <div className="space-y-8 py-4 font-sans">
              <div className="p-8 rounded-3xl bg-card border border-border/60 space-y-6 relative">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bio</h4>
                  <p className="text-base font-serif text-foreground leading-relaxed">
                    {user?.bio || (isCreatorOrAdmin ? 'Tech writer and creator on InkFlow.' : 'Avid reader on InkFlow.')}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/settings"
                    className="px-5 py-1.5 rounded-full border border-foreground text-foreground text-xs font-semibold hover:bg-muted transition-colors cursor-pointer inline-block"
                  >
                    Edit About &amp; Bio
                  </Link>
                </div>

                <div className="h-px bg-border/40" />

                <div className="flex items-center gap-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <button
                    onClick={handleOpenFollowersModal}
                    className="hover:underline cursor-pointer"
                  >
                    {user?.followersCount || 0} followers
                  </button>
                  <span>•</span>
                  <button
                    onClick={handleOpenFollowingModal}
                    className="hover:underline cursor-pointer"
                  >
                    {user?.followingCount || followingList.length || 0} following
                  </button>
                </div>
              </div>
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
              <p className="text-xs text-muted-foreground">@{user?.username || 'user'}</p>

              {/* Clickable Followers & Following Counts */}
              <div className="flex items-center gap-3 text-xs font-semibold pt-1">
                <button
                  type="button"
                  onClick={handleOpenFollowersModal}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  title="View followers"
                >
                  <strong>{user?.followersCount || 0}</strong> followers
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleOpenFollowingModal}
                  className="text-foreground hover:underline cursor-pointer"
                  title="View following"
                >
                  <strong>{user?.followingCount || followingList.length || 0}</strong> following
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {user?.bio || (isCreatorOrAdmin ? 'Tech writer and creator on InkFlow.' : 'Avid reader on InkFlow.')}
            </p>

            <Link
              href="/settings"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer block"
            >
              Edit profile
            </Link>
          </div>

          {/* Become Creator CTA or Pending Review Banner for Readers */}
          {!isCreatorOrAdmin && (
            application?.status === 'PENDING' ? (
              <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3 font-sans">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> Application Under Review ⏳
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your creator application is currently pending Admin editorial evaluation.
                </p>
                <Link
                  href="/become-creator"
                  className="inline-block px-4 py-2 rounded-full bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  View Application Status
                </Link>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 font-sans">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Become a Creator
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Publish technical stories, gain followers, and build your readership on InkFlow.
                </p>
                <Link
                  href="/become-creator"
                  className="inline-block px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Submit Creator Application
                </Link>
              </div>
            )
          )}

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

      {/* Followers / Following Popup List Modal */}
      <UserListModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={modalType === 'followers' ? 'Followers' : 'Following'}
        users={modalUsers}
        isLoading={modalLoading}
      />
    </div>
  );
}
