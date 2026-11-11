'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { X, Users, Sparkles, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { ClapIcon, MediumClapButton } from '@/components/ui/clap-icon';
import { ImageWithSkeleton, Skeleton, SkeletonCircle } from '@/components/ui/skeleton';
import { redirectToLogin, isUnauthorizedError } from '@/lib/auth-redirect';

interface ClapButtonProps {
  postId: string;
  authorId: string;
  initialClapsCount: number;
  isDraft?: boolean;
  unlockToken?: string;
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

export function ClapButton({
  postId,
  authorId,
  initialClapsCount,
  isDraft,
  unlockToken,
}: ClapButtonProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [clapsCount, setClapsCount] = useState(initialClapsCount);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clappers, setClappers] = useState<Clapper[]>([]);
  const [loadingClappers, setLoadingClappers] = useState(false);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pointerStartedOnBackdropRef = useRef(false);
  const modalTitleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setClapsCount(initialClapsCount);
  }, [initialClapsCount]);

  const showAuthState = mounted && isAuthenticated && Boolean(user);
  const isSelfAuthor = Boolean(user && user.id === authorId);

  const fetchClappers = async () => {
    if (!isAuthenticated || !user) {
      redirectToLogin();
      return;
    }
    setLoadingClappers(true);
    try {
      const list = await BlogService.getPostClappers(postId, unlockToken);
      setClappers(list);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        dialogRef.current?.close();
        setIsModalOpen(false);
        redirectToLogin();
      }
    } finally {
      setLoadingClappers(false);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isModalOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      fetchClappers();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isModalOpen]);

  const handleClap = async (newTotalClaps: number) => {
    if (isDraft || isSelfAuthor) return;
    if (!isAuthenticated || !user) {
      redirectToLogin();
      throw new Error('LOGIN_REQUIRED');
    }

    const prevClaps = clapsCount;
    setClapsCount(newTotalClaps);
    try {
      const serverCount = await BlogService.clapPost(postId, 1, unlockToken);
      if (typeof serverCount === 'number' && serverCount >= newTotalClaps) {
        setClapsCount(serverCount);
      }
    } catch (err) {
      setClapsCount(prevClaps);
      if (isUnauthorizedError(err)) {
        redirectToLogin();
      }
      throw err;
    }
  };

  const handleWhoClappedClick = () => {
    if (!isAuthenticated || !user) {
      redirectToLogin();
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const supportsClosedBy =
    typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

  return (
    <div className="flex items-center gap-3 font-sans">
      <MediumClapButton
        clapsCount={clapsCount}
        onClap={handleClap}
        onRequireAuth={!showAuthState ? () => redirectToLogin() : undefined}
        hideCount={!showAuthState}
        disabled={Boolean(isDraft || isSelfAuthor)}
        disabledTooltip={
          !showAuthState
            ? 'Sign in to view claps & clap'
            : isDraft
            ? 'Claps are disabled on draft previews'
            : isSelfAuthor
            ? 'Authors cannot clap for their own stories'
            : undefined
        }
        size="md"
        circular={true}
      />

      {showAuthState ? (
        <button
          type="button"
          onClick={handleWhoClappedClick}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-sans cursor-pointer group"
          title="View who clapped for this story"
        >
          <span className="group-hover:underline font-medium">
            {clapsCount} {clapsCount === 1 ? 'clap' : 'claps'}
          </span>
          <Users className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => redirectToLogin()}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 font-sans cursor-pointer group"
          title="Sign in to view who clapped"
        >
          <Lock className="w-3 h-3 opacity-75" />
          <span className="group-hover:underline font-medium">Who clapped</span>
        </button>
      )}

      {/* Native <dialog> Clappers Modal */}
      <dialog
        ref={dialogRef}
        aria-labelledby={modalTitleId}
        {...({ closedby: 'any' } as Record<string, string>)}
        onClose={() => setIsModalOpen(false)}
        onPointerDown={(e) => {
          if (!supportsClosedBy) {
            pointerStartedOnBackdropRef.current = e.target === dialogRef.current;
          }
        }}
        onPointerUp={(e) => {
          if (!supportsClosedBy && pointerStartedOnBackdropRef.current && e.target === dialogRef.current) {
            closeModal();
          }
          pointerStartedOnBackdropRef.current = false;
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md bg-card text-foreground border border-border/80 rounded-3xl p-0 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-xs font-sans open:block"
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 id={modalTitleId} className="text-base font-extrabold text-foreground tracking-tight">
                Claps from readers ({clapsCount})
              </h3>
            </div>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close claps modal"
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clappers List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {loadingClappers ? (
              <div aria-hidden="true" className="space-y-3 py-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40"
                  >
                    <div className="flex items-center gap-3">
                      <SkeletonCircle size={36} />
                      <div className="space-y-1.5">
                        <Skeleton className="w-28 h-3.5" />
                        <Skeleton className="w-20 h-3" />
                      </div>
                    </div>
                    <Skeleton variant="pill" className="w-16 h-6" />
                  </div>
                ))}
              </div>
            ) : clappers.length > 0 ? (
              clappers.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/30 border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <ImageWithSkeleton
                      src={
                        c.user?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                      }
                      alt={c.user?.name || 'User'}
                      width={36}
                      height={36}
                      wrapperClassName="w-9 h-9 rounded-full shrink-0"
                      className="rounded-full object-cover border border-border w-full h-full"
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
        </div>
      </dialog>
    </div>
  );
}
