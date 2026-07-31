'use client';

import React from 'react';
import { useReportStore } from '@/store/use-report-store';
import { Shield, Trash2, CheckCircle, AlertOctagon, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ReportsManagementPage() {
  const { reports, deleteReportedResponse, dismissReport, blockedAuthors } = useReportStore();

  const activeReports = reports.filter((r) => r.status === 'under_evaluation');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-rose-500" />
            Response Moderation & Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Review reported responses, evaluate reader flags, and manage platform safety.
          </p>
        </div>

        <Badge variant="outline" className="px-4 py-1.5 text-xs font-bold rounded-full">
          {activeReports.length} Pending Evaluation
        </Badge>
      </div>

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

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/60" />
            <h3 className="text-base font-bold text-foreground">No pending reports</h3>
            <p className="text-xs text-muted-foreground">All reported responses have been evaluated and resolved.</p>
          </div>
        ) : (
          reports.map((rep) => (
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

              {/* Reported Content */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 text-xs text-foreground font-serif leading-relaxed italic">
                "{rep.commentContent}"
              </div>

              {/* Reasons */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Violation Reasons:</span>
                <div className="flex flex-wrap gap-1.5">
                  {rep.reasons.map((r) => (
                    <span key={r} className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                      {r}
                    </span>
                  ))}
                  {rep.blockedAuthor && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold">
                      Author Blocked
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
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
    </div>
  );
}
