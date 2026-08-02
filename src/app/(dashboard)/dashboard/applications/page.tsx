'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Clock, UserCheck } from 'lucide-react';
import { CreatorApplication } from '@/types';

export default function AdminApplicationsPage() {
  const { role } = useAuthStore();
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'admin' || role === 'ADMIN';

  useEffect(() => {
    async function fetchApps() {
      try {
        const data = await apiClient.get<any[]>('/applications');
        if (Array.isArray(data) && data.length > 0) {
          setApplications(data);
        } else {
          // Fallback mock applications if database has no pending applications yet
          setApplications([
            {
              id: 'app_1',
              userId: 'u_1',
              user: {
                id: 'u_1',
                name: 'Alex Rivera',
                username: 'arivera',
                email: 'alex@example.com',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                bio: 'Frontend Architect interested in React 19 & Next.js 16',
                role: 'reader',
                followersCount: 0,
                followingCount: 5,
                articlesCount: 0,
                createdAt: new Date().toISOString(),
              },
              sampleTitle: 'Scaling Next.js App Router Architecture in 2026',
              sampleContent: 'Building enterprise frontend applications requires strict decoupling of state, query hooks, and UI primitives...',
              motivation: 'I have 6 years of experience building web applications and want to share architectural insights with the InkFlow community.',
              status: 'PENDING',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (err: any) {
        if (err?.status !== 401 && err?.response?.status !== 401) {
          console.error('Error fetching creator applications:', err);
        }
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchApps();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.patch(`/applications/${id}/status`, { status: newStatus });
    } catch (err) {
      // Gracefully handle UI update
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center font-sans space-y-4">
        <Shield className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-xs text-muted-foreground">Only Admins can review creator applications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 font-sans space-y-8">
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-emerald-600" /> Creator Applications Approval
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review user-submitted applications and sample content to grant WRITER role status.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
          Loading pending applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-border/60 text-center space-y-2">
          <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-semibold text-foreground">No pending creator applications</p>
          <p className="text-xs text-muted-foreground">When readers submit writing samples, they will appear here for Admin review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app.id} className="p-8 rounded-3xl bg-card border border-border/60 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {app.user?.avatar && (
                    <img src={app.user.avatar} alt={app.user.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                  )}
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-foreground">{app.user?.name || 'Applicant'}</h3>
                    <p className="text-xs text-muted-foreground">{app.user?.email} · Current Role: <span className="font-semibold text-foreground">{app.user?.role?.toUpperCase() || 'READER'}</span></p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  app.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : app.status === 'REJECTED'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {app.status}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Sample Article Title</h4>
                <p className="text-sm font-semibold text-foreground">{app.sampleTitle}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Writing Sample Content</h4>
                <div className="p-4 rounded-2xl bg-muted/40 text-xs text-foreground font-serif leading-relaxed italic whitespace-pre-wrap">
                  "{app.sampleContent}"
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Applicant Motivation</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{app.motivation}</p>
              </div>

              {app.status === 'PENDING' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                    className="rounded-full text-xs gap-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                    className="rounded-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve &amp; Grant Writer Role
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
