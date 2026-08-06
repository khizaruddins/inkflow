'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/user-dropdown';
import { useAuthStore } from '@/store/use-auth-store';
import { useEditorStore } from '@/store/use-editor-store';

interface EditorNavbarProps {
  onPublish: () => void;
  onOpenSEO: () => void;
}

export function EditorNavbar({ onPublish, onOpenSEO }: EditorNavbarProps) {
  const { user } = useAuthStore();
  const { saveStatus } = useEditorStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/40 transition-all">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black font-serif tracking-tight text-foreground">
              InkFlow
            </span>
          </Link>
          <span className="text-xs font-sans text-muted-foreground font-medium border-l border-border pl-3">
            Draft in {user?.name || 'Story'}
          </span>
          {saveStatus === 'saving' ? (
            <span className="text-[11px] text-amber-500 dark:text-amber-400 font-sans animate-pulse font-medium">Saving...</span>
          ) : saveStatus === 'saved' ? (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans flex items-center gap-1 font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-500" /> Saved
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground font-sans font-medium">Draft</span>
          )}
        </div>

        {/* Right: Publish Pill & Tools */}
        <div className="flex items-center gap-4">
          <button
            onClick={onPublish}
            className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-sans tracking-wide transition-colors cursor-pointer shadow-xs"
          >
            Publish
          </button>

          <button
            onClick={onOpenSEO}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Story & SEO Settings"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden sm:block">
            <Bell className="w-4 h-4" />
          </button>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
