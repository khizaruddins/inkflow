'use client';

import React from 'react';
import Image from 'next/image';
import { Globe, Search, Share2, Tag as TagIcon, Eye, Folder } from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/use-editor-store';
import { mockCategories, mockTags } from '@/services/blog.service';
import { PostStatus, PostVisibility } from '@/types';

interface SEODrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SEODrawer({ isOpen, onClose }: SEODrawerProps) {
  const { currentPost, updateField, updateSEO } = useEditorStore();
  const seo = currentPost.seo || {
    slug: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    keywords: [],
    ogImage: '',
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Publish & SEO Settings">
      <div className="space-y-6">
        {/* Status & Visibility */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Post Visibility & Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Status</span>
              <select
                value={currentPost.status || 'draft'}
                onChange={(e) => updateField('status', e.target.value as PostStatus)}
                className="w-full p-2 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Visibility</span>
              <select
                value={currentPost.visibility || 'public'}
                onChange={(e) => updateField('visibility', e.target.value as PostVisibility)}
                className="w-full p-2 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" /> Category & Organization
          </label>
          <select
            value={currentPost.category?.slug || mockCategories[0].slug}
            onChange={(e) => {
              const cat = mockCategories.find((c) => c.slug === e.target.value);
              if (cat) updateField('category', cat);
            }}
            className="w-full p-2 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {mockCategories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> URL Slug
          </label>
          <input
            type="text"
            value={currentPost.slug || ''}
            onChange={(e) => updateField('slug', e.target.value)}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono"
          />
        </div>

        {/* Meta Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Meta Title
          </label>
          <input
            type="text"
            value={seo.metaTitle || currentPost.title || ''}
            onChange={(e) => updateSEO('metaTitle', e.target.value)}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Meta Description</label>
          <textarea
            rows={3}
            value={seo.metaDescription || currentPost.excerpt || ''}
            onChange={(e) => updateSEO('metaDescription', e.target.value)}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
          />
        </div>

        {/* Cover Image & OG Preview */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Cover Image & OG Social Preview
          </label>
          <input
            type="text"
            value={currentPost.coverImage || ''}
            onChange={(e) => updateField('coverImage', e.target.value)}
            placeholder="Image URL"
            className="w-full p-2 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono mb-2"
          />
          {currentPost.coverImage && (
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border">
              <Image src={currentPost.coverImage} alt="OG Preview" fill className="object-cover" />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose} className="w-full rounded-xl">
            Save SEO Settings
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
