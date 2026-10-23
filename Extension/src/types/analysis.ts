/**
 * Supported security verdict levels for an analyzed URL
 */
export type Verdict = 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN';

/**
 * Individual risk or threat indicator returned by analysis
 */
export interface ThreatIndicator {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Standard request contract sent to backend API
 */
export interface UrlAnalysisRequest {
  url: string;
}

/**
 * Standard security check executed by the engine
 */
export interface SecurityCheck {
  name: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'NOT_CHECKED';
  message: string;
}

export interface ScanDetails {
  canonicalHost?: string;
  subdomainCount?: number;
  dnsResolved?: boolean;
  finalDestinationUrl?: string;
  isSuspiciousTld?: boolean;
  tld?: string;
  usesHttps?: boolean;
  isUrlShortener?: boolean;
  resolvedIp?: string;
  reputableDomain?: boolean;
  domainEntropy?: number;
  finalDestinationDomain?: string;
  isIpHost?: boolean;
}

/**
 * Standard response contract received from backend API
 */
export interface UrlAnalysisResponse {
  url: string;
  verdict: Verdict;
  riskScore: number | null; // Threat risk (0 = safe, 100 = danger)
  safetyScore?: number; // Safety rating (100 = safe, 0 = danger)
  summary: string;
  recommendation?: string;
  securityRecommendations?: string[];
  checks?: SecurityCheck[];
  indicators: ThreatIndicator[];
  analyzedAt: string;
  // Backend verification telemetry
  backendScanId?: string;
  ipAddress?: string;
  providerName?: string;
  protocol?: string;
  https?: boolean;
  hasRedirects?: boolean;
  redirectCount?: number;
  redirectChain?: string[];
  latencyMs?: number;
  sourceServer?: string;
  fromCache?: boolean;
  details?: ScanDetails;
}

/**
 * Detected active tab status and metadata
 */
export interface ActiveTabInfo {
  id?: number;
  url: string;
  domain: string;
  sanitizedUrl: string;
  isInspectable: boolean;
  restrictionReason?: string;
  title?: string;
  favIconUrl?: string;
}

/**
 * UI visual states in the extension popup
 */
export type AnalysisStatus =
  | 'INITIAL'
  | 'LOADING'
  | 'SAFE'
  | 'SUSPICIOUS'
  | 'MALICIOUS'
  | 'UNKNOWN'
  | 'ERROR';

/**
 * Formatted error message and recovery action
 */
export interface AnalysisError {
  message: string;
  details?: string;
  isNetworkError?: boolean;
}
