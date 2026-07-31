'use client';

import React, { useState } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';
import { mockTags } from '@/services/blog.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function TagsPage() {
  const [tags, setTags] = useState(mockTags);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = () => {
    if (!newTagName) return;
    const newT = {
      id: `tag_${Date.now()}`,
      name: newTagName,
      slug: newTagName.toLowerCase().replace(/\s+/g, '-'),
      postCount: 0,
    };
    setTags([...tags, newT]);
    setNewTagName('');
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Tags & Keywords</h1>
          <p className="text-sm text-muted-foreground">Manage granular keywords for search indexing.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)} className="rounded-xl gap-1.5">
          <Plus className="w-4 h-4" /> Add Tag
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <div key={tag.id} className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <TagIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-bold text-foreground">#{tag.name}</span>
            </div>
            <Badge variant="secondary">{tag.postCount}</Badge>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Tag">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Tag Name</label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g. GraphQL"
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAddTag}>Save Tag</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
