'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, UserCheck } from 'lucide-react';
import { EditorNavbar } from '@/features/editor/editor-navbar';
import { TipTapEditor } from '@/features/editor/tiptap-editor';
import { SEODrawer } from '@/features/editor/seo-drawer';
import { useEditorStore, emptyPost } from '@/store/use-editor-store';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { Button } from '@/components/ui/button';

export default function NewPostPage() {
  const router = useRouter();
  const { currentPost, updateField, resetEditor } = useEditorStore();
  const { role, toggleDemoRole } = useAuthStore();
  const [isSEODrawerOpen, setIsSEODrawerOpen] = useState(false);

  useEffect(() => {
    resetEditor(emptyPost);
  }, [resetEditor]);

  if (role === 'reader') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Writer Access Required
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account is currently in <strong>READER</strong> mode. Readers can explore stories, clap, reply to comments, and manage reading lists, but are not permitted to write or publish blog posts.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={toggleDemoRole}
              className="w-full text-xs font-semibold gap-1.5"
            >
              <UserCheck className="w-4 h-4" /> Switch to Writer / Admin Role
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" size="md" className="w-full text-xs font-semibold gap-1">
                <ArrowLeft className="w-4 h-4" /> Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePublish = async () => {
    await BlogService.createPost({
      ...currentPost,
      status: 'published',
    });
    router.push('/dashboard/posts');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Authentic Medium Top Bar */}
      <EditorNavbar
        onPublish={handlePublish}
        onOpenSEO={() => setIsSEODrawerOpen(true)}
      />

      {/* Seamless Writing Canvas */}
      <main className="max-w-4xl mx-auto py-12 px-12 sm:px-16 md:px-20 space-y-4">
        {/* Title Input */}
        <input
          type="text"
          value={currentPost.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Title"
          className="w-full text-5xl md:text-6xl font-serif font-medium tracking-tight bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 leading-tight"
        />

        {/* Subtitle Input */}
        <input
          type="text"
          value={currentPost.subtitle || ''}
          onChange={(e) => updateField('subtitle', e.target.value)}
          placeholder="Add a subtitle..."
          className="w-full text-xl md:text-2xl font-serif text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30 mb-8"
        />

        {/* TipTap Rich Text Editor */}
        <TipTapEditor />
      </main>

      {/* SEO & Publishing Settings Drawer */}
      <SEODrawer isOpen={isSEODrawerOpen} onClose={() => setIsSEODrawerOpen(false)} />
    </div>
  );
}
