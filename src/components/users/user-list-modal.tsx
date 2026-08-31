'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
  isLoading?: boolean;
}

export function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  isLoading = false,
}: UserListModalProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleToggleFollow = async (e: React.MouseEvent, targetUser: User) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      setFollowLoading((prev) => ({ ...prev, [targetUser.id]: true }));
      const res = await AuthService.toggleFollowUser(targetUser.id, targetUser.name);
      useAuthStore.setState({
        user: {
          ...currentUser,
          followingUserIds: res.followingUserIds,
          followingCount: res.followingUserIds.length,
        },
      });
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const getAvatarUrl = (avatar?: string, name: string = 'User') => {
    if (avatar && avatar.trim().length > 0) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-foreground">
                {title} ({users.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User List Content */}
          <div className="max-h-[380px] overflow-y-auto p-4 space-y-2 divide-y divide-border/30">
            {isLoading ? (
              <div className="py-12 flex items-center justify-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Loading {title.toLowerCase()}...
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-1">
                <p className="text-xs font-semibold text-foreground">No {title.toLowerCase()} yet</p>
                <p className="text-[11px]">When people follow or get followed, they will appear here.</p>
              </div>
            ) : (
              users.map((u) => {
                const isSelf = currentUser && (currentUser.id === u.id || currentUser.username === u.username);
                const isFollowing = Boolean(currentUser?.followingUserIds?.includes(u.id));
                const isItemLoading = Boolean(followLoading[u.id]);
                const roleLower = String(u.role || 'reader').toLowerCase();

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      onClose();
                      router.push(`/author/${u.username}`);
                    }}
                    className="pt-2 pb-2 first:pt-0 flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getAvatarUrl(u.avatar, u.name)}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-border/60 shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {u.name}
                          </h4>
                          {roleLower === 'writer' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              Writer
                            </span>
                          )}
                          {roleLower === 'admin' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{u.username} {u.bio ? `· ${u.bio}` : ''}
                        </p>
                      </div>
                    </div>

                    {!isSelf && (
                      <Button
                        size="sm"
                        variant={isFollowing ? 'outline' : 'primary'}
                        disabled={isItemLoading}
                        onClick={(e) => handleToggleFollow(e, u)}
                        className={`rounded-full text-[11px] h-7 px-3 shrink-0 cursor-pointer ${
                          isFollowing ? 'hover:text-red-500 hover:border-red-500/40' : ''
                        }`}
                      >
                        {isItemLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isFollowing ? (
                          'Following'
                        ) : (
                          'Follow'
                        )}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border/60 bg-muted/20 text-center">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
