'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, AtSign, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/use-auth-store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const router = useRouter();
  const { login, register, isLoading } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'READER' | 'WRITER'>('READER');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await login({ email, password });
        setSuccess('Successfully signed in!');
        setTimeout(() => {
          onClose();
          router.push('/');
        }, 600);
      } else {
        await register({
          email,
          password,
          name,
          username: username.replace('@', ''),
          role,
        });
        setSuccess('Account created successfully! Welcome to InkFlow.');
        setTimeout(() => {
          onClose();
          router.push('/');
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-8 overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <span className="text-3xl font-black tracking-tight text-foreground font-serif block">
              Ink<span className="text-primary font-sans">Flow</span>
            </span>
            <h2 className="text-2xl font-black tracking-tight text-foreground font-serif">
              {mode === 'signup' ? 'Join InkFlow.' : 'Welcome back.'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === 'signup'
                ? 'Create a reader account to save stories, clap, & follow authors.'
                : 'Sign in to access your personal reading feed & library.'}
            </p>
          </div>

          {/* Social login mock buttons */}
          <div className="space-y-2 mb-5">
            <button
              onClick={() => {
                setEmail('reader@inkflow.dev');
                setPassword('password123');
                setMode('login');
              }}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-border/80 bg-background text-xs font-semibold hover:bg-muted/50 transition-all shadow-sm"
            >
              <span className="text-base">🌐</span> Continue with Reader Demo
            </button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <span className="relative px-3 bg-card text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              or with email
            </span>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                      className="w-full pl-9 pr-3 py-2 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-muted/40 border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              size="lg"
              className="w-full rounded-full gap-2 mt-3 font-semibold"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  {mode === 'signup' ? 'Create Reader Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer toggle */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                No account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Create one
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
