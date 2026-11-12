'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ImageWithSkeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/use-auth-store';
import { Lock, Camera, AlertCircle } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateProfile, privateNotesPassword, setPrivateNotesPassword } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState(privateNotesPassword || 'secretpassword');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
      setError(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (privateNotesPassword !== undefined) {
      setPassword(privateNotesPassword);
    }
  }, [privateNotesPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Display name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ name, username, avatar, bio });
      setPrivateNotesPassword(password);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unable to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit profile & Private notes password">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Avatar Preview & URL */}
        <div className="flex items-center gap-4 py-2 border-b border-border/60 pb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-md shrink-0">
            <ImageWithSkeleton
              src={avatar || user?.avatar}
              alt={name || 'Profile avatar'}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label htmlFor="modal-avatar" className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Avatar Image URL
            </label>
            <input
              id="modal-avatar"
              name="avatar"
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              autoComplete="photo"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full p-2 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Display Name & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="modal-name" className="text-xs font-semibold text-foreground">
              Display Name <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <input
              id="modal-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="modal-username" className="text-xs font-semibold text-foreground">
              Username
            </label>
            <input
              id="modal-username"
              name="username"
              type="text"
              minLength={2}
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-mono"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label htmlFor="modal-bio" className="text-xs font-semibold text-foreground">Short Bio</label>
          <textarea
            id="modal-bio"
            name="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio..."
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
          />
        </div>

        {/* Encrypted Notes Master Password */}
        <div className="space-y-1.5 pt-2 border-t border-border/60">
          <label htmlFor="modal-notes-password" className="text-xs font-semibold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Lock className="w-3.5 h-3.5" /> Private Notes Encryption Password
          </label>
          <input
            id="modal-notes-password"
            name="privateNotesPassword"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set master encryption password..."
            className="w-full p-2.5 text-xs bg-muted/50 border border-emerald-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-mono"
          />
          <p className="text-[10px] text-muted-foreground">
            Used to lock and unlock your private posts and notes across InkFlow.
          </p>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
          <Button size="sm" variant="ghost" type="button" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" isLoading={isSaving} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
