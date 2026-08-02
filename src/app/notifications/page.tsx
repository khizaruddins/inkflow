'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/hooks/queries/use-notifications-query';
import { useNotificationStore } from '@/store/use-notification-store';
import { Bell, Heart, UserPlus, MessageSquare, CheckCheck, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { data: notificationsData = [], isLoading } = useNotificationsQuery();
  const markAsReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const localMarkAsRead = useNotificationStore((s) => s.markAsRead);
  const localMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const [activeTab, setActiveTab] = useState<'all' | 'responses'>('all');

  const handleMarkAsRead = (id: string) => {
    localMarkAsRead(id);
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    localMarkAllAsRead();
    markAllReadMutation.mutate();
  };

  const notifications = notificationsData;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'responses') return n.type === 'response' || n.type === 'reply';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Stay updated with your readers, claps, responses, and followers.
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          disabled={markAllReadMutation.isPending}
          className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer disabled:opacity-50"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-border/40 text-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'all'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'responses'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Responses
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading notifications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Bell className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleMarkAsRead(item.id)}
              className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                item.isRead
                  ? 'bg-card/40 border-border/40 text-muted-foreground'
                  : 'bg-card border-emerald-500/30 shadow-xs text-foreground'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Actor Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={item.actorAvatar}
                    alt={item.actorName}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-[10px]">
                    {item.type === 'clap' && <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />}
                    {item.type === 'follow' && <UserPlus className="w-3 h-3 text-emerald-500" />}
                    {item.type === 'subscribe' && <Mail className="w-3 h-3 text-blue-500" />}
                    {(item.type === 'response' || item.type === 'reply') && (
                      <MessageSquare className="w-3 h-3 text-purple-500" />
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="space-y-1">
                  <p className="text-sm font-normal leading-snug">
                    <span className="font-bold text-foreground">{item.actorName}</span>{' '}
                    <span className="text-muted-foreground">{item.metaText}</span>{' '}
                    {item.targetTitle && (
                      item.targetSlug ? (
                        <Link
                          href={`/blog/${item.targetSlug}`}
                          className="font-semibold text-foreground italic hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          "{item.targetTitle}"
                        </Link>
                      ) : (
                        <span className="font-semibold text-foreground italic">"{item.targetTitle}"</span>
                      )
                    )}
                  </p>
                  <span className="text-[11px] text-muted-foreground/60 block">{item.timestamp}</span>
                </div>
              </div>

              {!item.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
