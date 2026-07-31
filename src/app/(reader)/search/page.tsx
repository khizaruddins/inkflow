'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X, Clock, Flame } from 'lucide-react';
import { BlogService, mockCategories, mockTags } from '@/services/blog.service';
import { BlogPost } from '@/types';
import { PostCard } from '@/features/blogs/post-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [recentQueries] = useState(['React 19', 'Design Systems', 'TipTap Editor', 'LLM Agents']);

  useEffect(() => {
    async function fetchResults() {
      const fetched = await BlogService.getPosts({
        query,
        categorySlug: selectedCategory || undefined,
        tagSlug: selectedTag || undefined,
      });
      setResults(fetched);
    }
    fetchResults();
  }, [query, selectedCategory, selectedTag]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Search InkFlow</h1>
        <p className="text-sm text-muted-foreground">Find articles, technical topics, authors, and design systems.</p>
      </div>

      {/* Main Search Input Bar */}
      <div className="relative max-w-2xl mx-auto">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, keyword, or concept..."
          className="w-full pl-12 pr-10 py-3.5 text-base bg-card border border-border/80 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent Queries */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-semibold">
          <Clock className="w-3.5 h-3.5" /> Recent Searches:
        </span>
        {recentQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(q)}
            className="px-3 py-1 rounded-full bg-muted/60 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Category & Tag Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-border/40">
        <Button
          size="sm"
          variant={selectedCategory === null && selectedTag === null ? 'primary' : 'outline'}
          onClick={() => {
            setSelectedCategory(null);
            setSelectedTag(null);
          }}
          className="rounded-full text-xs"
        >
          All Topics
        </Button>
        {mockCategories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={selectedCategory === cat.slug ? 'primary' : 'outline'}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setSelectedTag(null);
            }}
            className="rounded-full text-xs"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>Found {results.length} results</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
