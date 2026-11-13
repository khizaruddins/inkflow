'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { PauseCircle, ShieldAlert, LogOut, PlayCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export function AccountStatusOverlay() {
  const { user, isAuthenticated, isCheckingAuth, unpauseAccount, cancelDeletion, logout } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (isCheckingAuth || !isAuthenticated || !user) {
    return null;
  }

  const status = user.status;

  // Handle Unpause
  const handleUnpause = async () => {
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      await unpauseAccount();
      setFeedbackMessage('Your account has been successfully unpaused!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Failed to unpause account.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Cancel Deletion
  const handleCancelDeletion = async () => {
    setIsProcessing(true);
    try {
      await cancelDeletion();
      setFeedbackMessage('Account deletion stopped! Your account is active.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Failed to cancel deletion request.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // =========================================================================
  // 1. Paused Account State (Full Blank Screen Overlay)
  // =========================================================================
  if (status === 'PAUSED') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paused-modal-title"
        className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-hidden"
      >
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <PauseCircle className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h2 id="paused-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Your Account is Paused
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your InkFlow account is currently in a paused state. While paused, you cannot read or write any blogs, and private stories and notes are not accessible.
            </p>
          </div>

          {feedbackMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold">
              {feedbackMessage}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-foreground/80 space-y-1">
            <div className="font-semibold text-foreground">Do you want to unpause your account?</div>
            <div className="text-[11px] text-muted-foreground">You can unpause anytime to restore full reading and writing privileges.</div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isProcessing}
              onClick={handleUnpause}
              className="w-full rounded-full text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            >
              <PlayCircle className="w-4 h-4" />
              {isProcessing ? 'Unpausing Account...' : 'Unpause Account Now'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full rounded-full text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. Suspended Account State (Full Blank Screen Overlay)
  // =========================================================================
  if (status === 'SUSPENDED') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspended-modal-title"
        className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-hidden"
      >
        <div className="max-w-md w-full bg-card border border-rose-500/40 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h2 id="suspended-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-destructive">
              Account Suspended
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your InkFlow account has been suspended by an administrator for violating community guidelines. You can no longer read or write any blogs or access private content.
            </p>
          </div>

          {user.suspensionReason && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive text-left space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Suspension Notice:</span>
              <p className="font-medium">{user.suspensionReason}</p>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={handleLogout}
              className="w-full rounded-full text-xs font-bold gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
            >
              <LogOut className="w-4 h-4" /> Acknowledge & Log Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. Pending Deletion Banner (Grace Period Notice with Cancel Option)
  // =========================================================================
  if (status === 'PENDING_DELETION' || user.deletionScheduledAt) {
    const scheduledDate = user.deletionScheduledAt ? new Date(user.deletionScheduledAt) : null;
    const now = new Date();
    const daysLeft = scheduledDate
      ? Math.max(0, Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 30;

    return (
      <aside aria-label="Account deletion status notice" className="sticky top-0 z-40 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white shadow-md font-sans px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
            <span>
              <strong>Account scheduled for permanent termination</strong> on{' '}
              <span className="underline font-bold">
                {scheduledDate ? formatDate(scheduledDate.toISOString()) : 'in 30 days'}
              </span>{' '}
              ({daysLeft} days remaining).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isProcessing}
              onClick={handleCancelDeletion}
              className="rounded-full text-xs font-bold bg-white text-rose-700 hover:bg-rose-50 px-4 h-7 shrink-0 shadow-xs"
            >
              {isProcessing ? 'Stopping...' : 'Stop Deletion Request'}
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
