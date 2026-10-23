import React from 'react';
import { UrlAnalysisResponse, Verdict } from '../../types/analysis';

interface AnalysisResultProps {
  result: UrlAnalysisResponse;
  domain: string;
  onAnalyzeAgain: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, domain, onAnalyzeAgain }) => {
  const config = getVerdictConfig(result.verdict);
  const formattedTime = formatTimestamp(result.analyzedAt);

  const safetyScore =
    result.safetyScore ??
    (result.riskScore !== null ? Math.max(0, 100 - result.riskScore) : result.verdict === 'SAFE' ? 96 : 20);
  const threatScore = result.riskScore ?? (100 - safetyScore);

  return (
    <div className={`card result-card result-${result.verdict.toLowerCase()}`} role="region" aria-label="Analysis Result">
      {/* Verdict Header Banner with Dual Score Badges */}
      <div className={`verdict-banner banner-${result.verdict.toLowerCase()}`}>
        <div className="verdict-icon" aria-hidden="true">
          {config.icon}
        </div>
        <div className="verdict-text-block">
          <span className="verdict-label">Verdict Assessment</span>
          <h2 className="verdict-title">{result.verdict}</h2>
        </div>
        <div className="dual-scores-container">
          <div className="score-badge-item safety" title="Safety Rating (100 = Safe, 0 = Dangerous)">
            <span className="score-pill-title">Safety</span>
            <span className="score-num">{safetyScore}</span>
            <span className="score-denom">/100</span>
          </div>
          <div className="score-badge-item threat" title="Threat Risk Index (0 = Clean, 100 = Dangerous)">
            <span className="score-pill-title">Threat</span>
            <span className="score-num">{threatScore}</span>
            <span className="score-denom">/100</span>
          </div>
        </div>
      </div>

      {/* Domain info row */}
      <div className="result-domain-row">
        <div className="domain-left">
          <span className="domain-label">Domain:</span>
          <strong className="domain-value">{domain}</strong>
        </div>
        {result.protocol && (
          <span className={`protocol-tag ${result.https ? 'proto-https' : 'proto-http'}`}>
            {result.protocol}
          </span>
        )}
      </div>

      {/* Recommendation Banner (Matching Mobile App) */}
      {result.recommendation && (
        <div className={`recommendation-banner banner-${result.verdict.toLowerCase()}`}>
          <span className="rec-icon" aria-hidden="true">
            {result.verdict === 'SAFE' ? '🛡️' : result.verdict === 'SUSPICIOUS' ? '⚠️' : '⛔'}
          </span>
          <p className="rec-text">{result.recommendation}</p>
        </div>
      )}

      {/* Summary Explanation */}
      <div className="summary-section">
        <h3 className="section-subtitle">Analysis Summary</h3>
        <p className="summary-text">{result.summary}</p>
      </div>

      {/* Checks Performed Section (1:1 with Mobile App & 8 Backend Security Domains) */}
      {result.checks && result.checks.length > 0 && (
        <div className="checks-section">
          <h3 className="section-subtitle">Checks Performed ({result.checks.length} Security Layers)</h3>
          <div className="checks-container">
            {result.checks.map((chk) => (
              <div key={chk.name} className="check-row">
                <div className="check-info">
                  <span className="check-name">{chk.name}</span>
                  <span className="check-msg">{chk.message}</span>
                </div>
                <span className={`check-badge status-${chk.status.toLowerCase()}`}>
                  {chk.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network & Infrastructure Telemetry (From Backend) */}
      {(result.providerName || result.ipAddress || result.details) && (
        <div className="infra-section">
          <h3 className="section-subtitle">Domain & Network Telemetry</h3>
          <div className="infra-grid">
            {result.details?.canonicalHost && (
              <div className="infra-item">
                <span className="infra-label">Canonical Host:</span>
                <span className="infra-val mono">{result.details.canonicalHost}</span>
              </div>
            )}
            {result.details?.domainEntropy !== undefined && (
              <div className="infra-item">
                <span className="infra-label">Domain Entropy:</span>
                <span className="infra-val">
                  {result.details.domainEntropy.toFixed(2)} (Shannon)
                </span>
              </div>
            )}
            {result.details?.tld && (
              <div className="infra-item">
                <span className="infra-label">TLD Standing:</span>
                <span className={`infra-val ${result.details.isSuspiciousTld ? 'warn-text' : ''}`}>
                  .{result.details.tld} {result.details.isSuspiciousTld ? '(Abused TLD)' : '(Verified)'}
                </span>
              </div>
            )}
            {(result.details?.resolvedIp || result.ipAddress) && (
              <div className="infra-item">
                <span className="infra-label">DNS Resolved IP:</span>
                <span className="infra-val mono">{result.details?.resolvedIp || result.ipAddress}</span>
              </div>
            )}
            {result.providerName && (
              <div className="infra-item">
                <span className="infra-label">Hosting Provider:</span>
                <span className="infra-val">{result.providerName}</span>
              </div>
            )}
            {result.details?.reputableDomain !== undefined && (
              <div className="infra-item">
                <span className="infra-label">Brand Standing:</span>
                <span className="infra-val">
                  {result.details.reputableDomain ? 'Verified Known Brand' : 'Standard Domain'}
                </span>
              </div>
            )}
            {result.hasRedirects !== undefined && (
              <div className="infra-item">
                <span className="infra-label">Redirects:</span>
                <span className="infra-val">
                  {result.hasRedirects ? `${result.redirectCount || 1} hop(s)` : 'Direct link'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Threat Indicators List or Clean State */}
      <div className="indicators-section">
        <h3 className="section-subtitle">
          Detected Threat Indicators ({result.indicators ? result.indicators.length : 0})
        </h3>
        {result.indicators && result.indicators.length > 0 ? (
          <ul className="indicators-list">
            {result.indicators.map((ind) => (
              <li key={ind.id} className={`indicator-item severity-${ind.severity.toLowerCase()}`}>
                <span className="indicator-dot" aria-hidden="true" />
                <div className="indicator-body">
                  <span className="indicator-title">{ind.title}</span>
                  {ind.description && ind.description !== ind.title && (
                    <span className="indicator-desc">{ind.description}</span>
                  )}
                </div>
                <span className="severity-tag">{ind.severity}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="clean-state-box">
            <span className="clean-icon" aria-hidden="true">✓</span>
            <span className="clean-text">
              No high-risk indicators detected in domain name, structure, or host configuration.
            </span>
          </div>
        )}
      </div>

      {/* Live Backend Telemetry & Verification Box */}
      <div className="backend-proof-card">
        <div className="proof-header">
          <div className="proof-title-wrap">
            <span className="proof-dot"></span>
            <span className="proof-heading">Spring Boot API Verification</span>
          </div>
          <span className={`proof-status-badge ${result.fromCache ? 'badge-cached' : 'badge-live'}`}>
            {result.fromCache ? '⚡ Pre-fetched' : '🌐 Live Request'}
          </span>
        </div>
        <div className="proof-details">
          {result.backendScanId && (
            <div className="proof-item">
              <span className="p-label">Server Scan UUID:</span>
              <span className="p-val mono" title={result.backendScanId}>
                {result.backendScanId.length > 22
                  ? `${result.backendScanId.substring(0, 10)}...${result.backendScanId.substring(result.backendScanId.length - 8)}`
                  : result.backendScanId}
              </span>
            </div>
          )}
          {result.latencyMs !== undefined && (
            <div className="proof-item">
              <span className="p-label">Response Time:</span>
              <span className="p-val">{result.latencyMs} ms</span>
            </div>
          )}
          {result.sourceServer && (
            <div className="proof-item">
              <span className="p-label">Backend Host:</span>
              <span className="p-val mono">{result.sourceServer}</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="security-notice disclaimer-notice">
        <span className="disclaimer-icon" aria-hidden="true">🛡️</span>
        <span className="disclaimer-text">
          {result.verdict === 'MALICIOUS'
            ? 'DO NOT proceed or submit sensitive information on this page.'
            : result.verdict === 'SUSPICIOUS'
            ? 'Proceed with caution. Carefully confirm the domain address before continuing.'
            : 'Destination appears normal. Automated evaluation cannot guarantee 100% safety; always verify sender credentials.'}
        </span>
      </div>

      {/* Timestamp */}
      {formattedTime && (
        <div className="timestamp-row">
          <span>Evaluated: {formattedTime}</span>
        </div>
      )}

      {/* Re-check action */}
      <button
        type="button"
        className="btn-secondary reanalyze-btn"
        onClick={onAnalyzeAgain}
        aria-label="Re-analyze current active tab"
      >
        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        <span>Analyze Again</span>
      </button>
    </div>
  );
};

function getVerdictConfig(verdict: Verdict) {
  switch (verdict) {
    case 'SAFE':
      return {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        ),
      };
    case 'SUSPICIOUS':
      return {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      };
    case 'MALICIOUS':
      return {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
      };
    case 'UNKNOWN':
    default:
      return {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      };
  }
}

function formatTimestamp(iso: string): string | null {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ', ' +
      d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}
