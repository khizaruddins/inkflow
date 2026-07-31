'use client';

import React, { useState } from 'react';
import { Save, Globe, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('InkFlow');
  const [siteDesc, setSiteDesc] = useState('A modern publishing-first blogging platform.');
  const [allowComments, setAllowComments] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Site & SEO Settings</h1>
        <p className="text-sm text-muted-foreground">Configure global publishing metadata and reader permissions.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-card p-6 rounded-3xl border border-border/80 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> General Platform Information
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Platform Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Meta Description</label>
            <textarea
              rows={3}
              value={siteDesc}
              onChange={(e) => setSiteDesc(e.target.value)}
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" /> Discussion & Moderation
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div>
              <div className="text-xs font-semibold text-foreground">Enable Reader Comments</div>
              <div className="text-[11px] text-muted-foreground">Allow logged-in readers to reply and clap on articles</div>
            </div>
            <input
              type="checkbox"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          {saved ? <span className="text-xs font-semibold text-emerald-500">Settings saved successfully!</span> : <div />}
          <Button type="submit" variant="primary" size="md" className="rounded-xl gap-1.5">
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
