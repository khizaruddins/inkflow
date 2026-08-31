'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  useNotificationsQuery,
  useMarkAllNotificationsReadMutation,
} from '@/hooks/queries/use-notifications-query';
import { useNotificationStore } from '@/store/use-notification-store';
import { Bell, Heart, UserPlus, MessageSquare, Mail, Loader2, Sparkles, FileText, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const { data: notificationsData = [], isLoading } = useNotificationsQuery();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const localMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const [activeTab, setActiveTab] = useState<'all' | 'responses'>('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const hasTriggeredReadRef = useRef(false);

  // Automatically mark all notifications as read once when landing on the page
  useEffect(() => {
    if (!hasTriggeredReadRef.current && notificationsData.some((n) => !n.isRead)) {
      hasTriggeredReadRef.current = true;
      localMarkAllAsRead();
      markAllReadMutation.mutate();
    }
  }, [notificationsData, localMarkAllAsRead, markAllReadMutation]);

  const notifications = notificationsData;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'responses') return n.type === 'response' || n.type === 'reply';
    return true;
  });

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const getAvatarUrl = (avatar?: string, name: string = 'User') => {
    if (avatar && avatar.trim().length > 0) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans space-y-8">
      {/* Title Header without "Mark all as read" button */}
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Notifications
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Stay updated with your readers, new publications, claps, responses, and followers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-border/40 text-sm">
        <button
          onClick={() => {
            setActiveTab('all');
            setVisibleCount(20);
          }}
          className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'all'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setActiveTab('responses');
            setVisibleCount(20);
          }}
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
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading notifications...</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Bell className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          displayed.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-border/90 transition-all text-foreground shadow-xs"
            >
              <div className="flex items-start gap-4">
                {/* Actor Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={getAvatarUrl(item.actorAvatar, item.actorName)}
                    alt={item.actorName}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-[10px]">
                    {item.type === 'clap' && <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />}
                    {item.type === 'follow' && <UserPlus className="w-3 h-3 text-emerald-500" />}
                    {item.type === 'publish' && <FileText className="w-3 h-3 text-amber-500" />}
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
                    {item.metaText && <span className="text-muted-foreground">{item.metaText} </span>}
                    {item.targetTitle && (
                      item.targetSlug ? (
                        <Link
                          href={`/blog/${item.targetSlug}`}
                          className="font-semibold text-foreground italic hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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
            </motion.div>
          ))
        )}

        {/* View Past Notifications Button */}
        {hasMore && (
          <div className="pt-6 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="rounded-full px-6 py-2 text-xs font-semibold hover:bg-muted cursor-pointer inline-flex items-center gap-1.5 shadow-xs border-border/80"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              View Past Notifications ({filtered.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
