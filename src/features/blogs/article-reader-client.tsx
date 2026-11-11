'use client';

import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Lock,
  ShieldAlert,
  UserPlus,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  KeyRound,
  Ban,
  Clock,
} from 'lucide-react';
import { BlogService } from '@/services/blog.service';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/use-auth-store';
import { extractApiError, redirectToLogin } from '@/lib/auth-redirect';
import {
  clearPrivateUnlockToken,
  getPrivateUnlockToken,
  setPrivateUnlockToken,
} from '@/lib/private-unlock';
import { BlogPost } from '@/types';
import { highlightCodeBlocks } from '@/lib/highlight';
import { CodeBlockEnhancer } from '@/components/code-block-enhancer';
import { TextHighlightPopover } from '@/components/text-highlight-popover';
import { AuthorHeader } from '@/features/blogs/author-header';
import { ReactionBar } from '@/features/blogs/reaction-bar';
import { CommentSection } from '@/features/blogs/comment-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageWithSkeleton } from '@/components/ui/skeleton';
import { ArticlePageSkeleton } from '@/components/skeletons/page-skeletons';

interface ArticleReaderClientProps {
  slug?: string;
  shareToken?: string;
  mode?: 'slug' | 'share-token';
}

interface GateErrorState {
  status?: number;
  code?: string;
  message: string;
  authorId?: string;
  authorName?: string;
}

