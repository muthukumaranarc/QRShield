import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { RootStackParamList } from '../types/navigation';
import { CheckStatus } from '../types/analysis';
import { AnalysisService } from '../services/analysisService';
import { RiskBadge } from '../components/RiskBadge';
import { AnalysisIndicatorRow } from '../components/AnalysisIndicatorRow';
import { Toast } from '../components/Toast';
import { Colors, Radius, Spacing, Shadows, Typography } from '../constants/theme';

type RouteProps = RouteProp<RootStackParamList, 'AnalysisDetails'>;

export const AnalysisDetailsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { analysis } = route.params;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isHighRisk = analysis.riskLevel === 'HIGH';
  const isMediumRisk = analysis.riskLevel === 'MEDIUM';
  const isLowRisk = analysis.riskLevel === 'LOW';

  // Harmonized dual scores matching ResultScreen and backend calibration
  const safetyScore =
    typeof analysis.safetyScore === 'number'
      ? analysis.safetyScore
      : typeof analysis.riskScore === 'number'
      ? Math.max(0, 100 - analysis.riskScore)
      : isLowRisk
      ? 96
      : isHighRisk
      ? 20
      : 50;
  const threatScore = typeof analysis.riskScore === 'number' ? analysis.riskScore : (100 - safetyScore);

  const handleCopyUrl = async () => {
    const textToCopy = analysis.normalizedUrl || analysis.originalContent;
    if (textToCopy) {
      await Clipboard.setStringAsync(textToCopy);
      setToastMessage('URL copied to clipboard');
    }
  };

  const handleShareReport = async () => {
    try {
      const url = analysis.normalizedUrl || analysis.originalContent;
      const message = `QRShield Security Report\nTarget: ${url}\nRisk Assessment: ${analysis.riskLevel} (${analysis.riskScore !== null ? `${analysis.riskScore}/100` : 'Not scored'})\nRecommendation: ${analysis.recommendation}`;
      await Share.share({ message });
    } catch {
      // Ignore share error
    }
  };

  const handleOpenUrl = () => {
    const target = analysis.normalizedUrl || analysis.originalContent;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      Alert.alert('Unsupported Scheme', 'Only HTTP and HTTPS links are allowed.');
      return;
    }

    if (isHighRisk) {
      Alert.alert(
        '⚠️ Dangerous Link Warning',
        'QRShield strongly advises against opening this link. Continuing may result in malware or data theft.\n\nOpen anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'I Understand, Open',
            style: 'destructive',
            onPress: () => Linking.openURL(target).catch(() => Alert.alert('Error', 'Unable to open link.')),
          },
        ]
      );
    } else {
      Linking.openURL(target).catch(() => Alert.alert('Error', 'Unable to open link.'));
    }
  };

  const handleReportThreat = () => {
    Alert.alert(
      isHighRisk ? 'Dispute Detection' : 'Report Security Threat',
      isHighRisk
        ? 'Do you believe this destination was falsely flagged as dangerous?'
        : 'Report this URL to the QRShield security community for threat intelligence inspection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Report',
          onPress: async () => {
            const res = await AnalysisService.submitThreatReport({
              scanId: analysis.id,
              targetUrl: analysis.normalizedUrl || analysis.originalContent,
              reportType: isHighRisk ? 'FALSE_POSITIVE' : 'PHISHING',
              comments: 'Reported from QRShield mobile client',
            });
            setToastMessage(res.message);
          },
        },
      ]
    );
  };

  const renderCheckStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case 'PASSED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: Colors.riskLowBg, borderColor: Colors.riskLowBorder }]}>
            <Ionicons name="checkmark-circle" size={13} color={Colors.riskLowText} />
            <Text style={[styles.statusBadgeText, { color: Colors.riskLowText }]}>Passed</Text>
          </View>
        );
      case 'WARNING':
        return (
          <View style={[styles.statusBadge, { backgroundColor: Colors.riskMediumBg, borderColor: Colors.riskMediumBorder }]}>
            <Ionicons name="warning" size={13} color={Colors.riskMediumText} />
            <Text style={[styles.statusBadgeText, { color: Colors.riskMediumText }]}>Warning</Text>
          </View>
        );
      case 'FAILED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: Colors.riskHighBg, borderColor: Colors.riskHighBorder }]}>
            <Ionicons name="close-circle" size={13} color={Colors.riskHighText} />
            <Text style={[styles.statusBadgeText, { color: Colors.riskHighText }]}>Failed</Text>
          </View>
        );
      case 'NOT_CHECKED':
        return (
          <View style={[styles.statusBadge, { backgroundColor: Colors.surfaceSubtle, borderColor: Colors.border }]}>
            <Ionicons name="ellipse-outline" size={13} color={Colors.textSecondary} />
            <Text style={[styles.statusBadgeText, { color: Colors.textSecondary }]}>Not checked</Text>
          </View>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <View style={[styles.statusBadge, { backgroundColor: Colors.surfaceSubtle, borderColor: Colors.border }]}>
            <Ionicons name="help-circle-outline" size={13} color={Colors.textSecondary} />
            <Text style={[styles.statusBadgeText, { color: Colors.textSecondary }]}>Unavailable</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Analysis</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleShareReport}
          accessibilityRole="button"
          accessibilityLabel="Share report"
        >
          <Ionicons name="share-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}>
        {/* Mock/Demo Notice */}
        {analysis.analysisSource === 'MOCK' ? (
          <View style={styles.demoNotice}>
            <Ionicons name="flask-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.demoNoticeText}>
              Prototype Heuristic Mode: Evaluation generated via client security rules.
            </Text>
          </View>
        ) : (
          <View style={[styles.demoNotice, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Ionicons name="shield-checkmark" size={16} color="#059669" style={{ marginRight: 6 }} />
            <Text style={[styles.demoNoticeText, { color: '#047857' }]}>
              Verified by Spring Boot Threat Engine (Live API)
            </Text>
          </View>
        )}

        {/* Hero Score Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <RiskBadge riskLevel={analysis.riskLevel} size="lg" />
            <View style={styles.sourceTag}>
              <Ionicons
                name={analysis.analysisSource === 'BACKEND' ? 'shield-checkmark' : 'flask-outline'}
                size={13}
                color={analysis.analysisSource === 'BACKEND' ? '#059669' : Colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.sourceTagText,
                  { color: analysis.analysisSource === 'BACKEND' ? '#059669' : Colors.primary },
                ]}
              >
                {analysis.analysisSource === 'BACKEND' ? 'Live Threat Engine' : 'Heuristic Rules'}
              </Text>
            </View>
          </View>

          {/* Harmonized Dual Metric Scoring Panel */}
          <View style={styles.scoreDualCard}>
            <View
              style={[
                styles.scoreMetricBox,
                {
                  backgroundColor: isLowRisk ? '#F0FDF4' : isHighRisk ? '#FEF2F2' : '#FFFBEB',
                  borderColor: isLowRisk ? '#BBF7D0' : isHighRisk ? '#FECACA' : '#FDE68A',
                },
              ]}
            >
              <Text
                style={[
                  styles.metricLabel,
                  { color: isLowRisk ? '#15803D' : isHighRisk ? '#B91C1C' : '#B45309' },
                ]}
              >
                SAFETY SCORE
              </Text>
              <View style={styles.metricValRow}>
                <Text
                  style={[
                    styles.metricVal,
                    { color: isLowRisk ? '#16A34A' : isHighRisk ? '#DC2626' : '#D97706' },
                  ]}
                >
                  {safetyScore}
                </Text>
                <Text style={styles.metricDenom}>/100</Text>
              </View>
              <Text style={styles.metricDesc}>
                {isLowRisk ? 'Grade: A · High Trust' : isHighRisk ? 'Grade: F · High Danger' : 'Grade: C · Caution'}
              </Text>
            </View>

            <View
              style={[
                styles.scoreMetricBox,
                {
                  backgroundColor: '#F8FAFC',
                  borderColor: '#E2E8F0',
                },
              ]}
            >
              <Text style={styles.metricLabelMuted}>THREAT RISK INDEX</Text>
              <View style={styles.metricValRow}>
                <Text
                  style={[
                    styles.metricVal,
                    { color: isLowRisk ? '#16A34A' : isHighRisk ? '#DC2626' : '#D97706' },
                  ]}
                >
                  {threatScore}
                </Text>
                <Text style={styles.metricDenom}>/100</Text>
              </View>
              <Text style={styles.metricDesc}>
                {isLowRisk ? 'Minimal Threat Signals' : isHighRisk ? 'Critical Threat Risk' : 'Suspicious Indicators'}
              </Text>
            </View>
          </View>

          {/* URL Box */}
          <View style={styles.urlBox}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={styles.domainText}>{analysis.domain || 'Direct Content'}</Text>
              <Text style={styles.fullUrlText} numberOfLines={3}>
                {analysis.normalizedUrl || analysis.originalContent}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={handleCopyUrl}
              accessibilityRole="button"
              accessibilityLabel="Copy URL"
            >
              <Ionicons name="copy-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Recommendation Banner */}
          <View
            style={[
              styles.recommendationBanner,
              isHighRisk && styles.recommendationHigh,
              isMediumRisk && styles.recommendationMedium,
              isLowRisk && styles.recommendationLow,
            ]}
          >
            <Ionicons
              name={isHighRisk ? 'shield-outline' : isMediumRisk ? 'warning-outline' : 'shield-checkmark-outline'}
              size={20}
              color={isHighRisk ? Colors.riskHighText : isMediumRisk ? Colors.riskMediumText : Colors.riskLowText}
              style={{ marginRight: Spacing.sm }}
            />
            <Text
              style={[
                styles.recommendationText,
                { color: isHighRisk ? Colors.riskHighText : isMediumRisk ? Colors.riskMediumText : Colors.riskLowText },
              ]}
            >
              {analysis.recommendation}
            </Text>
          </View>

          <Text style={styles.summaryText}>{analysis.summary}</Text>
        </View>

        {/* Detected Indicators Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Indicators</Text>
          {analysis.indicators.length > 0 ? (
            analysis.indicators.map(indicator => (
              <AnalysisIndicatorRow key={indicator.id} indicator={indicator} />
            ))
          ) : (
            <View style={styles.cleanStateCard}>
              <Ionicons name="checkmark-done-circle" size={24} color={Colors.riskLowText} style={{ marginRight: 8 }} />
              <Text style={styles.cleanStateText}>
                No high-risk indicators detected in domain name, structure, or host configuration.
              </Text>
            </View>
          )}
        </View>

        {/* Checks Performed Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checks Performed</Text>
          <View style={styles.checksCard}>
            {analysis.checks.map((check, index) => (
              <View
                key={check.name}
                style={[styles.checkRow, index !== analysis.checks.length - 1 && styles.checkRowBorder]}
              >
                <View style={{ flex: 1, marginRight: Spacing.sm }}>
                  <Text style={styles.checkName}>{check.name}</Text>
                  <Text style={styles.checkMessage}>{check.message}</Text>
                </View>
                {renderCheckStatusBadge(check.status)}
              </View>
            ))}
          </View>
        </View>

        {/* Network & Infrastructure Telemetry (Backend Enhanced) */}
        {(analysis.providerName || analysis.ipAddress || (analysis.redirectChain && analysis.redirectChain.length > 1) || analysis.details) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Domain & Network Intelligence</Text>
            <View style={styles.checksCard}>
              {analysis.details?.canonicalHost && (
                <View style={[styles.checkRow, styles.checkRowBorder]}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.checkName}>Canonical Reverse Host</Text>
                    <Text style={styles.checkMessage}>PTR reverse DNS identifier</Text>
                  </View>
                  <Text style={styles.infraValueText}>{analysis.details.canonicalHost}</Text>
                </View>
              )}
              {typeof analysis.details?.domainEntropy === 'number' && (
                <View style={[styles.checkRow, styles.checkRowBorder]}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.checkName}>Domain Shannon Entropy</Text>
                    <Text style={styles.checkMessage}>
                      {analysis.details.domainEntropy > 4.5
                        ? 'High entropy (>4.5) indicates algorithmic DGA domain'
                        : 'Natural lexical distribution (<4.0)'}
                    </Text>
                  </View>
                  <Text style={[styles.infraValueText, { fontWeight: '700' }]}>
                    {analysis.details.domainEntropy.toFixed(2)}
                  </Text>
                </View>
              )}
              {analysis.details?.tld && (
                <View style={[styles.checkRow, styles.checkRowBorder]}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.checkName}>Top-Level Domain (TLD)</Text>
                    <Text style={styles.checkMessage}>
                      {analysis.details.isSuspiciousTld ? 'Flagged as high-abuse TLD' : 'Standard verified TLD'}
                    </Text>
                  </View>
                  <Text style={[styles.infraValueText, analysis.details.isSuspiciousTld && { color: '#DC2626', fontWeight: '700' }]}>
                    .{analysis.details.tld}
                  </Text>
                </View>
              )}
              {(analysis.details?.resolvedIp || analysis.ipAddress) && (
                <View style={[styles.checkRow, styles.checkRowBorder]}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.checkName}>DNS Resolved IP</Text>
                    <Text style={styles.checkMessage}>A-Record network address</Text>
                  </View>
                  <Text style={[styles.infraValueText, { fontFamily: Typography.mono.fontFamily }]}>
                    {analysis.details?.resolvedIp || analysis.ipAddress}
                  </Text>
                </View>
              )}
              {analysis.providerName && (
                <View style={[styles.checkRow, styles.checkRowBorder]}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.checkName}>Hosting Provider / ASN</Text>
                    <Text style={styles.checkMessage}>Origin infrastructure organization</Text>
                  </View>
                  <Text style={styles.infraValueText}>{analysis.providerName}</Text>
                </View>
              )}
              {analysis.details?.reputableDomain !== undefined && (
                <View style={[styles.checkRow, (analysis.redirectChain && analysis.redirectChain.length > 1) ? styles.checkRowBorder : null]}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.checkName}>Brand Standing</Text>
                    <Text style={styles.checkMessage}>Pre-click corporate brand registry</Text>
                  </View>
                  <Text style={[styles.infraValueText, { color: analysis.details.reputableDomain ? '#16A34A' : '#64748B', fontWeight: '700' }]}>
                    {analysis.details.reputableDomain ? 'Verified Known Brand' : 'Standard Domain'}
                  </Text>
                </View>
              )}
              {analysis.redirectChain && analysis.redirectChain.length > 1 && (
                <View style={styles.checkRow}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.checkName}>Redirect Chain</Text>
                    <Text style={styles.checkMessage}>Destination hops observed</Text>
                  </View>
                  <Text style={styles.infraValueText}>{analysis.redirectChain.length - 1} hop(s)</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quarantined Download Artifacts (Dynamic Sandbox Findings) */}
        {analysis.downloadDetected && analysis.downloadArtifacts && analysis.downloadArtifacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quarantined Download Artifacts</Text>
            <View style={styles.checksCard}>
              {analysis.downloadArtifacts.map(artifact => (
                <View key={artifact.artifactId} style={styles.checkRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checkName}>{artifact.originalFilename}</Text>
                    <Text style={styles.checkMessage}>
                      Size: {Math.round(artifact.sizeBytes / 1024)} KB • Status: {artifact.quarantineStatus}
                    </Text>
                    <Text
                      style={[
                        styles.checkMessage,
                        {
                          color:
                            artifact.reputationStatus === 'CONFIRMED_MALICIOUS'
                              ? '#DC2626'
                              : '#64748B',
                          fontWeight: '600',
                          marginTop: 2,
                        },
                      ]}
                    >
                      Reputation: {artifact.reputationStatus}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.openBtn, isHighRisk && styles.openBtnDanger]}
            onPress={handleOpenUrl}
            accessibilityRole="button"
            accessibilityLabel="Open in external browser"
          >
            <Text style={[styles.openBtnText, isHighRisk && styles.openBtnTextDanger]}>
              {isHighRisk ? 'Open anyway (high risk)' : 'Open in browser'}
            </Text>
            <Ionicons
              name="open-outline"
              size={15}
              color={isHighRisk ? Colors.riskHighText : Colors.primaryContrast}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportBtn}
            onPress={handleReportThreat}
            accessibilityRole="button"
            accessibilityLabel="Report suspicious URL or false positive"
          >
            <Ionicons name="flag-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.reportBtnText}>
              {isHighRisk ? 'Dispute False Positive' : 'Report Threat to Community'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast
        visible={!!toastMessage}
        message={toastMessage || ''}
        onDismiss={() => setToastMessage(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  demoNoticeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    flex: 1,
  },
  // Hero Card
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  sourceTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoreDualCard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  scoreMetricBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricLabelMuted: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricVal: {
    fontSize: 24,
    fontWeight: '900',
  },
  metricDenom: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 2,
  },
  metricDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  domainText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  fullUrlText: {
    fontSize: 12,
    fontFamily: Typography.mono.fontFamily,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  copyBtn: {
    padding: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  recommendationHigh: {
    backgroundColor: Colors.riskHighBg,
    borderColor: Colors.riskHighBorder,
  },
  recommendationMedium: {
    backgroundColor: Colors.riskMediumBg,
    borderColor: Colors.riskMediumBorder,
  },
  recommendationLow: {
    backgroundColor: Colors.riskLowBg,
    borderColor: Colors.riskLowBorder,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  cleanStateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cleanStateText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  checksCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  checkRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  checkName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  infraValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  checkMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    marginTop: Spacing.sm,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
  },
  openBtnDanger: {
    backgroundColor: Colors.riskHighBg,
    borderWidth: 1.5,
    borderColor: Colors.riskHigh,
  },
  openBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryContrast,
  },
  openBtnTextDanger: {
    color: Colors.riskHighText,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: '#F1F5F9',
    marginTop: 10,
  },
  reportBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
