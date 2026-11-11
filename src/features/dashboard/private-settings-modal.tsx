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
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
  KeyRound,
  Search,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { BlogService } from '@/services/blog.service';
import { AuthService } from '@/services/auth.service';
import { extractApiError } from '@/lib/auth-redirect';
import {
  BlogPost,
  PrivateAccessStatus,
  PrivateFollowerEntry,
  PrivateLockType,
  PrivateSearchUserEntry,
  PrivateSharedUserEntry,
} from '@/types';
import { Button } from '@/components/ui/button';
import { ImageWithSkeleton, Skeleton, SkeletonCircle } from '@/components/ui/skeleton';

interface PrivatePostSettingsModalProps {
  isOpen: boolean;
  postId: string | null;
  onClose: () => void;
  onUpdated?: (post?: BlogPost) => void;
}

type SettingsTab = 'security' | 'followers' | 'users' | 'shared';

function formatShortDate(value?: string | null): string {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function PrivatePostSettingsModal({
  isOpen,
  postId,
  onClose,
  onUpdated,
}: PrivatePostSettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pointerStartedOnBackdropRef = useRef(false);
  const titleId = useId();

  const [activeTab, setActiveTab] = useState<SettingsTab>('security');
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Core post & security state
  const [post, setPost] = useState<BlogPost | null>(null);
  const [lockType, setLockType] = useState<PrivateLockType>('NONE');
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [allowLinkPasswordAccess, setAllowLinkPasswordAccess] = useState(true);
  const [requirePasswordForGrantedUsers, setRequirePasswordForGrantedUsers] = useState(false);
  const [requireFollowerToView, setRequireFollowerToView] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [rotatingToken, setRotatingToken] = useState(false);
  const [copiedWhich, setCopiedWhich] = useState<'blog' | 'private' | null>(null);

  // Followers tab
  const [followers, setFollowers] = useState<PrivateFollowerEntry[]>([]);
  const [followerSearch, setFollowerSearch] = useState('');
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // Non-followers / Add Reader tab
  const [userSearch, setUserSearch] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<PrivateSearchUserEntry[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [directIdentifier, setDirectIdentifier] = useState('');

  // Shared-with list tab
  const [sharedWith, setSharedWith] = useState<PrivateSharedUserEntry[]>([]);
  const [sharedFilter, setSharedFilter] = useState<PrivateAccessStatus | 'ALL'>('ALL');
  const [loadingShared, setLoadingShared] = useState(false);

  // Grant configuration (used in Followers & Add Reader tabs)
  const [grantOneTimeView, setGrantOneTimeView] = useState(false);
  const [grantRequirePassword, setGrantRequirePassword] = useState(false);
  const [grantLockType, setGrantLockType] = useState<PrivateLockType>('NONE');
  const [grantPassword, setGrantPassword] = useState('');
  const [showGrantPassword, setShowGrantPassword] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  // Pending 403 FOLLOW_REQUIRED_BEFORE_GRANT recovery
  const [followBeforeGrantTarget, setFollowBeforeGrantTarget] = useState<{
    userId?: string;
    usernameOrEmail?: string;
    label: string;
  } | null>(null);

  // Per-user custom password editor in Shared With tab
  const [editingSecretUserId, setEditingSecretUserId] = useState<string | null>(null);
  const [perUserLockType, setPerUserLockType] = useState<PrivateLockType>('PIN');
  const [perUserSecret, setPerUserSecret] = useState('');
  const [showPerUserSecret, setShowPerUserSecret] = useState(false);

  const supportsClosedBy =
    typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

  const notifySaved = (msg: string) => {
    setErrorBanner(null);
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const syncPostSecurityState = (loadedPost: BlogPost) => {
    setPost(loadedPost);
    setLockType(loadedPost.privateLockType || 'NONE');
    setAllowLinkPasswordAccess(loadedPost.allowLinkPasswordAccess ?? true);
    setRequirePasswordForGrantedUsers(Boolean(loadedPost.requirePasswordForGrantedUsers));
    setRequireFollowerToView(Boolean(loadedPost.requireFollowerToView));
  };

  const loadAllSettings = useCallback(async (id: string) => {
    setLoadingInitial(true);
    setErrorBanner(null);
    try {
      const data = await BlogService.getPrivateSettings(id);
      syncPostSecurityState(data.post);
      setFollowers(data.followers || []);
      setSharedWith(data.sharedWith || []);
    } catch (err) {
      setErrorBanner(extractApiError(err, 'Failed to load private story settings.').message);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && postId) {
      if (!dialog.open) {
        dialog.showModal();
      }
      setActiveTab('security');
      setSecretInput('');
      setFollowBeforeGrantTarget(null);
      setEditingSecretUserId(null);
      setErrorBanner(null);
      setStatusMessage(null);
      loadAllSettings(postId);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen, postId, loadAllSettings]);

  const refreshFollowers = useCallback(
    async (search = followerSearch) => {
      if (!postId) return;
      setLoadingFollowers(true);
      try {
        const list = await BlogService.getPrivateAccessFollowers(postId, search);
        setFollowers(list);
      } catch (err) {
        setErrorBanner(extractApiError(err, 'Unable to load followers.').message);
      } finally {
        setLoadingFollowers(false);
      }
    },
    [postId, followerSearch]
  );

  const refreshSharedWith = useCallback(
    async (statusFilter = sharedFilter) => {
      if (!postId) return;
      setLoadingShared(true);
      try {
        const list = await BlogService.getPrivateAccessList(postId, statusFilter);
        setSharedWith(list);
      } catch (err) {
        setErrorBanner(extractApiError(err, 'Unable to load shared readers list.').message);
      } finally {
        setLoadingShared(false);
      }
    },
    [postId, sharedFilter]
  );

  const runUserSearch = useCallback(
    async (query = userSearch) => {
      if (!postId) return;
      setLoadingUsers(true);
      try {
        const list = await BlogService.searchPrivateAccessUsers(postId, query);
        setSearchedUsers(list);
      } catch (err) {
        setErrorBanner(extractApiError(err, 'Unable to search readers.').message);
      } finally {
        setLoadingUsers(false);
      }
    },
    [postId, userSearch]
  );

  // Fetch initial searchable readers when switching to Add Reader tab
  useEffect(() => {
    if (isOpen && postId && activeTab === 'users') {
      runUserSearch(userSearch);
    }
  }, [isOpen, postId, activeTab]);

  // Reload Shared With list when filter changes
  useEffect(() => {
    if (isOpen && postId && activeTab === 'shared') {
      refreshSharedWith(sharedFilter);
    }
  }, [isOpen, postId, activeTab, sharedFilter, refreshSharedWith]);

  const shareUrlSlug =
    typeof window !== 'undefined' && post?.slug && post?.shareToken
      ? `${window.location.origin}/blog/${post.slug}?share=${post.shareToken}`
      : '';

  const shareUrlDirect =
    typeof window !== 'undefined' && post?.shareToken
      ? `${window.location.origin}/private/${post.shareToken}`
      : '';

  const handleCopyShareUrl = async (which: 'blog' | 'private') => {
    const url = which === 'blog' ? shareUrlSlug : shareUrlDirect;
    if (!url || typeof navigator === 'undefined') return;
    await navigator.clipboard.writeText(url);
    setCopiedWhich(which);
    setTimeout(() => setCopiedWhich(null), 2000);
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;
    setErrorBanner(null);

    const trimmedSecret = secretInput.trim();
    if (lockType === 'PIN') {
      if (!trimmedSecret && !post?.hasPassword) {
        setErrorBanner('Please enter a 4–8 digit numeric PIN or switch to Invited Only.');
        return;
      }
      if (trimmedSecret && !/^\d{4,8}$/.test(trimmedSecret)) {
        setErrorBanner('PIN must be 4 to 8 numeric digits.');
        return;
      }
    }
    if (lockType === 'PASSWORD' && !trimmedSecret && !post?.hasPassword) {
      setErrorBanner('Please enter a password or switch to Invited Only.');
      return;
    }

    setSavingSecurity(true);
    try {
      const updated = await BlogService.updatePrivateSettings(postId, {
        lockType,
        ...(trimmedSecret ? { password: trimmedSecret } : {}),
        ...(lockType === 'NONE' && post?.hasPassword ? { removePassword: true } : {}),
        allowLinkPasswordAccess,
        requirePasswordForGrantedUsers,
        requireFollowerToView,
      });
      syncPostSecurityState(updated);
      setSecretInput('');
      notifySaved('Lock & sharing rules updated.');
      onUpdated?.(updated);
    } catch (err) {
      setErrorBanner(extractApiError(err, 'Failed to update security settings.').message);
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleRemovePassword = async () => {
    if (!postId) return;
    setSavingSecurity(true);
    setErrorBanner(null);
    try {
      const updated = await BlogService.updatePrivateSettings(postId, {
        removePassword: true,
        lockType: 'NONE',
      });
      syncPostSecurityState(updated);
      setSecretInput('');
      notifySaved('Story PIN/password removed (Invited Only).');
      onUpdated?.(updated);
    } catch (err) {
      setErrorBanner(extractApiError(err, 'Failed to remove PIN/password.').message);
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleRegenerateShareToken = async () => {
    if (!postId) return;
    setRotatingToken(true);
    setErrorBanner(null);
    try {
      const updated = await BlogService.updatePrivateSettings(postId, {
        regenerateShareToken: true,
      });
      syncPostSecurityState(updated);
      notifySaved('Share link regenerated. Previous share links no longer work.');
      onUpdated?.(updated);
    } catch (err) {
      setErrorBanner(extractApiError(err, 'Failed to regenerate share link.').message);
    } finally {
      setRotatingToken(false);
    }
  };

  const buildGrantPayload = (target: { userId?: string; usernameOrEmail?: string }) => {
    const trimmed = grantPassword.trim();
    if (grantLockType === 'PIN' && trimmed && !/^\d{4,8}$/.test(trimmed)) {
      throw new Error('Custom grant PIN must be 4 to 8 numeric digits.');
    }
    return {
      ...target,
      oneTimeView: grantOneTimeView,
      requirePassword: grantRequirePassword,
      ...(trimmed && grantLockType !== 'NONE'
        ? { password: trimmed, lockType: grantLockType }
        : {}),
    };
  };

  const afterAccessMutation = async () => {
    if (!postId) return;
    await Promise.all([
      refreshFollowers(followerSearch),
      refreshSharedWith(sharedFilter),
      activeTab === 'users' ? runUserSearch(userSearch) : Promise.resolve(),
    ]);
    onUpdated?.();
  };

  const handleGrant = async (
    target: { userId?: string; usernameOrEmail?: string },
    label: string,
    followFirst = false
  ) => {
    if (!postId) return;
    const busyKey = target.userId || target.usernameOrEmail || 'direct';
    setBusyUserId(busyKey);
    setErrorBanner(null);
    setFollowBeforeGrantTarget(null);

    try {
      const payload = buildGrantPayload(target);
      if (followFirst && target.userId) {
        await AuthService.toggleFollowUser(target.userId, label);
      }
      await BlogService.grantPrivateAccess(postId, payload);
      setGrantPassword('');
      setDirectIdentifier('');
      await afterAccessMutation();
      notifySaved(`Granted access to ${label}.`);
    } catch (err: any) {
      const parsed = extractApiError(err, 'Unable to grant access.');
      if (parsed.code === 'FOLLOW_REQUIRED_BEFORE_GRANT' && (target.userId || parsed.data?.userId)) {
        setFollowBeforeGrantTarget({
          userId: target.userId || parsed.data?.userId,
          usernameOrEmail: target.usernameOrEmail,
          label,
        });
      }
      setErrorBanner(parsed.message);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRevoke = async (userId: string, label: string) => {
    if (!postId) return;
    setBusyUserId(userId);
    setErrorBanner(null);
    try {
      await BlogService.revokePrivateAccess(postId, userId);
      await afterAccessMutation();
      notifySaved(`Revoked access for ${label}.`);
    } catch (err) {
      setErrorBanner(extractApiError(err, 'Unable to revoke access.').message);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleUpdateEntry = async (
    entry: PrivateSharedUserEntry,
    patch: Parameters<typeof BlogService.updatePrivateAccess>[2],
    successText: string
  ) => {
    if (!postId) return;
    setBusyUserId(entry.userId);
    setErrorBanner(null);
    try {
      await BlogService.updatePrivateAccess(postId, entry.userId, patch);
      await afterAccessMutation();
      notifySaved(successText);
    } catch (err) {
      setErrorBanner(extractApiError(err, 'Failed to update reader access.').message);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleSavePerUserPassword = async (entry: PrivateSharedUserEntry) => {
    const trimmed = perUserSecret.trim();
    if (!trimmed) {
      setErrorBanner('Enter a PIN or password for this reader.');
      return;
    }
    if (perUserLockType === 'PIN' && !/^\d{4,8}$/.test(trimmed)) {
      setErrorBanner('Reader PIN must be 4 to 8 numeric digits.');
      return;
    }
    await handleUpdateEntry(
      entry,
      { password: trimmed, lockType: perUserLockType, requirePassword: true },
      `Updated custom ${perUserLockType} for ${entry.name || entry.username || 'reader'}.`
    );
    setEditingSecretUserId(null);
    setPerUserSecret('');
  };

  const renderGrantOptionsBox = () => (
    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Grant Options for Next Invite
        </span>
        <span className="text-[10px] text-muted-foreground">Applied when clicking Grant Access</span>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={grantOneTimeView}
            onChange={(e) => setGrantOneTimeView(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
          />
          <span>One-Time View (burns after 1 read)</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={grantRequirePassword}
            onChange={(e) => setGrantRequirePassword(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary cursor-pointer"
          />
          <span>Require PIN / password</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <select
          aria-label="Per-reader lock type"
          value={grantLockType}
          onChange={(e) => {
            const next = e.target.value as PrivateLockType;
            setGrantLockType(next);
            if (next === 'NONE') setGrantPassword('');
          }}
          className="px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground"
        >
          <option value="NONE">Use Story Default Lock</option>
          <option value="PIN">Custom Reader PIN (4–8 digits)</option>
          <option value="PASSWORD">Custom Reader Password</option>
        </select>

        {grantLockType !== 'NONE' && (
          <div className="relative flex-1 min-w-[180px]">
            <input
              type={showGrantPassword ? 'text' : 'password'}
              inputMode={grantLockType === 'PIN' ? 'numeric' : undefined}
              maxLength={grantLockType === 'PIN' ? 8 : undefined}
              value={grantPassword}
              onChange={(e) =>
                setGrantPassword(
                  grantLockType === 'PIN' ? e.target.value.replace(/\D/g, '').slice(0, 8) : e.target.value
                )
              }
              placeholder={grantLockType === 'PIN' ? '4–8 digit reader PIN' : 'Reader password'}
              className="w-full pl-3 pr-9 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground"
            />
            <button
              type="button"
              onClick={() => setShowGrantPassword((prev) => !prev)}
              aria-pressed={showGrantPassword}
              aria-label={showGrantPassword ? 'Hide grant secret' : 'Show grant secret'}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showGrantPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );

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
      className="m-auto w-[calc(100%-1.5rem)] max-w-3xl bg-card text-foreground border border-border/80 rounded-3xl p-0 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-xs font-sans open:flex open:flex-col max-h-[90vh] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-card/95 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-extrabold text-foreground tracking-tight truncate">
              Private Blog Settings &amp; Sharing
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {post?.title || 'Loading story details...'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close private settings"
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 pt-3 pb-0 border-b border-border/60 flex items-center gap-2 overflow-x-auto bg-muted/20 shrink-0">
        {(
          [
            { id: 'security', label: 'Lock & Security', icon: KeyRound },
            { id: 'followers', label: `Followers (${followers.length})`, icon: Users },
            { id: 'users', label: 'Add Reader', icon: UserPlus },
            { id: 'shared', label: `Shared With (${sharedWith.length})`, icon: Shield },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Body */}
      <div className="p-6 overflow-y-auto overscroll-contain space-y-5 flex-1">
        {errorBanner && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            {followBeforeGrantTarget && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                isLoading={busyUserId === followBeforeGrantTarget.userId}
                onClick={() =>
                  handleGrant(
                    {
                      userId: followBeforeGrantTarget.userId,
                      usernameOrEmail: followBeforeGrantTarget.usernameOrEmail,
                    },
                    followBeforeGrantTarget.label,
                    true
                  )
                }
                className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Follow &amp; Grant Access
              </Button>
            )}
          </div>
        )}

        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {loadingInitial ? (
          <div aria-hidden="true" className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Tab 1: Lock & Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Share Links Box */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Private Share URLs
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Share this private link with authorized readers or unlock with PIN/password.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      isLoading={rotatingToken}
                      onClick={handleRegenerateShareToken}
                      className="rounded-xl gap-1.5 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate Share Link
                    </Button>
                  </div>

                  {shareUrlSlug ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareUrlSlug}
                          aria-label="Story share URL"
                          className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => handleCopyShareUrl('blog')}
                          className="rounded-xl gap-1.5 text-xs shrink-0"
                        >
                          {copiedWhich === 'blog' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedWhich === 'blog' ? 'Copied' : 'Copy Share URL'}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareUrlDirect}
                          aria-label="Direct token share URL"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-background/70 border border-border/70 text-[11px] font-mono text-muted-foreground"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyShareUrl('private')}
                          className="rounded-xl gap-1.5 text-[11px] shrink-0"
                        >
                          {copiedWhich === 'private' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedWhich === 'private' ? 'Copied' : 'Copy /private Link'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Click Regenerate Share Link to generate a share token for this private post.
                    </p>
                  )}
                </div>

                {/* Lock & Rule Form */}
                <form onSubmit={handleSaveSecurity} className="space-y-5">
                  <fieldset className="space-y-2">
                    <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Protection Mode
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {(
                        [
                          { id: 'NONE', label: 'Invited Only', desc: 'Authorized readers only' },
                          { id: 'PIN', label: 'Numeric PIN', desc: '4–8 digits' },
                          { id: 'PASSWORD', label: 'Password', desc: 'Custom secret text' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLockType(opt.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            lockType === opt.id
                              ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                              : 'border-border/70 bg-background hover:border-border'
                          }`}
                        >
                          <div className="text-xs font-bold text-foreground">{opt.label}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {lockType === 'PIN' && (
                    <div className="space-y-1.5">
                      <label htmlFor="settings-pin-input" className="block text-xs font-semibold text-foreground">
                        {post?.hasPassword ? 'Update 4–8 Digit PIN (leave blank to keep current)' : 'Set 4–8 Digit Numeric PIN'}
                      </label>
                      <div className="relative">
                        <input
                          id="settings-pin-input"
                          type={showSecret ? 'text' : 'password'}
                          inputMode="numeric"
                          pattern="\d{4,8}"
                          maxLength={8}
                          value={secretInput}
                          onChange={(e) => setSecretInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                          placeholder={post?.hasPassword ? '•••• (keep existing or enter new PIN)' : 'Enter 4–8 digits'}
                          className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-background border border-border text-sm font-mono tracking-[0.35em] text-foreground placeholder:tracking-normal placeholder:font-sans placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret((prev) => !prev)}
                          aria-pressed={showSecret}
                          aria-label={showSecret ? 'Hide PIN' : 'Show PIN'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {lockType === 'PASSWORD' && (
                    <div className="space-y-1.5">
                      <label htmlFor="settings-pw-input" className="block text-xs font-semibold text-foreground">
                        {post?.hasPassword ? 'Update Story Password (leave blank to keep current)' : 'Set Story Password'}
                      </label>
                      <div className="relative">
                        <input
                          id="settings-pw-input"
                          type={showSecret ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={secretInput}
                          onChange={(e) => setSecretInput(e.target.value)}
                          placeholder={post?.hasPassword ? '•••••••• (keep existing or enter new password)' : 'Enter password...'}
                          className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret((prev) => !prev)}
                          aria-pressed={showSecret}
                          aria-label={showSecret ? 'Hide password' : 'Show password'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 p-4 rounded-2xl bg-muted/20 border border-border/60">
                    <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowLinkPasswordAccess}
                        onChange={(e) => setAllowLinkPasswordAccess(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-border text-primary cursor-pointer"
                      />
                      <span>Allow anyone with share URL + PIN/password to unlock</span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requirePasswordForGrantedUsers}
                        onChange={(e) => setRequirePasswordForGrantedUsers(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-border text-primary cursor-pointer"
                      />
                      <span>Also require PIN/password for invited users</span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requireFollowerToView}
                        onChange={(e) => setRequireFollowerToView(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-border text-primary cursor-pointer"
                      />
                      <span>Require readers to follow you before viewing</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div>
                      {(post?.hasPassword || (post?.privateLockType && post.privateLockType !== 'NONE')) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={savingSecurity}
                          onClick={handleRemovePassword}
                          className="rounded-xl text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                        >
                          Remove PIN / Password
                        </Button>
                      )}
                    </div>
                    <Button
                      type="submit"
                      size="md"
                      variant="primary"
                      isLoading={savingSecurity}
                      className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Save Security Settings
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Followers */}
            {activeTab === 'followers' && (
              <div className="space-y-4">
                <search aria-label="Search followers" className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={followerSearch}
                      onChange={(e) => setFollowerSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          refreshFollowers(followerSearch);
                        }
                      }}
                      placeholder="Filter followers by name or @username..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => refreshFollowers(followerSearch)}
                    className="rounded-xl text-xs"
                  >
                    Filter
                  </Button>
                </search>

                {renderGrantOptionsBox()}

                {loadingFollowers ? (
                  <div aria-hidden="true" className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-border/60">
                        <div className="flex items-center gap-3">
                          <SkeletonCircle size={36} />
                          <div className="space-y-1.5">
                            <Skeleton className="w-32 h-3.5" />
                            <Skeleton className="w-24 h-3" />
                          </div>
                        </div>
                        <Skeleton className="w-24 h-8 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : followers.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                    No followers matched. Readers who follow you appear here for quick 1-click sharing.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {followers.map((f) => {
                      const displayName = f.name || f.user?.name || 'Follower';
                      const username = f.username || f.user?.username || 'reader';
                      const avatar = f.avatar || f.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
                      const isActiveGrant = f.hasAccess && f.accessStatus !== 'REVOKED';
                      const busy = busyUserId === f.userId;

                      return (
                        <div
                          key={f.userId}
                          className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-background border border-border/70"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ImageWithSkeleton
                              src={avatar}
                              alt={displayName}
                              width={36}
                              height={36}
                              wrapperClassName="w-9 h-9 rounded-full shrink-0"
                              className="w-full h-full rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground truncate">{displayName}</span>
                                {f.oneTimeView && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                    One-Time
                                  </span>
                                )}
                                {f.hasViewed && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                                    Used
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">@{username}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isActiveGrant ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                isLoading={busy}
                                onClick={() => handleRevoke(f.userId, displayName)}
                                className="rounded-xl text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                              >
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                isLoading={busy}
                                onClick={() => handleGrant({ userId: f.userId }, displayName)}
                                className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
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

            {/* Tab 3: Add Reader / Non-Followers */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <search aria-label="Search readers to invite" className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          runUserSearch(userSearch);
                        }
                      }}
                      placeholder="Search any reader by name, @username, or email..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => runUserSearch(userSearch)}
                    className="rounded-xl text-xs"
                  >
                    Search
                  </Button>
                </search>

                {/* Quick Direct Grant by Username/Email */}
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-muted/20 border border-border/60">
                  <input
                    type="text"
                    value={directIdentifier}
                    onChange={(e) => setDirectIdentifier(e.target.value)}
                    placeholder="Or enter exact username or email directly..."
                    className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!directIdentifier.trim()}
                    isLoading={busyUserId === directIdentifier.trim()}
                    onClick={() =>
                      handleGrant(
                        { usernameOrEmail: directIdentifier.trim() },
                        directIdentifier.trim()
                      )
                    }
                    className="rounded-xl text-xs"
                  >
                    Grant by Username / Email
                  </Button>
                </div>

                {renderGrantOptionsBox()}

                {loadingUsers ? (
                  <div aria-hidden="true" className="space-y-2.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-border/60">
                        <div className="flex items-center gap-3">
                          <SkeletonCircle size={36} />
                          <div className="space-y-1.5">
                            <Skeleton className="w-36 h-3.5" />
                            <Skeleton className="w-24 h-3" />
                          </div>
                        </div>
                        <Skeleton className="w-28 h-8 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : searchedUsers.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                    Search above to find readers on InkFlow. Non-followers can be followed in one click to unlock sharing.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchedUsers.map((u) => {
                      const displayName = u.name || u.user?.name || 'Reader';
                      const username = u.username || u.user?.username || 'reader';
                      const avatar = u.avatar || u.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
                      const isActiveGrant = u.hasAccess && u.accessStatus !== 'REVOKED';
                      const busy = busyUserId === u.userId;

                      return (
                        <div
                          key={u.userId}
                          className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-background border border-border/70"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ImageWithSkeleton
                              src={avatar}
                              alt={displayName}
                              width={36}
                              height={36}
                              wrapperClassName="w-9 h-9 rounded-full shrink-0"
                              className="w-full h-full rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground truncate">{displayName}</span>
                                {u.isFollower && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    Follower
                                  </span>
                                )}
                                {u.isFollowing && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                    Following
                                  </span>
                                )}
                                {isActiveGrant && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary">
                                    {u.accessStatus === 'CONSUMED' ? 'Used (One-Time)' : 'Has Access'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">@{username}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isActiveGrant ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                isLoading={busy}
                                onClick={() => handleRevoke(u.userId, displayName)}
                                className="rounded-xl text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                              >
                                Revoke
                              </Button>
                            ) : u.needsFollowBeforeGrant ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                isLoading={busy}
                                onClick={() => handleGrant({ userId: u.userId }, displayName, true)}
                                className="rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                Follow to Grant Access
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                isLoading={busy}
                                onClick={() => handleGrant({ userId: u.userId }, displayName, false)}
                                className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
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

            {/* Tab 4: Shared With List */}
            {activeTab === 'shared' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['ALL', 'ACTIVE', 'CONSUMED', 'REVOKED'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSharedFilter(status)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                          sharedFilter === status
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-background text-muted-foreground border-border hover:text-foreground'
                        }`}
                      >
                        {status === 'ALL' ? 'All' : status === 'CONSUMED' ? 'Used (One-Time)' : status}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => refreshSharedWith(sharedFilter)}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </Button>
                </div>

                {loadingShared ? (
                  <div aria-hidden="true" className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-border/60 space-y-2.5">
                        <div className="flex items-center gap-3">
                          <SkeletonCircle size={36} />
                          <div className="space-y-1.5">
                            <Skeleton className="w-32 h-3.5" />
                            <Skeleton className="w-24 h-3" />
                          </div>
                        </div>
                        <Skeleton className="w-full h-8 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : sharedWith.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                    No readers in this list yet. Use the Followers or Add Reader tab to grant access.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sharedWith.map((entry) => {
                      const displayName = entry.name || entry.user?.name || 'Reader';
                      const username = entry.username || entry.user?.username || 'reader';
                      const avatar =
                        entry.avatar ||
                        entry.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
                      const busy = busyUserId === entry.userId;
                      const isEditingSecret = editingSecretUserId === entry.userId;

                      return (
                        <div
                          key={entry.userId}
                          className="p-4 rounded-2xl bg-background border border-border/80 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <ImageWithSkeleton
                                src={avatar}
                                alt={displayName}
                                width={38}
                                height={38}
                                wrapperClassName="w-9.5 h-9.5 rounded-full shrink-0"
                                className="w-full h-full rounded-full object-cover"
                              />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-xs font-bold text-foreground">{displayName}</span>
                                  {entry.isFollower && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                      Follower
                                    </span>
                                  )}
                                  {entry.isFollowing && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                      Following
                                    </span>
                                  )}
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      entry.status === 'ACTIVE'
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                        : entry.status === 'CONSUMED'
                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                        : 'bg-rose-500/15 text-rose-500'
                                    }`}
                                  >
                                    {entry.status === 'CONSUMED' ? 'CONSUMED (Used)' : entry.status}
                                  </span>
                                  {entry.hasCustomPassword && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                                      Custom {entry.lockType && entry.lockType !== 'NONE' ? entry.lockType : 'Password'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                  <span className="font-mono">@{username}</span>
                                  <span>•</span>
                                  <span>Views: {entry.viewCount}</span>
                                  <span>•</span>
                                  <span>Last viewed: {formatShortDate(entry.lastViewedAt)}</span>
                                </div>
                              </div>
                            </div>

                            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                              <input
                                type="checkbox"
                                disabled={busy}
                                checked={entry.oneTimeView}
                                onChange={() =>
                                  handleUpdateEntry(
                                    entry,
                                    { oneTimeView: !entry.oneTimeView },
                                    `One-Time View ${!entry.oneTimeView ? 'enabled' : 'disabled'} for ${displayName}.`
                                  )
                                }
                                className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                              />
                              <span>One-Time View</span>
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                            {entry.status === 'CONSUMED' && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                isLoading={busy}
                                onClick={() =>
                                  handleUpdateEntry(
                                    entry,
                                    { resetView: true },
                                    `One-time view reset for ${displayName}.`
                                  )
                                }
                                className="rounded-xl text-[11px] gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              >
                                <RotateCcw className="w-3 h-3" /> Reset One-Time View
                              </Button>
                            )}

                            {entry.status === 'REVOKED' ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                isLoading={busy}
                                onClick={() =>
                                  handleUpdateEntry(
                                    entry,
                                    { status: 'ACTIVE' },
                                    `Restored access for ${displayName}.`
                                  )
                                }
                                className="rounded-xl text-[11px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              >
                                <Check className="w-3 h-3" /> Restore Access
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                isLoading={busy}
                                onClick={() => handleRevoke(entry.userId, displayName)}
                                className="rounded-xl text-[11px] gap-1 text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                              >
                                <Trash2 className="w-3 h-3" /> Revoke Access
                              </Button>
                            )}

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSecretUserId(isEditingSecret ? null : entry.userId);
                                setPerUserLockType(entry.lockType && entry.lockType !== 'NONE' ? entry.lockType : 'PIN');
                                setPerUserSecret('');
                              }}
                              className="rounded-xl text-[11px] gap-1"
                            >
                              <KeyRound className="w-3 h-3" />
                              {entry.hasCustomPassword ? 'Change Custom PIN/Password' : 'Set Custom PIN/Password'}
                            </Button>

                            {entry.hasCustomPassword && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={busy}
                                onClick={() =>
                                  handleUpdateEntry(
                                    entry,
                                    { removePassword: true },
                                    `Removed custom password for ${displayName}.`
                                  )
                                }
                                className="rounded-xl text-[11px] text-muted-foreground hover:text-rose-500"
                              >
                                Remove Custom Password
                              </Button>
                            )}
                          </div>

                          {isEditingSecret && (
                            <div className="p-3 rounded-xl bg-muted/40 border border-border/70 flex flex-wrap items-center gap-2">
                              <select
                                aria-label="Custom lock type"
                                value={perUserLockType}
                                onChange={(e) => {
                                  setPerUserLockType(e.target.value as PrivateLockType);
                                  setPerUserSecret('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground"
                              >
                                <option value="PIN">PIN (4–8 digits)</option>
                                <option value="PASSWORD">Password</option>
                              </select>
                              <div className="relative flex-1 min-w-[160px]">
                                <input
                                  type={showPerUserSecret ? 'text' : 'password'}
                                  inputMode={perUserLockType === 'PIN' ? 'numeric' : undefined}
                                  maxLength={perUserLockType === 'PIN' ? 8 : undefined}
                                  value={perUserSecret}
                                  onChange={(e) =>
                                    setPerUserSecret(
                                      perUserLockType === 'PIN'
                                        ? e.target.value.replace(/\D/g, '').slice(0, 8)
                                        : e.target.value
                                    )
                                  }
                                  placeholder={perUserLockType === 'PIN' ? 'Enter 4–8 digit PIN' : 'Enter password'}
                                  className="w-full pl-3 pr-9 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPerUserSecret((prev) => !prev)}
                                  aria-pressed={showPerUserSecret}
                                  aria-label={showPerUserSecret ? 'Hide secret' : 'Show secret'}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  {showPerUserSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                isLoading={busy}
                                onClick={() => handleSavePerUserPassword(entry)}
                                className="rounded-lg text-xs"
                              >
                                Save
                              </Button>
                            </div>
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
