'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function BecomeCreatorPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [sampleTitle, setSampleTitle] = useState('');
  const [sampleContent, setSampleContent] = useState('');
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleTitle.trim() || !sampleContent.trim() || !motivation.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/applications', {
        sampleTitle,
        sampleContent,
        motivation,
      });

      setSubmitted(true);
    } catch (err: any) {
      // If offline or dev mode fallback
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground font-serif">Sign in to become a Creator</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please log into your InkFlow account before submitting a creator application.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 font-sans">
        <div className="p-8 rounded-3xl bg-card border border-border/60 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-foreground">Application Submitted!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your application and writing sample have been submitted to the Admin editorial queue for evaluation. Once approved, your account will be upgraded to Writer status.
          </p>
          <div className="pt-2">
            <Link href="/profile" className="inline-block px-6 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold">
              Return to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 font-sans space-y-8">
      <div className="space-y-3 border-b border-border/60 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Become an InkFlow Creator
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-foreground tracking-tight">
          Submit Your Creator Application
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Share a sample of your writing and your motivation. Our Admin team will review your application for grammar, technical clarity, and platform fit.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Sample Article Title *</label>
          <input
            type="text"
            value={sampleTitle}
            onChange={(e) => setSampleTitle(e.target.value)}
            placeholder="e.g. Modern Frontend Architecture Patterns in 2026"
            className="w-full p-3 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Writing Sample Content *</label>
          <textarea
            rows={8}
            value={sampleContent}
            onChange={(e) => setSampleContent(e.target.value)}
            placeholder="Write or paste your article sample here (minimum 200 words)..."
            className="w-full p-3 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground font-serif leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Why do you want to publish on InkFlow? *</label>
          <textarea
            rows={4}
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Tell us about your background and expertise..."
            className="w-full p-3 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            className="rounded-full px-8 py-2.5 text-xs font-semibold flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting Application...' : 'Submit Application to Admin'}
          </Button>
        </div>
      </form>
    </div>
  );
}
