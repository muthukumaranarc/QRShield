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

export const TermsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 }]}>
        <Text style={styles.effectiveDate}>Effective Date: October 2026</Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>1. Acceptance of Terms</Text>
          <Text style={styles.bodyText}>
            By downloading, installing, or using QRShield, you agree to be bound by these Terms of Service. If you do not agree, do not use the application.
          </Text>

          <Text style={styles.sectionHeader}>2. Protective Analysis Disclaimer</Text>
          <Text style={styles.bodyText}>
            QRShield is a protective preview tool that evaluates QR codes and URLs for known risk indicators. While our algorithms provide proactive assessments, QRShield does not guarantee that any URL is 100% safe. Users remain responsible for evaluating external links.
          </Text>

          <Text style={styles.sectionHeader}>3. Prohibited Usage</Text>
          <Text style={styles.bodyText}>
            You may not use QRShield to perform unauthorized network penetration testing, abuse threat intelligence endpoints, or reverse-engineer the heuristic threat model.
          </Text>

          <Text style={styles.sectionHeader}>4. Limitation of Liability</Text>
          <Text style={styles.bodyText}>
            In no event shall QRShield or its contributors be liable for any damages, phishing losses, or device compromise resulting from visiting external websites.
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
