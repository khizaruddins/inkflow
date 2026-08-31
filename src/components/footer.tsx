'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rss, Github, Twitter, Heart } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  const pathname = usePathname();
  const isEditorPage = pathname === '/dashboard/posts/new' || (pathname.startsWith('/dashboard/posts/') && pathname !== '/dashboard/posts');
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  if (isEditorPage || isAuthPage) return null;

  return (
    <footer className="w-full border-t border-border/60 bg-card/50 backdrop-blur-xs py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-2">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-black tracking-tight text-foreground font-serif">
              Ink<span className="text-primary font-sans">Flow</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm font-sans leading-relaxed">
            {siteConfig.description} Engineered with Next.js 16, React 19, TipTap rich text authoring, and typography-first layouts.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary transition-colors">About InkFlow</Link></li>
            <li><Link href="/blog" className="hover:text-primary transition-colors">Blogging Guide</Link></li>
            <li><Link href="/become-creator" className="hover:text-primary transition-colors">Become a Creator</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Syndication</h4>
          <div className="flex items-center gap-3">
            <a href="/api/rss" target="_blank" className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary transition-colors" title="RSS Feed">
              <Rss className="w-4 h-4" />
            </a>
            <a href={siteConfig.links.twitter} target="_blank" className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary transition-colors" title="Twitter / X">
              <Twitter className="w-4 h-4" />
            </a>
            <a href={siteConfig.links.github} target="_blank" className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary transition-colors" title="GitHub">
              <Github className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            © {new Date().getFullYear()} InkFlow Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
