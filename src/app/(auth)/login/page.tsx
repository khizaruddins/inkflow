'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/use-auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login, setRole, isLoading } = useAuthStore();
  const [email, setEmail] = useState('marcus@reader.io');
  const [password, setPassword] = useState('password123');
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
        router.push('/');
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md space-y-6 p-8 rounded-3xl bg-card border border-border/80 shadow-2xl">
        <div className="space-y-2 text-center">
          <span className="text-3xl font-black tracking-tight text-foreground font-serif block">
            Ink<span className="text-primary font-sans">Flow</span>
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-serif">
            Welcome back to InkFlow
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in to your reader account or creator workspace
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
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/50 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/50 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
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
              'Authenticating...'
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-border/60 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Create a Reader account
            </Link>
          </p>

          <div className="pt-2 border-t border-border/40">
            <p className="text-[11px] text-muted-foreground mb-2">Or instant demo switch:</p>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRole('reader');
                  router.push('/');
                }}
                className="text-xs rounded-xl"
              >
                📖 Reader Demo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRole('admin');
                  router.push('/dashboard');
                }}
                className="text-xs rounded-xl"
              >
                ⚙️ Admin Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
