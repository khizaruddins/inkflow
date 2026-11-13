'use client';

import React, { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';
import { User, AccountDeletionRequest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatDate } from '@/lib/utils';
import {
  Users,
  ShieldAlert,
  Trash2,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  Clock,
  Search,
  Filter,
  UserX,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export default function UsersManagementPage() {
  const { user: currentAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'deletions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<AccountDeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Suspension Modal State
  const [suspendModalUser, setSuspendModalUser] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hard Delete Modal State
  const [deleteModalUser, setDeleteModalUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, deletionsData] = await Promise.all([
        UserService.getUsers(),
        UserService.getDeletionRequests(),
      ]);
      setUsers(usersData);
      setDeletionRequests(deletionsData);
    } catch (err: any) {
      console.error('Failed to load user management data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  // Action: Suspend User
  const handleConfirmSuspend = async () => {
    if (!suspendModalUser) return;
    setIsSubmitting(true);
    try {
      await UserService.suspendUser(suspendModalUser.id, suspendReason);
      setActionFeedback(`User ${suspendModalUser.name} has been suspended.`);
      setSuspendModalUser(null);
      setSuspendReason('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to suspend user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Unsuspend User
  const handleUnsuspend = async (targetUser: User) => {
    if (!confirm(`Restore access and unsuspend ${targetUser.name} (@${targetUser.username})?`)) return;
    try {
      await UserService.unsuspendUser(targetUser.id);
      setActionFeedback(`User ${targetUser.name} restored to active.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to unsuspend user.');
    }
  };

  // Action: Hard Delete
  const handleConfirmHardDelete = async () => {
    if (!deleteModalUser) return;
    setIsSubmitting(true);
    try {
      await UserService.hardDeleteUser(deleteModalUser.id);
      setActionFeedback(`User ${deleteModalUser.name} and all data wiped permanently from MongoDB.`);
      setDeleteModalUser(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-[calc(100vh-14rem)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" /> User Management &amp; Moderation
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage platform accounts, monitor deletion requests, and suspend or purge users.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-border/80">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deletions')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deletions'
                ? 'bg-card text-destructive shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Deletion Requests ({deletionRequests.filter((r) => r.status === 'PENDING').length})
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
      {/* TAB 1: ALL USERS LIST */}
      {/* =================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl px-4 py-2">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @username, email, or role..."
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border font-medium text-xs">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Stories</th>
                    <th className="p-4">Followers</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No users found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrentUser = currentAdmin?.id === u.id;
                      const status = u.status || 'ACTIVE';

                      return (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <UserAvatar
                              src={u.avatar}
                              alt={u.name}
                              name={u.name}
                              role={u.role}
                              size="md"
                            />
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-1.5">
                                {u.name}
                                {isCurrentUser && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-primary/10 text-primary rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground">@{u.username} • {u.email}</div>
                            </div>
                          </td>

                          <td className="p-4">
                            <Badge variant={u.role === 'admin' || u.role === 'ADMIN' ? 'accent' : 'secondary'}>
                              {u.role.toUpperCase()}
                            </Badge>
                          </td>

                          <td className="p-4">
                            {status === 'ACTIVE' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                                ACTIVE
                              </span>
                            )}
                            {status === 'PAUSED' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">
                                PAUSED
                              </span>
                            )}
                            {status === 'SUSPENDED' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">
                                SUSPENDED
                              </span>
                            )}
                            {status === 'PENDING_DELETION' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/30">
                                DELETING (30d)
                              </span>
                            )}
                          </td>

                          <td className="p-4 font-mono">{u.articlesCount ?? 0}</td>
                          <td className="p-4 font-mono">{(u.followersCount || 0).toLocaleString()}</td>
                          <td className="p-4 text-muted-foreground">{formatDate(u.createdAt)}</td>

                          <td className="p-4 text-right">
                            {!isCurrentUser && u.role !== 'admin' && u.role !== 'ADMIN' && (
                              <div className="flex items-center justify-end gap-1.5">
                                {status === 'SUSPENDED' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnsuspend(u)}
                                    className="rounded-full text-[11px] h-7 px-3 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 font-bold"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5" /> Unsuspend
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSuspendModalUser(u)}
                                    className="rounded-full text-[11px] h-7 px-3 text-rose-600 border-rose-500/30 hover:bg-rose-500/10 gap-1 font-bold"
                                  >
                                    <UserX className="w-3.5 h-3.5" /> Suspend
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteModalUser({ id: u.id, name: u.name, email: u.email })}
                                  className="rounded-full text-[11px] h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  title="Permanently wipe user from MongoDB"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: ACCOUNT DELETION REQUESTS */}
      {/* =================================================================== */}
      {activeTab === 'deletions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed space-y-1">
            <strong>30-Day Deletion Protocol:</strong> When a user requests account deletion, a 30-day grace period is initiated. If the user logs back in, they can cancel the request. Once 30 days elapse, administrators can execute the permanent hard delete to wipe all stories, comments, and records from MongoDB.
          </div>

          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border font-medium text-xs">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Requested On</th>
                    <th className="p-4">Scheduled Termination</th>
                    <th className="p-4">Status &amp; Eligibility</th>
                    <th className="p-4 text-right">Database Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {deletionRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No account deletion requests found.
                      </td>
                    </tr>
                  ) : (
                    deletionRequests.map((req) => {
                      const isPending = req.status === 'PENDING';
                      const isCancelled = req.status === 'CANCELLED';
                      const isEligible = req.isEligibleForTermination;

                      return (
                        <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-bold text-foreground">
                            {req.userName || req.user?.name || 'Unknown User'}
                          </td>
                          <td className="p-4 font-mono text-muted-foreground">{req.userEmail}</td>
                          <td className="p-4 text-muted-foreground">{formatDate(req.requestedAt)}</td>
                          <td className="p-4 text-foreground font-semibold">
                            {formatDate(req.scheduledFor)}
                            {isPending && (
                              <span className="block text-[11px] text-muted-foreground font-normal">
                                {isEligible ? 'Time elapsed' : `${req.daysRemaining} days left`}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {isCancelled ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                                CANCELLED BY USER
                              </span>
                            ) : isEligible ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 border border-rose-500/40">
                                ⚠️ ELIGIBLE FOR PURGE (&gt;30 Days)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">
                                GRACE PERIOD ({req.daysRemaining}d)
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {isPending && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setDeleteModalUser({
                                    id: req.userId,
                                    name: req.userName,
                                    email: req.userEmail,
                                  })
                                }
                                className={`rounded-full text-xs font-bold gap-1.5 ${
                                  isEligible
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-destructive hover:text-white'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {isEligible ? 'Permanently Purge from MongoDB' : 'Purge Ahead of Time'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUSPENSION MODAL */}
      {/* =================================================================== */}
      {suspendModalUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="suspend-user-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans"
        >
          <div className="w-full max-w-md bg-card p-6 sm:p-8 rounded-3xl border border-rose-500/40 space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 id="suspend-user-title" className="text-xl font-bold text-foreground">
                Suspend {suspendModalUser.name}?
              </h3>
              <p className="text-xs text-muted-foreground">
                While suspended, @{suspendModalUser.username} will be locked out and cannot read or write any stories.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-left">
              <label className="font-bold text-foreground block">Reason for Suspension:</label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Violation of community rules, spam, malicious activity..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setSuspendModalUser(null)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={isSubmitting}
                onClick={handleConfirmSuspend}
                className="rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isSubmitting ? 'Suspending...' : 'Confirm Suspension'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* HARD DELETE CONFIRMATION MODAL */}
      {/* =================================================================== */}
      {deleteModalUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="purge-user-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans"
        >
          <div className="w-full max-w-md bg-card p-6 sm:p-8 rounded-3xl border-2 border-destructive/50 space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                Irreversible Action
              </span>
              <h3 id="purge-user-title" className="text-xl font-black text-foreground">
                Permanently Purge User?
              </h3>
              <p className="text-xs text-muted-foreground">
                Target: <strong className="text-foreground">{deleteModalUser.name}</strong> ({deleteModalUser.email})
              </p>
            </div>

            <p className="p-3.5 rounded-2xl bg-destructive/5 border border-destructive/20 text-xs text-destructive leading-relaxed">
              ⚠️ This will wipe the user, all their blog stories, drafts, comments, bookmarks, claps, private accesses, and requests from the MongoDB database permanently.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setDeleteModalUser(null)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={isSubmitting}
                onClick={handleConfirmHardDelete}
                className="rounded-full text-xs font-bold bg-destructive text-white hover:bg-destructive/90 gap-1"
              >
                {isSubmitting ? 'Purging...' : 'Wipe All Data from MongoDB'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
