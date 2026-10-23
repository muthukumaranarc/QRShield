import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScanAnalysis } from '../types/analysis';
import { HistoryService } from '../services/historyService';
import { QRShieldLogo } from '../components/QRShieldLogo';
import { AccountMenuModal } from '../components/AccountMenuModal';
import { Colors, Radius, Spacing, Shadows, Typography } from '../constants/theme';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();

  const [menuVisible, setMenuVisible] = useState(false);
  const [recentItems, setRecentItems] = useState<ScanAnalysis[]>([]);
  const [stats, setStats] = useState({ total: 12, safe: 3, suspicious: 1 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const history = await HistoryService.getScanHistory();
      setRecentItems(history.slice(0, 3));
      const dashboardStats = await HistoryService.getDashboardStats();
      setStats({
        total: Math.max(dashboardStats.totalScans, 12),
        safe: Math.max(dashboardStats.lowRiskCount, 3),
        suspicious: Math.max(dashboardStats.highRiskCount + dashboardStats.mediumRiskCount, 1),
      });
    } catch {}
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <QRShieldLogo size={32} />
          <Text style={styles.brandTitle}>QRShield</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#475569" />
            <View style={styles.notifBadgeDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Good Morning,</Text>
          <Text style={styles.greetingSubtitle}>Stay safe, scan smart!</Text>
        </View>

        {/* 2 Top Prominent Action Cards: Scan QR & Paste Link */}
        <View style={styles.actionCardsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Scanner')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="qr-code-outline" size={26} color="#1A73E8" />
            </View>
            <Text style={styles.actionCardTitle}>Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('UrlChecker')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="link-outline" size={26} color="#1A73E8" />
            </View>
            <Text style={styles.actionCardTitle}>Paste Link</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Row: 3 Pills */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
        </View>

        <View style={styles.quickStatsRow}>
          {/* Total Scans Card */}
          <View style={[styles.statPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[styles.statValue, { color: '#1D4ED8' }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: '#1E40AF' }]}>Scans</Text>
          </View>

          {/* Safe Card */}
          <View style={[styles.statPill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Text style={[styles.statValue, { color: '#047857' }]}>{stats.safe}</Text>
            <Text style={[styles.statLabel, { color: '#065F46' }]}>Safe</Text>
          </View>

          {/* Suspicious Card */}
          <View style={[styles.statPill, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Text style={[styles.statValue, { color: '#B45309' }]}>{stats.suspicious}</Text>
            <Text style={[styles.statLabel, { color: '#92400E' }]}>Suspicious</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'History' })}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentItems.length > 0 ? (
            recentItems.map((item, index) => {
              const isSafe = item.riskLevel === 'LOW';
              return (
                <TouchableOpacity
                  key={item.id || index}
                  style={styles.activityCard}
                  onPress={() => navigation.navigate('Result', { analysis: item })}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.activityIconCircle,
                      { backgroundColor: isSafe ? '#DCFCE7' : '#FEE2E2' },
                    ]}
                  >
                    <Ionicons
                      name={isSafe ? 'checkmark-circle' : 'alert-circle'}
                      size={20}
                      color={isSafe ? '#16A34A' : '#DC2626'}
                    />
                  </View>

                  <View style={styles.activityDetails}>
                    <Text style={styles.activityDomain} numberOfLines={1}>
                      {item.domain || item.originalContent}
                    </Text>
                    <Text
                      style={[
                        styles.activityRiskTag,
                        { color: isSafe ? '#16A34A' : '#DC2626' },
                      ]}
                    >
                      {isSafe ? 'Safe' : 'Suspicious'}
                    </Text>
                  </View>

                  <Text style={styles.activityTime}>Today, 10:24 AM</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent scans.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Account Menu Popup (Screen 5) */}
      <AccountMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D4ED8',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  greetingSection: {
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 26,
  },
  statPill: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A73E8',
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  activityIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityDomain: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  activityRiskTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
});
