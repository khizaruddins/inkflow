'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { DashboardTabs } from './dashboard-tabs';

export function DashboardHeader() {
  const { role, user } = useAuthStore();
  const isAdmin = role === 'admin' || role === 'ADMIN' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isAdmin ? 'Admin & Writer Dashboard' : 'Writer Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin
              ? 'Platform performance overview, member management, moderation reports, and content editorial reviews.'
              : `Personal dashboard for ${user?.name || 'Writer'}: article metrics, reads, and drafts.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/dashboard/posts/new">
            <Button
              variant="primary"
              size="md"
              className="rounded-xl gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer h-10 px-4"
            >
              <Plus className="w-4 h-4" />
              New Article
            </Button>
          </Link>
        </div>
      </div>

      <DashboardTabs />
    </div>
  );
}
