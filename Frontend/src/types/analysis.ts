export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export type CheckStatus =
  | 'PASSED'
  | 'WARNING'
  | 'FAILED'
  | 'NOT_CHECKED'
  | 'UNAVAILABLE';

export interface AnalysisIndicator {
  id: string;
  title: string;
  description: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: CheckStatus;
}

export interface SecurityCheck {
  name: string;
  status: CheckStatus;
  message: string;
}

export interface DownloadFinding {
  providerName: string;
  status: string;
  message: string;
  checkedAt?: string;
}

export interface DownloadArtifact {
  artifactId: string;
  analysisId?: string;
  sourceUrl?: string;
  redirectChain?: string[];
  finalUrl?: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  quarantineStatus: 'QUARANTINED' | 'REJECTED_OVERSIZED' | 'REJECTED_CAPACITY' | 'CAPTURE_FAILED' | 'NOT_DOWNLOADED' | string;
  reputationStatus: 'CONFIRMED_MALICIOUS' | 'NO_KNOWN_MATCH' | 'UNAVAILABLE' | 'ERROR' | 'NOT_CHECKED' | string;
  findings?: DownloadFinding[];
  limitations?: string[];
  createdAt?: string;
}

export interface DeepScanFinding {
  code: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  description: string;
  category: string;
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

export interface ScanAnalysis {
  id: string;
  originalContent: string;
  normalizedUrl?: string;
  domain?: string;
  riskScore: number | null; // Threat Risk Index: 0 (safe) to 100 (maximum danger)
  safetyScore?: number; // Safety / Trust Index: 100 (clean) to 0 (critical threat)
  riskLevel: RiskLevel;
  summary: string;
  recommendation: string;
  indicators: AnalysisIndicator[];
  checks: SecurityCheck[];
  analyzedAt: string; // ISO 8601 string
  analysisSource: 'MOCK' | 'BACKEND';

  // Extended Spring Boot Backend Fields & Telemetry
  status?: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' | 'UNVERIFIED';
  providerName?: string;
  ipAddress?: string;
  protocol?: string;
  https?: boolean;
  hasRedirects?: boolean;
  redirectCount?: number;
  redirectChain?: string[];
  scanSource?: string;
  notes?: string;
  pageTitle?: string;
  httpStatus?: number;
  downloadDetected?: boolean;
  downloadArtifacts?: DownloadArtifact[];
  findings?: DeepScanFinding[];
  warningSigns?: string[];
  securityRecommendations?: string[];
  limitations?: string[];
  executionDurationMs?: number;
  details?: ScanDetails;
}

export interface DashboardStats {
  totalScans: number;
  safeScans?: number;
  suspiciousScans?: number;
  dangerousScans?: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  unknownRiskCount: number;
  averageRiskScore?: number;
  recentScans?: Array<{
    id: string;
    originalUrl?: string;
    domain?: string;
    riskScore: number;
    riskCategory: RiskLevel;
    status: string;
    scannedAt: string;
  }>;
}
