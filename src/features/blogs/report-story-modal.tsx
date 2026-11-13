'use client';

import React, { useState } from 'react';
import { Flag, AlertTriangle, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportService } from '@/services/report.service';
import { useAuthStore } from '@/store/use-auth-store';
import Link from 'next/link';

interface ReportStoryModalProps {
  postId: string;
  postTitle: string;
}

const REPORT_REASONS = [
  { id: 'abusive', label: 'Abusive or Harassing', desc: 'Personal attacks, hate speech, or harassment.' },
  { id: 'inappropriate', label: 'Inappropriate Content', desc: 'NSFW, sensitive, or offensive material.' },
  { id: 'false_claim', label: 'False Claim / Misinformation', desc: 'Fabricated facts, misleading technical claims, or impersonation.' },
  { id: 'other', label: 'Other Concerns', desc: 'Copyright violation, spam, or other platform issues.' },
];

export function ReportStoryModal({ postId, postTitle }: ReportStoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('abusive');
  const [customNote, setCustomNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isAuthenticated } = useAuthStore();

  const handleOpen = () => {
    setIsOpen(true);
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedReason('abusive');
    setCustomNote('');
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await ReportService.reportPost(postId, selectedReason, customNote);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Small Discreet Report Trigger Button at the End of Every Blog */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Report this story"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-rose-500 transition-colors py-1.5 px-3 rounded-full hover:bg-rose-500/10 cursor-pointer font-sans"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Report story</span>
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-card p-6 sm:p-8 rounded-3xl border border-border/80 space-y-6 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-foreground">Report Submitted</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Thank you for keeping our community safe. Your report has been submitted to InkFlow administrators for evaluation.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleClose}
                    className="rounded-full text-xs px-6 font-bold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">Sign In Required</h3>
                  <p className="text-xs text-muted-foreground">
                    Please sign in to submit a story report to platform moderators.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <Link href="/login">
                    <Button size="sm" variant="primary" className="rounded-full text-xs px-5">
                      Sign In
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={handleClose} className="rounded-full text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Story Moderation
                  </div>
                  <h3 id="report-modal-title" className="text-xl font-black text-foreground">
                    Report "{postTitle}"
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select a reason for reporting this post to InkFlow administrators.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* Reasons Radio List */}
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => {
                    const isSelected = selectedReason === r.id;
                    return (
                      <label
                        key={r.id}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/5 border-primary text-foreground'
                            : 'bg-muted/30 border-border/60 hover:bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        <input
                          type="radio"
                          name="report-reason"
                          value={r.id}
                          checked={isSelected}
                          onChange={() => setSelectedReason(r.id)}
                          className="mt-0.5 accent-primary"
                        />
                        <div className="space-y-0.5">
                          <div className={`text-xs font-bold ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
                            {r.label}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Free Text Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    Additional Details / Your View (Optional):
                  </label>
                  <textarea
                    rows={3}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Provide specific paragraphs or context to help moderators evaluate..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleClose}
                    className="rounded-full text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="destructive"
                    disabled={isSubmitting}
                    className="rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
