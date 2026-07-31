'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, HelpCircle, Sparkles, LogOut, User as UserIcon, Award } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export function UserDropdown() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative inline-block text-left font-sans z-50">
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 focus:outline-none cursor-pointer group"
        title="Account menu"
      >
        <Image
          src={user.avatar}
          alt={user.name}
          width={36}
          height={36}
          className="rounded-full ring-2 ring-primary/30 group-hover:ring-primary transition-all object-cover"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click outside */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Dropdown Menu Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 rounded-3xl bg-card border border-border/80 shadow-2xl z-50 overflow-hidden py-3 font-sans"
            >
              {/* Header Profile Section */}
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors group"
              >
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-border"
                />
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {user.name}
                  </h4>
                  <span className="text-[11px] text-muted-foreground block">View profile</span>
                </div>
              </Link>

              <div className="h-px bg-border/40 my-2" />

              {/* Menu Items */}
              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  Profile
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>

                <Link
                  href="/library"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <Award className="w-4 h-4 text-muted-foreground" />
                  Partner Program
                </Link>

                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  Help
                </Link>
              </div>

              <div className="h-px bg-border/40 my-2" />

              {/* Become a Member Banner */}
              <div className="px-4 py-2 flex items-center justify-between text-xs text-foreground font-semibold hover:bg-muted/40 cursor-pointer transition-colors">
                <span>Become an InkFlow member</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              </div>

              <div className="h-px bg-border/40 my-2" />

              {/* Sign out section */}
              <div className="px-4 py-2 space-y-1">
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-xs text-foreground hover:text-destructive font-semibold transition-colors block cursor-pointer"
                >
                  Sign out
                </button>
                <span className="text-[10px] text-muted-foreground/70 block truncate">
                  {user.email}
                </span>
              </div>

              <div className="h-px bg-border/40 my-2" />

              {/* Footer Links */}
              <div className="px-4 py-1 text-[10px] text-muted-foreground/60 flex flex-wrap gap-1.5 leading-tight">
                <span>About</span> • <span>Blog</span> • <span>Careers</span> • <span>Privacy</span> • <span>Terms</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
