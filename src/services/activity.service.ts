export interface ActivityLogItem {
  id: string;
  text: string;
  timestamp: string;
  createdAt: string;
  type: 'follow' | 'clap' | 'bookmark' | 'join' | 'application';
}

const STORAGE_KEY = 'inkflow_user_activity_logs';

export const ActivityService = {
  getActivities(): ActivityLogItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    // Default seed activities
    return [
      {
        id: 'act_join',
        text: 'Joined InkFlow publishing platform',
        timestamp: 'Just now',
        createdAt: new Date().toISOString(),
        type: 'join',
      },
    ];
  },

  logActivity(text: string, type: ActivityLogItem['type'] = 'follow'): ActivityLogItem {
    const newActivity: ActivityLogItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      type,
    };

    if (typeof window !== 'undefined') {
      try {
        const current = this.getActivities();
        // Prevent immediate duplicate log
        if (current.length === 0 || current[0].text !== text) {
          const updated = [newActivity, ...current].slice(0, 30);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } catch {}
    }

    return newActivity;
  },
};
