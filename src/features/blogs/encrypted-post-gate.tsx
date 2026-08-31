'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/use-auth-store';

interface EncryptedPostGateProps {
  children: React.ReactNode;
  isPrivate?: boolean;
}

export function EncryptedPostGate({ children, isPrivate = false }: EncryptedPostGateProps) {
  const { privateNotesPassword } = useAuthStore();
  const [isUnlocked, setIsUnlocked] = useState(!isPrivate);
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isPrivate || isUnlocked) {
    return <>{children}</>;
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPassword = privateNotesPassword || 'secretpassword';
    if (inputPassword === targetPassword) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="relative py-16 px-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-card border border-border/80 rounded-3xl p-8 shadow-2xl text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground tracking-tight">
            Encrypted Private Story
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This article is locked with password encryption. Please enter the master password set on the profile to decrypt and read.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter master password..."
              className="w-full pl-10 pr-11 py-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground transition-all"
              autoFocus
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

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5" />
              Incorrect master password. Try again!
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-2.5 text-xs font-semibold">
            Unlock & Read Story
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground/60">
          Demo Default Password: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">secretpassword</code>
        </p>
      </motion.div>
    </div>
  );
}
