'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Settings as SettingsIcon,
  Camera,
  Lock,
  PauseCircle,
  PlayCircle,
  Trash2,
  Bold,
  Italic,
  List,
  Quote,
  Code,
  Link as LinkIcon,
  Check,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { SettingsPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isCheckingAuth,
    updateProfile,
    privateNotesPassword,
    setPrivateNotesPassword,
    logout,
    pauseAccount,
    unpauseAccount,
  } = useAuthStore();

  // Form Fields State
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState(privateNotesPassword || 'secretpassword');
  const [showPassword, setShowPassword] = useState(false);

  // Account & Submission State
  const isPaused = user?.status === 'PAUSED';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; username?: string }>({});

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.replace('/login?redirect=%2Fsettings');
    }
  }, [isCheckingAuth, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (privateNotesPassword !== undefined) {
      setPassword(privateNotesPassword);
    }
  }, [privateNotesPassword]);

  // Bio Formatting Toolbar Helper Function
  const insertFormatting = (tag: string, wrapperText: string = '') => {
    let newBio = bio;
    if (tag === 'bold') newBio += ` **${wrapperText || 'bold text'}** `;
    else if (tag === 'italic') newBio += ` *${wrapperText || 'italic text'}* `;
    else if (tag === 'quote') newBio += `\n> "${wrapperText || 'A meaningful quote...'}"\n`;
    else if (tag === 'code') newBio += ` \`${wrapperText || 'code'}\` `;
    else if (tag === 'list') newBio += `\n- ${wrapperText || 'List item'}\n`;
    else if (tag === 'link') newBio += ` [${wrapperText || 'Link Title'}](https://example.com) `;
    setBio(newBio);
  };

  const validateFields = (): boolean => {
    const errors: { name?: string; username?: string } = {};
    const trimmedName = name.trim();
    const cleanUsername = username.trim().replace(/^@+/, '');

    if (!trimmedName) {
      errors.name = 'Display name cannot be empty.';
    }
    if (cleanUsername.length < 2) {
      errors.username = 'Username must be at least 2 characters long.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      errors.username = 'Use only letters, numbers, underscores, dots, or hyphens.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    if (!validateFields()) {
      setSaveError('Please fix the highlighted fields before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim().replace(/^@+/, ''),
        avatar: avatar.trim(),
        bio,
      });
      setPrivateNotesPassword(password);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseDefaultAvatar = () => {
    const fallbackName = encodeURIComponent(name.trim() || user?.name || 'InkFlow User');
    setAvatar(`https://ui-avatars.com/api/?name=${fallbackName}&background=059669&color=fff`);
  };

  const handleTogglePause = async () => {
    try {
      if (user?.status === 'PAUSED') {
        await unpauseAccount();
      } else {
        await pauseAccount();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update account pause state.');
    }
  };

  const handleRequestDeletion = async () => {
    const requiredPhrase = 'Delete my account';
    if (deletePhrase.trim() !== requiredPhrase) {
      setDeleteError(`Please type "${requiredPhrase}" exactly as shown.`);
      return;
    }
    const currentEmail = (user?.email || '').trim().toLowerCase();
    if (deleteEmail.trim().toLowerCase() !== currentEmail) {
      setDeleteError(`Please type your registered email address (${user?.email}) accurately.`);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const { UserService } = await import('@/services/user.service');
      const res = await UserService.requestDeletion(deleteEmail.trim());
      setDeleteSuccess(true);
      if (res.user) {
        useAuthStore.getState().setUser(res.user);
      }
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setDeletePhrase('');
        setDeleteEmail('');
        setDeleteSuccess(false);
      }, 2500);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to request account deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isCheckingAuth || !isAuthenticated) {
    return <SettingsPageSkeleton />;
  }

  const avatarPreviewSrc =
    avatar?.trim() ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=059669&color=fff`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans space-y-8">
      {/* Top Breadcrumb & Header */}
      <header className="space-y-5 border-b border-border/60 pb-8">
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 hover:bg-muted border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <SettingsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Account &amp; Profile Settings
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Manage your personal profile details, formatted author bio, private notes encryption, and account controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            {saveSuccess ? (
              <div
                role="status"
                aria-live="polite"
                className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Changes Saved
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-muted/50 border border-border/60 text-xs text-muted-foreground font-medium">
                Signed in as <span className="font-semibold text-foreground">@{user?.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <form onSubmit={handleSaveProfile} aria-labelledby="settings-basic-heading" className="space-y-8" noValidate>
        {saveError && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-3 p-4 rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Could not save changes</p>
              <p className="text-xs opacity-90 mt-0.5">{saveError}</p>
            </div>
          </div>
        )}

        {/* Section 1: Profile & Avatar Details */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 id="settings-basic-heading" className="text-lg font-bold text-foreground flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-emerald-500" /> Basic Information &amp; Avatar
            </h2>
            <p className="text-xs text-muted-foreground">
              This information appears on your public author profile and beside your published articles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border/50">
            <UserAvatar
              src={avatarPreviewSrc}
              alt={name || 'Author avatar'}
              name={name}
              role={user?.role}
              size="2xl"
              containerClassName="border-2 border-emerald-500/60 shadow-md"
            />
            <div className="w-full space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="settings-avatar" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-muted-foreground" /> Avatar Image URL
                </label>
                <button
                  type="button"
                  onClick={handleUseDefaultAvatar}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Generate Avatar
                </button>
              </div>
              <input
                id="settings-avatar"
                name="avatar"
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                autoComplete="photo"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full px-4 py-3 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Paste any image URL or leave blank to use an automatically generated initials avatar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="settings-name" className="text-xs font-semibold text-foreground block">
                Display Name <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <input
                id="settings-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                aria-invalid={fieldErrors.name ? 'true' : 'false'}
                aria-describedby={fieldErrors.name ? 'settings-name-error' : undefined}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className="w-full px-4 py-3 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
              />
              {fieldErrors.name && (
                <p id="settings-name-error" className="text-xs text-destructive font-medium">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="settings-username" className="text-xs font-semibold text-foreground block">
                Username / Handle <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <input
                id="settings-username"
                name="username"
                type="text"
                required
                minLength={2}
                autoComplete="username"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={fieldErrors.username ? 'true' : 'false'}
                aria-describedby={fieldErrors.username ? 'settings-username-error' : 'settings-username-help'}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
                className="w-full px-4 py-3 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-mono"
              />
              {fieldErrors.username ? (
                <p id="settings-username-error" className="text-xs text-destructive font-medium">
                  {fieldErrors.username}
                </p>
              ) : (
                <p id="settings-username-help" className="text-[11px] text-muted-foreground">
                  Public URL: inkflow/@{username.trim().replace(/^@+/, '') || 'username'}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Formatted Bio Rich-Text Editor */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-4 shadow-xs">
          <div className="space-y-1">
            <label htmlFor="settings-bio" className="text-lg font-bold text-foreground block">
              Formatted Author Bio
            </label>
            <p className="text-xs text-muted-foreground">
              Write and format your author bio with rich text primitives (bold, quotes, code, lists, and links).
            </p>
          </div>

          {/* Formatted Text Toolbar */}
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-muted/50 border border-border/60 overflow-x-auto">
            <button
              type="button"
              onClick={() => insertFormatting('bold')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Bold Text"
              aria-label="Insert bold text"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('italic')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Italic Text"
              aria-label="Insert italic text"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('quote')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Insert Blockquote"
              aria-label="Insert blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('code')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Inline Code"
              aria-label="Insert inline code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('list')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Bullet List"
              aria-label="Insert bullet list item"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('link')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Insert Link"
              aria-label="Insert link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Formatted Bio Textarea */}
          <textarea
            id="settings-bio"
            name="bio"
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short or detailed author bio describing your background, technical interests, and publications..."
            className="w-full p-4 text-sm font-sans bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground leading-relaxed"
          />
        </section>

        {/* Section 3: Security & Private Notes Password */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-4 shadow-xs">
          <div className="space-y-1">
            <label htmlFor="settings-notes-password" className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" /> Private Notes Encryption Password
            </label>
            <p id="settings-notes-password-help" className="text-xs text-muted-foreground">
              Set or update your local workspace master passphrase used for quick private notes convenience on this device.
            </p>
          </div>

          <div className="relative">
            <input
              id="settings-notes-password"
              name="privateNotesPassword"
              type={showPassword ? 'text' : 'password'}
              aria-describedby="settings-notes-password-help"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master encryption password..."
              className="w-full pl-4 pr-12 py-3 text-sm bg-muted/40 border border-emerald-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-mono transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-pressed={showPassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </section>

        {/* Save Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div role="status" aria-live="polite" className="text-xs">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" /> Profile updated and synced with your account.
              </span>
            )}
          </div>
          <Button
            type="submit"
            size="md"
            variant="primary"
            isLoading={isSaving}
            disabled={isSaving}
            className="rounded-full text-xs font-semibold px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {/* Section 4: Account Actions (Pause & Delete Account) */}
      <section className="pt-8 border-t border-border/60 space-y-6">
        <h2 className="text-xl font-bold text-foreground">Account Controls &amp; Status</h2>

        {/* Pause Account Option */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-foreground">Pause Account</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${isPaused ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Temporarily pause your account. While paused, your public profile and technical stories will be hidden from recommendations until you unpause.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleTogglePause}
            className={`rounded-full text-xs gap-1.5 shrink-0 ${isPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20'}`}
          >
            {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
            {isPaused ? 'Unpause Account' : 'Pause Account'}
          </Button>
        </div>

        {/* Delete Account Option */}
        <div className="p-6 sm:p-8 rounded-3xl bg-destructive/5 border border-destructive/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Permanently Delete Account
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Once deleted, your profile data, author bio, reading lists, and custom preferences will be permanently wiped. This action cannot be undone.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-full text-xs gap-1.5 shrink-0 text-destructive border-destructive/40 hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </Button>
        </div>
      </section>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-card p-6 sm:p-8 rounded-3xl border-2 border-destructive/50 space-y-6 shadow-2xl relative my-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2 text-center">
              <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-extrabold uppercase tracking-wider">
                Danger Zone
              </span>
              <h3 id="delete-account-modal-title" className="text-xl sm:text-2xl font-black text-foreground">
                Do you really want to delete your account?
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p className="font-bold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This will delete all your posts, drafts, comments, and profile data.
              </p>
              <p>
                After submitting, an account deletion request will be raised. Your account will enter a{' '}
                <strong className="text-foreground">30-day grace period</strong>. After 30 days pass, an administrator can permanently wipe all your records from the database.
              </p>
              <p className="text-foreground/90 font-medium">
                💡 <span className="underline">Changed your mind?</span> You can log back in anytime within these 30 days to stop and cancel the deletion request.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {deleteError}
              </div>
            )}

            {deleteSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Account deletion requested! Scheduled for termination in 30 days.
              </div>
            )}

            <div className="space-y-4 pt-1 text-left text-xs">
              {/* Verification Phrase Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  1. Type <span className="font-mono text-destructive select-all">Delete my account</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deletePhrase}
                  onChange={(e) => setDeletePhrase(e.target.value)}
                  placeholder="Delete my account"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border/80 text-foreground font-mono text-xs focus:outline-hidden focus:border-destructive focus:ring-1 focus:ring-destructive"
                />
              </div>

              {/* Email Verification Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  2. Type your registered email address (<span className="font-mono text-foreground font-semibold select-all">{user?.email}</span>):
                </label>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder={user?.email || 'your-email@example.com'}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-hidden focus:border-destructive focus:ring-1 focus:ring-destructive"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePhrase('');
                  setDeleteEmail('');
                  setDeleteError(null);
                }}
                className="rounded-full text-xs font-semibold"
              >
                Cancel &amp; Keep Account
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={
                  isDeleting ||
                  deletePhrase.trim() !== 'Delete my account' ||
                  deleteEmail.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase()
                }
                onClick={handleRequestDeletion}
                className="rounded-full text-xs font-bold bg-destructive text-white hover:bg-destructive/90 gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Raising Request...' : 'Raise Deletion Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
