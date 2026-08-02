'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 font-sans space-y-8">
      <div className="space-y-2 border-b border-border/60 pb-6">
        <h1 className="text-3xl font-extrabold text-foreground font-serif">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">1. User Roles & Account Rules</h2>
          <p>
            InkFlow provides Reader, Writer (Creator), and Admin roles. Readers can save stories, create lists, and interact with posts. Writers must abide by editorial quality standards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">2. Creator Applications & Content Ownership</h2>
          <p>
            Users applying for Creator status agree to submit original, authentic content. Admins reserve the right to review, approve, or request revisions for any submitted stories.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">3. Prohibited Content</h2>
          <p>
            Spam, harassment, hate speech, and unverified plagiarized content are strictly prohibited and will be removed upon evaluation.
          </p>
        </section>
      </div>
    </div>
  );
}
