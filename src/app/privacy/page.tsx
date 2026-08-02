'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 font-sans space-y-8">
      <div className="space-y-2 border-b border-border/60 pb-6">
        <h1 className="text-3xl font-extrabold text-foreground font-serif">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">1. Information We Collect</h2>
          <p>
            We collect account details (email, username, avatar) and reading preferences (bookmarks, reading history, highlights) to provide a tailored publishing experience.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">2. Authentication & Security</h2>
          <p>
            Tokens are safely stored in secure httpOnly cookies. We do not sell or share personal data with third-party advertising networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">3. Your Data Rights</h2>
          <p>
            You can edit your profile, clear your reading history, or request account deletion at any time from your account settings.
          </p>
        </section>
      </div>
    </div>
  );
}
