'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/use-auth-store';
import { useReportStore } from '@/store/use-report-store';
import { useAddCommentMutation, useReportCommentMutation } from '@/hooks/queries';
import { Comment } from '@/types';
import { ResponseInput } from '@/features/blogs/response-input';
import { Heart, MessageSquare, MoreHorizontal, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import { MediumClapButton, ClapIcon } from '@/components/ui/clap-icon';
import { CommentService } from '@/services/comment.service';

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const { user } = useAuthStore();
  const { reports, reportResponse } = useReportStore();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const addCommentMutation = useAddCommentMutation();
  const reportMutation = useReportCommentMutation();

  // Track toggled reply trees
  const [hiddenReplyIds, setHiddenReplyIds] = useState<Record<string, boolean>>({});
  // Track open option popovers
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  // Report Modal State
  const [targetCommentForReport, setTargetCommentForReport] = useState<Comment | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [blockAuthor, setBlockAuthor] = useState(false);
  const [reportSuccessNotice, setReportSuccessNotice] = useState(false);

  const toggleReplies = (id: string) => {
    setHiddenReplyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getAuthorAvatar = (avatar?: string, name: string = 'User') => {
    if (avatar && avatar.trim().length > 0) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  const handleAddComment = async (htmlContent: string) => {
    if (!htmlContent.trim() || !user) return;

    try {
      const created = await addCommentMutation.mutateAsync({
        postId,
        content: htmlContent,
      });
      setComments([created, ...comments]);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleAddReply = async (parentCommentId: string, htmlContent: string) => {
    if (!htmlContent.trim() || !user) return;

    try {
      const reply = await addCommentMutation.mutateAsync({
        postId,
        content: htmlContent,
        parentId: parentCommentId,
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentCommentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c
        )
      );

      setActiveReplyId(null);
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  const handleOpenReportModal = (comment: Comment) => {
    setTargetCommentForReport(comment);
    setSelectedReasons([]);
    setBlockAuthor(false);
    setActiveOptionId(null);
  };

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCommentForReport) return;

    reportResponse(
      targetCommentForReport.id,
      targetCommentForReport.author.name,
      targetCommentForReport.content,
      selectedReasons,
      blockAuthor
    );

    reportMutation.mutate({
      commentId: targetCommentForReport.id,
      reasons: selectedReasons,
      blockAuthor,
    });

    setTargetCommentForReport(null);
    setReportSuccessNotice(true);
    setTimeout(() => setReportSuccessNotice(false), 4000);
  };

  return (
    <section className="space-y-8 font-sans border-t border-border/60 pt-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground tracking-tight">
          Responses ({comments.length})
        </h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Rules">
          <Shield className="w-4 h-4" />
        </button>
      </div>

      {reportSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          Response reported successfully. It is now under evaluation by admin moderators.
        </div>
      )}

      {/* Main Comment Input Box */}
      {!user ? (
        <div className="bg-card border border-border/80 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <p className="text-xs text-muted-foreground">Sign in to leave a response or reply to comments.</p>
          <a href="/login" className="inline-block">
            <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold px-5">
              Sign In to Respond
            </Button>
          </a>
        </div>
      ) : (
        <div className="space-y-3 font-sans">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <img
              src={getAuthorAvatar(user.avatar, user.name)}
              alt={user.name}
              className="w-6 h-6 rounded-full object-cover border border-border/60"
            />
            <span>{user.name}</span>
          </div>

          <ResponseInput
            placeholder="What are your thoughts?"
            onSubmit={handleAddComment}
          />
        </div>
      )}

      {/* Threaded Comments Feed */}
      <div className="space-y-6">
        {comments.map((comment) => {
          const hasReplies = comment.replies && comment.replies.length > 0;
          const isRepliesHidden = hiddenReplyIds[comment.id];
          const isUnderEvaluation = reports.some((r) => r.commentId === comment.id && r.status === 'under_evaluation');
          const isDeletedByAdmin = reports.some((r) => r.commentId === comment.id && r.status === 'deleted');

          if (isDeletedByAdmin) {
            return (
              <div key={comment.id} className="p-4 rounded-2xl bg-muted/40 text-xs text-muted-foreground italic border border-border/40">
                This response was removed by admin moderators.
              </div>
            );
          }

          return (
            <div key={comment.id} className="space-y-4 border-b border-border/40 pb-6 relative overflow-hidden">
              {/* Evaluation Notice */}
              {isUnderEvaluation && (
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl inline-block">
                  Under evaluation by admin moderators
                </div>
              )}

              {/* Comment Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={getAuthorAvatar(comment.author.avatar, comment.author.name)}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-border/60"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-tight">{comment.author.name}</h4>
                    <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                </div>

                {/* Option Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setActiveOptionId(activeOptionId === comment.id ? null : comment.id)}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors focus:outline-none"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {activeOptionId === comment.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute right-0 mt-1 w-44 rounded-2xl bg-card border border-border/80 z-50 overflow-hidden py-1 shadow-lg"
                      >
                        <button
                          onClick={() => handleOpenReportModal(comment)}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          Report response...
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Formatted Comment HTML Content with URL line-breaking */}
              <div
                className="text-xs text-foreground/90 leading-relaxed font-sans prose-sm dark:prose-invert max-w-none break-words [overflow-wrap:anywhere] [word-break:break-word] [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400 [&_a]:underline [&_a]:decoration-emerald-500/40 [&_a]:underline-offset-2 [&_a]:break-all [&_a]:[overflow-wrap:anywhere] [&_a]:hover:text-emerald-500"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />

              {/* Action Bar */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-sans">
                <MediumClapButton
                  clapsCount={comment.clapsCount}
                  onClap={async () => {
                    if (user) {
                      try {
                        await CommentService.clapComment(comment.id);
                      } catch {}
                    }
                  }}
                  size="sm"
                />

                {hasReplies && (
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="flex items-center gap-1.5 hover:text-foreground cursor-pointer font-medium transition-colors focus:outline-none rounded-md px-1.5 py-0.5 hover:bg-muted/40"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {isRepliesHidden
                      ? `${comment.replies?.length || 0} ${(comment.replies?.length || 0) === 1 ? 'reply' : 'replies'}`
                      : 'Hide replies'}
                  </button>
                )}

                <button
                  onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                  className="hover:text-foreground cursor-pointer font-medium transition-colors focus:outline-none"
                >
                  Reply
                </button>
              </div>

              {/* Reply Visual Rich Input */}
              {activeReplyId === comment.id && user && (
                <div className="mt-3 pl-4 border-l-2 border-border/60">
                  <ResponseInput
                    placeholder={`Replying to ${comment.author.name}...`}
                    replyingToName={comment.author.name}
                    onSubmit={(html) => handleAddReply(comment.id, html)}
                    onCancel={() => setActiveReplyId(null)}
                  />
                </div>
              )}

              {/* Nested Replies */}
              {hasReplies && !isRepliesHidden && (
                <div className="pl-6 space-y-4 pt-2 border-l-2 border-border/60 overflow-hidden">
                  {comment.replies?.map((reply, rIdx) => (
                    <div key={`${reply.id}-${rIdx}`} className="space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={getAuthorAvatar(reply.author.avatar, reply.author.name)}
                            alt={reply.author.name}
                            className="w-6 h-6 rounded-full object-cover border border-border/60"
                          />
                          <h5 className="text-xs font-bold text-foreground">{reply.author.name}</h5>
                          <span className="text-[10px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
                        </div>
                      </div>

                      <div
                        className="text-xs text-foreground/90 leading-relaxed font-sans prose-sm dark:prose-invert max-w-none break-words [overflow-wrap:anywhere] [word-break:break-word] [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400 [&_a]:underline [&_a]:decoration-emerald-500/40 [&_a]:underline-offset-2 [&_a]:break-all [&_a]:[overflow-wrap:anywhere] [&_a]:hover:text-emerald-500"
                        dangerouslySetInnerHTML={{ __html: reply.content }}
                      />

                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <MediumClapButton
                          clapsCount={reply.clapsCount}
                          onClap={async () => {
                            if (user) {
                              try {
                                await CommentService.clapComment(reply.id);
                              } catch {}
                            }
                          }}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Report Response Modal */}
      <Modal
        isOpen={!!targetCommentForReport}
        onClose={() => setTargetCommentForReport(null)}
        title="Report Response"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4 font-sans text-left">
          <p className="text-xs text-muted-foreground">
            Please select all reasons that apply for reporting this response by <strong>{targetCommentForReport?.author.name}</strong>:
          </p>

          <div className="space-y-3 pt-1">
            {[
              'Harassment',
              'Rules Violation',
              'Spam',
              'AI-generated',
            ].map((reason) => (
              <label key={reason} className="flex items-center gap-3 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason)}
                  onChange={() => toggleReason(reason)}
                  className="w-4 h-4 rounded border-border text-rose-600 focus:ring-rose-500"
                />
                <span>{reason}</span>
              </label>
            ))}

            <div className="h-px bg-border/40 my-2" />

            <label className="flex items-center gap-3 text-xs font-semibold text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={blockAuthor}
                onChange={(e) => setBlockAuthor(e.target.checked)}
                className="w-4 h-4 rounded border-border text-rose-600 focus:ring-rose-500"
              />
              <span>Also block the author of this response</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setTargetCommentForReport(null)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              className="rounded-full px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Report
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
