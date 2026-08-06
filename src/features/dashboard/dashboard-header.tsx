'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  const { role, user } = useAuthStore();
  const isAdmin = role === 'admin' || role === 'ADMIN';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {isAdmin ? 'Admin & Writer Dashboard' : 'Writer Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? 'Overview of platform content performance, applications, and editorial reviews.'
            : `Personal dashboard for ${user?.name || 'Writer'}: article performance, views, and content drafts.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isAdmin && (
          <>
            <Link href="/dashboard/applications">
              <Button variant="outline" size="md" className="rounded-xl text-xs font-semibold">
                Creator Applications
              </Button>
            </Link>
            <Link href="/dashboard/review">
              <Button variant="outline" size="md" className="rounded-xl text-xs font-semibold">
                Editorial Review
              </Button>
            </Link>
          </>
        )}
        <Link href="/dashboard/posts/new">
          <Button variant="primary" size="md" className="rounded-xl gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </Link>
      </div>
    </div>
  );
}
