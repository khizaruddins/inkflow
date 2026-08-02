'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useHighlightStore } from '@/store/use-highlight-store';
import { LibraryService, ReadingHistoryItem } from '@/services/library.service';
import { Bookmark, Lock, Plus, MoreHorizontal, BookmarkPlus, X, Trash2, Clock, BookOpen, Layers } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export default function LibraryPage() {
  const { lists, bookmarkedIds, createList } = useBookmarkStore();
  const { user } = useAuthStore();
  const { highlights, removeHighlight } = useHighlightStore();

  const [activeTab, setActiveTab] = useState<'your-lists' | 'saved-bookmarks' | 'highlights' | 'history'>('your-lists');
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [historyItems, setHistoryItems] = useState<ReadingHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New List Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoadingHistory(true);
      try {
        const data = await LibraryService.getHistory();
        setHistoryItems(data);
      } catch (err) {
        setHistoryItems([]);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, []);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    createList(listName, listDescription, isPrivate);
    setListName('');
    setListDescription('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Your library
          </h1>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="rounded-full px-5 py-2 text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New list
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-border/40 text-sm overflow-x-auto">
        {[
          { id: 'your-lists', label: 'Your lists' },
          { id: 'saved-bookmarks', label: `Saved bookmarks (${bookmarkedIds.length})` },
          { id: 'highlights', label: `Highlights (${highlights.length})` },
          { id: 'history', label: 'Reading history' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Medium Green Banner Promo */}
      {showPromoBanner && activeTab === 'your-lists' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-emerald-700 dark:bg-emerald-800 text-white rounded-3xl p-8 overflow-hidden shadow-xl flex items-center justify-between"
        >
          <div className="space-y-4 max-w-md z-10">
            <h2 className="text-2xl font-bold tracking-tight leading-snug">
              Create a list to easily organize and share stories
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Start a list
            </button>
          </div>

          <button
            onClick={() => setShowPromoBanner(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex w-36 h-36 rounded-full bg-emerald-600/40 items-center justify-center -mr-6">
            <div className="w-14 h-14 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-lg">
              <BookmarkPlus className="w-7 h-7" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Content 1: Your Lists */}
      {activeTab === 'your-lists' && (
        <div className="space-y-4">
          {lists.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-4 font-sans">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No custom lists found</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Organize stories into private or public lists to curate your reading collections.
                </p>
              </div>
              <Button size="sm" variant="primary" onClick={() => setShowCreateModal(true)} className="rounded-full px-5 text-xs">
                Create First List
              </Button>
            </div>
          ) : (
            lists.map((list) => (
              <Link key={list.id} href={`/library/lists/${list.id}`} className="block">
                <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-3xl bg-card border border-border/60 hover:border-border transition-all shadow-xs cursor-pointer">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <img src={user?.avatar} alt={user?.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-semibold text-foreground">{user?.name}</span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {list.name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{list.postIds.length} {list.postIds.length === 1 ? 'story' : 'stories'}</span>
                      {list.isPrivate && <Lock className="w-3.5 h-3.5 text-muted-foreground/70" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-4 overflow-hidden py-1">
                      {list.coverImages.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={list.name}
                          className="inline-block h-16 w-20 rounded-xl object-cover ring-2 ring-background shadow-md"
                        />
                      ))}
                    </div>
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Tab Content 2: Saved Bookmarks */}
      {activeTab === 'saved-bookmarks' && (
        <div className="space-y-4 font-sans">
          {bookmarkedIds.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No saved bookmarks yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Click the bookmark icon on any story card to save articles here for later reading.
                </p>
              </div>
              <Link href="/" className="inline-block px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                Explore Feed
              </Link>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Saved Articles ({bookmarkedIds.length})</h3>
              <p className="text-xs text-muted-foreground">Articles saved by clicking the bookmark icon on story cards.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Highlights */}
      {activeTab === 'highlights' && (
        <div className="space-y-4">
          {highlights.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-4 font-sans">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No text highlights saved</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Select text on any story page to highlight and save memorable quotes here.
                </p>
              </div>
            </div>
          ) : (
            highlights.map((hl) => (
              <div key={hl.id} className="p-6 rounded-3xl bg-card border border-border/60 space-y-3 font-sans relative group">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Link href={`/blog/${hl.postSlug}`} className="font-bold text-foreground hover:underline line-clamp-1">
                    {hl.postTitle}
                  </Link>
                  <span>{hl.createdAt}</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border-l-4 border-emerald-500 text-xs text-foreground font-serif leading-relaxed italic">
                  "{hl.text}"
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">You highlighted</span>
                  <button
                    onClick={() => removeHighlight(hl.id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Unhighlight
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 4: Reading History (Offloaded to API) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Recently Viewed Stories (API Driven)</h3>
          </div>

          {loadingHistory ? (
            <div className="p-12 rounded-3xl bg-card border border-border/60 text-center text-xs text-muted-foreground animate-pulse">
              Loading reading history from backend database...
            </div>
          ) : historyItems.length === 0 ? (
            /* Visual empty state card */
            <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-4 font-sans">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">No reading activity found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  You haven't read any stories recently. Read articles across InkFlow and your browsing history will automatically sync to your account.
                </p>
              </div>
              <Link href="/" className="inline-block px-6 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity shadow-md">
                Start Reading Stories
              </Link>
            </div>
          ) : (
            historyItems.map((item) => (
              <div key={item.id} className="p-6 rounded-3xl bg-card border border-border/60 flex items-center justify-between gap-6">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{item.authorName}</span>
                    <span>•</span>
                    <span>{new Date(item.viewedAt).toLocaleDateString()}</span>
                  </div>
                  <Link href={`/blog/${item.postSlug}`}>
                    <h4 className="text-base font-bold text-foreground hover:underline line-clamp-1">
                      {item.postTitle}
                    </h4>
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.postExcerpt}</p>
                </div>

                {item.coverImage && (
                  <img src={item.coverImage} alt={item.postTitle} className="w-20 h-16 rounded-xl object-cover border border-border" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create List Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create new list">
        <form onSubmit={handleCreateList} className="space-y-4 font-sans text-left">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">List Name</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g. Frontend Architecture Notes"
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description (optional)</label>
            <input
              type="text"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="Add a brief description..."
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPrivateCheck"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-border text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <label htmlFor="isPrivateCheck" className="text-xs text-foreground cursor-pointer flex items-center gap-1 font-medium">
              <Lock className="w-3.5 h-3.5" /> Make list private
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Create List
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
