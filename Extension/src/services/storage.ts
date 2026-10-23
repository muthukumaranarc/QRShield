import { UrlAnalysisResponse } from '../types/analysis';

const TAB_PREFIX = 'qrshield_tab_';
const URL_PREFIX = 'qrshield_url_';
const CONFIG_BASE_URL_KEY = 'qrshield_api_base_url_v1';

interface CacheEntry {
  analysis: UrlAnalysisResponse;
  timestamp: number;
}

/**
 * Saves analysis result into chrome.storage.local for both the tab and sanitized URL
 */
export async function saveCachedAnalysis(
  tabId: number | undefined,
  url: string,
  analysis: UrlAnalysisResponse
): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return;
  }

  const cleanUrl = url.split('#')[0];
  const payload: Record<string, CacheEntry> = {};

  if (tabId !== undefined && tabId > 0) {
    payload[`${TAB_PREFIX}${tabId}`] = {
      analysis,
      timestamp: Date.now(),
    };
  }

  payload[`${URL_PREFIX}${cleanUrl}`] = {
    analysis,
    timestamp: Date.now(),
  };

  try {
    await chrome.storage.local.set(payload);
  } catch (err) {
    console.warn('QRShield storage: Failed to cache analysis:', err);
  }
}

/**
 * Retrieves cached analysis if available and fresher than maxAgeMs (default: 5 min)
 */
export async function getCachedAnalysis(
  tabId?: number,
  url?: string,
  maxAgeMs = 5 * 60 * 1000
): Promise<UrlAnalysisResponse | null> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return null;
  }

  const keys: string[] = [];
  if (tabId !== undefined && tabId > 0) {
    keys.push(`${TAB_PREFIX}${tabId}`);
  }
  if (url) {
    keys.push(`${URL_PREFIX}${url.split('#')[0]}`);
  }

  if (keys.length === 0) return null;

  try {
    const result = await chrome.storage.local.get(keys);

    // 1. Check tabId key first
    if (tabId !== undefined && result[`${TAB_PREFIX}${tabId}`]) {
      const entry = result[`${TAB_PREFIX}${tabId}`] as CacheEntry;
      if (entry && Date.now() - entry.timestamp < maxAgeMs) {
        return { ...entry.analysis, fromCache: true };
      }
    }

    // 2. Check url key fallback
    if (url && result[`${URL_PREFIX}${url.split('#')[0]}`]) {
      const entry = result[`${URL_PREFIX}${url.split('#')[0]}`] as CacheEntry;
      if (entry && Date.now() - entry.timestamp < maxAgeMs) {
        return { ...entry.analysis, fromCache: true };
      }
    }
  } catch (err) {
    console.warn('QRShield storage: Failed to read cached analysis:', err);
  }

  return null;
}

/**
 * Stores custom backend URL so background service worker and popup stay in sync
 */
export async function setStoredBaseUrl(url: string): Promise<void> {
  const cleaned = url.trim().replace(/\/+$/, '');
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CONFIG_BASE_URL_KEY, cleaned);
    } catch {}
  }

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.set({ [CONFIG_BASE_URL_KEY]: cleaned });
    } catch {}
  }
}

/**
 * Reads stored backend URL from either chrome.storage.local or localStorage
 */
export async function getStoredBaseUrl(): Promise<string | null> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const res = await chrome.storage.local.get(CONFIG_BASE_URL_KEY);
      if (res && typeof res[CONFIG_BASE_URL_KEY] === 'string' && res[CONFIG_BASE_URL_KEY]) {
        return res[CONFIG_BASE_URL_KEY];
      }
    } catch {}
  }

  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(CONFIG_BASE_URL_KEY);
    } catch {}
  }

  return null;
}

/**
 * Clears cached scan results from storage
 */
export async function clearScanCache(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  try {
    const all = await chrome.storage.local.get(null);
    const keysToRemove = Object.keys(all).filter(
      (k) => k.startsWith(TAB_PREFIX) || k.startsWith(URL_PREFIX)
    );
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
    }
  } catch {}
}
