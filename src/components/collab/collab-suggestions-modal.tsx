'use client';

import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { DiffChecker } from './diff-checker';
import { CollabSuggestion } from '@/types';
import { formatDate } from '@/lib/utils';

interface CollabSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  isAuthorOrAdmin: boolean;
  suggestions: CollabSuggestion[];
  onApprove: (suggestionId: string, note?: string) => Promise<void>;
  onReject: (suggestionId: string, note?: string) => Promise<void>;
  selectedSuggestionId?: string | null;
}

export function CollabSuggestionsModal({
  isOpen,
  onClose,
  postId,
  isAuthorOrAdmin,
  suggestions,
  onApprove,
  onReject,
  selectedSuggestionId: initialSelectedId,
}: CollabSuggestionsModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync selected suggestion
  const activeSuggestion =
    suggestions.find((s) => s.id === (selectedId || initialSelectedId)) ||
    suggestions.find((s) => s.status === 'PENDING') ||
    suggestions[0] ||
    null;

  const filteredSuggestions = suggestions.filter((s) => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  const pendingCount = suggestions.filter((s) => s.status === 'PENDING').length;

  const handleApprove = async (id: string, note?: string) => {
    setIsProcessing(true);
    try {
      await onApprove(id, note);
    } catch (_) {}
    setIsProcessing(false);
  };

  const handleReject = async (id: string, note?: string) => {
    setIsProcessing(true);
    try {
      await onReject(id, note);
    } catch (_) {}
    setIsProcessing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revisions & Approval Reviews"
      description="Review proposed contributions with interactive before/after diff checker."
      className="max-w-5xl w-[95vw] h-[85vh] p-4 sm:p-6 overflow-hidden flex flex-col bg-card border-border"
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Tabs */}
        <div className="pb-3 border-b border-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Proposals ({suggestions.length})
            </span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'PENDING'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'ALL'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({suggestions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('APPROVED')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'APPROVED'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Approved
              </button>
            </div>
          </div>

        {/* Content Body */}
        {suggestions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-foreground">No Proposed Changes Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              When co-authors write in Approval Mode, their proposed changes will appear here with an
              instant diff checker for your review and one-click merge.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Suggestions Sidebar List */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border overflow-y-auto p-3 space-y-2 bg-muted/10 shrink-0 max-h-48 md:max-h-none">
              {filteredSuggestions.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 italic">
                  No {filter.toLowerCase()} suggestions.
                </p>
              ) : (
                filteredSuggestions.map((s) => {
                  const isSelected = activeSuggestion?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={s.user?.avatar || 'https://ui-avatars.com/api/?name=User'}
                            alt={s.user?.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <span className="font-medium text-xs text-foreground truncate">
                            {s.user?.name}
                          </span>
                        </div>
                        {s.status === 'PENDING' && (
                          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                        {s.status === 'APPROVED' && (
                          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Merged
                          </span>
                        )}
                        {s.status === 'REJECTED' && (
                          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Declined
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1">
                        {s.diffSummary || 'Revision proposed for draft'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {formatDate(s.createdAt)}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Active Diff Viewer Pane */}
            <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-card">
              {activeSuggestion ? (
                <DiffChecker
                  suggestion={activeSuggestion}
                  isAuthorOrAdmin={isAuthorOrAdmin}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={isProcessing}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Select a suggestion to inspect the diff.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