export function ArticleReaderClient({
  slug,
  shareToken,
  mode = 'slug',
}: ArticleReaderClientProps) {
  const { user, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [gateError, setGateError] = useState<GateErrorState | null>(null);
  const [sessionUnlockToken, setSessionUnlockToken] = useState<string | undefined>(() =>
    getPrivateUnlockToken(undefined, { slug, shareToken })
  );

  // Unlock form state
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  const hasUnlockedInSessionRef = useRef(false);
  const latestPostRef = useRef<BlogPost | null>(null);
  const secretInputId = useId();
  const unlockErrorId = useId();
  const commentsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    latestPostRef.current = post;
  }, [post]);

  // Clear one-time unlock token when leaving an active one-time reading session
  useEffect(() => {
    return () => {
      if (latestPostRef.current?.oneTimeView) {
        clearPrivateUnlockToken(latestPostRef.current.id, { slug, shareToken });
      }
    };
  }, [slug, shareToken]);

  const mapErrorToGate = useCallback((err: any): GateErrorState | null => {
    const parsed = extractApiError(err, 'This story is private or the link is invalid.');
    const code = parsed.code;
    const status = parsed.status;

    if (status === 401 || code === 'LOGIN_REQUIRED') {
      redirectToLogin();
      return null;
    }

    if (status === 403 && code === 'FOLLOW_AUTHOR_REQUIRED') {
      return {
        status,
        code,
        message: 'Follow this author to unlock this private story',
        authorId:
          parsed.data?.authorId ||
          parsed.data?.author?.id ||
          parsed.meta?.authorId ||
          parsed.meta?.author?.id ||
          parsed.payload?.authorId,
        authorName:
          parsed.data?.authorName ||
          parsed.data?.author?.name ||
          parsed.meta?.authorName ||
          parsed.meta?.author?.name ||
          parsed.payload?.authorName,
      };
    }

    if (status === 403 && code === 'ACCESS_REVOKED') {
      return {
        status,
        code,
        message: 'Your access to this private story was revoked by the author.',
      };
    }

    if (status === 403 && code === 'ONE_TIME_VIEW_EXPIRED') {
      return {
        status,
        code,
        message: 'This one-time private story has already been viewed and is no longer accessible.',
      };
    }

    return {
      status,
      code: code || 'PRIVATE_POST_FORBIDDEN',
      message: 'This story is private or the link is invalid.',
    };
  }, []);

  const loadPost = useCallback(async () => {
    // Never re-fetch a one-time story after it has already been unlocked in this session
    if (hasUnlockedInSessionRef.current) return;

    setLoading(true);
    setGateError(null);

    try {
      const storedToken =
        sessionUnlockToken || getPrivateUnlockToken(undefined, { slug, shareToken });
      const loaded =
        mode === 'share-token' && shareToken
          ? await BlogService.getPrivatePostByShareToken(shareToken, storedToken)
          : slug
          ? await BlogService.getReaderPost(slug, { shareToken, unlockToken: storedToken })
          : shareToken
          ? await BlogService.getPrivatePostByShareToken(shareToken, storedToken)
          : null;

      if (!loaded) {
        setGateError({
          status: 404,
          code: 'PRIVATE_POST_FORBIDDEN',
          message: 'This story is private or the link is invalid.',
        });
        return;
      }

      setPost(loaded);
      if (loaded.id && storedToken) {
        setSessionUnlockToken(storedToken);
      }
    } catch (err) {
      const mapped = mapErrorToGate(err);
      if (mapped) {
        setGateError(mapped);
      }
    } finally {
      setLoading(false);
    }
  }, [mode, slug, shareToken, sessionUnlockToken, mapErrorToGate]);

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, shareToken, mode]);

  const handleFollowAuthorAndRetry = async () => {
    if (!isAuthenticated || !user) {
      redirectToLogin();
      return;
    }
    if (!gateError?.authorId) {
      await loadPost();
      return;
    }

    setFollowLoading(true);
    try {
      const res = await AuthService.toggleFollowUser(gateError.authorId, gateError.authorName);
      useAuthStore.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              followingUserIds: res.followingUserIds,
              followingCount: res.followingUserIds.length,
            }
          : state.user,
      }));
      await loadPost();
    } catch (err) {
      const mapped = mapErrorToGate(err);
      if (mapped) setGateError(mapped);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    const requiresPassword = Boolean(post.requiresPassword);
    const lockType = post.privateLockType || 'PASSWORD';
    const trimmedSecret = secretInput.trim();

    if (requiresPassword) {
      if (lockType === 'PIN') {
        if (!/^\d{4,8}$/.test(trimmedSecret)) {
          setUnlockError('Please enter your 4–8 digit numeric PIN.');
          return;
        }
      } else if (!trimmedSecret) {
        setUnlockError('Please enter the password to unlock this story.');
        return;
      }
    }

    setUnlocking(true);
    setUnlockError(null);

    try {
      const res = await BlogService.unlockPrivatePost(post.id, {
        ...(requiresPassword ? { password: trimmedSecret } : {}),
        ...(shareToken ? { shareToken } : {}),
      });

      const isOneTime = Boolean(res.oneTimeView ?? res.post?.oneTimeView ?? post.oneTimeView);
      const unlockedPost: BlogPost = {
        ...res.post,
        oneTimeView: isOneTime,
        locked: false,
      };

      hasUnlockedInSessionRef.current = true;

      if (res.unlockToken) {
        setPrivateUnlockToken(unlockedPost.id, res.unlockToken, isOneTime, {
          slug: unlockedPost.slug || slug,
          shareToken,
        });
        setSessionUnlockToken(res.unlockToken);
      }

      // Render directly from the unlock response — never re-fetch GET /posts/:slug
      setPost(unlockedPost);
      setUnlockError(null);
    } catch (err: any) {
      const parsed = extractApiError(err, 'Incorrect PIN or password');
      if (parsed.code === 'LOGIN_REQUIRED') {
        redirectToLogin();
        return;
      }
      if (
        parsed.code === 'FOLLOW_AUTHOR_REQUIRED' ||
        parsed.code === 'ACCESS_REVOKED' ||
        parsed.code === 'ONE_TIME_VIEW_EXPIRED' ||
        parsed.code === 'PRIVATE_POST_FORBIDDEN'
      ) {
        const mapped = mapErrorToGate(err);
        if (mapped) {
          setPost(null);
          setGateError(mapped);
        }
        return;
      }
      // Keep the unlock screen & entered secret intact on INVALID_PRIVATE_PASSWORD
      setUnlockError(
        parsed.code === 'INVALID_PRIVATE_PASSWORD' || parsed.status === 401
          ? 'Incorrect PIN or password'
          : parsed.message || 'Incorrect PIN or password'
      );
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return <ArticlePageSkeleton />;
  }

  // API Gate States (403 Follow / Revoked / Expired / Private / 404)
  if (gateError) {
    const isFollowGate = gateError.code === 'FOLLOW_AUTHOR_REQUIRED';
    const isExpiredGate = gateError.code === 'ONE_TIME_VIEW_EXPIRED';
    const isRevokedGate = gateError.code === 'ACCESS_REVOKED';

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 font-sans">
        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {isFollowGate ? (
              <UserPlus className="w-8 h-8" />
            ) : isExpiredGate ? (
              <Clock className="w-8 h-8 text-rose-500" />
            ) : isRevokedGate ? (
              <Ban className="w-8 h-8 text-rose-500" />
            ) : (
              <ShieldAlert className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <Badge variant={isFollowGate ? 'warning' : 'destructive'} className="mx-auto">
              {isFollowGate
                ? 'Follower Access Required'
                : isExpiredGate
                ? 'One-Time View Expired'
                : isRevokedGate
                ? 'Access Revoked'
                : 'Private Story'}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground pt-1">
              {gateError.message}
            </h1>
            {gateError.authorName && isFollowGate && (
              <p className="text-sm text-muted-foreground">
                Follow <span className="font-semibold text-foreground">{gateError.authorName}</span> to unlock this story.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isFollowGate && (
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={followLoading}
                onClick={handleFollowAuthorAndRetry}
                className="rounded-full px-6 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              >
                <UserPlus className="w-4 h-4" />
                Follow Author
              </Button>
            )}
            <Link href="/">
              <Button type="button" variant="outline" size="md" className="rounded-full px-6 text-xs">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <p className="text-sm text-muted-foreground">This story is private or the link is invalid.</p>
        <Link href="/">
          <Button variant="outline" size="sm" className="rounded-full">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  // Locked Preview Screen (content intentionally omitted by backend)
  if (post.locked) {
    const lockType = post.privateLockType || 'PASSWORD';
    const isPin = lockType === 'PIN';
    const isOneTime = Boolean(post.oneTimeView);
    const requiresPassword = Boolean(post.requiresPassword);

    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 font-sans">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to InkFlow
            </Button>
          </Link>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              {requiresPassword ? <KeyRound className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge variant="warning" className="gap-1">
                <Lock className="w-3 h-3" /> Private Story
              </Badge>
              {requiresPassword && (
                <Badge variant="outline">{isPin ? 'PIN Protected' : 'Password Protected'}</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {post.title}
            </h1>

            {post.author && (
              <div className="flex items-center justify-center gap-2.5 pt-1">
                <ImageWithSkeleton
                  src={
                    post.author.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                  }
                  alt={post.author.name}
                  width={28}
                  height={28}
                  wrapperClassName="w-7 h-7 rounded-full shrink-0"
                  className="w-7 h-7 rounded-full object-cover border border-border"
                />
                <span className="text-xs font-semibold text-foreground">{post.author.name}</span>
                {post.author.username && (
                  <span className="text-xs text-muted-foreground font-mono">
                    @{post.author.username}
                  </span>
                )}
              </div>
            )}
          </div>

          {isOneTime && (
            <div
              role="note"
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200 leading-relaxed"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>One-Time View:</strong> Once unlocked, you can read this story only once. Refreshing or leaving will expire access.
              </span>
            </div>
          )}

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            {requiresPassword && (
              <div className="space-y-2">
                <label htmlFor={secretInputId} className="block text-xs font-bold text-foreground">
                  {isPin ? 'Enter 4–8 Digit Numeric PIN' : 'Enter Story Password'}
                </label>

                <div className="relative">
                  <input
                    id={secretInputId}
                    type={showSecret ? 'text' : 'password'}
                    inputMode={isPin ? 'numeric' : undefined}
                    pattern={isPin ? '\\d{4,8}' : undefined}
                    maxLength={isPin ? 8 : undefined}
                    autoComplete={isPin ? 'one-time-code' : 'current-password'}
                    value={secretInput}
                    onChange={(e) => {
                      const next = isPin
                        ? e.target.value.replace(/\D/g, '').slice(0, 8)
                        : e.target.value;
                      setSecretInput(next);
                      if (unlockError) setUnlockError(null);
                    }}
                    placeholder={isPin ? '• • • •' : 'Enter password to unlock...'}
                    aria-invalid={Boolean(unlockError)}
                    aria-describedby={unlockError ? unlockErrorId : undefined}
                    className={`w-full pl-4 pr-11 py-3 rounded-2xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      isPin
                        ? 'text-center text-lg font-mono tracking-[0.45em] placeholder:tracking-[0.45em]'
                        : 'text-sm'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((prev) => !prev)}
                    aria-pressed={showSecret}
                    aria-label={showSecret ? (isPin ? 'Hide PIN' : 'Hide password') : isPin ? 'Show PIN' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {unlockError && (
              <p
                id={unlockErrorId}
                role="alert"
                aria-live="assertive"
                className="text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5 text-center"
              >
                {unlockError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={unlocking}
              disabled={unlocking}
              className="w-full rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
            >
              {isOneTime ? 'Open One-Time Story' : 'Unlock Story'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Unlocked Story View (Public client fallback or Private unlocked story)
  const isDraft = post.status?.toLowerCase() === 'draft';
  const hasCustomCoverImage = Boolean(
    post.coverImage &&
      post.coverImage.trim() !== '' &&
      !post.coverImage.includes('photo-1618005182384-a83a8bd57fbe')
  );

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative">
      <TextHighlightPopover
        postId={post.id}
        postTitle={post.title}
        postSlug={post.slug}
        unlockToken={sessionUnlockToken}
      />

      {/* Back Link */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <Link href={post.visibility === 'private' ? '/dashboard/posts?tab=shared' : '/blog'}>
          <Button variant="ghost" size="sm" className="rounded-full gap-1 text-muted-foreground">
            <ArrowLeft className="w-3.5 h-3.5" />
            {post.visibility === 'private' ? 'Back to Shared Stories' : 'Back to Articles'}
          </Button>
        </Link>
      </div>

      {/* One-Time View Active Session Banner */}
      {post.oneTimeView && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-300 font-sans text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>One-Time Session Active:</strong> Do not refresh or close this tab until you finish reading; access has been consumed for this share.
          </span>
        </div>
      )}

      {/* Draft Notice Banner */}
      {isDraft && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-300 font-sans text-xs">
          <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
            Draft Preview
          </span>
          <span>
            This story is in draft state and is not published yet. Clapping, responding, and public interactions are disabled.
          </span>
        </div>
      )}

      {/* Article Header */}
      <header className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-2.5">
          {post.visibility === 'private' && (
            <Badge variant="warning" className="gap-1">
              <Lock className="w-3 h-3" /> Private Story
            </Badge>
          )}
          <Badge variant="default">{post.category?.name || 'General'}</Badge>
          {post.series && (
            <Badge variant="accent" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {post.series}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-sans tracking-tight text-foreground leading-[1.12]">
          {post.title}
        </h1>

        {(post.subtitle || post.excerpt) && (
          <p className="text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed">
            {post.subtitle || post.excerpt}
          </p>
        )}

        <AuthorHeader
          author={post.author}
          postId={post.id}
          postTitle={post.title}
          postSlug={post.slug}
          coverImage={post.coverImage}
          readingTimeMinutes={post.readingTimeMinutes}
          publishedAt={post.publishedAt}
          clapsCount={post.clapsCount}
          isDraft={isDraft}
          unlockToken={sessionUnlockToken}
        />
      </header>

      {/* Cover Image */}
      {hasCustomCoverImage && (
        <div className="max-w-4xl mx-auto relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-border shadow-md">
          <ImageWithSkeleton
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Main Article Content Body */}
      <div className="max-w-4xl mx-auto space-y-8 prose-content article-content">
        <CodeBlockEnhancer />
        <div
          className="prose prose-lg dark:prose-invert font-serif leading-relaxed max-w-none article-body text-foreground"
          dangerouslySetInnerHTML={{ __html: highlightCodeBlocks(post.content || '') }}
        />

        <ReactionBar
          postId={post.id}
          initialClaps={post.clapsCount || 0}
          commentsCount={post.commentsCount || 0}
          unlockToken={sessionUnlockToken}
          onScrollToComments={() => {
            commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Author Card */}
        {post.author && (
          <div className="p-6 rounded-3xl bg-card border border-border/80 flex items-center gap-4">
            <ImageWithSkeleton
              src={post.author.avatar}
              alt={post.author.name}
              width={56}
              height={56}
              wrapperClassName="w-14 h-14 rounded-full shrink-0"
              className="rounded-full object-cover w-full h-full"
            />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground font-sans">
                Written by {post.author.name}
              </h3>
              <p className="text-xs text-muted-foreground font-sans">{post.author.bio}</p>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div ref={commentsSectionRef}>
          <CommentSection
            postId={post.id}
            initialComments={undefined}
            isDraft={isDraft}
            unlockToken={sessionUnlockToken}
          />
        </div>
      </div>
    </article>
  );
}
