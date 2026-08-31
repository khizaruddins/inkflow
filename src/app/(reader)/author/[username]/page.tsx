'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthService } from '@/services/auth.service';
import { UserService, PublicUserProfile } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { UserListModal } from '@/components/users/user-list-modal';
import { ClapIcon } from '@/components/ui/clap-icon';
import {
  Sparkles,
  Calendar,
  Heart,
  MessageCircle,
  Bookmark,
  Users,
  ArrowLeft,
  Loader2,
  FileText,
  UserCheck,
} from 'lucide-react';
import { User as UserType } from '@/types';

export default function AuthorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // Modal State for Followers / Following list popup
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
  const [modalUsers, setModalUsers] = useState<UserType[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'stories' | 'following' | 'about'>('stories');
  const [followingList, setFollowingList] = useState<UserType[]>([]);
  const [loadingFollowingList, setLoadingFollowingList] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data = await UserService.getUserByUsername(username);
        setProfile(data);
        if (data) {
          const roleLower = String(data.role || 'reader').toLowerCase();
          if (roleLower === 'reader') {
            setActiveTab('following');
          }
        }
      } catch (err) {
        console.error('Failed to load author profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username]);

  // Load following list for the user
  useEffect(() => {
    if (profile?.id) {
      setLoadingFollowingList(true);
      UserService.getUserFollowing(profile.id)
        .then((list) => setFollowingList(list))
        .finally(() => setLoadingFollowingList(false));
    }
  }, [profile?.id]);

  const isSelf = currentUser && (currentUser.id === profile?.id || currentUser.username === profile?.username);
  const isFollowing = Boolean(currentUser?.followingUserIds?.includes(profile?.id || ''));
  const roleLower = String(profile?.role || 'reader').toLowerCase();
  const isWriter = roleLower === 'writer' || roleLower === 'admin';

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!profile) return;

    try {
      setFollowLoading(true);
      const res = await AuthService.toggleFollowUser(profile.id, profile.name);
      if (currentUser) {
        useAuthStore.setState({
          user: {
            ...currentUser,
            followingUserIds: res.followingUserIds,
            followingCount: res.followingUserIds.length,
          },
        });
      }
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followersCount: res.following
                ? (prev.followersCount || 0) + 1
                : Math.max(0, (prev.followersCount || 0) - 1),
            }
          : null
      );
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenFollowersModal = async () => {
    if (!profile) return;
    setModalType('followers');
    setModalLoading(true);
    try {
      const followers = await UserService.getUserFollowers(profile.id);
      setModalUsers(followers);
    } catch {
      setModalUsers([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenFollowingModal = async () => {
    if (!profile) return;
    setModalType('following');
    setModalLoading(true);
    try {
      const following = await UserService.getUserFollowing(profile.id);
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading author profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">User Not Found</h1>
        <p className="text-xs text-muted-foreground">
          We couldn't find a user profile matching @{username}.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm" className="rounded-full text-xs mt-2">
            Return to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 font-sans">
      {/* Back navigation */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left / Main Content Stream (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Mobile / Responsive Title */}
          <div className="flex items-center justify-between border-b border-border/60 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {profile.name}
                </h1>
                {roleLower === 'writer' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Writer
                  </span>
                )}
                {roleLower === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Admin / Editor
                  </span>
                )}
                {roleLower === 'reader' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Reader
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            </div>

            {!isSelf && (
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                disabled={followLoading}
                onClick={handleToggleFollow}
                className={`rounded-full px-6 text-xs font-semibold cursor-pointer ${
                  isFollowing ? 'hover:text-red-500 hover:border-red-500/40' : ''
                }`}
              >
                {followLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isFollowing ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </Button>
            )}
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex items-center gap-8 border-b border-border/40 text-sm overflow-x-auto">
            {isWriter && (
              <button
                onClick={() => setActiveTab('stories')}
                className={`pb-3 font-semibold capitalize transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'stories'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-500" /> Published Stories ({profile.posts?.length || 0})
              </button>
            )}

            <button
              onClick={() => setActiveTab('following')}
              className={`pb-3 font-semibold capitalize transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === 'following'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-500" /> Following ({followingList.length})
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 font-semibold capitalize transition-colors cursor-pointer border-b-2 ${
                activeTab === 'about'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              About
            </button>
          </div>

          {/* Tab 1: Published Stories (Writers & Admins) */}
          {activeTab === 'stories' && isWriter && (
            <div className="space-y-6">
              {!profile.posts || profile.posts.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-card border border-border/60 space-y-2">
                  <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No published stories yet</p>
                  <p className="text-xs text-muted-foreground">Stories published by {profile.name} will appear here.</p>
                </div>
              ) : (
                profile.posts.map((post) => (
                  <article key={post.id} className="group border-b border-border/40 pb-8 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <img
                        src={getAvatarUrl(profile.avatar, profile.name)}
                        alt={profile.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-foreground">{profile.name}</span>
                      <span>•</span>
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div className="sm:col-span-3 space-y-1">
                        <Link href={`/blog/${post.slug}`}>
                          <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h2>
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      {post.coverImage && (
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/40 shadow-xs">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ClapIcon className="w-3.5 h-3.5 text-foreground/80" /> {post.clapsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount || 0}
                        </span>
                        <span>{post.readingTimeMinutes} min read</span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <span className="text-xs font-semibold text-emerald-600 hover:underline">
                          Read story →
                        </span>
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Following Writers / Creators List */}
          {activeTab === 'following' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  {isSelf ? 'Writers You Follow' : `Writers ${profile.name} Follows`}
                </h3>

                {loadingFollowingList ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Loading following list...
                  </div>
                ) : followingList.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground space-y-2">
                    <p className="text-xs font-semibold text-foreground">Not following any writers yet</p>
                    <p className="text-[11px] text-muted-foreground">
                      Follow interesting writers to get their stories delivered to your Following stream.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {followingList.map((followedUser) => {
                      const isItemFollowing = Boolean(
                        currentUser?.followingUserIds?.includes(followedUser.id)
                      );
                      const isItemSelf = currentUser?.id === followedUser.id;

                      return (
                        <div
                          key={followedUser.id}
                          className="p-4 rounded-2xl bg-muted/40 border border-border/40 hover:border-border/80 transition-all flex items-start justify-between gap-3 group"
                        >
                          <Link
                            href={`/author/${followedUser.username}`}
                            className="flex items-start gap-3 min-w-0"
                          >
                            <img
                              src={getAvatarUrl(followedUser.avatar, followedUser.name)}
                              alt={followedUser.name}
                              className="w-10 h-10 rounded-full object-cover border border-border/60 shrink-0 mt-0.5"
                            />
                            <div className="min-w-0 space-y-0.5">
                              <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                {followedUser.name}
                              </h4>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                @{followedUser.username}
                              </p>
                              <p className="text-[11px] text-muted-foreground/80 line-clamp-1">
                                {followedUser.bio || 'Writer on InkFlow'}
                              </p>
                            </div>
                          </Link>

                          {!isItemSelf && currentUser && (
                            <Button
                              size="sm"
                              variant={isItemFollowing ? 'outline' : 'primary'}
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const res = await AuthService.toggleFollowUser(
                                  followedUser.id,
                                  followedUser.name
                                );
                                useAuthStore.setState({
                                  user: {
                                    ...currentUser,
                                    followingUserIds: res.followingUserIds,
                                    followingCount: res.followingUserIds.length,
                                  },
                                });
                              }}
                              className="rounded-full text-[10px] h-6 px-2.5 shrink-0 cursor-pointer"
                            >
                              {isItemFollowing ? 'Following' : 'Follow'}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: About */}
          {activeTab === 'about' && (
            <div className="space-y-6 font-sans">
              <div className="p-8 rounded-3xl bg-card border border-border/60 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About &amp; Bio</h4>
                  <p className="text-base font-serif text-foreground leading-relaxed">
                    {profile.bio || `${profile.name} is a member of the InkFlow writing and reading community.`}
                  </p>
                </div>

                <div className="h-px bg-border/40" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-medium">Joined</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      {profile.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-medium">Role</span>
                    <span className="font-semibold text-foreground capitalize">
                      {roleLower}
                    </span>
                  </div>

                  {isWriter && (
                    <div className="space-y-1">
                      <span className="text-muted-foreground block font-medium">Published Works</span>
                      <span className="font-semibold text-foreground">
                        {profile.posts?.length || 0} stories
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Details (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 border-l border-border/40 pl-0 lg:pl-8 font-sans">
          {/* User Profile Card */}
          <div className="space-y-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-lg">
              <img
                src={getAvatarUrl(profile.avatar, profile.name)}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">{profile.name}</h3>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            </div>

            {/* Clickable Followers & Following Counts that trigger modal popup */}
            <div className="flex items-center gap-4 text-xs font-semibold pt-1">
              <button
                type="button"
                onClick={handleOpenFollowersModal}
                className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                title="View followers"
              >
                <strong>{profile.followersCount || 0}</strong> followers
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleOpenFollowingModal}
                className="text-foreground hover:underline cursor-pointer flex items-center gap-1"
                title="View following"
              >
                <strong>{profile.followingCount || followingList.length || 0}</strong> following
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              {profile.bio || `InkFlow ${roleLower}`}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Joined{' '}
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'recently'}
              </span>
            </div>
          </div>
        </div>
      </div>

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
