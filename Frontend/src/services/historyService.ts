import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanAnalysis, DashboardStats } from '../types/analysis';
import { API_ENDPOINTS } from './apiConfig';
import { mapBackendAnalysisToFrontend } from './analysisService';

const HISTORY_STORAGE_KEY = '@qrshield_scan_history_v1';

// Seed items for demonstration on initial app launch before network scans
const SEED_HISTORY: ScanAnalysis[] = [
  {
    id: 'seed_1',
    originalContent: 'https://paypal-security-update.account-alert.net/login',
    normalizedUrl: 'https://paypal-security-update.account-alert.net/login',
    domain: 'paypal-security-update.account-alert.net',
    riskScore: 92,
    riskLevel: 'HIGH',
    summary:
      'Multiple high-risk indicators detected. This link displays characteristics of credential phishing.',
    recommendation: 'We strongly recommend NOT opening this link.',
    indicators: [
      {
        id: 'ind_1',
        title: 'Deceptive credential keyword detected',
        description:
          'Contains high-risk credential keywords ("paypal-security", "account-alert") designed to mimic PayPal.',
        severity: 'HIGH',
        status: 'FAILED',
      },
    ],
    checks: [
      { name: 'URL Format Validation', status: 'PASSED', message: 'Well-formed secure HTTPS URL.' },
      {
        name: 'Domain & Host Analysis',
        status: 'FAILED',
        message: 'Domain registered recently with deceptive name.',
      },
      { name: 'Redirect Chain Inspection', status: 'PASSED', message: 'Direct destination.' },
      {
        name: 'Threat Intelligence Lookup',
        status: 'FAILED',
        message: 'Flagged on anti-phishing community lists.',
      },
    ],
    analyzedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    analysisSource: 'MOCK',
  },
  {
    id: 'seed_2',
    originalContent: 'https://bit.ly/3xSummerDiscount',
    normalizedUrl: 'https://bit.ly/3xSummerDiscount',
    domain: 'bit.ly',
    riskScore: 55,
    riskLevel: 'MEDIUM',
    summary:
      'The QR code uses a URL shortener service. The true landing destination cannot be confirmed until opened.',
    recommendation: 'Proceed with caution. Verify the destination before entering credentials.',
    indicators: [
      {
        id: 'ind_2',
        title: 'Shortened URL hides true destination',
        description: 'The link redirects through bit.ly which obscures the destination domain.',
        severity: 'MEDIUM',
        status: 'WARNING',
      },
    ],
    checks: [
      { name: 'URL Format Validation', status: 'PASSED', message: 'Well-formed secure HTTPS URL.' },
      { name: 'Domain & Host Analysis', status: 'PASSED', message: 'Reputable shortener host.' },
      {
        name: 'Redirect Chain Inspection',
        status: 'WARNING',
        message: 'Obfuscates final landing page.',
      },
      {
        name: 'Threat Intelligence Lookup',
        status: 'PASSED',
        message: 'No direct blacklisting on wrapper.',
      },
    ],
    analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    analysisSource: 'MOCK',
  },
  {
    id: 'seed_3',
    originalContent: 'https://github.com/explore',
    normalizedUrl: 'https://github.com/explore',
    domain: 'github.com',
    riskScore: 8,
    riskLevel: 'LOW',
    summary: 'No obvious risk indicators found in standard structure and host reputation checks.',
    recommendation: 'Destination appears typical, but always verify before sharing sensitive data.',
    indicators: [],
    checks: [
      { name: 'URL Format Validation', status: 'PASSED', message: 'Valid secure HTTPS URL.' },
      {
        name: 'Domain & Host Analysis',
        status: 'PASSED',
        message: 'Well-known domain with established history.',
      },
      { name: 'Redirect Chain Inspection', status: 'PASSED', message: 'Direct destination.' },
      {
        name: 'Threat Intelligence Lookup',
        status: 'PASSED',
        message: 'Clear reputation records.',
      },
    ],
    analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    analysisSource: 'MOCK',
  },
];

