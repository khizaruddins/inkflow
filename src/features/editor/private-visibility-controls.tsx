'use client';

import React, { useState, useId } from 'react';
import { Lock, Globe, ShieldCheck, KeyRound, Eye, EyeOff, Users } from 'lucide-react';
import { PostVisibility, PrivateLockType } from '@/types';

interface PrivateVisibilityControlsProps {
  visibility: PostVisibility;
  privateLockType?: PrivateLockType;
  secretPassword?: string;
  hasExistingPassword?: boolean;
  allowLinkPasswordAccess?: boolean;
  requirePasswordForGrantedUsers?: boolean;
  requireFollowerToView?: boolean;
  isReaderOnly?: boolean;
  onChange: (patch: {
    visibility?: PostVisibility;
    privateLockType?: PrivateLockType;
    secretPassword?: string;
    allowLinkPasswordAccess?: boolean;
    requirePasswordForGrantedUsers?: boolean;
    requireFollowerToView?: boolean;
  }) => void;
  compact?: boolean;
}

export function PrivateVisibilityControls({
  visibility,
  privateLockType = 'NONE',
  secretPassword = '',
  hasExistingPassword = false,
  allowLinkPasswordAccess = true,
  requirePasswordForGrantedUsers = false,
  requireFollowerToView = false,
  isReaderOnly = false,
  onChange,
  compact = false,
}: PrivateVisibilityControlsProps) {
  const [showSecret, setShowSecret] = useState(false);
  const groupId = useId();

  const normalizedVisibility = visibility?.toLowerCase() === 'private' ? 'private' : visibility || 'public';
  const isPrivate = normalizedVisibility === 'private';
  const lockType: PrivateLockType = privateLockType || 'NONE';

  const pinTrimmed = secretPassword.trim();
  const pinInvalid =
    isPrivate &&
    lockType === 'PIN' &&
    pinTrimmed.length > 0 &&
    !/^\d{4,8}$/.test(pinTrimmed);

  const pinErrorId = `${groupId}-pin-error`;
  const secretInputId = `${groupId}-secret-input`;
  const allowLinkId = `${groupId}-allow-link`;
  const requirePassGrantedId = `${groupId}-require-pass-granted`;
  const requireFollowerId = `${groupId}-require-follower`;

  const handleSelectVisibility = (next: PostVisibility) => {
    if (isReaderOnly && next !== 'private') return;
    onChange({ visibility: next });
  };

  const handleSelectLockType = (next: PrivateLockType) => {
    onChange({
      privateLockType: next,
      ...(next === 'NONE' ? { secretPassword: '' } : {}),
    });
  };

  const handlePinInput = (raw: string) => {
    // Allow numeric digits only up to 8 digits while typing
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 8);
    onChange({ secretPassword: digitsOnly });
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Visibility Radio Group */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-primary" /> Story Visibility
        </legend>

        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5 pt-1`}>
          <label
            htmlFor={`${groupId}-vis-public`}
            className={`relative flex items-start gap-3 p-3 rounded-2xl border transition-all ${
              isReaderOnly
                ? 'opacity-55 cursor-not-allowed border-border/50 bg-muted/20'
                : !isPrivate
                ? 'border-primary bg-primary/5 ring-1 ring-primary/30 cursor-pointer'
                : 'border-border/70 hover:border-border bg-card cursor-pointer'
            }`}
          >
            <input
              id={`${groupId}-vis-public`}
              type="radio"
              name={`${groupId}-visibility`}
              value="public"
              checked={!isPrivate}
              disabled={isReaderOnly}
              onChange={() => handleSelectVisibility('public')}
              className="sr-only"
            />
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <Globe className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">PUBLIC</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {isReaderOnly
                  ? 'Writer or Admin role required for public feed publishing.'
                  : 'Visible on InkFlow feeds, search, and topic pages.'}
              </p>
            </div>
          </label>

          <label
            htmlFor={`${groupId}-vis-private`}
            className={`relative flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
              isPrivate
                ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                : 'border-border/70 hover:border-border bg-card'
            }`}
          >
            <input
              id={`${groupId}-vis-private`}
              type="radio"
              name={`${groupId}-visibility`}
              value="private"
              checked={isPrivate}
              onChange={() => handleSelectVisibility('private')}
              className="sr-only"
            />
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">PRIVATE</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Private — Hidden from home feed, accessible only via share link / authorized people &amp; admin.
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Private Lock & Sharing Rules */}
      {isPrivate && (
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-4">
          {/* Lock Type Selector */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Access Lock Type
            </legend>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(
                [
                  { value: 'NONE', label: 'Invited Only', desc: 'No PIN/password' },
                  { value: 'PIN', label: 'Numeric PIN', desc: '4–8 digits' },
                  { value: 'PASSWORD', label: 'Password', desc: 'Custom text' },
                ] as const
              ).map((opt) => {
                const active = lockType === opt.value;
                return (
                  <label
                    key={opt.value}
                    htmlFor={`${groupId}-lock-${opt.value}`}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                        : 'border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <input
                      id={`${groupId}-lock-${opt.value}`}
                      type="radio"
                      name={`${groupId}-lock-type`}
                      value={opt.value}
                      checked={active}
                      onChange={() => handleSelectLockType(opt.value)}
                      className="sr-only"
                    />
                    <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
                    <span className="text-[10px] opacity-80 leading-tight mt-0.5">{opt.desc}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* PIN or Password Input */}
          {lockType === 'PIN' && (
            <div className="space-y-1.5">
              <label htmlFor={secretInputId} className="block text-xs font-semibold text-foreground">
                4–8 Digit Numeric PIN
              </label>
              <div className="relative">
                <input
                  id={secretInputId}
                  type={showSecret ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="\d{4,8}"
                  maxLength={8}
                  autoComplete="off"
                  value={secretPassword}
                  onChange={(e) => handlePinInput(e.target.value)}
                  placeholder={hasExistingPassword ? 'Enter new 4–8 digit PIN (leave blank to keep)' : 'e.g. 4829'}
                  aria-invalid={pinInvalid}
                  aria-describedby={pinInvalid ? pinErrorId : undefined}
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-background border border-border text-sm font-mono tracking-[0.35em] text-foreground placeholder:tracking-normal placeholder:font-sans placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((prev) => !prev)}
                  aria-pressed={showSecret}
                  aria-label={showSecret ? 'Hide PIN' : 'Show PIN'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pinInvalid && (
                <p id={pinErrorId} role="alert" className="text-[11px] text-rose-500 font-medium">
                  PIN must be 4 to 8 numeric digits.
                </p>
              )}
            </div>
          )}

          {lockType === 'PASSWORD' && (
            <div className="space-y-1.5">
              <label htmlFor={secretInputId} className="block text-xs font-semibold text-foreground">
                Secret Password
              </label>
              <div className="relative">
                <input
                  id={secretInputId}
                  type={showSecret ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={secretPassword}
                  onChange={(e) => onChange({ secretPassword: e.target.value })}
                  placeholder={
                    hasExistingPassword
                      ? 'Enter new password (leave blank to keep current)'
                      : 'Enter secret story password...'
                  }
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((prev) => !prev)}
                  aria-pressed={showSecret}
                  aria-label={showSecret ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Security Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-border/50">
            <label htmlFor={allowLinkId} className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id={allowLinkId}
                type="checkbox"
                checked={Boolean(allowLinkPasswordAccess)}
                onChange={(e) => onChange({ allowLinkPasswordAccess: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-xs text-foreground leading-snug">
                Allow anyone with share URL + PIN/password to unlock
              </span>
            </label>

            <label htmlFor={requirePassGrantedId} className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id={requirePassGrantedId}
                type="checkbox"
                checked={Boolean(requirePasswordForGrantedUsers)}
                onChange={(e) => onChange({ requirePasswordForGrantedUsers: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-xs text-foreground leading-snug">
                Also require PIN/password for invited users
              </span>
            </label>

            <label htmlFor={requireFollowerId} className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id={requireFollowerId}
                type="checkbox"
                checked={Boolean(requireFollowerToView)}
                onChange={(e) => onChange({ requireFollowerToView: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-xs text-foreground leading-snug flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                Require readers to follow you before viewing
              </span>
            </label>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Private stories stay hidden from public feeds and never go through editorial review.</span>
          </div>
        </div>
      )}
    </div>
  );
}

