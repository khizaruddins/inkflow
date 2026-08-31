'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, HelpCircle, Sparkles, LogOut, User as UserIcon, Award, UserCheck, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export function UserDropdown() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const userRole = user.role?.toUpperCase() || 'READER';
  const isAdmin = userRole === 'ADMIN';
  const isReader = userRole === 'READER';

  return (
    <div className="relative inline-block text-left font-sans z-50">
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full overflow-hidden flex items-center justify-center focus:outline-none cursor-pointer group shrink-0"
        title="Account menu"
      >
        <Image
          src={user.avatar}
          alt={user.name}
          width={36}
          height={36}
          className="rounded-full aspect-square w-full h-full ring-2 ring-primary/30 group-hover:ring-primary transition-all object-cover"
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
                  className="rounded-full object-cover border border-border aspect-square"
                />
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {user.name}
                  </h4>
                  <span className="text-[11px] text-muted-foreground block truncate">{userRole}</span>
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
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      href="/dashboard/applications"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      Creator Applications Approval
                    </Link>

                    <Link
                      href="/dashboard/review"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Editorial Review Queue
                    </Link>
                  </>
                )}

                <Link
                  href="/library"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <Award className="w-4 h-4 text-muted-foreground" />
                  Library & Saved
                </Link>

                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  Notifications
                </Link>
              </div>

              {/* Become a Creator Banner ONLY for Readers */}
              {isReader && (
                <>
                  <div className="h-px bg-border/40 my-2" />
                  <Link
                    href="/become-creator"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 flex items-center justify-between text-xs text-foreground font-semibold hover:bg-emerald-500/10 cursor-pointer transition-colors block"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Become an InkFlow creator</span>
                    </div>
                  </Link>
                </>
              )}

              <div className="h-px bg-border/40 my-2" />

              {/* Whole Sign Out Row Clickable */}
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await logout();
                  window.location.href = '/';
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-destructive/10 text-destructive text-xs font-semibold transition-colors cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/70 block truncate mt-0.5 font-normal">
                  {user.email}
                </span>
              </button>

              <div className="h-px bg-border/40 my-2" />

              {/* Footer Links (Careers removed, real links added) */}
              <div className="px-4 py-1 text-[10px] text-muted-foreground/60 flex flex-wrap gap-1.5 leading-tight">
                <Link href="/about" onClick={() => setIsOpen(false)} className="hover:underline hover:text-foreground">About</Link> • 
                <Link href="/blog" onClick={() => setIsOpen(false)} className="hover:underline hover:text-foreground">Blog</Link> • 
                <Link href="/privacy" onClick={() => setIsOpen(false)} className="hover:underline hover:text-foreground">Privacy</Link> • 
                <Link href="/terms" onClick={() => setIsOpen(false)} className="hover:underline hover:text-foreground">Terms</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
