'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/use-auth-store';
import { User, Lock, Camera, User as UserIcon } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, username, avatar, bio });
    setPrivateNotesPassword(password);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit profile & Private notes password">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">
        {/* Avatar Preview & URL */}
        <div className="flex items-center gap-4 py-2 border-b border-border/60 pb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-md flex-shrink-0">
            <img src={avatar || user?.avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Avatar Image URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Short Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio..."
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
          />
        </div>

        {/* Encrypted Notes Master Password */}
        <div className="space-y-1 pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Lock className="w-3.5 h-3.5" /> Private Notes Encryption Password
          </label>
          <input
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
          <Button size="sm" variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
