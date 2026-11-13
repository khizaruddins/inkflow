'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Flag,
  UserCheck,
  CheckSquare,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export function DashboardTabs() {
  const { role, user } = useAuthStore();
  const pathname = usePathname();
  const isAdmin =
    role === 'admin' || role === 'ADMIN' || user?.role === 'ADMIN';

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Articles',
      href: '/dashboard/posts',
      icon: FileText,
      isActive:
        pathname.startsWith('/dashboard/posts') &&
        pathname !== '/dashboard/posts/new',
    },
    ...(isAdmin
      ? [
          {
            label: 'Users & Deletions',
            href: '/dashboard/users',
            icon: Users,
            isActive: pathname.startsWith('/dashboard/users'),
          },
          {
            label: 'Reports & Flags',
            href: '/dashboard/reports',
            icon: Flag,
            isActive: pathname.startsWith('/dashboard/reports'),
          },
          {
            label: 'Creator Apps',
            href: '/dashboard/applications',
            icon: UserCheck,
            isActive: pathname.startsWith('/dashboard/applications'),
          },
          {
            label: 'Editorial Review',
            href: '/dashboard/review',
            icon: CheckSquare,
            isActive: pathname.startsWith('/dashboard/review'),
          },
        ]
      : []),
  ];

  return (
    <div className="border-b border-border/60 pb-3">
      <nav
        aria-label="Dashboard navigation tabs"
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
