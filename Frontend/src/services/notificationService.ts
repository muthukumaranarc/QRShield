import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, getAuthHeaders } from './apiConfig';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'warning' | 'info' | 'success';
}

const NOTIFICATIONS_STORAGE_KEY = '@qrshield_notifications_v1';

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'High-Risk Link Flagged',
    message: 'phishing-site.net was detected and blocked with a danger score of 32/100.',
    time: 'Today, 08:17 AM',
    read: false,
    type: 'warning',
  },
  {
    id: 'notif_2',
    title: 'Security Definitions Updated',
    message: 'Downloaded the latest threat signatures (v2026.10.23) for improved quishing protection.',
    time: 'Yesterday, 09:30 PM',
    read: false,
    type: 'success',
  },
  {
    id: 'notif_3',
    title: 'Weekly Scan Summary',
    message: 'You analyzed 12 destinations this week. 11 were safe and 1 threat was avoided.',
    time: '2 days ago',
    read: true,
    type: 'info',
  },
];

export const NotificationService = {
  /**
   * Fetches security advisories and notifications from backend, with local cache fallback
   */
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const rawList = await response.json();
        if (Array.isArray(rawList)) {
          const mapped: AppNotification[] = rawList.map((item: any) => {
            const rawType = (item.type || '').toUpperCase();
            const type: AppNotification['type'] =
              rawType.includes('CRITICAL') || rawType.includes('WARNING')
                ? 'warning'
                : rawType.includes('SUCCESS')
                ? 'success'
                : 'info';

            return {
              id: String(item.id),
              title: item.title,
              message: item.message,
              time: item.createdAt ? formatTime(item.createdAt) : 'Recent',
              read: Boolean(item.read || item.is_read),
              type,
            };
          });

          await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mapped));
          return mapped;
        }
      }
    } catch {
      // Backend unavailable; read local storage
    }

    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!data) {
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
        return SEED_NOTIFICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_NOTIFICATIONS;
    }
  },

  /**
   * Registers Expo/FCM push token with preferences at `POST /api/notifications/register-token`
   */
  async registerPushToken(
    deviceToken: string,
    platform: 'ANDROID' | 'IOS' = 'ANDROID',
    allowSecurityAlerts = true,
    allowWeeklySummary = true
  ): Promise<boolean> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_REGISTER_TOKEN, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deviceToken,
          platform,
          allowSecurityAlerts,
          allowWeeklySummary,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async markAllAsRead(): Promise<AppNotification[]> {
    try {
      const current = await this.getNotifications();
      const updated = current.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  async clearNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
    } catch {}
  },
};

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recent';
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}
