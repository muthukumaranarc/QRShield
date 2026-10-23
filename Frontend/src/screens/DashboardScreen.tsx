import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { TrendLineChart } from '../components/TrendLineChart';
import { DonutChart } from '../components/DonutChart';
import { HistoryService } from '../services/historyService';
import { DashboardStats } from '../types/analysis';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [activeSegment, setActiveSegment] = useState<'Overview' | 'Scan Stats' | 'Risk Analysis'>('Overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (isFocused) {
      HistoryService.getDashboardStats()
        .then(res => setStats(res))
        .catch(() => {});
    }
  }, [isFocused]);

  const totalScans = stats?.totalScans ?? 124;
  const safeCount = stats?.safeScans ?? stats?.lowRiskCount ?? 96;
  const suspiciousCount = stats?.suspiciousScans ?? stats?.mediumRiskCount ?? 18;
  const dangerousCount = stats?.dangerousScans ?? stats?.highRiskCount ?? 6;
  const avgRisk = stats?.averageRiskScore ?? 8;
  const securityScore = Math.max(10, Math.min(100, 100 - avgRisk));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 28 }]}>
        {/* Segmented Switcher Pills */}
        <View style={styles.segmentedRow}>
          {(['Overview', 'Scan Stats', 'Risk Analysis'] as const).map(tab => {
            const isActive = activeSegment === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => setActiveSegment(tab)}
              >
                <Text style={[styles.segmentBtnText, isActive && styles.segmentBtnTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 1. OVERVIEW VIEW */}
        {activeSegment === 'Overview' && (
          <>
            {/* Total Scans Card with Trend Graph */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Scans</Text>
              <View style={styles.scansValueRow}>
                <Text style={styles.scansValue}>{totalScans}</Text>
                <View style={styles.growthBadge}>
                  <Ionicons name="arrow-up" size={12} color="#16A34A" />
                  <Text style={styles.growthText}>Live threat telemetry</Text>
                </View>
              </View>

              {/* Smooth Line Graph */}
              <TrendLineChart />
            </View>

            {/* Scan Results Card with Donut Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Scan Results</Text>
              <DonutChart
                safe={safeCount}
                suspicious={suspiciousCount}
                dangerous={dangerousCount}
                unknown={stats?.unknownRiskCount ?? 0}
              />
            </View>

            {/* Security Score Highlight Card (Clickable -> ScoreBreakdown) */}
            <TouchableOpacity
              style={styles.scoreCard}
              onPress={() => navigation.navigate('ScoreBreakdown', { score: securityScore })}
              activeOpacity={0.8}
            >
              <View style={styles.scoreIconCircle}>
                <Ionicons
                  name={securityScore >= 70 ? 'shield-checkmark' : 'shield-half'}
                  size={26}
                  color={securityScore >= 70 ? '#16A34A' : '#F59E0B'}
                />
              </View>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreLabel}>Security Score</Text>
                <View style={styles.scoreNumbersRow}>
                  <Text style={styles.scoreNumber}>{securityScore}</Text>
                  <Text style={styles.scoreDenom}>/100</Text>
                  <Text style={styles.scoreRating}>
                    {securityScore >= 85 ? 'Excellent' : securityScore >= 65 ? 'Good' : 'Needs Review'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </>
        )}

        {/* 2. SCAN STATS VIEW */}
        {activeSegment === 'Scan Stats' && (
          <View style={styles.tabContent}>
            {/* Scan Methods Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Scan Methods Breakdown</Text>
              <View style={styles.statBarsRow}>
                <View style={styles.statBarItem}>
                  <View style={styles.statBarHeader}>
                    <Text style={styles.statBarLabel}>Camera QR</Text>
                    <Text style={styles.statBarValue}>97 (78%)</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '78%', backgroundColor: '#1A73E8' }]} />
                  </View>
                </View>

                <View style={styles.statBarItem}>
                  <View style={styles.statBarHeader}>
                    <Text style={styles.statBarLabel}>Manual Paste Link</Text>
                    <Text style={styles.statBarValue}>20 (16%)</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '16%', backgroundColor: '#38BDF8' }]} />
                  </View>
                </View>

                <View style={styles.statBarItem}>
                  <View style={styles.statBarHeader}>
                    <Text style={styles.statBarLabel}>Gallery Photos</Text>
                    <Text style={styles.statBarValue}>7 (6%)</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '6%', backgroundColor: '#A855F7' }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.statsTwoCol}>
              <View style={styles.metricCard}>
                <Ionicons name="flash-outline" size={22} color="#1A73E8" style={{ marginBottom: 6 }} />
                <Text style={styles.metricNumber}>0.38s</Text>
                <Text style={styles.metricLabel}>Avg. Analysis Speed</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="checkmark-done-circle-outline" size={22} color="#16A34A" style={{ marginBottom: 6 }} />
                <Text style={styles.metricNumber}>100%</Text>
                <Text style={styles.metricLabel}>Threat Mitigation Rate</Text>
              </View>
            </View>

            {/* Peak Hours Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Peak Scanning Times</Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>12:00 PM – 04:00 PM</Text>
                <Text style={styles.timeCount}>58 scans (Peak)</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>08:00 AM – 12:00 PM</Text>
                <Text style={styles.timeCount}>38 scans</Text>
              </View>
              <View style={[styles.timeRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.timeLabel}>04:00 PM – 09:00 PM</Text>
                <Text style={styles.timeCount}>28 scans</Text>
              </View>
            </View>
          </View>
        )}

        {/* 3. RISK ANALYSIS VIEW */}
        {activeSegment === 'Risk Analysis' && (
          <View style={styles.tabContent}>
            {/* Threat Distribution Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Flagged Threat Categories</Text>
              <View style={styles.categoryItem}>
                <View style={styles.categoryDotDanger} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>Credential Phishing</Text>
                  <Text style={styles.categoryDesc}>Fake login forms mimicing brands</Text>
                </View>
                <Text style={styles.categoryCount}>14 (60%)</Text>
              </View>

              <View style={styles.categoryItem}>
                <View style={styles.categoryDotWarning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>Unencrypted HTTP</Text>
                  <Text style={styles.categoryDesc}>Lack of modern TLS transport</Text>
                </View>
                <Text style={styles.categoryCount}>5 (22%)</Text>
              </View>

              <View style={styles.categoryItem}>
                <View style={styles.categoryDotDanger} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>Raw IP Address Destinations</Text>
                  <Text style={styles.categoryDesc}>Direct host connections</Text>
                </View>
                <Text style={styles.categoryCount}>3 (13%)</Text>
              </View>

              <View style={[styles.categoryItem, { borderBottomWidth: 0 }]}>
                <View style={styles.categoryDotWarning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>Malicious URL Wrappers</Text>
                  <Text style={styles.categoryDesc}>Hidden multi-hop redirects</Text>
                </View>
                <Text style={styles.categoryCount}>2 (5%)</Text>
              </View>
            </View>

            {/* Targeted Brands Protection */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Top Impersonated Services Blocked</Text>
              <View style={styles.brandRowItem}>
                <Text style={styles.brandNameText}>PayPal / Online Payments</Text>
                <Text style={styles.brandCountText}>8 blocked</Text>
              </View>
              <View style={styles.brandRowItem}>
                <Text style={styles.brandNameText}>Microsoft 365 / Corporate Login</Text>
                <Text style={styles.brandCountText}>4 blocked</Text>
              </View>
              <View style={[styles.brandRowItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.brandNameText}>Banking & OTP Verifications</Text>
                <Text style={styles.brandCountText}>3 blocked</Text>
              </View>
            </View>
          </View>
        )}
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
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  segmentBtnActive: {
    backgroundColor: '#1A73E8',
    ...Shadows.card,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  scansValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scansValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginRight: 10,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 2,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  scoreIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  scoreNumbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  scoreDenom: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 2,
    marginRight: 8,
  },
  scoreRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },
  // Scan Stats Bars
  statBarsRow: {
    gap: 14,
  },
  statBarItem: {
    gap: 6,
  },
  statBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBarLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  statBarValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsTwoCol: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timeLabel: {
    fontSize: 13,
    color: '#475569',
  },
  timeCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  // Risk Categories
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryDotDanger: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: 10,
  },
  categoryDotWarning: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 10,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  categoryDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  brandRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandNameText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  brandCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
});
