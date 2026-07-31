'use client';

import React, { useState, useEffect } from 'react';
import { TOCItem } from '@/types';
import { cn } from '@/lib/utils';

export function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -80% 0%' }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <nav className="space-y-2 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Table of Contents
      </h4>
      <ul className="space-y-1 text-xs font-sans">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className={cn(
                'block py-1 text-muted-foreground hover:text-primary transition-colors line-clamp-1',
                activeId === item.id && 'text-primary font-semibold border-l-2 border-primary pl-2'
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
