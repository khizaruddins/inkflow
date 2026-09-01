'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { ClapIcon, MediumClapButton } from '@/components/ui/clap-icon';

interface ClapButtonProps {
  postId: string;
  authorId: string;
  initialClapsCount: number;
  isDraft?: boolean;
}

interface Clapper {
  id: string;
  count: number;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

export function ClapButton({ postId, authorId, initialClapsCount, isDraft }: ClapButtonProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [clapsCount, setClapsCount] = useState(initialClapsCount);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clappers, setClappers] = useState<Clapper[]>([]);
  const [loadingClappers, setLoadingClappers] = useState(false);

  const isSelfAuthor = Boolean(user && user.id === authorId);

  // Fetch public clappers list when modal opens
  useEffect(() => {
    if (isModalOpen) {
      async function loadClappers() {
        setLoadingClappers(true);
        try {
          const list = await BlogService.getPostClappers(postId);
          setClappers(list);
        } catch (e) {
          setClappers([]);
        } finally {
          setLoadingClappers(false);
        }
      }
      loadClappers();
    }
  }, [isModalOpen, postId]);

  const handleClap = async (newTotalClaps: number) => {
    if (isDraft || isSelfAuthor || !isAuthenticated) return;
    setClapsCount(newTotalClaps);
    try {
      await BlogService.clapPost(postId, 1);
    } catch (err) {}
  };

  return (
    <div className="relative inline-flex items-center gap-3 font-sans">
      {/* Medium Clapping Button with Floating Badge */}
      <MediumClapButton
        clapsCount={clapsCount}
        onClap={handleClap}
        disabled={isDraft || isSelfAuthor || !isAuthenticated}
        disabledTooltip={
          isDraft
            ? 'Clapping is disabled for drafted stories. Publish the story to enable claps.'
            : isSelfAuthor
            ? 'Authors cannot clap for their own story'
            : !isAuthenticated
            ? 'Sign in to clap for this story'
            : undefined
        }
        size="md"
        circular={true}
      />

      {/* View Clappers Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline cursor-pointer flex items-center gap-1"
      >
        <Users className="w-3.5 h-3.5 text-muted-foreground" />
        <span>Who clapped</span>
      </button>

      {/* Clappers Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl z-10 space-y-5 overflow-hidden"
            >
              {/* Close Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-base font-extrabold text-foreground tracking-tight">
                    Claps from readers ({clapsCount})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Clappers List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {loadingClappers ? (
                  <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                    Loading clappers...
                  </div>
                ) : clappers.length > 0 ? (
                  clappers.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={c.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={c.user?.name || 'User'}
                          width={36}
                          height={36}
                          className="rounded-full object-cover border border-border"
                        />
                        <div>
                          <p className="text-xs font-bold text-foreground leading-tight">
                            {c.user?.name || 'Anonymous Reader'}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            @{c.user?.username || 'reader'}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono flex items-center gap-1.5">
                        <ClapIcon className="w-3.5 h-3.5 text-emerald-500" filled />
                        {c.count} {c.count === 1 ? 'clap' : 'claps'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Be the first reader to clap for this story!
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
