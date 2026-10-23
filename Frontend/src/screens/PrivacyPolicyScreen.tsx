import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const PrivacyPolicyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 }]}>
        <Text style={styles.effectiveDate}>Effective Date: October 2026</Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>1. Zero Video / Image Storage</Text>
          <Text style={styles.bodyText}>
            QRShield accesses your device camera and gallery solely to decode barcodes in real-time. Camera frames and selected images are processed in local memory and are never uploaded or stored on remote servers.
          </Text>

          <Text style={styles.sectionHeader}>2. Scan History Storage</Text>
          <Text style={styles.bodyText}>
            Your scan history is stored locally on your device using encrypted storage. You can delete individual scans or clear your complete history at any time from the History or Settings screen.
          </Text>

          <Text style={styles.sectionHeader}>3. URL Analysis Telemetry</Text>
          <Text style={styles.bodyText}>
            When checking a URL with the backend threat intelligence service, only the normalized web address is sent to query reputation engines. No advertising identifiers, device serial numbers, or location data are ever transmitted.
          </Text>

          <Text style={styles.sectionHeader}>4. Third-Party Registries</Text>
          <Text style={styles.bodyText}>
            Threat intelligence lookups check public security registries (such as Google Safe Browsing and anti-phishing community feeds). These queries do not contain personal user data.
          </Text>
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
  effectiveDate: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 14,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});
