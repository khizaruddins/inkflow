'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AtSign, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/use-auth-store';

export default function SignupPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'READER' | 'WRITER'>('READER');
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
        role,
      });
      setSuccess('Reader account registered successfully! Redirecting to feed...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md space-y-6 p-8 rounded-3xl bg-card border border-border/80 shadow-2xl">
        <div className="space-y-2 text-center">
          <span className="text-3xl font-black tracking-tight text-foreground font-serif block">
            Ink<span className="text-primary font-sans">Flow</span>
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-serif">
            Join InkFlow
          </h1>
          <p className="text-xs text-muted-foreground">
            Create your account to start reading, clapping, bookmarking, and following top authors.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Marcus Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Username / Handle</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="marcus_chen"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="marcus@reader.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Account Type selection */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-foreground">Primary Intent</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('READER')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  role === 'READER'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border/70 bg-muted/30 text-muted-foreground'
                }`}
              >
                📖 Reader
              </button>
              <button
                type="button"
                onClick={() => setRole('WRITER')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  role === 'WRITER'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border/70 bg-muted/30 text-muted-foreground'
                }`}
              >
                ✍️ Writer / Creator
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="lg"
            className="w-full rounded-xl gap-2 mt-2 font-semibold shadow-md shadow-primary/20"
          >
            {isLoading ? (
              'Creating Account...'
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-border/60 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
