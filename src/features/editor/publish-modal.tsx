'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Folder, Plus, Camera, Search, RotateCcw, Link as LinkIcon, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/use-editor-store';
import { BlogService, mockCategories } from '@/services/blog.service';
import { Category } from '@/types';
import { searchUnsplash, UnsplashPhoto } from '@/lib/unsplash-search';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: () => Promise<void>;
  isPublished?: boolean;
}

export function PublishModal({
  isOpen,
  onClose,
  onConfirmPublish,
  isPublished = false,
}: PublishModalProps) {
  const { currentPost, updateField } = useEditorStore();
  const [publishing, setPublishing] = useState(false);

  // Extract all images from the story content
  const storyImages = React.useMemo(() => {
    if (!currentPost.content) return [];
    const matches = [...currentPost.content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
    const urls = matches.map((m) => m[1].replace(/&amp;/g, '&')).filter(Boolean);
    return Array.from(new Set(urls));
  }, [currentPost.content]);

  // Image Picker State
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imagePickerTab, setImagePickerTab] = useState<'story' | 'unsplash' | 'url'>('story');
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([]);
  const [isSearchingUnsplash, setIsSearchingUnsplash] = useState(false);

  // If current coverImage is empty or default placeholder and story has images, auto-assign first image
  useEffect(() => {
    if (
      storyImages.length > 0 &&
      (!currentPost.coverImage || currentPost.coverImage.includes('photo-1618005182384-a83a8bd57fbe'))
    ) {
      updateField('coverImage', storyImages[0]);
    }
  }, [storyImages, currentPost.coverImage, updateField]);

  // Set default tab to 'story' if story has images, else 'unsplash'
  useEffect(() => {
    if (storyImages.length > 0) {
      setImagePickerTab('story');
    } else {
      setImagePickerTab('unsplash');
    }
  }, [storyImages.length]);

  const handleSearchUnsplash = async (q: string) => {
    setIsSearchingUnsplash(true);
    try {
      const results = await searchUnsplash(q || currentPost.title || 'nature');
      setUnsplashResults(results.slice(0, 9));
    } finally {
      setIsSearchingUnsplash(false);
    }
  };

  useEffect(() => {
    if (showImagePicker && imagePickerTab === 'unsplash' && unsplashResults.length === 0) {
      handleSearchUnsplash(unsplashQuery || currentPost.title || '');
    }
  }, [showImagePicker, imagePickerTab]);

  // Topics & Categories State (Max 5)
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<Category[]>(mockCategories);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync selectedCategories from currentPost
  useEffect(() => {
    if (currentPost.category) {
      setSelectedCategories([currentPost.category]);
    }
  }, [currentPost.category]);

  // Fetch available categories from backend API
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await BlogService.getCategories(topicInput);
        setDbCategories(cats);
      } catch (err) {
        // Fallback to mockCategories
      }
    }
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, topicInput]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSelectCategory = (cat: Category) => {
    if (selectedCategories.length >= 5) return;
    if (selectedCategories.some((c) => c.id === cat.id || c.name.toLowerCase() === cat.name.toLowerCase())) {
      setTopicInput('');
      setIsDropdownOpen(false);
      return;
    }

    const updated = [...selectedCategories, cat];
    setSelectedCategories(updated);
    updateField('category', updated[0]);
    setTopicInput('');
    setIsDropdownOpen(false);
  };

  const handleCreateNewCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || selectedCategories.length >= 5) return;

    try {
      const newCat = await BlogService.createCategory(trimmed);
      handleSelectCategory(newCat);
    } catch (err) {
      const fallbackCat: Category = {
        id: `cat_${Date.now()}`,
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: `${trimmed} topic`,
        color: 'from-emerald-500 to-teal-600',
        postCount: 0,
      };
      handleSelectCategory(fallbackCat);
    }
  };

  const handleRemoveCategory = (catId: string) => {
    const updated = selectedCategories.filter((c) => c.id !== catId);
    setSelectedCategories(updated);
    if (updated.length > 0) {
      updateField('category', updated[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = topicInput.trim();
      if (!trimmed) return;

      const exactMatch = dbCategories.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (exactMatch) {
        handleSelectCategory(exactMatch);
      } else {
        handleCreateNewCategory(trimmed);
      }
    }
  };

  const handleConfirm = async () => {
    setPublishing(true);
    try {
      if (selectedCategories.length > 0) {
        updateField('category', selectedCategories[0]);
      } else {
        updateField('category', mockCategories[0]);
      }
      await onConfirmPublish();
    } finally {
      setPublishing(false);
    }
  };

  // Filter categories matching query that aren't already selected
  const matchingCategories = dbCategories.filter(
    (cat) =>
      !selectedCategories.some((c) => c.id === cat.id || c.name.toLowerCase() === cat.name.toLowerCase()) &&
      (topicInput === '' || cat.name.toLowerCase().includes(topicInput.toLowerCase()))
  );

  const showNewOption =
    topicInput.trim() !== '' &&
    !dbCategories.some((c) => c.name.toLowerCase() === topicInput.trim().toLowerCase());

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Card - Medium Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-card border border-border/80 rounded-3xl p-6 sm:p-10 shadow-2xl z-10 space-y-8 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Story Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground tracking-tight">Story preview</h3>
                <button
                  type="button"
                  onClick={() => setShowImagePicker((prev) => !prev)}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {showImagePicker ? 'Hide picker' : 'Change preview image'}
                </button>
              </div>

              <div className="aspect-[16/10] w-full rounded-2xl bg-muted/60 border border-border flex items-center justify-center overflow-hidden relative group">
                {currentPost.coverImage ? (
                  <Image src={currentPost.coverImage} alt="Cover Preview" fill className="object-cover" />
                ) : (
                  <p className="text-xs text-muted-foreground text-center px-6 leading-relaxed">
                    Include a high-quality image in your story to make it more inviting to readers.
                  </p>
                )}

                {/* Quick overlay change image button */}
                <button
                  type="button"
                  onClick={() => setShowImagePicker((prev) => !prev)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-xs cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Change preview image</span>
                </button>
              </div>

              {/* Image Picker Panel */}
              <AnimatePresence>
                {showImagePicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-3 overflow-hidden text-xs"
                  >
                    {/* Tabs */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex gap-1.5">
                        {storyImages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setImagePickerTab('story')}
                            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                              imagePickerTab === 'story'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            From story ({storyImages.length})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setImagePickerTab('unsplash')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            imagePickerTab === 'unsplash'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Unsplash
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagePickerTab('url')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            imagePickerTab === 'url'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Custom URL
                        </button>
                      </div>

                      {storyImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => updateField('coverImage', storyImages[0])}
                          title="Reset to first image from story"
                          className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>First image</span>
                        </button>
                      )}
                    </div>

                    {/* Tab: Story Images */}
                    {imagePickerTab === 'story' && storyImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-muted-foreground">
                          Choose any image from your story content to feature as the cover:
                        </p>
                        <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                          {storyImages.map((imgUrl, i) => {
                            const isSelected = currentPost.coverImage === imgUrl;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => updateField('coverImage', imgUrl)}
                                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                                  isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-foreground/40'
                                }`}
                              >
                                <img src={imgUrl} alt={`Story image ${i + 1}`} className="w-full h-full object-cover" />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 p-0.5 rounded-full bg-primary text-primary-foreground shadow">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] bg-black/60 text-white backdrop-blur-xs">
                                  #{i + 1}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tab: Unsplash */}
                    {imagePickerTab === 'unsplash' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Search Unsplash photos..."
                            value={unsplashQuery}
                            onChange={(e) => setUnsplashQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchUnsplash(unsplashQuery)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-primary"
                          />
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleSearchUnsplash(unsplashQuery)}
                            className="h-8 text-xs cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                          {unsplashResults.map((photo) => {
                            const isSelected = currentPost.coverImage === photo.url;
                            return (
                              <button
                                key={photo.id}
                                type="button"
                                onClick={() => updateField('coverImage', photo.url)}
                                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                                  isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-foreground/40'
                                }`}
                              >
                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 p-0.5 rounded-full bg-primary text-primary-foreground shadow">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tab: Custom URL */}
                    {imagePickerTab === 'url' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={customImageUrl}
                            onChange={(e) => setCustomImageUrl(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-primary"
                          />
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              if (customImageUrl.trim()) {
                                updateField('coverImage', customImageUrl.trim());
                                setCustomImageUrl('');
                              }
                            }}
                            className="h-8 text-xs cursor-pointer"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 pt-1 border-b border-border/60 pb-4">
                <h2 className="text-xl font-bold font-serif text-foreground line-clamp-2">
                  {currentPost.title || 'Untitled Story'}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {currentPost.subtitle || currentPost.excerpt || 'No subtitle added.'}
                </p>
                <p className="text-[11px] text-muted-foreground/60 pt-1">
                  Note: Changes here will affect how your story appears in public places like InkFlow's homepage and in subscribers' inboxes.
                </p>
              </div>
            </div>

            {/* Right: Topics / Categories Section (Medium Replica) */}
            <div className="space-y-5" ref={dropdownRef}>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground tracking-tight">Topics</h3>
                <p className="text-xs text-muted-foreground">
                  Add up to five topics to help readers find your story.
                </p>
              </div>

              {/* Topics Pill Input Box */}
              <div className="relative">
                <div
                  onClick={() => setIsDropdownOpen(true)}
                  className="flex flex-wrap gap-2 p-3.5 rounded-2xl bg-muted/30 border border-border focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-primary/20 min-h-[56px] transition-all cursor-text"
                >
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-semibold border border-border/80 shadow-xs"
                    >
                      {cat.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCategory(cat.id);
                        }}
                        className="hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}

                  {selectedCategories.length < 5 && (
                    <input
                      type="text"
                      value={topicInput}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setTopicInput(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={selectedCategories.length === 0 ? 'Add a topic...' : 'Add more topics...'}
                      className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 min-w-[140px] py-1"
                    />
                  )}
                </div>

                {/* Topics Dropdown (Matching Screenshot 2 & 3) */}
                <AnimatePresence>
                  {isDropdownOpen && selectedCategories.length < 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto font-sans"
                    >
                      {/* Show "(new)" option if typed topic does not exist in DB */}
                      {showNewOption && (
                        <div
                          onClick={() => handleCreateNewCategory(topicInput)}
                          className="px-4 py-3 hover:bg-muted/80 text-xs font-medium text-foreground cursor-pointer flex items-center justify-between border-b border-border/60 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{topicInput.trim()}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-sans">
                            (new)
                          </span>
                        </div>
                      )}

                      {/* Matching Categories List */}
                      {matchingCategories.length > 0 ? (
                        matchingCategories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => handleSelectCategory(cat)}
                            className="px-4 py-2.5 hover:bg-muted/80 text-xs font-medium text-foreground cursor-pointer flex items-center justify-between transition-colors border-b border-border/40 last:border-none"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {cat.postCount > 0 ? `${cat.postCount * 1.2}K` : 'Topic'}
                            </span>
                          </div>
                        ))
                      ) : !showNewOption ? (
                        <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                          No matching topics found
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Publish Actions */}
              <div className="pt-6 border-t border-border/60 flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  disabled={publishing}
                  onClick={handleConfirm}
                  className="rounded-full text-xs font-semibold px-6 py-2.5 bg-foreground text-background hover:opacity-90 transition-opacity shadow-md"
                >
                  {publishing ? 'Publishing...' : isPublished ? 'Publish changes' : 'Publish now'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  className="rounded-full text-xs font-medium border-none hover:bg-muted"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
