'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.resetPassword({
        email: email.trim(),
        newPassword: newPassword,
      });

      setSuccess('Password updated successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground overflow-y-auto lg:overflow-hidden font-sans">
      {/* Left Column - Editorial Hero Visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-900 text-white">
        <Image
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
          alt="InkFlow Security & Editorial"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-300 font-medium">
            <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
            Account Security &amp; Access Recovery
          </div>
          <h2 className="text-4xl xl:text-5xl font-black font-serif leading-tight">
            "Your workspace, your words — safe and accessible."
          </h2>
          <p className="text-sm text-slate-300 font-light leading-relaxed">
            Reset your password securely to recover your reading history, published stories, bookmarks, and drafts.
          </p>
        </div>
      </div>

      {/* Right Column - Reset Password Form */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center justify-between pb-6">
          <Link href="/" className="text-2xl font-black font-serif text-foreground">
            Ink<span className="text-primary font-sans">Flow</span>
          </Link>
        </div>

        <div className="my-auto w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-serif text-foreground">
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your registered email and choose a new password.
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
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-muted/40 border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
                  required
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm bg-muted/40 border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              size="lg"
              className="w-full rounded-2xl py-3.5 text-sm font-semibold gap-2 shadow-lg shadow-primary/25 cursor-pointer"
            >
              {isLoading ? (
                'Updating Password...'
              ) : (
                <>
                  Update Password &amp; Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-border/50 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Remembered your credentials?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in here
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
