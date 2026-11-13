'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2, AlertCircle } from 'lucide-react';
import { CollabService } from '@/services/collab.service';
import { useAuthStore } from '@/store/use-auth-store';
import { redirectToLogin } from '@/lib/auth-redirect';
import { Button } from '@/components/ui/button';

export default function JoinCollabPage({
  params,
}: {
  params: Promise<{ inviteToken: string }>;
}) {
  const resolvedParams = use(params);
  const inviteToken = resolvedParams.inviteToken;
  const router = useRouter();
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!isAuthenticated) {
      redirectToLogin(router, `/collab/${inviteToken}`);
      return;
    }

    async function joinStory() {
      try {
        const res = await CollabService.joinByToken(inviteToken);
        if (res?.postId) {
          router.replace(`/dashboard/posts/${res.postId}`);
        } else {
          setError('Failed to resolve collaboration session.');
          setJoining(false);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Invalid or expired collaboration invitation link.',
        );
        setJoining(false);
      }
    }

    joinStory();
  }, [inviteToken, isAuthenticated, isCheckingAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Users className="w-7 h-7" />
        </div>

        {joining && !error ? (
          <>
            <h2 className="text-lg font-semibold text-foreground">Joining Collaboration...</h2>
            <p className="text-xs text-muted-foreground">
              Connecting you to the real-time writing room...
            </p>
            <div className="pt-2 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </>
        ) : error ? (
          <>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Unable to Join</h2>
            <p className="text-xs text-muted-foreground">{error}</p>
            <div className="pt-3">
              <Button onClick={() => router.push('/dashboard/posts')} size="sm">
                Go to Dashboard
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
