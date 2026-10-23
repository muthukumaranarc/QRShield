import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, getAuthHeaders } from './apiConfig';

export interface BlockedDomainItem {
  id: string;
  domain: string;
  reason?: string;
  blockedAt: string;
}

const BLOCKED_DOMAINS_STORAGE_KEY = '@qrshield_blocked_domains_v1';

export const BlockedDomainsService = {
  /**
   * Fetches list of blocked domains from backend or local storage
   */
  async getBlockedDomains(): Promise<BlockedDomainItem[]> {
    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(API_ENDPOINTS.BLOCKED_DOMAINS, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          await AsyncStorage.setItem(BLOCKED_DOMAINS_STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // Offline fallback
    }

    try {
      const cached = await AsyncStorage.getItem(BLOCKED_DOMAINS_STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  /**
   * Adds a new domain to the blacklist
   */
  async blockDomain(domain: string, reason = 'Manually blocked by user'): Promise<BlockedDomainItem> {
    const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0].trim().toLowerCase();

    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(API_ENDPOINTS.BLOCKED_DOMAINS, {
        method: 'POST',
        headers,
        body: JSON.stringify({ domain: cleanDomain, reason }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const item: BlockedDomainItem = await response.json();
        const current = await this.getBlockedDomains();
        const updated = [item, ...current.filter(b => b.domain !== cleanDomain)];
        await AsyncStorage.setItem(BLOCKED_DOMAINS_STORAGE_KEY, JSON.stringify(updated));
        return item;
      }
    } catch {
      // Offline fallback
    }

    const fallbackItem: BlockedDomainItem = {
      id: `local_b_${Date.now()}`,
      domain: cleanDomain,
      reason,
      blockedAt: new Date().toISOString(),
    };
    const current = await this.getBlockedDomains();
    const updated = [fallbackItem, ...current.filter(b => b.domain !== cleanDomain)];
    await AsyncStorage.setItem(BLOCKED_DOMAINS_STORAGE_KEY, JSON.stringify(updated));
    return fallbackItem;
  },

  /**
   * Unblocks a domain by ID or domain string
   */
  async unblockDomain(id: string): Promise<boolean> {
    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      await fetch(API_ENDPOINTS.BLOCKED_DOMAIN_ITEM(id), {
        method: 'DELETE',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch {
      // Ignore network error
    }

    try {
      const current = await this.getBlockedDomains();
      const updated = current.filter(b => b.id !== id && b.domain !== id);
      await AsyncStorage.setItem(BLOCKED_DOMAINS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },
};
