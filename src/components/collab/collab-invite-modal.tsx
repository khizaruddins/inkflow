'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Shield,
  Users,
  ExternalLink,
  Mail,
  Search,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CollabService } from '@/services/collab.service';
import { CollabCollaborator } from '@/types';

interface CollabInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  collabInviteToken: string | null;
  onTokenRegenerated?: (newToken: string) => void;
}

export function CollabInviteModal({
  isOpen,
  onClose,
  postId,
  postTitle,
  collabInviteToken,
  onTokenRegenerated,
}: CollabInviteModalProps) {
  const [inviteInput, setInviteInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [collaborators, setCollaborators] = useState<CollabCollaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);

  const inviteUrl =
    typeof window !== 'undefined' && collabInviteToken
      ? `${window.location.origin}/dashboard/posts/${postId}?collabToken=${collabInviteToken}`
      : '';

  useEffect(() => {
    if (isOpen && postId) {
      loadCollaborators();
      setFeedback(null);
      setInviteInput('');
    }
  }, [isOpen, postId]);

  async function loadCollaborators() {
    setLoadingCollaborators(true);
    try {
      const state = await CollabService.getState(postId);
      setCollaborators(state.collaborators || []);
    } catch (_) {}
    setLoadingCollaborators(false);
  }

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (_) {}
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setFeedback(null);
    try {
      const res = await CollabService.regenerateToken(postId);
      if (res?.collabInviteToken && onTokenRegenerated) {
        onTokenRegenerated(res.collabInviteToken);
      }
      setFeedback({ type: 'success', message: 'Collaboration link updated.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to regenerate link.' });
    }
    setIsRegenerating(false);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inviteInput.trim();
    if (!query) return;

    setIsSending(true);
    setFeedback(null);
    try {
      const isEmail = query.includes('@');
      await CollabService.invite(postId, {
        ...(isEmail ? { email: query } : { username: query }),
        canEdit: true,
      });
      setFeedback({
        type: 'success',
        message: `Invitation successfully sent to ${query}!`,
      });
      setInviteInput('');
      await loadCollaborators();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to send invite. Check username or email.',
      });
    }
    setIsSending(false);
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await CollabService.removeCollaborator(postId, userId);
      setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
      setFeedback({ type: 'success', message: 'Collaborator removed.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to remove collaborator.' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Co-Authors & Collaborators"
      description={postTitle ? `Story: ${postTitle}` : 'Share access to co-write in real time.'}
      className="sm:max-w-md max-w-[95vw] p-5"
    >
      <div className="space-y-5 pt-2">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Shareable Link Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Direct Collaboration Link</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                Anyone with link can join
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-muted/30 font-mono text-muted-foreground select-all"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 text-xs px-3"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isRegenerating}
                onClick={handleRegenerate}
                title="Regenerate collaboration link"
                className="shrink-0 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-primary' : ''}`}
                />
              </Button>
            </div>
          </div>

          {/* Invite by User / Email Form */}
          <form onSubmit={handleInviteUser} className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Invite by Username or Email
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. orlando or friend@example.com"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSending || !inviteInput.trim()}
                className="shrink-0 text-xs px-3"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> {isSending ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          </form>

          {/* Active Collaborators List */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Collaborators ({collaborators.length})</span>
            </label>

            {loadingCollaborators ? (
              <p className="text-xs text-muted-foreground py-2 italic">Loading co-authors...</p>
            ) : collaborators.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 italic">
                No external collaborators invited yet. Share the link above or invite by username.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={c.user?.avatar || 'https://ui-avatars.com/api/?name=User'}
                        alt={c.user?.name || 'User'}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{c.user?.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          @{c.user?.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                        Can edit
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(c.userId)}
                        className="text-muted-foreground hover:text-rose-500 p-1 rounded transition-colors"
                        title="Remove collaborator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </Modal>
  );
}
