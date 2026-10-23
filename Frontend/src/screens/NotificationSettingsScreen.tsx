import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NotificationService } from '../services/notificationService';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const NotificationSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [threatAlerts, setThreatAlerts] = useState(true);
  const [warnings, setWarnings] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const syncPushSettings = (alerts: boolean, weekly: boolean) => {
    NotificationService.registerPushToken(
      'ExponentPushToken[mobile_client_default]',
      Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      alerts,
      weekly
    ).catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 }]}>
        <Text style={styles.sectionTitle}>Threat Alerts</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>High-Risk Threat Alerts</Text>
              <Text style={styles.switchSubtext}>Instant push warning when a malicious destination is intercepted</Text>
            </View>
            <Switch
              value={threatAlerts}
              onValueChange={val => {
                setThreatAlerts(val);
                syncPushSettings(val, weeklyDigest);
              }}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={threatAlerts ? '#1A73E8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>Suspicious Link Warnings</Text>
              <Text style={styles.switchSubtext}>Notify when shortened or newly registered domains are scanned</Text>
            </View>
            <Switch
              value={warnings}
              onValueChange={setWarnings}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={warnings ? '#1A73E8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>Haptic Feedback on Scan</Text>
              <Text style={styles.switchSubtext}>Vibrate device when a barcode is detected</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={hapticsEnabled ? '#1A73E8' : '#F1F5F9'}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>App & Insights</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>Weekly Security Digest</Text>
              <Text style={styles.switchSubtext}>Weekly summary of scans, avoided threats, and security score</Text>
            </View>
            <Switch
              value={weeklyDigest}
              onValueChange={setWeeklyDigest}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={weeklyDigest ? '#1A73E8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>Database & Signature Updates</Text>
              <Text style={styles.switchSubtext}>Notifications when offline threat databases are updated</Text>
            </View>
            <Switch
              value={systemUpdates}
              onValueChange={setSystemUpdates}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={systemUpdates ? '#1A73E8' : '#F1F5F9'}
            />
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.lg,
    marginBottom: 20,
    ...Shadows.card,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  switchSubtext: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
