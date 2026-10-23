import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_TOKEN_KEY = '@qrshield_auth_token_v1';

/**
 * Resolves the backend base URL:
 * - Defaults to remote backend server: http://60.8.4.223:8080
 * - Can be overridden via EXPO_PUBLIC_API_BASE_URL env variable
 */
const getDefaultBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  return 'http://60.8.4.223:8080';
};

export const API_BASE_URL = getDefaultBaseUrl();

export const API_ENDPOINTS = {
  // System Health
  HEALTH: `${API_BASE_URL}/api/health`,

  // Core Scans & Threat Engine
  ANALYZE: `${API_BASE_URL}/api/scan/analyze`,
  QR_IMAGE: `${API_BASE_URL}/api/scan/qr-image`,
  DEEP_ANALYSIS: `${API_BASE_URL}/api/scan/deep-analysis`,
  DEEP_ANALYSIS_QR_IMAGE: `${API_BASE_URL}/api/scan/deep-analysis/qr-image`,
  SCAN_STATUS: (scanId: string) => `${API_BASE_URL}/api/scan/${scanId}/status`,
  SCAN_RESULT: (scanId: string) => `${API_BASE_URL}/api/scan/${scanId}`,
  HISTORY: `${API_BASE_URL}/api/scan/history`,
  HISTORY_ITEM: (id: string) => `${API_BASE_URL}/api/scan/history/${id}`,
  STATS: `${API_BASE_URL}/api/scan/stats`,
  ADMIN_SCANS: `${API_BASE_URL}/api/scan/admin/scans`,

  // User Authentication & Profiles (New Domain 1)
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_GOOGLE: `${API_BASE_URL}/api/auth/google`,
  USER_PROFILE: `${API_BASE_URL}/api/user/profile`,

  // User Custom Blocked Domains (New Domain 2)
  BLOCKED_DOMAINS: `${API_BASE_URL}/api/user/blocked-domains`,
  BLOCKED_DOMAIN_ITEM: (id: string) => `${API_BASE_URL}/api/user/blocked-domains/${id}`,

  // Crowdsourced Threat Reporting (New Domain 3)
  SCAN_REPORT: `${API_BASE_URL}/api/scan/report`,

  // Push Notifications & Advisories (New Domain 4)
  NOTIFICATIONS_REGISTER_TOKEN: `${API_BASE_URL}/api/notifications/register-token`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
} as const;

let isBackendAvailableCache: boolean | null = null;
let lastCheckTime = 0;

/**
 * Checks if the Spring Boot backend server is reachable and operational
 */
export async function checkBackendHealth(): Promise<{ isUp: boolean; version?: string; engine?: string }> {
  const now = Date.now();
  if (isBackendAvailableCache !== null && now - lastCheckTime < 10000) {
    return { isUp: isBackendAvailableCache };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(API_ENDPOINTS.HEALTH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      isBackendAvailableCache = true;
      lastCheckTime = now;
      return { isUp: true, version: data.version, engine: data.engine };
    }
  } catch {
    // Backend not reachable
  }

  isBackendAvailableCache = false;
  lastCheckTime = now;
  return { isUp: false };
}

/**
 * Helper to get authorization headers with JWT Bearer token
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}
