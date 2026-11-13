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
  isPublished?: boolean;
  hasChanges?: boolean;
  showPublishButton?: boolean;
}

export function EditorNavbar({
  onPublish,
  onOpenSEO,
  isPublished = false,
  hasChanges = false,
  showPublishButton,
}: EditorNavbarProps) {
  const { user } = useAuthStore();
  const { saveStatus, currentPost } = useEditorStore();

  const published = isPublished || currentPost.status === 'published';
  const shouldShowPublish =
    showPublishButton !== undefined ? showPublishButton : (!published || hasChanges);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/40 transition-all">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-black font-serif tracking-tight text-foreground group-hover:opacity-90 transition-opacity">
              Ink<span className="text-primary font-sans">Flow</span>
            </span>
          </Link>
          <span className="text-xs font-sans text-muted-foreground font-medium border-l border-border pl-3">
            {published ? 'Published in' : 'Draft in'} {user?.name || currentPost.author?.name || 'Story'}
          </span>
          {saveStatus === 'saving' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-sans font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Saving draft...
            </span>
          ) : saveStatus === 'saved' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Saved
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground font-sans font-medium px-2 py-0.5">
              {published ? 'Published' : 'Draft'}
            </span>
          )}
        </div>

        {/* Right: Publish Pill & Tools */}
        <div className="flex items-center gap-4">
          {shouldShowPublish && (
            <button
              onClick={onPublish}
              className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-sans tracking-wide transition-colors cursor-pointer shadow-xs animate-in fade-in duration-150"
            >
              Publish
            </button>
          )}

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