export const HistoryService = {
  /**
   * Retrieves scan history list, querying `GET /api/scan/history` with optional category and search.
   * Seamlessly falls back to AsyncStorage offline cache.
   */
  async getScanHistory(
    category?: 'LOW' | 'MEDIUM' | 'HIGH',
    search?: string
  ): Promise<ScanAnalysis[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const queryParts: string[] = [];
      if (category) queryParts.push(`category=${encodeURIComponent(category)}`);
      if (search && search.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const requestUrl = `${API_ENDPOINTS.HISTORY}${queryString}`;

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const rawData = await response.json();
        const rawList = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.content)
          ? rawData.content
          : Array.isArray(rawData?.value)
          ? rawData.value
          : Array.isArray(rawData?.scans)
          ? rawData.scans
          : [];

        if (Array.isArray(rawList) && rawList.length > 0) {
          const mappedItems: ScanAnalysis[] = rawList.map(item =>
            mapBackendAnalysisToFrontend(item)
          );

          // Update local offline cache with newest items
          if (!category && !search) {
            await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mappedItems));
          }

          return mappedItems;
        }
      }
    } catch {
      // Backend unavailable; proceed with offline storage
    }

    return this.getLocalScanHistory(category, search);
  },

  /**
   * Retrieves an individual scan record by ID from `GET /api/scan/history/{id}`
   */
  async getScanById(id: string): Promise<ScanAnalysis | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(API_ENDPOINTS.HISTORY_ITEM(id), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return mapBackendAnalysisToFrontend(data);
      }
    } catch {
      // Offline fallback
    }

    const localList = await this.getLocalScanHistory();
    return localList.find(s => s.id === id) || null;
  },

  /**
   * Deletes a single scan record via `DELETE /api/scan/history/{id}` and updates local storage
   */
  async deleteScanItem(id: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(API_ENDPOINTS.HISTORY_ITEM(id), {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch {
      // Ignore network errors
    }

    try {
      const current = await this.getLocalScanHistory();
      const updated = current.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Clears all scan history via `DELETE /api/scan/history` and clears local storage
   */
  async clearScanHistory(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(API_ENDPOINTS.HISTORY, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch {
      // Ignore network error
    }

    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
    } catch {
      // Local clear failure
    }
  },

  /**
   * Saves a new scan analysis locally
   */
  async saveScanResult(analysis: ScanAnalysis): Promise<ScanAnalysis[]> {
    try {
      const current = await this.getLocalScanHistory();
      const filtered = current.filter(item => item.originalContent !== analysis.originalContent);
      const updated = [analysis, ...filtered].slice(0, 50);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [analysis];
    }
  },

  /**
   * Fetches dashboard analytics from `GET /api/scan/stats` or calculates them from local history
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(API_ENDPOINTS.STATS, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const stats = await response.json();
        return {
          totalScans: stats.totalScans ?? 0,
          safeScans: stats.safeScans ?? 0,
          suspiciousScans: stats.suspiciousScans ?? 0,
          dangerousScans: stats.dangerousScans ?? 0,
          highRiskCount: stats.highRiskCount ?? stats.dangerousScans ?? 0,
          mediumRiskCount: stats.mediumRiskCount ?? stats.suspiciousScans ?? 0,
          lowRiskCount: stats.lowRiskCount ?? stats.safeScans ?? 0,
          unknownRiskCount: 0,
          averageRiskScore: stats.averageRiskScore ?? 0,
          recentScans: stats.recentScans ?? [],
        };
      }
    } catch {
      // Offline fallback
    }

    const history = await this.getLocalScanHistory();
    let high = 0;
    let medium = 0;
    let low = 0;
    let unknown = 0;

    history.forEach(item => {
      if (item.riskLevel === 'HIGH') high++;
      else if (item.riskLevel === 'MEDIUM') medium++;
      else if (item.riskLevel === 'LOW') low++;
      else unknown++;
    });

    return {
      totalScans: history.length,
      safeScans: low,
      suspiciousScans: medium,
      dangerousScans: high,
      highRiskCount: high,
      mediumRiskCount: medium,
      lowRiskCount: low,
      unknownRiskCount: unknown,
      averageRiskScore: history.length > 0
        ? Math.round(
            history.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / history.length
          )
        : 0,
    };
  },

  /**
   * Internal helper for local storage access
   */
  async getLocalScanHistory(
    category?: 'LOW' | 'MEDIUM' | 'HIGH',
    search?: string
  ): Promise<ScanAnalysis[]> {
    try {
      const json = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      let items: ScanAnalysis[] = json ? JSON.parse(json) : SEED_HISTORY;

      if (!json) {
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(SEED_HISTORY));
      }

      if (category) {
        items = items.filter(item => item.riskLevel === category);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        items = items.filter(
          item =>
            (item.domain && item.domain.toLowerCase().includes(q)) ||
            (item.normalizedUrl && item.normalizedUrl.toLowerCase().includes(q)) ||
            (item.originalContent && item.originalContent.toLowerCase().includes(q))
        );
      }

      return items;
    } catch {
      return SEED_HISTORY;
    }
  },
};
