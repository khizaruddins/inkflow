import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { BlogService } from '@/services/blog.service';
import { CommentService } from '@/services/comment.service';
import { CommentSection } from '@/features/blogs/comment-section';
import { PostCard } from '@/features/blogs/post-card';
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo';
import { TextHighlightPopover } from '@/components/text-highlight-popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HtmlContentWithSkeletons, ImageWithSkeleton, Skeleton, SkeletonCircle } from '@/components/ui/skeleton';
import { PostCardGridSkeleton } from '@/components/skeletons/page-skeletons';
import { AuthorHeader } from '@/features/blogs/author-header';

async function ArticleCommentsSection({ postId, isDraft }: { postId: string; isDraft: boolean }) {
  const comments = await CommentService.getCommentsByPostId(postId);
  return <CommentSection postId={postId} initialComments={comments} isDraft={isDraft} />;
}

async function MoreFromAuthorSection({ postId, authorName }: { postId: string; authorName: string }) {
  const allPosts = await BlogService.getPosts();
  const relatedPosts = allPosts.filter((p) => p.id !== postId).slice(0, 3);
  if (relatedPosts.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto space-y-6 pt-12 border-t border-border/60">
      <h2 className="text-2xl font-bold font-serif tracking-tight text-foreground">
        More from {authorName}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((rel) => (
          <PostCard key={rel.id} post={rel} />
        ))}
      </div>
    </section>
  );
}

function CommentsSkeletonFallback() {
  return (
    <div aria-hidden="true" className="space-y-6 pt-8 border-t border-border/60">
      <Skeleton variant="text" className="w-40 h-6" />
      <Skeleton variant="rect" className="w-full h-24 rounded-2xl" />
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="p-4 rounded-2xl border border-border/60 space-y-3">
            <div className="flex items-center gap-2.5">
              <SkeletonCircle size="sm" />
              <div className="space-y-1.5">
                <Skeleton variant="text" className="w-28 h-3" />
                <Skeleton variant="text" className="w-16 h-2.5" />
              </div>
            </div>
            <Skeleton variant="text" className="w-full h-3.5" />
            <Skeleton variant="text" className="w-4/5 h-3.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await BlogService.getPostBySlug(slug);
  if (!post) return { title: 'Article Not Found' };

  return {
    title: post.seo.metaTitle || post.title,
    description: post.seo.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await BlogService.getPostBySlug(slug);

  if (!post) notFound();

  const isDraft = post.status?.toLowerCase() === 'draft';
  const hasCustomCoverImage =
    Boolean(post.coverImage) &&
    post.coverImage.trim().length > 0 &&
    !post.coverImage.includes('photo-1618005182384-a83a8bd57fbe');

  return (
    <>
      <ArticleSchema post={post} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: 'https://inkflow.dev' },
          { name: 'Blog', item: 'https://inkflow.dev/blog' },
          { name: post.title, item: `https://inkflow.dev/blog/${post.slug}` },
        ]}
      />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative">
        <TextHighlightPopover postId={post.id} postTitle={post.title} postSlug={post.slug} />

        {/* Back Link */}
        <div className="max-w-4xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="rounded-full gap-1 text-muted-foreground">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Articles
            </Button>
          </Link>
        </div>

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
          <div className="flex items-center gap-3">
            <Badge variant="default">{post.category.name}</Badge>
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

          <p className="text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed">
            {post.subtitle || post.excerpt}
          </p>

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
          />
        </header>

        {/* Cover Image - Rendered ONLY if the author uploaded/selected a real cover image */}
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
          <HtmlContentWithSkeletons
            html={post.content}
            className="prose prose-lg dark:prose-invert font-serif leading-relaxed max-w-none article-body text-foreground"
          />

          {/* Author Card */}
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
              <h3 className="text-base font-bold text-foreground font-sans">Written by {post.author.name}</h3>
              <p className="text-xs text-muted-foreground font-sans">{post.author.bio}</p>
            </div>
          </div>

          {/* Comments Section */}
          <Suspense fallback={<CommentsSkeletonFallback />}>
            <ArticleCommentsSection postId={post.id} isDraft={isDraft} />
          </Suspense>
        </div>

        {/* Medium "More from Author" Section - Uniform PostCard component */}
        <Suspense
          fallback={
            <section aria-hidden="true" className="max-w-4xl mx-auto space-y-6 pt-12 border-t border-border/60">
              <Skeleton variant="text" className="w-56 h-7" />
              <PostCardGridSkeleton count={3} />
            </section>
          }
        >
          <MoreFromAuthorSection postId={post.id} authorName={post.author.name} />
        </Suspense>
      </article>
    </>
  );
}
