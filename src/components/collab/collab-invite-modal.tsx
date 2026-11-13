'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Eye,
  Edit3,
  Shield,
  Info,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
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
  const [invitePermission, setInvitePermission] = useState<'EDIT' | 'VIEW'>('EDIT');
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);
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
      setInvitePermission('EDIT');
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
      const canEdit = invitePermission === 'EDIT';
      await CollabService.invite(postId, {
        ...(isEmail ? { email: query } : { username: query }),
        canEdit,
        permission: invitePermission,
      });
      setFeedback({
        type: 'success',
        message: `Invitation successfully sent to ${query} with ${canEdit ? 'Edit' : 'View'} access!`,
      });
      setInviteInput('');
      await loadCollaborators();
    } catch (err: any) {
      const rawMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send invite. Check username or email.';
      setFeedback({
        type: 'error',
        message: rawMsg,
      });
    }
    setIsSending(false);
  };

  const handlePermissionChange = async (userId: string, newCanEdit: boolean) => {
    setUpdatingUserId(userId);
    setFeedback(null);
    try {
      await CollabService.updatePermission(postId, userId, newCanEdit);
      setCollaborators((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, canEdit: newCanEdit } : c)),
      );
      setFeedback({
        type: 'success',
        message: `Permission updated to ${newCanEdit ? 'Can Edit' : 'Can View'}.`,
      });
    } catch (err: any) {
      const rawMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update collaborator permission.';
      setFeedback({
        type: 'error',
        message: rawMsg,
      });
    }
    setUpdatingUserId(null);
  };

  const handleRemoveCollaborator = async (userId: string, username?: string) => {
    setRevokingUserId(userId);
    setFeedback(null);
    try {
      await CollabService.removeCollaborator(postId, userId);
      setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
      setFeedback({
        type: 'success',
        message: `Access revoked for ${username ? `@${username}` : 'collaborator'}.`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to revoke access.' });
    }
    setRevokingUserId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite & Manage Collaborators"
      description={postTitle ? `Draft: ${postTitle}` : 'Control who can view or co-author this story.'}
      className="sm:max-w-lg max-w-[95vw] p-5 max-h-[85vh] flex flex-col"
    >
      <div className="space-y-5 pt-1 overflow-y-auto pr-1">
        {/* Feedback banner */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            <span className="shrink-0 mt-0.5">{feedback.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Shareable Link Section */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Direct Collaboration Link</span>
            <span className="text-[10px] font-normal text-muted-foreground">
              InkFlow members can join
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
          <p className="text-[11px] text-muted-foreground">
            Writers joining via link get edit access; Readers joining via link get view-only access.
          </p>
        </div>

        {/* Invite by User / Email Form */}
        <form onSubmit={handleInviteUser} className="space-y-2 pt-2 border-t border-border">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Invite Member</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Must be registered on InkFlow
            </span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Username or email (e.g. alice or alice@inkflow.io)"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
            />
            <select
              value={invitePermission}
              onChange={(e) => setInvitePermission(e.target.value as 'EDIT' | 'VIEW')}
              className="text-xs px-2.5 py-2 rounded-lg border border-border bg-background text-foreground font-medium focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
            >
              <option value="EDIT">Can edit</option>
              <option value="VIEW">Can view</option>
            </select>
            <Button
              type="submit"
              size="sm"
              disabled={isSending || !inviteInput.trim()}
              className="shrink-0 text-xs px-3.5 h-[34px]"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" /> {isSending ? 'Inviting...' : 'Invite'}
            </Button>
          </div>

          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-muted/40 text-[11px] text-muted-foreground">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <span>
              <strong>Role policy:</strong> Readers can only receive View access. Writer or Admin role is required for Edit access.
            </span>
          </div>
        </form>

        {/* Active Collaborators List & Permission Controls */}
        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Collaborators ({collaborators.length})</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Manage permissions or revoke access
            </span>
          </label>

          {loadingCollaborators ? (
            <p className="text-xs text-muted-foreground py-2 italic">Loading co-authors...</p>
          ) : collaborators.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 italic">
              No external collaborators invited yet. Share the link above or invite by username.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {collaborators.map((c) => {
                const userRole = String(c.user?.role || 'READER').toUpperCase();
                const isReader = userRole === 'READER';
                const isItemUpdating = updatingUserId === c.userId;
                const isItemRevoking = revokingUserId === c.userId;

                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/80 text-xs hover:border-border transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        src={c.user?.avatar}
                        name={c.user?.name || 'User'}
                        role={c.user?.role}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[160px]">
                            {c.user?.name || 'User'}
                          </p>
                          {/* Role Badge */}
                          {userRole === 'ADMIN' ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Admin
                            </span>
                          ) : userRole === 'WRITER' ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              Writer
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                              Reader
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          @{c.user?.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Permission Control */}
                      {isReader ? (
                        <span
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1 cursor-default"
                          title="Inkflow Readers can only have View access"
                        >
                          <Eye className="w-3 h-3" /> Can view
                        </span>
                      ) : (
                        <select
                          value={c.canEdit ? 'EDIT' : 'VIEW'}
                          disabled={isItemUpdating}
                          onChange={(e) => handlePermissionChange(c.userId, e.target.value === 'EDIT')}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                            c.canEdit
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <option value="EDIT">Can edit</option>
                          <option value="VIEW">Can view</option>
                        </select>
                      )}

                      {/* Revoke Access Button */}
                      <button
                        type="button"
                        disabled={isItemRevoking}
                        onClick={() => handleRemoveCollaborator(c.userId, c.user?.username)}
                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Revoke access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
