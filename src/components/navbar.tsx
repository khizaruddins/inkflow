'use client';

import React, { useState } from 'react';
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
  UserCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/user-dropdown';
import { AuthModal } from '@/components/auth-modal';
import { useThemeStore } from '@/store/use-theme-store';
import { useAuthStore } from '@/store/use-auth-store';
import { siteConfig } from '@/config/site';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { role, isAuthenticated, toggleDemoRole } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const isDashboard = pathname.startsWith('/dashboard');
  const isEditorPage =
    pathname === '/dashboard/posts/new' ||
    (pathname.startsWith('/dashboard/posts/') &&
      pathname !== '/dashboard/posts');

  if (isEditorPage) return null;

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const navItems = isDashboard
    ? siteConfig.nav.admin.slice(0, 4)
    : isAuthenticated
      ? siteConfig.nav.reader
      : siteConfig.nav.reader.filter((item) => item.href === '/');

  return (
    <>
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
            {isAuthenticated && (
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
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
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

            {role === 'admin' ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard/posts/new">
                  <Button
                    size="sm"
                    variant="primary"
                    className="rounded-full gap-1.5 font-semibold"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    Write
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1.5 hidden sm:inline-flex"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard/posts/new">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full gap-1.5 text-xs"
                  >
                    <PenSquare className="w-3.5 h-3.5 text-muted-foreground" />
                    Write
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openAuth('login')}
                  className="rounded-full text-xs font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openAuth('signup')}
                  className="rounded-full text-xs font-semibold px-4 shadow-sm"
                >
                  Get started
                </Button>
              </div>
            )}

            {/* User Profile Dropdown Menu */}
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
