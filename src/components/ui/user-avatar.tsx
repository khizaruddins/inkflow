'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageWithSkeleton } from '@/components/ui/skeleton';

export function isAdminRole(role?: string | null): boolean {
  return typeof role === 'string' && role.trim().toUpperCase() === 'ADMIN';
}

export function resolveAvatarUrl(src?: string | null, fallbackName: string = 'User'): string {
  if (src && src.trim().length > 0) return src;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || 'User')}&background=random`;
}

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const SIZE_STYLES: Record<
  UserAvatarSize,
  {
    px: number;
    container: string;
    badge: string;
    icon: string;
    ring: string;
  }
> = {
  xs: {
    px: 24,
    container: 'w-6 h-6',
    badge: 'w-3.5 h-3.5 -top-1.5 left-1/2 -translate-x-1/2',
    icon: 'w-2 h-2',
    ring: 'ring-[1.5px] ring-amber-400/90',
  },
  sm: {
    px: 28,
    container: 'w-7 h-7',
    badge: 'w-4 h-4 -top-2 left-1/2 -translate-x-1/2',
    icon: 'w-2.5 h-2.5',
    ring: 'ring-2 ring-amber-400/90',
  },
  md: {
    px: 36,
    container: 'w-9 h-9',
    badge: 'w-4 h-4 -top-2 left-1/2 -translate-x-1/2',
    icon: 'w-2.5 h-2.5',
    ring: 'ring-2 ring-amber-400/90',
  },
  lg: {
    px: 48,
    container: 'w-12 h-12',
    badge: 'w-5 h-5 -top-2.5 left-1/2 -translate-x-1/2',
    icon: 'w-3 h-3',
    ring: 'ring-2 ring-amber-400/90 ring-offset-1 ring-offset-background',
  },
  xl: {
    px: 80,
    container: 'w-20 h-20',
    badge: 'w-6 h-6 -top-3 left-1/2 -translate-x-1/2',
    icon: 'w-3.5 h-3.5',
    ring: 'ring-2 ring-amber-400/90 ring-offset-2 ring-offset-background',
  },
  '2xl': {
    px: 96,
    container: 'w-24 h-24',
    badge: 'w-7 h-7 -top-3.5 left-1/2 -translate-x-1/2',
    icon: 'w-4 h-4',
    ring: 'ring-[2.5px] ring-amber-400/90 ring-offset-2 ring-offset-background',
  },
};

export interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  role?: string | null;
  isAdmin?: boolean;
  size?: UserAvatarSize;
  pxSize?: number;
  /** Optional sizing/border classes applied to the circular image container */
  containerClassName?: string;
  /** Classes applied to the inner <img> */
  imgClassName?: string;
  /** Classes applied to the outer relative wrapper */
  wrapperClassName?: string;
  /** Optional custom classes for the admin crown badge */
  badgeClassName?: string;
}

export function UserAvatar({
  src,
  alt,
  name,
  role,
  isAdmin: isAdminProp,
  size = 'md',
  pxSize,
  containerClassName,
  imgClassName,
  wrapperClassName,
  badgeClassName,
}: UserAvatarProps) {
  const showCrown = Boolean(isAdminProp || isAdminRole(role));
  const preset = SIZE_STYLES[size];
  const dimension = pxSize ?? preset.px;
  const displayAlt = alt || name || 'User avatar';
  const resolvedSrc = resolveAvatarUrl(src, name || alt || 'User');

  return (
    <span className={cn('relative inline-flex shrink-0 select-none', wrapperClassName)}>
      <span
        className={cn(
          'inline-flex rounded-full overflow-hidden bg-muted',
          preset.container,
          showCrown && preset.ring,
          containerClassName
        )}
      >
        <ImageWithSkeleton
          src={resolvedSrc}
          alt={displayAlt}
          width={dimension}
          height={dimension}
          wrapperClassName="w-full h-full rounded-full"
          className={cn('w-full h-full rounded-full object-cover aspect-square', imgClassName)}
        />
      </span>

      {showCrown && (
        <span
          title="InkFlow Admin"
          aria-label="InkFlow Admin"
          className={cn(
            'pointer-events-none absolute z-10 inline-flex items-center justify-center rounded-full',
            'bg-gradient-to-br from-amber-300 via-amber-500 to-orange-500 text-amber-950',
            'shadow-[0_2px_6px_rgba(245,158,11,0.55)] ring-2 ring-background',
            preset.badge,
            badgeClassName
          )}
        >
          <Crown className={cn('fill-amber-950/20 stroke-[2.4]', preset.icon)} aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
