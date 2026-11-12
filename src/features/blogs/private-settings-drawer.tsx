'use client';

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import {
  X,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Users,
  UserPlus,
  Shield,
  Search,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { BlogService } from '@/services/blog.service';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/ui/user-avatar';
import { extractApiError, redirectToLogin, isUnauthorizedError } from '@/lib/auth-redirect';
import { formatDate } from '@/lib/utils';
import {
  BlogPost,
  PrivateLockType,
  PrivateSharedUserEntry,
  PrivateFollowerEntry,
  PrivateSearchUserEntry,
  PrivateAccessStatus,
} from '@/types';

interface PrivateSettingsDrawerProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

type DrawerTab = 'lock' | 'followers' | 'search' | 'shared';

interface SecretConfig {
  lockType: PrivateLockType;
  password: string;
  oneTimeView: boolean;
  requirePassword: boolean;
}

function SecretInputs({
  idPrefix,
  lockType,
  password,
  placeholder,
  onLockTypeChange,
  onPasswordChange,
}: {
  idPrefix: string;
  lockType: PrivateLockType;
  password: string;
  placeholder?: string;
  onLockTypeChange: (val: PrivateLockType) => void;
  onPasswordChange: (val: string) => void;
}) {
  const [reveal, setReveal] = useState(false);
  const inputId = `${idPrefix}-secret`;
  const errId = `${idPrefix}-secret-err`;
  const trimmed = password.trim();
  const pinInvalid = lockType === 'PIN' && trimmed.length > 0 && !/^\d{4,8}$/.test(trimmed);

  return (
    <div className="space-y-2.5">
      <fieldset className="space-y-1.5">
        <legend className="text-[11px] font-bold text-foreground">Lock Type</legend>
        <div className="grid grid-cols-3 gap-1.5">
          {(['NONE', 'PIN', 'PASSWORD'] as const).map((opt) => (
            <label
              key={opt}
              htmlFor={`${idPrefix}-lt-${opt}`}
              className={`px-2.5 py-1.5 rounded-xl border text-center text-[11px] font-semibold cursor-pointer transition-colors ${
                lockType === opt
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border/70 bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              <input
                id={`${idPrefix}-lt-${opt}`}
                type="radio"
                name={`${idPrefix}-locktype`}
                value={opt}
                checked={lockType === opt}
                onChange={() => {
                  onLockTypeChange(opt);
                  if (opt === 'NONE') onPasswordChange('');
                }}
                className="sr-only"
              />
              {opt === 'NONE' ? 'No Lock' : opt === 'PIN' ? 'PIN (4-8)' : 'Password'}
            </label>
          ))}
        </div>
      </fieldset>

      {lockType !== 'NONE' && (
        <div className="space-y-1">
          <label htmlFor={inputId} className="block text-[11px] font-semibold text-foreground">
            {lockType === 'PIN' ? '4–8 Digit Numeric PIN' : 'Password'}
          </label>
          <div className="relative">
            <input
              id={inputId}
              type={reveal ? 'text' : 'password'}
              inputMode={lockType === 'PIN' ? 'numeric' : 'text'}
              pattern={lockType === 'PIN' ? '\\d{4,8}' : undefined}
              maxLength={lockType === 'PIN' ? 8 : undefined}
              autoComplete="off"
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                onPasswordChange(lockType === 'PIN' ? v.replace(/\D/g, '').slice(0, 8) : v);
              }}
              placeholder={
                placeholder ||
                (lockType === 'PIN' ? '4–8 numeric digits' : 'Enter secret password')
              }
              aria-invalid={pinInvalid}
              aria-describedby={pinInvalid ? errId : undefined}
              className={`w-full pl-3 pr-10 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                lockType === 'PIN' ? 'font-mono tracking-[0.3em] placeholder:tracking-normal placeholder:font-sans' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setReveal((p) => !p)}
              aria-pressed={reveal}
              aria-label={reveal ? 'Hide secret' : 'Show secret'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {reveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {pinInvalid && (
            <p id={errId} role="alert" className="text-[11px] text-rose-500 font-medium">
              PIN must be 4 to 8 numeric digits.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function PrivateSettingsDrawer({
  postId,
  isOpen,
  onClose,
  onUpdated,
}: PrivateSettingsDrawerProps) {
  const { user, setUser } = useAuthStore();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pointerStartedOnBackdropRef = useRef(false);
  const titleId = useId();
  const lockGroupId = useId();

  const [activeTab, setActiveTab] = useState<DrawerTab>('lock');
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lock & Security state
  const [lockType, setLockType] = useState<PrivateLockType>('NONE');
  const [secretInput, setSecretInput] = useState('');
  const [allowLinkPasswordAccess, setAllowLinkPasswordAccess] = useState(true);
  const [requirePasswordForGrantedUsers, setRequirePasswordForGrantedUsers] = useState(false);
  const [requireFollowerToView, setRequireFollowerToView] = useState(false);
  const [savingLock, setSavingLock] = useState(false);
  const [copiedType, setCopiedType] = useState<'blog' | 'private' | null>(null);

  // Followers tab state
  const [followers, setFollowers] = useState<PrivateFollowerEntry[]>([]);
  const [followerSearch, setFollowerSearch] = useState('');
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // Reader search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PrivateSearchUserEntry[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Shared grant options (for Followers & Add Reader tabs)
  const [grantOptions, setGrantOptions] = useState<SecretConfig>({
    lockType: 'NONE',
    password: '',
    oneTimeView: false,
    requirePassword: false,
  });

  // Follow-required 403 prompt
  const [followRequiredTarget, setFollowRequiredTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  // Shared With list tab state
  const [sharedStatusFilter, setSharedStatusFilter] = useState<PrivateAccessStatus | 'ALL'>('ALL');
  const [sharedList, setSharedList] = useState<PrivateSharedUserEntry[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const [editingAccessUserId, setEditingAccessUserId] = useState<string | null>(null);
  const [editingAccessSecret, setEditingAccessSecret] = useState<{
    lockType: PrivateLockType;
    password: string;
  }>({ lockType: 'NONE', password: '' });

  // Busy user ID map for individual buttons
  const [busyUsers, setBusyUsers] = useState<Record<string, boolean>>({});

  const showNotice = (type: 'success' | 'error', text: string) => {
    setFeedbackBanner({ type, text });
    setTimeout(() => {
      setFeedbackBanner((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  const applyPostSettingsState = useCallback((loadedPost: BlogPost) => {
    setPost(loadedPost);
    setLockType(loadedPost.privateLockType || 'NONE');
    setSecretInput('');
    setAllowLinkPasswordAccess(loadedPost.allowLinkPasswordAccess ?? true);
    setRequirePasswordForGrantedUsers(Boolean(loadedPost.requirePasswordForGrantedUsers));
    setRequireFollowerToView(Boolean(loadedPost.requireFollowerToView));
  }, []);

  const loadInitialSettings = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setFeedbackBanner(null);
    setFollowRequiredTarget(null);
    try {
      const data = await BlogService.getPrivateSettings(postId);
      if (data.post) {
        applyPostSettingsState(data.post);
      }
      setSharedList(data.sharedWith || []);
      setFollowers(data.followers || []);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToLogin();
        return;
      }
      const parsed = extractApiError(err, 'Unable to load private settings.');
      showNotice('error', parsed.message);
    } finally {
      setLoading(false);
    }
  }, [postId, applyPostSettingsState]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && postId) {
      if (!dialog.open) {
        dialog.showModal();
      }
      loadInitialSettings();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, postId, loadInitialSettings]);

  const refreshFollowers = useCallback(
    async (query: string) => {
      if (!postId) return;
      setLoadingFollowers(true);
      try {
        const list = await BlogService.getPrivateAccessFollowers(postId, query);
        setFollowers(list);
      } catch (err) {
        const parsed = extractApiError(err, 'Failed to fetch followers.');
        showNotice('error', parsed.message);
      } finally {
        setLoadingFollowers(false);
      }
    },
    [postId]
  );

  const refreshSharedList = useCallback(
    async (status: PrivateAccessStatus | 'ALL') => {
      if (!postId) return;
      setLoadingShared(true);
      try {
        const list = await BlogService.getPrivateAccessList(postId, status);
        setSharedList(list);
      } catch (err) {
        const parsed = extractApiError(err, 'Failed to load shared users.');
        showNotice('error', parsed.message);
      } finally {
        setLoadingShared(false);
      }
    },
    [postId]
  );

  const runUserSearch = useCallback(
    async (query: string) => {
      if (!postId) return;
      setLoadingSearch(true);
      try {
        const list = await BlogService.searchPrivateAccessUsers(postId, query);
        setSearchResults(list);
      } catch (err) {
        const parsed = extractApiError(err, 'Failed to search readers.');
        showNotice('error', parsed.message);
      } finally {
        setLoadingSearch(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    if (!isOpen || !postId) return;
    if (activeTab === 'followers') {
      const timer = setTimeout(() => refreshFollowers(followerSearch), 220);
      return () => clearTimeout(timer);
    }
    if (activeTab === 'search') {
      const timer = setTimeout(() => runUserSearch(searchQuery), 250);
      return () => clearTimeout(timer);
    }
    if (activeTab === 'shared') {
      refreshSharedList(sharedStatusFilter);
    }
  }, [
    isOpen,
    postId,
    activeTab,
    followerSearch,
    searchQuery,
    sharedStatusFilter,
    refreshFollowers,
    runUserSearch,
    refreshSharedList,
  ]);

  const buildShareUrl = (kind: 'blog' | 'private') => {
    if (typeof window === 'undefined' || !post?.shareToken) return '';
    if (kind === 'private') {
      return `${window.location.origin}/private/${post.shareToken}`;
    }
    return `${window.location.origin}/blog/${post.slug}?share=${post.shareToken}`;
  };

  const handleCopyShareUrl = async (kind: 'blog' | 'private') => {
    const url = buildShareUrl(kind);
    if (!url || typeof navigator === 'undefined') return;
    await navigator.clipboard.writeText(url);
    setCopiedType(kind);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSaveLockSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;

    const trimmedSecret = secretInput.trim();
    if (lockType === 'PIN' && trimmedSecret && !/^\d{4,8}$/.test(trimmedSecret)) {
      showNotice('error', 'PIN must be 4 to 8 numeric digits.');
      return;
    }

    setSavingLock(true);
    try {
      const updated = await BlogService.updatePrivateSettings(postId, {
        lockType,
        ...(trimmedSecret ? { password: trimmedSecret } : {}),
        ...(lockType === 'NONE' && post?.hasPassword ? { removePassword: true } : {}),
        allowLinkPasswordAccess,
        requirePasswordForGrantedUsers,
        requireFollowerToView,
      });
      applyPostSettingsState(updated);
      onUpdated?.();
      showNotice('success', 'Private security settings saved.');
    } catch (err) {
      const parsed = extractApiError(err, 'Could not update private settings.');
      showNotice('error', parsed.message);
    } finally {
      setSavingLock(false);
    }
  };

  const handleRemovePassword = async () => {
    if (!postId) return;
    setSavingLock(true);
    try {
      const updated = await BlogService.updatePrivateSettings(postId, {
        removePassword: true,
        lockType: 'NONE',
      });
      applyPostSettingsState(updated);
      onUpdated?.();
      showNotice('success', 'PIN/password removed. Access is now invite-only / rule-based.');
    } catch (err) {
      const parsed = extractApiError(err, 'Failed to remove password.');
      showNotice('error', parsed.message);
    } finally {
      setSavingLock(false);
    }
  };

  const handleRegenerateShareLink = async () => {
    if (!postId) return;
    setSavingLock(true);
    try {
      const updated = await BlogService.updatePrivateSettings(postId, {
        regenerateShareToken: true,
      });
      applyPostSettingsState(updated);
      onUpdated?.();
      showNotice('success', 'Generated a brand new share link. Previous links are now invalid.');
    } catch (err) {
      const parsed = extractApiError(err, 'Failed to regenerate share link.');
      showNotice('error', parsed.message);
    } finally {
      setSavingLock(false);
    }
  };

  const executeGrantAccess = async (targetUserId: string, targetName: string) => {
    if (!postId) return;

    const trimmedPass = grantOptions.password.trim();
    if (grantOptions.lockType === 'PIN' && trimmedPass && !/^\d{4,8}$/.test(trimmedPass)) {
      showNotice('error', 'Per-user PIN must be 4 to 8 numeric digits.');
      return;
    }

    setBusyUsers((p) => ({ ...p, [targetUserId]: true }));
    setFollowRequiredTarget(null);
    try {
      await BlogService.grantPrivateAccess(postId, {
        userId: targetUserId,
        oneTimeView: grantOptions.oneTimeView,
        requirePassword: grantOptions.requirePassword || grantOptions.lockType !== 'NONE',
        ...(grantOptions.lockType !== 'NONE' && trimmedPass
          ? { lockType: grantOptions.lockType, password: trimmedPass }
          : {}),
      });
      showNotice('success', `Granted private access to ${targetName}.`);
      onUpdated?.();
      await Promise.all([
        refreshFollowers(followerSearch),
        runUserSearch(searchQuery),
        refreshSharedList(sharedStatusFilter),
      ]);
    } catch (err) {
      const parsed = extractApiError(err, 'Could not grant access.');
      if (parsed.status === 403 && parsed.code === 'FOLLOW_REQUIRED_BEFORE_GRANT') {
        setFollowRequiredTarget({ userId: targetUserId, name: targetName });
      }
      showNotice('error', parsed.message);
    } finally {
      setBusyUsers((p) => ({ ...p, [targetUserId]: false }));
    }
  };

  const handleFollowAndGrant = async (targetUserId: string, targetName: string) => {
    if (!postId) return;
    setBusyUsers((p) => ({ ...p, [targetUserId]: true }));
    setFollowRequiredTarget(null);
    try {
      const followRes = await AuthService.toggleFollowUser(targetUserId, targetName);
      if (user) {
        setUser({
          ...user,
          followingUserIds: followRes.followingUserIds,
          followingCount: followRes.followingUserIds.length,
        });
      }
      if (!followRes.following) {
        // Ensure followed state in case toggle unfollowed someone unexpectedly
        await AuthService.toggleFollowUser(targetUserId, targetName);
      }
      await executeGrantAccess(targetUserId, targetName);
    } catch (err) {
      const parsed = extractApiError(err, 'Follow & Grant failed.');
      showNotice('error', parsed.message);
      setBusyUsers((p) => ({ ...p, [targetUserId]: false }));
    }
  };

  const handleRevokeAccess = async (targetUserId: string, targetName: string) => {
    if (!postId) return;
    setBusyUsers((p) => ({ ...p, [targetUserId]: true }));
    try {
      await BlogService.revokePrivateAccess(postId, targetUserId);
      showNotice('success', `Revoked access for ${targetName}.`);
      onUpdated?.();
      await Promise.all([
        refreshFollowers(followerSearch),
        runUserSearch(searchQuery),
        refreshSharedList(sharedStatusFilter),
      ]);
    } catch (err) {
      const parsed = extractApiError(err, 'Failed to revoke access.');
      showNotice('error', parsed.message);
    } finally {
      setBusyUsers((p) => ({ ...p, [targetUserId]: false }));
    }
  };

  const handleUpdateSharedEntry = async (
    targetUserId: string,
    dto: Parameters<typeof BlogService.updatePrivateAccess>[2],
    successMsg: string
  ) => {
    if (!postId) return;
    setBusyUsers((p) => ({ ...p, [targetUserId]: true }));
    try {
      await BlogService.updatePrivateAccess(postId, targetUserId, dto);
      showNotice('success', successMsg);
      onUpdated?.();
      await refreshSharedList(sharedStatusFilter);
    } catch (err) {
      const parsed = extractApiError(err, 'Failed to update reader permissions.');
      showNotice('error', parsed.message);
    } finally {
      setBusyUsers((p) => ({ ...p, [targetUserId]: false }));
    }
  };

  const supportsClosedBy =
    typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
      onClose={onClose}
      onPointerDown={(e) => {
        if (!supportsClosedBy) {
          pointerStartedOnBackdropRef.current = e.target === dialogRef.current;
        }
      }}
      onPointerUp={(e) => {
        if (!supportsClosedBy && pointerStartedOnBackdropRef.current && e.target === dialogRef.current) {
          onClose();
        }
        pointerStartedOnBackdropRef.current = false;
      }}
      className="m-0 ml-auto h-full max-h-full w-full max-w-2xl bg-card text-foreground border-l border-border/80 p-0 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-xs font-sans open:flex open:flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border/60 shrink-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <h2 id={titleId} className="text-lg font-extrabold tracking-tight text-foreground truncate">
              Private Settings &amp; Sharing
            </h2>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {post ? post.title : 'Manage access, PIN/password locks, one-time views & invitations'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close private settings drawer"
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 px-6 py-3 border-b border-border/60 bg-muted/20 overflow-x-auto shrink-0">
        {(
          [
            { id: 'lock', label: 'Lock & Security', icon: KeyRound },
            { id: 'followers', label: `Followers (${followers.length})`, icon: Users },
            { id: 'search', label: 'Add Reader', icon: UserPlus },
            { id: 'shared', label: `Shared With (${sharedList.length})`, icon: Shield },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Status Notice Banner */}
      {feedbackBanner && (
        <div
          role="alert"
          className={`mx-6 mt-4 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border shrink-0 ${
            feedbackBanner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {feedbackBanner.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackBanner.text}</span>
        </div>
      )}

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-24 rounded-2xl" />
            <Skeleton className="w-full h-40 rounded-2xl" />
            <Skeleton className="w-full h-32 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* TAB 1: LOCK & SECURITY */}
            {activeTab === 'lock' && (
              <div className="space-y-6">
                {/* Share Links Section */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Private Share Link
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Share this secret link with authorized readers or anyone with the PIN/password.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={savingLock}
                      onClick={handleRegenerateShareLink}
                      className="rounded-xl text-xs gap-1.5 shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate Share Link
                    </Button>
                  </div>

                  {post?.shareToken ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          aria-label="Private story share URL"
                          value={buildShareUrl('blog')}
                          className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-[11px] font-mono text-muted-foreground"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => handleCopyShareUrl('blog')}
                          className="rounded-xl text-xs gap-1.5 shrink-0"
                        >
                          {copiedType === 'blog' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedType === 'blog' ? 'Copied' : 'Copy Share URL'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span className="truncate font-mono">Short route: /private/{post.shareToken}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyShareUrl('private')}
                          className="text-primary hover:underline font-semibold shrink-0 ml-2 cursor-pointer"
                        >
                          {copiedType === 'private' ? 'Copied!' : 'Copy short link'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Click &ldquo;Regenerate Share Link&rdquo; to issue a shareable token.
                    </p>
                  )}
                </div>

                {/* Lock Rules Form */}
                <form onSubmit={handleSaveLockSettings} className="p-4 rounded-2xl bg-card border border-border/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Lock &amp; Access Rules
                    </h3>
                    {post?.hasPassword && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={savingLock}
                        onClick={handleRemovePassword}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 h-7 px-2.5"
                      >
                        Remove Password
                      </Button>
                    )}
                  </div>

                  <SecretInputs
                    idPrefix={`${lockGroupId}-main`}
                    lockType={lockType}
                    password={secretInput}
                    placeholder={
                      post?.hasPassword
                        ? 'Enter new PIN/password (leave blank to keep current)'
                        : undefined
                    }
                    onLockTypeChange={setLockType}
                    onPasswordChange={setSecretInput}
                  />

                  <div className="space-y-2.5 pt-2 border-t border-border/50">
                    <label htmlFor={`${lockGroupId}-allow-link`} className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        id={`${lockGroupId}-allow-link`}
                        type="checkbox"
                        checked={allowLinkPasswordAccess}
                        onChange={(e) => setAllowLinkPasswordAccess(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs text-foreground">
                        Allow anyone with share URL + PIN/password to unlock
                      </span>
                    </label>

                    <label htmlFor={`${lockGroupId}-req-granted`} className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        id={`${lockGroupId}-req-granted`}
                        type="checkbox"
                        checked={requirePasswordForGrantedUsers}
                        onChange={(e) => setRequirePasswordForGrantedUsers(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs text-foreground">
                        Also require PIN/password for invited users
                      </span>
                    </label>

                    <label htmlFor={`${lockGroupId}-req-follow`} className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        id={`${lockGroupId}-req-follow`}
                        type="checkbox"
                        checked={requireFollowerToView}
                        onChange={(e) => setRequireFollowerToView(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs text-foreground">
                        Require readers to follow you before viewing
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={savingLock}
                      disabled={savingLock}
                      className="rounded-full px-5 text-xs font-semibold"
                    >
                      Save Security Settings
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Shared Grant Options Box for Followers & Add Reader tabs */}
            {(activeTab === 'followers' || activeTab === 'search') && (
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Grant Access Options (Applied on Grant)
                  </h3>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label htmlFor={`${lockGroupId}-grant-onetime`} className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      id={`${lockGroupId}-grant-onetime`}
                      type="checkbox"
                      checked={grantOptions.oneTimeView}
                      onChange={(e) =>
                        setGrantOptions((prev) => ({ ...prev, oneTimeView: e.target.checked }))
                      }
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    One-time view only
                  </label>

                  <label htmlFor={`${lockGroupId}-grant-reqpass`} className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      id={`${lockGroupId}-grant-reqpass`}
                      type="checkbox"
                      checked={grantOptions.requirePassword}
                      onChange={(e) =>
                        setGrantOptions((prev) => ({ ...prev, requirePassword: e.target.checked }))
                      }
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    Require password for this reader
                  </label>
                </div>

                <SecretInputs
                  idPrefix={`${lockGroupId}-grant`}
                  lockType={grantOptions.lockType}
                  password={grantOptions.password}
                  placeholder="Optional per-user PIN / password"
                  onLockTypeChange={(lt) => setGrantOptions((p) => ({ ...p, lockType: lt }))}
                  onPasswordChange={(pw) => setGrantOptions((p) => ({ ...p, password: pw }))}
                />

                {followRequiredTarget && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Follow <strong>{followRequiredTarget.name}</strong> before granting private story access.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => handleFollowAndGrant(followRequiredTarget.userId, followRequiredTarget.name)}
                      className="rounded-full text-xs shrink-0"
                    >
                      Follow &amp; Grant Access
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FOLLOWERS */}
            {activeTab === 'followers' && (
              <div className="space-y-4">
                <search>
                  <div className="relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <label htmlFor={`${lockGroupId}-follower-search`} className="sr-only">
                      Filter followers
                    </label>
                    <input
                      id={`${lockGroupId}-follower-search`}
                      type="search"
                      value={followerSearch}
                      onChange={(e) => setFollowerSearch(e.target.value)}
                      placeholder="Filter followers by name or @username..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </search>

                {loadingFollowers ? (
                  <div className="space-y-2.5">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3">
                          <SkeletonCircle size={36} />
                          <div className="space-y-1.5">
                            <Skeleton className="w-28 h-3.5" />
                            <Skeleton className="w-20 h-3" />
                          </div>
                        </div>
                        <Skeleton className="w-24 h-8 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : followers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                    No matching followers found.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {followers.map((f) => {
                      const isBusy = Boolean(busyUsers[f.userId]);
                      const hasActiveAccess = f.hasAccess && f.accessStatus !== 'REVOKED';
                      return (
                        <div
                          key={f.userId}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-background border border-border/60"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                              src={f.avatar}
                              alt={f.name || 'Follower'}
                              name={f.name || f.username}
                              role={f.role}
                              size="md"
                              containerClassName="border border-border"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-foreground truncate">{f.name}</span>
                                {f.oneTimeView && (
                                  <Badge variant="warning" className="text-[10px]">One-Time</Badge>
                                )}
                                {f.hasViewed && (
                                  <Badge variant="secondary" className="text-[10px]">Viewed</Badge>
                                )}
                                {f.accessStatus && (
                                  <Badge
                                    variant={f.accessStatus === 'REVOKED' ? 'destructive' : f.accessStatus === 'CONSUMED' ? 'warning' : 'success'}
                                    className="text-[10px]"
                                  >
                                    {f.accessStatus}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">@{f.username}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {hasActiveAccess ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                isLoading={isBusy}
                                disabled={isBusy}
                                onClick={() => handleRevokeAccess(f.userId, f.name || 'follower')}
                                className="rounded-full text-xs text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                              >
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                isLoading={isBusy}
                                disabled={isBusy}
                                onClick={() => executeGrantAccess(f.userId, f.name || 'follower')}
                                className="rounded-full text-xs"
                              >
                                Grant Access
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADD READER / NON-FOLLOWERS SEARCH */}
            {activeTab === 'search' && (
              <div className="space-y-4">
                <search>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      runUserSearch(searchQuery);
                    }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <label htmlFor={`${lockGroupId}-user-search`} className="sr-only">
                        Search users by name or username
                      </label>
                      <input
                        id={`${lockGroupId}-user-search`}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search InkFlow readers by name or @username..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <Button type="submit" size="sm" variant="secondary" className="rounded-xl text-xs">
                      Search
                    </Button>
                  </form>
                </search>

                {loadingSearch ? (
                  <div className="space-y-2.5">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3">
                          <SkeletonCircle size={36} />
                          <div className="space-y-1.5">
                            <Skeleton className="w-28 h-3.5" />
                            <Skeleton className="w-20 h-3" />
                          </div>
                        </div>
                        <Skeleton className="w-28 h-8 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                    No matching readers found. Try typing a reader&apos;s name or username.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchResults.map((u) => {
                      const isBusy = Boolean(busyUsers[u.userId]);
                      const hasActiveAccess = u.hasAccess && u.accessStatus === 'ACTIVE';
                      return (
                        <div
                          key={u.userId}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-background border border-border/60"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                              src={u.avatar}
                              alt={u.name || 'Reader'}
                              name={u.name || u.username}
                              role={u.role}
                              size="md"
                              containerClassName="border border-border"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-foreground truncate">{u.name}</span>
                                {u.isFollower && <Badge variant="outline" className="text-[10px]">Follower</Badge>}
                                {u.isFollowing && <Badge variant="secondary" className="text-[10px]">Following</Badge>}
                              </div>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">@{u.username}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {hasActiveAccess ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="success" className="text-[10px]">Granted</Badge>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  isLoading={isBusy}
                                  disabled={isBusy}
                                  onClick={() => handleRevokeAccess(u.userId, u.name || 'reader')}
                                  className="text-xs text-rose-600 hover:bg-rose-500/10 h-7 px-2"
                                >
                                  Revoke
                                </Button>
                              </div>
                            ) : u.needsFollowBeforeGrant ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                isLoading={isBusy}
                                disabled={isBusy}
                                onClick={() => handleFollowAndGrant(u.userId, u.name || 'reader')}
                                className="rounded-full text-xs gap-1"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                Follow to Grant Access
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                isLoading={isBusy}
                                disabled={isBusy}
                                onClick={() => executeGrantAccess(u.userId, u.name || 'reader')}
                                className="rounded-full text-xs"
                              >
                                Grant Access
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SHARED WITH LIST */}
            {activeTab === 'shared' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['ALL', 'ACTIVE', 'CONSUMED', 'REVOKED'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSharedStatusFilter(status)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
                        sharedStatusFilter === status
                          ? 'bg-foreground text-background'
                          : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {loadingShared ? (
                  <div className="space-y-3">
                    {[0, 1].map((idx) => (
                      <Skeleton key={idx} className="w-full h-24 rounded-2xl" />
                    ))}
                  </div>
                ) : sharedList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                    No readers with {sharedStatusFilter === 'ALL' ? '' : `${sharedStatusFilter.toLowerCase()} `}access yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sharedList.map((entry) => {
                      const isBusy = Boolean(busyUsers[entry.userId]);
                      const isEditingSecret = editingAccessUserId === entry.userId;

                      return (
                        <div
                          key={entry.userId}
                          className="p-3.5 rounded-2xl bg-background border border-border/70 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <UserAvatar
                                src={entry.avatar}
                                alt={entry.name || 'Reader'}
                                name={entry.name || entry.username}
                                role={entry.role}
                                size="md"
                                containerClassName="border border-border"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-foreground">{entry.name}</span>
                                  {entry.isFollower && <Badge variant="outline" className="text-[10px]">Follower</Badge>}
                                  {entry.isFollowing && <Badge variant="secondary" className="text-[10px]">Following</Badge>}
                                  <Badge
                                    variant={
                                      entry.status === 'ACTIVE'
                                        ? 'success'
                                        : entry.status === 'CONSUMED'
                                        ? 'warning'
                                        : 'destructive'
                                    }
                                    className="text-[10px]"
                                  >
                                    {entry.status === 'CONSUMED' ? 'CONSUMED (Used)' : entry.status}
                                  </Badge>
                                  {entry.hasCustomPassword && (
                                    <Badge variant="accent" className="text-[10px]">Custom {entry.lockType || 'Lock'}</Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                  <span className="font-mono">@{entry.username}</span>
                                  <span>•</span>
                                  <span>Views: {entry.viewCount}</span>
                                  {entry.lastViewedAt && (
                                    <>
                                      <span>•</span>
                                      <span>Last viewed {formatDate(entry.lastViewedAt)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <label
                              htmlFor={`${lockGroupId}-otv-${entry.userId}`}
                              className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground cursor-pointer shrink-0"
                            >
                              <input
                                id={`${lockGroupId}-otv-${entry.userId}`}
                                type="checkbox"
                                checked={entry.oneTimeView}
                                disabled={isBusy}
                                onChange={() =>
                                  handleUpdateSharedEntry(
                                    entry.userId,
                                    { oneTimeView: !entry.oneTimeView },
                                    `Updated one-time view for ${entry.name}.`
                                  )
                                }
                                className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary"
                              />
                              One-time
                            </label>
                          </div>

                          {/* Row Actions */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isBusy}
                              onClick={() => {
                                if (isEditingSecret) {
                                  setEditingAccessUserId(null);
                                } else {
                                  setEditingAccessUserId(entry.userId);
                                  setEditingAccessSecret({
                                    lockType: entry.lockType && entry.lockType !== 'NONE' ? entry.lockType : 'PIN',
                                    password: '',
                                  });
                                }
                              }}
                              className="rounded-xl text-[11px] h-7 px-2.5 gap-1"
                            >
                              <KeyRound className="w-3 h-3" />
                              {isEditingSecret ? 'Cancel Password Edit' : 'Set / Edit PIN or Password'}
                            </Button>

                            {entry.hasCustomPassword && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={isBusy}
                                onClick={() =>
                                  handleUpdateSharedEntry(
                                    entry.userId,
                                    { removePassword: true },
                                    `Removed per-user password for ${entry.name}.`
                                  )
                                }
                                className="rounded-xl text-[11px] h-7 px-2.5 text-muted-foreground hover:text-foreground"
                              >
                                Remove Custom Lock
                              </Button>
                            )}

                            {entry.status === 'CONSUMED' && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                isLoading={isBusy}
                                disabled={isBusy}
                                onClick={() =>
                                  handleUpdateSharedEntry(
                                    entry.userId,
                                    { resetView: true },
                                    `Reset one-time view for ${entry.name}.`
                                  )
                                }
                                className="rounded-xl text-[11px] h-7 px-2.5 gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Reset One-Time View
                              </Button>
                            )}

                            {entry.status === 'REVOKED' ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                isLoading={isBusy}
                                disabled={isBusy}
                                onClick={() =>
                                  handleUpdateSharedEntry(
                                    entry.userId,
                                    { status: 'ACTIVE' },
                                    `Restored access for ${entry.name}.`
                                  )
                                }
                                className="rounded-xl text-[11px] h-7 px-2.5"
                              >
                                Restore Access
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                isLoading={isBusy}
                                disabled={isBusy}
                                onClick={() => handleRevokeAccess(entry.userId, entry.name || 'reader')}
                                className="rounded-xl text-[11px] h-7 px-2.5 text-rose-600 hover:bg-rose-500/10 ml-auto gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Revoke Access
                              </Button>
                            )}
                          </div>

                          {/* Per-user Password/PIN Inline Form */}
                          {isEditingSecret && (
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const trimmed = editingAccessSecret.password.trim();
                                if (
                                  editingAccessSecret.lockType === 'PIN' &&
                                  !/^\d{4,8}$/.test(trimmed)
                                ) {
                                  showNotice('error', 'Per-user PIN must be 4 to 8 numeric digits.');
                                  return;
                                }
                                if (editingAccessSecret.lockType === 'PASSWORD' && !trimmed) {
                                  showNotice('error', 'Please enter a password.');
                                  return;
                                }
                                if (editingAccessSecret.lockType === 'NONE') {
                                  await handleUpdateSharedEntry(
                                    entry.userId,
                                    { removePassword: true },
                                    `Removed per-user password for ${entry.name}.`
                                  );
                                } else {
                                  await handleUpdateSharedEntry(
                                    entry.userId,
                                    {
                                      lockType: editingAccessSecret.lockType,
                                      password: trimmed,
                                      requirePassword: true,
                                    },
                                    `Saved per-user ${editingAccessSecret.lockType} for ${entry.name}.`
                                  );
                                }
                                setEditingAccessUserId(null);
                              }}
                              className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2.5"
                            >
                              <SecretInputs
                                idPrefix={`${lockGroupId}-edit-${entry.userId}`}
                                lockType={editingAccessSecret.lockType}
                                password={editingAccessSecret.password}
                                onLockTypeChange={(lt) =>
                                  setEditingAccessSecret((prev) => ({ ...prev, lockType: lt }))
                                }
                                onPasswordChange={(pw) =>
                                  setEditingAccessSecret((prev) => ({ ...prev, password: pw }))
                                }
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="primary"
                                  disabled={isBusy}
                                  className="rounded-full text-[11px] h-7 px-3"
                                >
                                  Apply Per-User Lock
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}

