import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { SecurityGauge } from '../components/SecurityGauge';
import { Colors, Radius, Spacing, Shadows } from '../constants/theme';

type RouteProps = RouteProp<RootStackParamList, 'Result'>;

export const ResultScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProps>();
  const { analysis } = route.params;

  const isSafe = analysis.riskLevel === 'LOW';
  const isHighRisk = analysis.riskLevel === 'HIGH';
  const isMediumRisk = analysis.riskLevel === 'MEDIUM';

  const displayUrl = analysis.normalizedUrl || analysis.originalContent;
  // Unified Scoring: Safety Score (100 = completely safe) & Threat Score (0 = no threat)
  const score =
    typeof analysis.safetyScore === 'number'
      ? analysis.safetyScore
      : typeof analysis.riskScore === 'number'
      ? Math.max(0, 100 - analysis.riskScore)
      : isSafe
      ? 96
      : isHighRisk
      ? 32
      : 55;
  const threatScore = typeof analysis.riskScore === 'number' ? analysis.riskScore : (100 - score);

  const handleContinue = () => {
    if (isHighRisk) {
      Alert.alert(
        '⚠️ Dangerous Link Warning',
        'QRShield has identified this link as high risk. Opening it may expose your device to fraud or malicious activity.\n\nAre you sure you want to proceed?',
        [
          { text: 'Cancel (Recommended)', style: 'cancel' },
          {
            text: 'Open Anyway',
            style: 'destructive',
            onPress: () => Linking.openURL(displayUrl).catch(() => Alert.alert('Error', 'Unable to open link.')),
          },
        ]
      );
    } else {
      Linking.openURL(displayUrl).catch(() => Alert.alert('Error', 'Unable to open link.'));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 }]}>
        {/* Top Icon Badge */}
        <View style={styles.topIconSection}>
          {isSafe ? (
            <View style={styles.safeShieldIcon}>
              <Ionicons name="shield-checkmark" size={54} color="#16A34A" />
            </View>
          ) : (
            <View style={styles.dangerTriangleIcon}>
              <Ionicons name="warning" size={54} color={isHighRisk ? '#DC2626' : '#F59E0B'} />
            </View>
          )}

          {/* Heading */}
          <Text style={styles.resultTitle}>
            {isSafe ? 'No Known Threats Detected' : 'Potentially Dangerous Link'}
          </Text>

          <Text style={styles.targetUrlText} numberOfLines={1}>
            {displayUrl}
          </Text>

          {/* Risk Pill */}
          <View
            style={[
              styles.riskPill,
              isSafe ? styles.riskPillSafe : isHighRisk ? styles.riskPillDanger : styles.riskPillMedium,
            ]}
          >
            <Text
              style={[
                styles.riskPillText,
                isSafe
                  ? styles.riskPillTextSafe
                  : isHighRisk
                  ? styles.riskPillTextDanger
                  : styles.riskPillTextMedium,
              ]}
            >
              {isSafe ? 'SAFE' : isHighRisk ? 'HIGH RISK' : 'SUSPICIOUS'}
            </Text>
          </View>
        </View>

        {/* Semicircular Score Gauge Card */}
        <View style={styles.gaugeCard}>
          <SecurityGauge
            score={score}
            grade={isSafe ? 'Grade: A' : isHighRisk ? 'Poor' : 'Fair'}
            isDanger={!isSafe}
          />

          {/* Unified Score Telemetry Breakdown */}
          <View style={styles.scoreDualRow}>
            <View style={styles.scoreDualItem}>
              <Text style={styles.scoreDualLabel}>SAFETY RATING</Text>
              <Text
                style={[
                  styles.scoreDualVal,
                  { color: isSafe ? '#16A34A' : isHighRisk ? '#DC2626' : '#D97706' },
                ]}
              >
                {score}/100
              </Text>
              <Text style={styles.scoreDualHint}>
                {isSafe ? 'Grade A · Trusted' : isHighRisk ? 'Critical Risk' : 'Suspicious'}
              </Text>
            </View>
            <View style={styles.scoreDualDivider} />
            <View style={styles.scoreDualItem}>
              <Text style={styles.scoreDualLabel}>THREAT INDEX</Text>
              <Text
                style={[
                  styles.scoreDualVal,
                  { color: isSafe ? '#16A34A' : isHighRisk ? '#DC2626' : '#D97706' },
                ]}
              >
                {threatScore}/100
              </Text>
              <Text style={styles.scoreDualHint}>
                {isSafe ? 'Minimal Risk Level' : isHighRisk ? 'Severe Threat' : 'Elevated Risk'}
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Explanation Section */}
        <View style={styles.detailsCard}>
          <View style={styles.bulletItem}>
            <View
              style={[
                styles.bulletDot,
                { backgroundColor: isSafe ? '#16A34A' : isHighRisk ? '#DC2626' : '#F59E0B' },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.bulletHeading}>Risk Analysis</Text>
              <Text style={styles.bulletText}>
                {isSafe
                  ? 'Low risk. This website appears to be safe and trustworthy.'
                  : 'This link may be harmful. Proceed with caution.'}
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <View
              style={[
                styles.bulletDot,
                { backgroundColor: isSafe ? '#16A34A' : isHighRisk ? '#DC2626' : '#F59E0B' },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.bulletHeading}>Synopsis</Text>
              <Text style={styles.bulletText}>
                {isSafe
                  ? 'The domain is legitimate, has valid SSL certificate and no known malicious activity.'
                  : 'Found suspicious patterns, untrusted domain and possible phishing indicators.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actionsContainer}>
          {isSafe ? (
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
              <Text style={styles.continueBtnText}>Continue to Website</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.safetyBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.safetyBtnText}>Go Back to Safety</Text>
            </TouchableOpacity>
          )}

          {/* View Detailed Report Link */}
          <TouchableOpacity
            style={styles.reportLinkBtn}
            onPress={() => navigation.navigate('AnalysisDetails', { analysis })}
          >
            <Text style={styles.reportLinkText}>View Detailed Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  topIconSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  safeShieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dangerTriangleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  targetUrlText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: 280,
  },
  riskPill: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  riskPillSafe: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  riskPillDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  riskPillMedium: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  riskPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  riskPillTextSafe: {
    color: '#15803D',
  },
  riskPillTextDanger: {
    color: '#B91C1C',
  },
  riskPillTextMedium: {
    color: '#B45309',
  },
  gaugeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.card,
  },
  scoreDualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  scoreDualItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreDualDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  scoreDualLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  scoreDualVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  scoreDualHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    gap: 16,
    ...Shadows.card,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  bulletHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  bulletText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  safetyBtn: {
    width: '100%',
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  safetyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  reportLinkBtn: {
    paddingVertical: 6,
  },
  reportLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A73E8',
  },
});
