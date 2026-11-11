'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithSkeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/use-auth-store';
import { sanitizeRedirectPath } from '@/lib/auth-redirect';

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const safeRedirect = sanitizeRedirectPath(redirectParam);
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await login({ email, password });
      setSuccess('Successfully signed in! Redirecting...');
      setTimeout(() => {
        router.push(safeRedirect);
      }, 400);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground overflow-y-auto lg:overflow-hidden">
      {/* Left Column - Editorial Hero Visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-900 text-white">
        <ImageWithSkeleton
          src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1600&q=80"
          alt="InkFlow Editorial Reading"
          fill
          className="object-cover opacity-40 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black font-serif tracking-tight text-white group">
            <span>Ink<span className="text-primary font-sans">Flow</span></span>
          </Link>
        </div>

        {/* Bottom Hero Content */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Curated Knowledge &amp; Creative Writing
          </div>
          <h2 className="text-4xl xl:text-5xl font-black font-serif leading-tight">
            "Ideas that inspire. Stories that stay with you."
          </h2>
          <p className="text-sm text-slate-300 font-light leading-relaxed">
            Sign in to access your personal reading feed, saved bookmarks, highlighted notes, and writer analytics.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center justify-between pb-6">
          <Link href="/" className="text-2xl font-black font-serif text-foreground">
            Ink<span className="text-primary font-sans">Flow</span>
          </Link>
        </div>

        <div className="my-auto w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-serif text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Status Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-muted/40 border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm bg-muted/40 border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              variant="primary"
              size="lg"
              className="w-full rounded-2xl py-3.5 text-sm font-semibold gap-2 shadow-lg shadow-primary/25"
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-border/50 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'}
                className="text-primary font-bold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-muted-foreground pt-6">
          &copy; {new Date().getFullYear()} InkFlow Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
