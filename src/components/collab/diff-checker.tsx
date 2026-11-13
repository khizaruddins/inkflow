'use client';

import React, { useMemo, useState } from 'react';
import { diffWords, diffLines, Change } from 'diff';
import {
  Check,
  X,
  GitCommit,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  Columns,
  ListFilter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollabSuggestion } from '@/types';
import { formatDate } from '@/lib/utils';

// Helper to convert HTML to cleaner text blocks for readable diff comparison
function stripHtmlKeepParagraphs(html: string): string {
  if (!html) return '';
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

interface DiffCheckerProps {
  suggestion: CollabSuggestion;
  isAuthorOrAdmin: boolean;
  onApprove?: (suggestionId: string, note?: string) => Promise<void>;
  onReject?: (suggestionId: string, note?: string) => Promise<void>;
  isProcessing?: boolean;
}

export function DiffChecker({
  suggestion,
  isAuthorOrAdmin,
  onApprove,
  onReject,
  isProcessing = false,
}: DiffCheckerProps) {
  const [viewMode, setViewMode] = useState<'inline' | 'side-by-side'>('inline');
  const [reviewNote, setReviewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const originalClean = useMemo(
    () => stripHtmlKeepParagraphs(suggestion.originalContent || ''),
    [suggestion.originalContent],
  );
  const suggestedClean = useMemo(
    () => stripHtmlKeepParagraphs(suggestion.suggestedContent || ''),
    [suggestion.suggestedContent],
  );

  const wordDiffs = useMemo(() => {
    return diffWords(originalClean, suggestedClean);
  }, [originalClean, suggestedClean]);

  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    wordDiffs.forEach((part) => {
      const words = part.value.trim().split(/\s+/).filter(Boolean).length;
      if (part.added) additions += words;
      if (part.removed) deletions += words;
    });
    return { additions, deletions };
  }, [wordDiffs]);

  const isPending = suggestion.status === 'PENDING';
  const isApproved = suggestion.status === 'APPROVED';
  const isRejected = suggestion.status === 'REJECTED';

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Suggestion Top Banner */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={suggestion.user.avatar || 'https://ui-avatars.com/api/?name=User'}
            alt={suggestion.user.name}
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm sm:text-base">
                {suggestion.user.name}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                @{suggestion.user.username}
              </span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Approved & Merged
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <XCircle className="w-3 h-3" /> Declined
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Clock className="w-3 h-3" /> Pending Review
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Proposed {formatDate(suggestion.createdAt)}
            </p>
          </div>
        </div>

        {/* Diff Stats & View Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-lg bg-background border border-border">
            <span className="text-emerald-500 font-semibold">+{stats.additions} words</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-rose-500 font-semibold">-{stats.deletions} words</span>
          </div>

          <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('inline')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === 'inline'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Inline
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Side-by-Side
            </button>
          </div>
        </div>
      </div>

      {/* Diff Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[280px] max-h-[460px]">
        {viewMode === 'inline' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none font-sans text-sm leading-relaxed whitespace-pre-wrap">
            {wordDiffs.map((part, index) => {
              if (part.added) {
                return (
                  <mark
                    key={index}
                    className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium px-1 py-0.5 rounded mx-0.5 border border-emerald-500/30"
                    title="Added text"
                  >
                    {part.value}
                  </mark>
                );
              }
              if (part.removed) {
                return (
                  <del
                    key={index}
                    className="bg-rose-500/15 text-rose-600 dark:text-rose-400 line-through px-1 py-0.5 rounded mx-0.5 border border-rose-500/20 opacity-80"
                    title="Removed text"
                  >
                    {part.value}
                  </del>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Original Column */}
            <div className="flex flex-col rounded-xl border border-border bg-muted/10 p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Original Text (Before)
                </span>
                <span className="text-xs text-rose-500 font-mono">-{stats.deletions}</span>
              </div>
              <div className="flex-1 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {originalClean || <span className="italic text-xs">Empty draft</span>}
              </div>
            </div>

            {/* Proposed Column */}
            <div className="flex flex-col rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/20">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Proposed Changes (After)
                </span>
                <span className="text-xs text-emerald-500 font-mono">+{stats.additions}</span>
              </div>
              <div className="flex-1 overflow-y-auto text-sm text-foreground whitespace-pre-wrap leading-relaxed font-normal">
                {suggestedClean}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Note Display if reviewed */}
      {suggestion.reviewNote && (
        <div className="px-5 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
          <span className="font-semibold text-foreground">Reviewer Note:</span>
          <span>{suggestion.reviewNote}</span>
        </div>
      )}

      {/* Bottom Actions for Author / Admin */}
      {isAuthorOrAdmin && isPending && (
        <div className="p-4 border-t border-border bg-background flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {showNoteInput ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Optional feedback note for collaborator..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowNoteInput(false)}
                className="text-xs text-muted-foreground hover:text-foreground px-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors text-left"
            >
              + Add feedback note
            </button>
          )}

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => onReject && onReject(suggestion.id, reviewNote)}
              className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 text-xs"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Decline
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isProcessing}
              onClick={() => onApprove && onApprove(suggestion.id, reviewNote)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm"
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Approve & Merge Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
