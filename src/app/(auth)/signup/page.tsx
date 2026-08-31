'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AtSign, ArrowRight, CheckCircle2, AlertCircle, Feather, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/use-auth-store';

export default function SignupPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
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
      await register({
        name,
        username: username.replace('@', ''),
        email,
        password,
        role: 'READER',
      });
      setSuccess('Account created successfully! Redirecting to feed...');
      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground overflow-y-auto lg:overflow-hidden">
      {/* Left Column - Creative Hero Visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-emerald-950 text-white">
        <Image
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80"
          alt="InkFlow Creative Space"
          fill
          className="object-cover opacity-35 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/60 to-transparent" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black font-serif tracking-tight text-white group">
            <span>Ink<span className="text-primary font-sans">Flow</span></span>
          </Link>
        </div>

        {/* Bottom Hero Content */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-300 font-medium">
            <Feather className="w-3.5 h-3.5 text-emerald-300" />
            Join our growing community
          </div>
          <h2 className="text-4xl xl:text-5xl font-black font-serif leading-tight">
            "Your voice matters. Share your stories with the world."
          </h2>
          <p className="text-sm text-emerald-100/80 font-light leading-relaxed">
            Create an account to follow inspiring writers, save stories to your personal library, and publish your own thoughts.
          </p>
        </div>
      </div>

      {/* Right Column - Signup Form */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center justify-between pb-6">
          <Link href="/" className="text-2xl font-black font-serif text-foreground">
            Ink<span className="text-primary font-sans">Flow</span>
          </Link>
        </div>

        <div className="my-auto w-full max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-serif text-foreground">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join InkFlow to read, write, and engage
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="alex_morgan"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-muted/40 border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm bg-muted/40 border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
                  required
                  minLength={6}
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
              disabled={isLoading}
              variant="primary"
              size="lg"
              className="w-full rounded-2xl py-3.5 text-sm font-semibold gap-2 shadow-lg shadow-primary/25 mt-2"
            >
              {isLoading ? (
                'Creating Account...'
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-border/50 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
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
