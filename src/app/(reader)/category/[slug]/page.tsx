import React from 'react';
import { notFound } from 'next/navigation';
import { BlogService, mockCategories } from '@/services/blog.service';
import { PostCard } from '@/features/blogs/post-card';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = mockCategories.find((c) => c.slug === slug);
  if (!category) notFound();

  const posts = await BlogService.getPosts({ categorySlug: slug });

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-3 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Category: {category.name}
        </h1>
        <p className="text-base text-muted-foreground">{category.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
