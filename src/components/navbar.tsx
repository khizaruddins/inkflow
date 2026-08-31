'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun,
  Moon,
  PenSquare,
  Search,
  Bookmark,
  Bell,
  LayoutDashboard,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/user-dropdown';
import { useThemeStore } from '@/store/use-theme-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useNotificationsQuery } from '@/hooks/queries';
import { siteConfig } from '@/config/site';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { role, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: notifications = [] } = useNotificationsQuery();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;
  const isDashboard = pathname.startsWith('/dashboard');
  const isEditorPage =
    pathname === '/dashboard/posts/new' ||
    (pathname.startsWith('/dashboard/posts/') &&
      pathname !== '/dashboard/posts');
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  if (isEditorPage || isAuthPage) return null;

  const isUserAuth = mounted && isAuthenticated;

  const navItems = isDashboard
    ? siteConfig.nav.admin.slice(0, 4)
    : isUserAuth
      ? siteConfig.nav.reader
      : siteConfig.nav.reader.filter((item) => item.href === '/');

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-black tracking-tight text-foreground font-serif group-hover:opacity-90 transition-opacity">
              Ink<span className="text-primary font-sans">Flow</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-primary ${
                  pathname === item.href
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* User Specific Action Icons (Only shown when authenticated) */}
          {isUserAuth && (
            <>
              {/* Quick Search */}
              <Link href="/search">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </Link>

              {/* Library Link */}
              <Link href="/library">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Your Library"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              </Link>

              {/* Notifications Bell */}
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative"
                  title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-emerald-600 rounded-full shadow-xs ring-2 ring-background">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </>
          )}

          {/* Dark / Light Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </Button>

          {/* Auth State CTAs */}
          {!mounted ? (
            <div className="w-20 h-8" />
          ) : isUserAuth ? (
            role === 'admin' ||
            role === 'ADMIN' ||
            role === 'writer' ||
            role === 'WRITER' ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard/posts/new">
                  <Button
                    size="sm"
                    variant="primary"
                    className="rounded-full gap-1.5 font-semibold text-xs px-4"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    Write
                  </Button>
                </Link>
                {(role === 'admin' || role === 'ADMIN') && (
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1.5 hidden sm:inline-flex text-xs"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            ) : null
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-xs font-semibold"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  variant="primary"
                  className="rounded-full text-xs font-semibold px-4 shadow-sm"
                >
                  Get started
                </Button>
              </Link>
            </div>
          )}

          {/* User Profile Dropdown Menu */}
          {isUserAuth && <UserDropdown />}
        </div>
      </div>
    </header>
  );
}
