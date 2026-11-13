'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Users, Flag, UserCheck, FileText } from 'lucide-react';
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
            ? 'Overview of platform content performance, user accounts, deletion requests, and editorial reviews.'
            : `Personal dashboard for ${user?.name || 'Writer'}: article performance, views, and content drafts.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isAdmin && (
          <>
            <Link href="/dashboard/users">
              <Button variant="outline" size="md" className="rounded-xl text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                <Users className="w-3.5 h-3.5" />
                Users &amp; Deletions
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" size="md" className="rounded-xl text-xs font-semibold gap-1.5 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10">
                <Flag className="w-3.5 h-3.5" />
                Reports &amp; Flags
              </Button>
            </Link>
            <Link href="/dashboard/applications">
              <Button variant="outline" size="md" className="rounded-xl text-xs font-semibold gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Creator Apps
              </Button>
            </Link>
            <Link href="/dashboard/review">
              <Button variant="outline" size="md" className="rounded-xl text-xs font-semibold gap-1.5">
                <FileText className="w-3.5 h-3.5" />
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
