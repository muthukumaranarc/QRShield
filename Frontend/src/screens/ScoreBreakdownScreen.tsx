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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { SecurityGauge } from '../components/SecurityGauge';
import { Radius, Spacing, Shadows } from '../constants/theme';

type RouteProps = RouteProp<RootStackParamList, 'ScoreBreakdown'>;

export const ScoreBreakdownScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const score = route.params?.score ?? 92;

  const factors = [
    { title: 'Safe Domains Verified', points: '+50 pts', desc: 'Destinations with clean threat registry records', positive: true },
    { title: 'SSL / TLS Enforcement', points: '+20 pts', desc: 'Secure HTTPS connections verified', positive: true },
    { title: 'Zero Malware Hits', points: '+22 pts', desc: 'No trojans or exploit payloads detected', positive: true },
    { title: 'Shortened / Obfuscated Link Encounter', points: '-8 pts', desc: 'Encountered link with hidden destination', positive: false },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Score Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}>
        {/* Gauge */}
        <View style={styles.gaugeCard}>
          <SecurityGauge score={score} grade="Grade: A (Excellent)" isDanger={score < 60} />
          <Text style={styles.gaugeDesc}>
            Your security score reflects how safely you browse and the risk level of scanned QR codes.
          </Text>
        </View>

        {/* Score Breakdown Section */}
        <Text style={styles.sectionTitle}>Score Calculation Factors</Text>
        <View style={styles.card}>
          {factors.map((f, idx) => (
            <View key={idx} style={[styles.factorRow, idx !== factors.length - 1 && styles.factorBorder]}>
              <View style={[styles.factorIcon, { backgroundColor: f.positive ? '#DCFCE7' : '#FEE2E2' }]}>
                <Ionicons
                  name={f.positive ? 'checkmark' : 'close'}
                  size={16}
                  color={f.positive ? '#16A34A' : '#DC2626'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.factorTitle}>{f.title}</Text>
                <Text style={styles.factorDesc}>{f.desc}</Text>
              </View>
              <Text style={[styles.pointsText, { color: f.positive ? '#16A34A' : '#DC2626' }]}>
                {f.points}
              </Text>
            </View>
          ))}
        </View>

        {/* Actionable Tips */}
        <Text style={styles.sectionTitle}>How to Improve</Text>
        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={18} color="#D97706" style={{ marginRight: 10 }} />
            <Text style={styles.tipText}>
              Avoid scanning unverified public sticker QR codes without checking the destination preview.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="shield-outline" size={18} color="#1A73E8" style={{ marginRight: 10 }} />
            <Text style={styles.tipText}>
              Keep threat definition updates enabled to detect zero-day phishing schemes.
            </Text>
          </View>
        </View>

        {/* Done Button */}
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
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
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    ...Shadows.card,
  },
  gaugeDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    paddingHorizontal: Spacing.lg,
    ...Shadows.card,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  factorBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  factorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  factorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  factorDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 24,
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  doneBtn: {
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
