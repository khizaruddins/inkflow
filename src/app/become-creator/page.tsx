'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, Send, AlertCircle, Clock, FileText, ArrowLeft, PenTool } from 'lucide-react';
import Link from 'next/link';
import { ApplicationService } from '@/services/application.service';
import { CreatorApplication } from '@/types';

export default function BecomeCreatorPage() {
  const { user, isAuthenticated, role } = useAuthStore();
  const [sampleTitle, setSampleTitle] = useState('');
  const [sampleContent, setSampleContent] = useState('');
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<CreatorApplication | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWriterOrAdmin =
    role === 'writer' ||
    role === 'WRITER' ||
    role === 'admin' ||
    role === 'ADMIN' ||
    user?.role === 'WRITER' ||
    user?.role === 'ADMIN';

  useEffect(() => {
    async function loadStatus() {
      if (isAuthenticated) {
        try {
          const app = await ApplicationService.getMyStatus();
          setExistingApplication(app);
        } catch {
          // No application found
        } finally {
          setLoadingStatus(false);
        }
      } else {
        setLoadingStatus(false);
      }
    }
    loadStatus();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleTitle.trim() || !sampleContent.trim() || !motivation.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await ApplicationService.submitApplication({
        sampleTitle,
        sampleContent,
        motivation,
      });

      setExistingApplication(created);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit application.';
      setError(msg);
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
        <div className="pt-2">
          <Link href="/login" className="inline-block px-6 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loadingStatus) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center font-sans space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground">Checking application status...</p>
      </div>
    );
  }

  // 1. User is already an approved Writer or Admin
  if (isWriterOrAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 font-sans">
        <div className="p-8 rounded-3xl bg-card border border-border/60 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-foreground">You are an Approved Creator!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your account has full Writer privileges. You can compose, publish, and manage stories across InkFlow.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              href="/dashboard/posts/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition-colors"
            >
              <PenTool className="w-4 h-4" /> Write a Story
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-muted text-foreground hover:bg-muted/80 text-xs font-semibold transition-colors"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. User has a PENDING Application under review
  if (existingApplication && existingApplication.status === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 font-sans space-y-6">
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
        </Link>

        <div className="p-8 rounded-3xl bg-card border border-amber-500/30 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Application Under Review</h2>
                <p className="text-xs text-muted-foreground">Submitted on {new Date(existingApplication.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              ⏳ Pending Review
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Your Creator Application is currently with our Admin editorial team. We review submissions for quality, technical depth, and community guidelines. You will receive an update once reviewed.
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Submitted Sample Title</h4>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                {existingApplication.sampleTitle}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Writing Motivation</h4>
              <p className="text-xs text-muted-foreground italic bg-muted/40 p-3 rounded-xl border border-border/40">
                "{existingApplication.motivation}"
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-border/40">
            <span className="text-[11px] text-muted-foreground">Status updates automatically upon Admin approval.</span>
            <Link
              href="/"
              className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. User can submit a new application
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
