import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HistoryService } from '../services/historyService';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const PrivacySecurityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [onDeviceOnly, setOnDeviceOnly] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);
  const [checkClipboard, setCheckClipboard] = useState(true);
  const [shareTelemetry, setShareTelemetry] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Security Data',
      'This will delete all cached threat signatures, local history, and temporary scan metadata. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await HistoryService.clearScanHistory();
            Alert.alert('Data Cleared', 'All local threat caches and scan records have been wiped.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const history = await HistoryService.getScanHistory();
      const payload = JSON.stringify(
        {
          appName: 'QRShield',
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          totalScans: history.length,
          scans: history,
        },
        null,
        2
      );
      await Share.share({
        title: 'QRShield Security Export',
        message: payload,
      });
    } catch {
      Alert.alert('Error', 'Unable to export scan data.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 }]}>
        {/* Privacy Promise Card */}
        <View style={styles.promiseCard}>
          <View style={styles.promiseIconCircle}>
            <Ionicons name="shield-checkmark" size={26} color="#16A34A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promiseTitle}>Zero-Knowledge Guarantee</Text>
            <Text style={styles.promiseText}>
              Camera video frames and photo gallery pixels are processed directly on your device. We never store camera footage or track your personal browsing.
            </Text>
          </View>
        </View>

        {/* Security Controls */}
        <Text style={styles.sectionTitle}>Security Settings</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>On-Device Threat Evaluation</Text>
              <Text style={styles.switchSubtext}>Analyze structural indicators locally before making server calls</Text>
            </View>
            <Switch
              value={onDeviceOnly}
              onValueChange={setOnDeviceOnly}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={onDeviceOnly ? '#1A73E8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>Prompt Before Opening High Risk</Text>
              <Text style={styles.switchSubtext}>Require confirmation before launching dangerous external URLs</Text>
            </View>
            <Switch
              value={autoBlock}
              onValueChange={setAutoBlock}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={autoBlock ? '#1A73E8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>Auto-Check Clipboard on Paste</Text>
              <Text style={styles.switchSubtext}>Quickly detect copied links in the link paste tool</Text>
            </View>
            <Switch
              value={checkClipboard}
              onValueChange={setCheckClipboard}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={checkClipboard ? '#1A73E8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.switchLabel}>Anonymous Threat Telemetry</Text>
              <Text style={styles.switchSubtext}>Help community security by reporting anonymized malicious domains</Text>
            </View>
            <Switch
              value={shareTelemetry}
              onValueChange={setShareTelemetry}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={shareTelemetry ? '#1A73E8' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Data Management Actions */}
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
            <View style={styles.actionLeft}>
              <Ionicons name="download-outline" size={20} color="#1A73E8" style={{ marginRight: 12 }} />
              <Text style={styles.actionLabel}>Export Security Log (JSON)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleClearData}>
            <View style={styles.actionLeft}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" style={{ marginRight: 12 }} />
              <Text style={[styles.actionLabel, { color: '#DC2626' }]}>Clear All Security Caches</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
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
  promiseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  promiseIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  promiseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  promiseText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
});
