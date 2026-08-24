'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      default: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs',
      primary: 'bg-foreground text-background hover:bg-foreground/90 shadow-xs',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-foreground/80 bg-background text-foreground hover:bg-muted shadow-2xs',
      ghost: 'hover:bg-muted text-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      glass: 'glass-panel text-foreground hover:bg-white/40 dark:hover:bg-white/10 border border-white/20 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-4 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-5 py-2 gap-2',
      lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5',
      icon: 'p-2 w-9 h-9 rounded-full',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
