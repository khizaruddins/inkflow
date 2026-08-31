'use client';

import React, { useState } from 'react';
import { Folder, Plus, Edit, Trash2 } from 'lucide-react';
import { mockCategories } from '@/services/blog.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleAddCategory = () => {
    if (!newCatName) return;
    const newCat = {
      id: `cat_${Date.now()}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      description: newCatDesc,
      postCount: 0,
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-[calc(100vh-14rem)] font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize posts into structured main topics.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)} className="rounded-xl gap-1.5">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="p-5 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">{cat.name}</h3>
              </div>
              <Badge variant="outline">{cat.postCount} Posts</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{cat.description || 'No description provided.'}</p>
            <div className="text-[11px] font-mono text-muted-foreground">/category/{cat.slug}</div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Category Name</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Cloud Architecture"
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <textarea
              rows={3}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Brief summary..."
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAddCategory}>Save Category</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
