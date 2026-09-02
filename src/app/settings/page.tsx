'use client';

import React, { useState } from 'react';
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
  ArrowLeft,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, privateNotesPassword, setPrivateNotesPassword, logout } =
    useAuthStore();

  // Form Fields State
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState(privateNotesPassword || 'secretpassword');
  const [showPassword, setShowPassword] = useState(false);

  // Account State (Paused / Active)
  const [isPaused, setIsPaused] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateProfile({ name, username, avatar, bio });
    setPrivateNotesPassword(password);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleDeleteAccount = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans space-y-10">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/profile" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" /> Account & Profile Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your personal profile, formatted bio, security credentials, or pause/delete your account.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" /> Changes Saved Successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-10">
        {/* Section 1: Profile & Avatar Details */}
        <section className="p-8 rounded-3xl bg-card border border-border/80 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-500" /> Basic Information & Avatar
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border/40">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-lg shrink-0">
              <img src={avatar || user?.avatar} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="w-full space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-muted-foreground" /> Avatar Image URL
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-3 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Username / Handle</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-mono"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Formatted Bio Rich-Text Editor */}
        <section className="p-8 rounded-3xl bg-card border border-border/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Formatted Author Bio</h2>
              <p className="text-xs text-muted-foreground">
                Write and format your author bio with rich text primitives (bold, quotes, code, lists, and links).
              </p>
            </div>
          </div>

          {/* Formatted Text Toolbar */}
          <div className="flex items-center gap-1 p-2 rounded-2xl bg-muted/50 border border-border/60 overflow-x-auto">
            <button
              type="button"
              onClick={() => insertFormatting('bold')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Bold Text"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('italic')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Italic Text"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('quote')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Insert Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('code')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('list')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('link')}
              className="p-2 rounded-xl text-xs hover:bg-background text-foreground transition-colors font-semibold flex items-center gap-1 cursor-pointer"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Formatted Bio Textarea */}
          <textarea
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short or detailed author bio describing your background, technical interests, and publications..."
            className="w-full p-4 text-xs font-sans bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground leading-relaxed"
          />
        </section>

        {/* Section 3: Security & Private Notes Password */}
        <section className="p-8 rounded-3xl bg-card border border-border/80 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" /> Private Notes Encryption Password
          </h2>
          <p className="text-xs text-muted-foreground">
            Set or update your master encryption password used to lock and unlock private stories across InkFlow.
          </p>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master encryption password..."
              className="w-full pl-4 pr-11 py-3 text-xs bg-muted/40 border border-emerald-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-mono transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
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
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="md"
            variant="primary"
            disabled={isSaving}
            className="rounded-full text-xs font-semibold px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {/* Section 4: Account Actions (Pause & Delete Account) */}
      <section className="pt-8 border-t border-border/60 space-y-6">
        <h2 className="text-xl font-bold text-foreground">Account Controls & Status</h2>

        {/* Pause Account Option */}
        <div className="p-8 rounded-3xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
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
        <div className="p-8 rounded-3xl bg-destructive/5 border border-destructive/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Permanently Delete Account
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Once deleted, your profile data, author bio, reading lists, and custom preferences will be permanently wiped. This action cannot be undone.
            </p>
          </div>

          <Button
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card p-8 rounded-3xl border border-destructive/40 space-y-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Confirm Account Deletion</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete your InkFlow account? All profile details, reading history, and saved preferences will be erased permanently.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleDeleteAccount}
                className="rounded-full text-xs bg-destructive text-white hover:bg-destructive/90"
              >
                Confirm &amp; Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
