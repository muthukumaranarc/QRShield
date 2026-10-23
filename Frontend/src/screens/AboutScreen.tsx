import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { QRShieldLogo } from '../components/QRShieldLogo';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About QRShield</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}>
        {/* Brand Banner */}
        <View style={styles.heroSection}>
          <QRShieldLogo size={72} />
          <Text style={styles.brandTitle}>QRShield</Text>
          <Text style={styles.versionBadge}>Version 1.0.0 (Build 24)</Text>
          <Text style={styles.mottoText}>Stay Safe, Scan Smart.</Text>
        </View>

        {/* Mission Statement */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Our Mission</Text>
          <Text style={styles.bodyText}>
            QRShield protects users from malicious QR codes ("quishing"), phishing traps, and deceptive redirects. By evaluating structural parameters, domain reputation, and threat registries before a browser ever launches, QRShield ensures you never step onto a dangerous landing page blindly.
          </Text>
        </View>

        {/* Technical Capabilities */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Under the Hood</Text>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#16A34A" style={styles.featureIcon} />
            <Text style={styles.featureText}>Real-time heuristic threat model with multi-factor scoring</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="lock-closed-outline" size={18} color="#1A73E8" style={styles.featureIcon} />
            <Text style={styles.featureText}>Strict scheme enforcement blocking dangerous custom protocols</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="server-outline" size={18} color="#A855F7" style={styles.featureIcon} />
            <Text style={styles.featureText}>Spring Boot REST API integration architecture for enterprise feeds</Text>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.linksCard}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.linkRowText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Terms')}
          >
            <Text style={styles.linkRowText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.copyrightText}>© 2026 QRShield Security. All rights reserved.</Text>
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
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D4ED8',
    marginTop: 10,
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A73E8',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginTop: 6,
  },
  mottoText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.card,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  linksCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    ...Shadows.card,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  linkRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  copyrightText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
  },
});
