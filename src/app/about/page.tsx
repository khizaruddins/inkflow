'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Feather, ShieldCheck, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 font-sans space-y-12">
      <div className="space-y-4 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" /> About InkFlow
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-serif text-foreground tracking-tight">
          A modern publishing platform for thinkers and creators
        </h1>
        <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
          InkFlow connects software engineers, designers, and domain experts with readers hungry for deep, human-curated insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Feather className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">TipTap Rich Authoring</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Craft beautiful stories with code blocks, custom text highlighting, and table of contents generation.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Editorial Approval</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Quality content backed by Admin editorial review, feedback notes, and revision loops before publishing.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Enterprise Stack</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Engineered with Next.js 16, NestJS, Prisma ORM, and MongoDB for sub-second performance.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-emerald-700 text-white space-y-4 text-center">
        <h2 className="text-2xl font-bold font-serif">Ready to share your voice?</h2>
        <p className="text-sm opacity-90 max-w-md mx-auto">
          Apply for an InkFlow Creator account today to publish articles and build a dedicated reader base.
        </p>
        <div>
          <Link
            href="/become-creator"
            className="inline-block px-6 py-3 rounded-full bg-white text-emerald-800 text-xs font-bold hover:bg-slate-100 transition-colors shadow-lg"
          >
            Apply to Become a Creator
          </Link>
        </div>
      </div>
    </div>
  );
}
