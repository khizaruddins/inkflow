'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useReportStore } from '@/store/use-report-store';
import { ReportService } from '@/services/report.service';
import { PostReport } from '@/types';
import {
  Shield,
  Trash2,
  CheckCircle,
  AlertTriangle,
  UserX,
  FileText,
  MessageSquare,
  MessageCircle,
  ExternalLink,
  Send,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { DashboardTabs } from '@/features/dashboard/dashboard-tabs';

export default function ReportsManagementPage() {
  const [activeTab, setActiveTab] = useState<'stories' | 'comments'>('stories');
  const [postReports, setPostReports] = useState<PostReport[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Warn Author Modal State
  const [warnModalReport, setWarnModalReport] = useState<PostReport | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isSubmittingWarn, setIsSubmittingWarn] = useState(false);

  // Comment store
  const { reports: commentReports, deleteReportedResponse, dismissReport, blockedAuthors } = useReportStore();

  const loadPostReports = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await ReportService.getPostReports();
      setPostReports(data);
    } catch (err: any) {
      console.error('Failed to load post reports:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPostReports();
  }, []);

  // Action: Take Down / Delete Story
  const handleDeletePost = async (report: PostReport) => {
    if (!confirm(`Are you sure you want to take down and permanently delete the story "${report.post?.title || 'Reported Story'}"?`)) {
      return;
    }

    try {
      await ReportService.deleteReportedPost(report.id);
      setActionFeedback(`Story "${report.post?.title || 'Reported Story'}" has been taken down.`);
      await loadPostReports();
    } catch (err: any) {
      alert(err.message || 'Failed to delete story.');
    }
  };

  // Action: Warn Author
  const handleConfirmWarnAuthor = async () => {
    if (!warnModalReport || !adminComment.trim()) return;
    setIsSubmittingWarn(true);

    try {
      await ReportService.warnPostAuthor(warnModalReport.id, adminComment.trim());
      setActionFeedback(`Warning message sent to author of "${warnModalReport.post?.title}".`);
      setWarnModalReport(null);
      setAdminComment('');
      await loadPostReports();
    } catch (err: any) {
      alert(err.message || 'Failed to send warning to author.');
    } finally {
      setIsSubmittingWarn(false);
    }
  };

  // Action: Dismiss Post Report
  const handleDismissPostReport = async (reportId: string) => {
    try {
      await ReportService.dismissPostReport(reportId);
      setActionFeedback('Story report has been dismissed.');
      await loadPostReports();
    } catch (err: any) {
      alert(err.message || 'Failed to dismiss report.');
    }
  };

  const pendingPostReports = postReports.filter((r) => r.status === 'PENDING');
  const activeCommentReports = commentReports.filter((r) => r.status === 'under_evaluation');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[calc(100vh-14rem)] font-sans">
      <DashboardTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-rose-500" />
            Content Moderation &amp; Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Review reported blog stories and responses, take down violating content, or send warnings to authors.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-border/80">
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stories'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Story Reports ({pendingPostReports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Comment Reports ({activeCommentReports.length})
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 1: STORY (BLOG) REPORTS */}
      {/* =================================================================== */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {isLoadingPosts ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              Loading reported blog stories...
            </div>
          ) : postReports.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2 bg-card border border-border/80 rounded-3xl p-8">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/60" />
              <h3 className="text-base font-bold text-foreground">No reported stories</h3>
              <p className="text-xs text-muted-foreground">All blog story reports have been evaluated and resolved.</p>
            </div>
          ) : (
            postReports.map((rep) => {
              const isPending = rep.status === 'PENDING';

              return (
                <div
                  key={rep.id}
                  className={`p-6 rounded-3xl border transition-all space-y-4 ${
                    isPending ? 'bg-card border-rose-500/40 shadow-sm' : 'bg-muted/20 border-border/40 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">
                        Reported Story:
                      </span>
                      {rep.post?.slug ? (
                        <Link
                          href={`/blog/${rep.post.slug}`}
                          target="_blank"
                          className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          "{rep.post.title}" <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="font-semibold text-foreground">
                          "{rep.post?.title || 'Story ID: ' + rep.postId}"
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-muted-foreground">
                        Author: <strong>{rep.post?.author?.name || 'Unknown'}</strong> (@{rep.post?.author?.username || 'unknown'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-[11px]">{formatDate(rep.createdAt)}</span>
                      <Badge
                        variant={isPending ? 'destructive' : rep.status === 'RESOLVED' ? 'secondary' : 'outline'}
                        className="rounded-full text-[10px] font-bold uppercase tracking-wider"
                      >
                        {rep.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Reasons and Reporter Info */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Flag Reason:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                        {rep.reason.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="text-muted-foreground">• Reported by: <strong>{rep.reporter?.name || 'User'}</strong> (@{rep.reporter?.username || 'user'})</span>
                    </div>

                    {rep.customNote && (
                      <div className="space-y-0.5 pt-1">
                        <span className="text-[11px] font-bold text-foreground">Reporter's Details / Note:</span>
                        <p className="italic text-muted-foreground bg-background/50 p-2.5 rounded-xl border border-border/40 font-serif">
                          "{rep.customNote}"
                        </p>
                      </div>
                    )}

                    {rep.adminNote && (
                      <div className="space-y-0.5 pt-1">
                        <span className="text-[11px] font-bold text-primary">Moderator Resolution Note:</span>
                        <p className="text-foreground bg-primary/5 p-2.5 rounded-xl border border-primary/20">
                          {rep.adminNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Reports */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismissPostReport(rep.id)}
                        className="rounded-full text-xs font-semibold"
                      >
                        Dismiss Report
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setWarnModalReport(rep);
                          setAdminComment(
                            `Editorial Notice: Your story "${rep.post?.title || 'post'}" was flagged for ${rep.reason.toLowerCase().replace('_', ' ')}. Please review and update the content or it may be taken down.`
                          );
                        }}
                        className="rounded-full text-xs font-bold text-amber-600 border-amber-500/30 hover:bg-amber-500/10 gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Warn Author &amp; Comment
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePost(rep)}
                        className="rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Take Down / Delete Story
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: COMMENT REPORTS */}
      {/* =================================================================== */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {blockedAuthors.length > 0 && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-rose-500" /> Blocked Authors ({blockedAuthors.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {blockedAuthors.map((name) => (
                  <span key={name} className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {commentReports.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2 bg-card border border-border/80 rounded-3xl p-8">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/60" />
              <h3 className="text-base font-bold text-foreground">No pending comment reports</h3>
              <p className="text-xs text-muted-foreground">All comment flags have been evaluated.</p>
            </div>
          ) : (
            commentReports.map((rep) => (
              <div
                key={rep.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 ${
                  rep.status === 'under_evaluation'
                    ? 'bg-card border-rose-500/30'
                    : 'bg-muted/20 border-border/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Author: {rep.authorName}</span>
                    <span>•</span>
                    <span className="text-muted-foreground">Reported on {rep.reportedAt}</span>
                  </div>

                  <Badge
                    variant={
                      rep.status === 'under_evaluation'
                        ? 'destructive'
                        : rep.status === 'deleted'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="rounded-full text-[10px] font-bold uppercase"
                  >
                    {rep.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 text-xs text-foreground font-serif leading-relaxed italic">
                  "{rep.commentContent}"
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Violation Reasons:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rep.reasons.map((r) => (
                      <span key={r} className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {rep.status === 'under_evaluation' && (
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissReport(rep.id)}
                      className="rounded-full text-xs font-semibold"
                    >
                      Dismiss Flag
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteReportedResponse(rep.id)}
                      className="rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Response
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* WARN AUTHOR MODAL */}
      {/* =================================================================== */}
      {warnModalReport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="warn-author-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans"
        >
          <div className="w-full max-w-lg bg-card p-6 sm:p-8 rounded-3xl border border-amber-500/40 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setWarnModalReport(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-extrabold uppercase tracking-wider">
                Editorial Warning
              </span>
              <h3 id="warn-author-title" className="text-xl font-bold text-foreground">
                Send Warning to Author
              </h3>
              <p className="text-xs text-muted-foreground">
                Target Story: <strong>"{warnModalReport.post?.title}"</strong> by {warnModalReport.post?.author?.name}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-foreground block">
                Warning / Feedback Comment (will be delivered to author):
              </label>
              <textarea
                rows={4}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Explain the required edits or violations. If not resolved, the story may be taken down..."
                className="w-full px-4 py-2.5 rounded-2xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSubmittingWarn}
                onClick={() => setWarnModalReport(null)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                disabled={isSubmittingWarn || !adminComment.trim()}
                onClick={handleConfirmWarnAuthor}
                className="rounded-full text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingWarn ? 'Sending...' : 'Send Warning & Resolve Flag'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
