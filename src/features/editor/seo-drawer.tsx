'use client';

import React from 'react';
import { Globe, Search, Share2, Eye, Folder } from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ImageWithSkeleton } from '@/components/ui/skeleton';
import { useEditorStore } from '@/store/use-editor-store';
import { useAuthStore } from '@/store/use-auth-store';
import { mockCategories } from '@/services/blog.service';
import { PostStatus } from '@/types';
import { PrivateVisibilityControls } from './private-visibility-controls';

interface SEODrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SEODrawer({ isOpen, onClose }: SEODrawerProps) {
  const { currentPost, updateField, updateSEO } = useEditorStore();
  const { role } = useAuthStore();
  const isReaderOnly = String(role || 'reader').toLowerCase() === 'reader';

  const seo = currentPost.seo || {
    slug: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    keywords: [],
    ogImage: '',
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Publish &amp; Private Settings">
      <div className="space-y-6">
        {/* Status */}
        <div className="space-y-2">
          <label htmlFor="seo-post-status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Publishing Status
          </label>
          <select
            id="seo-post-status"
            value={currentPost.status || 'draft'}
            onChange={(e) => updateField('status', e.target.value as PostStatus)}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Private & Public Visibility Controls */}
        <PrivateVisibilityControls
          compact
          visibility={currentPost.visibility || 'public'}
          privateLockType={currentPost.privateLockType || 'NONE'}
          secretPassword={currentPost.secretPassword || ''}
          hasExistingPassword={Boolean(currentPost.hasPassword)}
          allowLinkPasswordAccess={currentPost.allowLinkPasswordAccess ?? true}
          requirePasswordForGrantedUsers={Boolean(currentPost.requirePasswordForGrantedUsers)}
          requireFollowerToView={Boolean(currentPost.requireFollowerToView)}
          isReaderOnly={isReaderOnly}
          onChange={(patch) => {
            if (patch.visibility !== undefined) updateField('visibility', patch.visibility);
            if (patch.privateLockType !== undefined) updateField('privateLockType', patch.privateLockType);
            if (patch.secretPassword !== undefined) updateField('secretPassword', patch.secretPassword);
            if (patch.allowLinkPasswordAccess !== undefined) {
              updateField('allowLinkPasswordAccess', patch.allowLinkPasswordAccess);
            }
            if (patch.requirePasswordForGrantedUsers !== undefined) {
              updateField('requirePasswordForGrantedUsers', patch.requirePasswordForGrantedUsers);
            }
            if (patch.requireFollowerToView !== undefined) {
              updateField('requireFollowerToView', patch.requireFollowerToView);
            }
          }}
        />

        {/* Category & Tags */}
        <div className="space-y-2">
          <label htmlFor="seo-post-category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" /> Category &amp; Organization
          </label>
          <select
            id="seo-post-category"
            value={currentPost.category?.slug || mockCategories[0].slug}
            onChange={(e) => {
              const cat = mockCategories.find((c) => c.slug === e.target.value);
              if (cat) updateField('category', cat);
            }}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
          <label htmlFor="seo-post-slug" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> URL Slug
          </label>
          <input
            id="seo-post-slug"
            type="text"
            value={currentPost.slug || ''}
            onChange={(e) => updateField('slug', e.target.value)}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono"
          />
        </div>

        {/* Meta Title */}
        <div className="space-y-2">
          <label htmlFor="seo-meta-title" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Meta Title
          </label>
          <input
            id="seo-meta-title"
            type="text"
            value={seo.metaTitle || currentPost.title || ''}
            onChange={(e) => updateSEO('metaTitle', e.target.value)}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <label htmlFor="seo-meta-desc" className="text-xs font-semibold text-foreground">
            Meta Description
          </label>
          <textarea
            id="seo-meta-desc"
            rows={3}
            value={seo.metaDescription || currentPost.excerpt || ''}
            onChange={(e) => updateSEO('metaDescription', e.target.value)}
            className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
          />
        </div>

        {/* Cover Image & OG Preview */}
        <div className="space-y-2">
          <label htmlFor="seo-cover-url" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Cover Image &amp; OG Social Preview
          </label>
          <input
            id="seo-cover-url"
            type="text"
            value={currentPost.coverImage || ''}
            onChange={(e) => updateField('coverImage', e.target.value)}
            placeholder="Image URL"
            className="w-full p-2 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono mb-2"
          />
          {currentPost.coverImage && (
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border">
              <ImageWithSkeleton src={currentPost.coverImage} alt="OG Preview" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button type="button" variant="primary" size="sm" onClick={onClose} className="w-full rounded-xl">
            Done
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
