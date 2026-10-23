import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { QRShieldLogo } from '../components/QRShieldLogo';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const HelpSupportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // FAQ Accordion State
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Contact Modal State
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');

  // Report Issue Modal State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [reportType, setReportType] = useState('Phishing Link');
  const [reportDetails, setReportDetails] = useState('');

  const faqs = [
    {
      q: 'What is QRShield and how does it protect me?',
      a: 'QRShield inspects QR codes and web links before opening them in a browser. It extracts the destination URL and runs structural heuristics, domain reputation audits, and redirect checks to alert you to phishing or malware.',
    },
    {
      q: 'How is the Security Score calculated?',
      a: 'The Security Score (0 to 100) evaluates SSL certificate validity, domain registration age, known threat blacklist records, URL obfuscation techniques, and suspicious keywords.',
    },
    {
      q: 'Can attackers replace real QR codes with fake ones?',
      a: 'Yes, this is known as "quishing" (QR phishing). Attackers frequently paste fraudulent stickers over genuine restaurant menus, parking meters, or event posters. QRShield lets you preview the true landing URL before opening it.',
    },
    {
      q: 'Does QRShield upload my camera photos to the cloud?',
      a: 'No. Camera video frames and gallery photos are analyzed completely on your local device. We never store camera footage or browsing logs.',
    },
    {
      q: 'What should I do if a link is flagged as HIGH RISK?',
      a: 'We strongly advise not opening the link. If you believe the warning is a false alarm, you can tap "View Detailed Report" to inspect the individual check results.',
    },
  ];

  const handleSendContact = () => {
    if (!contactMessage.trim()) {
      Alert.alert('Required', 'Please enter your message.');
      return;
    }
    setContactModalVisible(false);
    setContactMessage('');
    Alert.alert('Message Sent', 'Thank you! Our support team will review your message and reply via email.');
  };

  const handleSubmitReport = () => {
    if (!reportUrl.trim()) {
      Alert.alert('Required', 'Please enter the suspicious URL.');
      return;
    }
    setReportModalVisible(false);
    setReportUrl('');
    setReportDetails('');
    Alert.alert('Threat Reported', 'Thank you for protecting the community! Our threat engine has received your report for verification.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 }]}>
        {/* Support Menu Items - Screen 18 */}
        <View style={styles.listCard}>
          <TouchableOpacity
            style={[styles.itemRow, styles.itemBorder]}
            onPress={() => setFaqModalVisible(true)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="help-circle-outline" size={18} color="#1A73E8" />
            </View>
            <Text style={styles.itemLabel}>Frequently Asked Questions (FAQs)</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.itemRow, styles.itemBorder]}
            onPress={() => setContactModalVisible(true)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={18} color="#1A73E8" />
            </View>
            <Text style={styles.itemLabel}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.itemRow, styles.itemBorder]}
            onPress={() => setReportModalVisible(true)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="flag-outline" size={18} color="#DC2626" />
            </View>
            <Text style={styles.itemLabel}>Report a Threat / False Positive</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.itemRow, styles.itemBorder]}
            onPress={() => navigation.navigate('Terms')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={18} color="#1A73E8" />
            </View>
            <Text style={styles.itemLabel}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#16A34A" />
            </View>
            <Text style={styles.itemLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Bottom Logo & Slogan - Screen 18 */}
        <View style={styles.bottomBrand}>
          <QRShieldLogo size={52} />
          <Text style={styles.brandName}>QRShield</Text>
          <Text style={styles.brandMotto}>Stay Safe, Scan Smart.</Text>
        </View>
      </ScrollView>

      {/* 1. FAQ Interactive Modal */}
      <Modal visible={faqModalVisible} animationType="slide">
        <View style={[styles.modalScreenContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setFaqModalVisible(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: Spacing.xl }}>
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.faqCard}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </View>
                  {isExpanded && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* 2. Contact Us Interactive Modal */}
      <Modal visible={contactModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Contact Support</Text>
              <TouchableOpacity onPress={() => setContactModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Subject</Text>
            <View style={styles.subjectRow}>
              {['General Inquiry', 'False Positive', 'Bug Report'].map(sub => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.subjectChip, contactSubject === sub && styles.subjectChipActive]}
                  onPress={() => setContactSubject(sub)}
                >
                  <Text style={[styles.subjectChipText, contactSubject === sub && styles.subjectChipTextActive]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Describe your issue or feedback..."
              placeholderTextColor="#94A3B8"
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.primaryActionBtn} onPress={handleSendContact}>
              <Text style={styles.primaryActionBtnText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mailAppBtn}
              onPress={() => Linking.openURL('mailto:support@qrshield.security?subject=QRShield Support Request')}
            >
              <Ionicons name="mail-outline" size={16} color="#1A73E8" style={{ marginRight: 6 }} />
              <Text style={styles.mailAppText}>Open in Mail App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Report Threat / Issue Modal */}
      <Modal visible={reportModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Report a Threat</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Suspicious URL / Domain</Text>
            <TextInput
              style={styles.singleInput}
              placeholder="https://example-phishing.com"
              placeholderTextColor="#94A3B8"
              value={reportUrl}
              onChangeText={setReportUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.fieldLabel}>Threat Type</Text>
            <View style={styles.subjectRow}>
              {['Phishing Link', 'Malware', 'Scam / Fraud'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.subjectChip, reportType === t && styles.subjectChipActiveDanger]}
                  onPress={() => setReportType(t)}
                >
                  <Text style={[styles.subjectChipText, reportType === t && styles.subjectChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.messageInput, { height: 70 }]}
              placeholder="e.g. Scanned from fake sticker on parking meter..."
              placeholderTextColor="#94A3B8"
              value={reportDetails}
              onChangeText={setReportDetails}
              multiline
            />

            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#DC2626' }]}
              onPress={handleSubmitReport}
            >
              <Text style={styles.primaryActionBtnText}>Submit Threat Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  listCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 40,
    ...Shadows.card,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 15,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  bottomBrand: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D4ED8',
    marginTop: 8,
  },
  brandMotto: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  // FAQ Modal
  modalScreenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    ...Shadows.card,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  // Dialog Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.sheet,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 6,
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectChipActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  subjectChipActiveDanger: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  subjectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  singleInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 10,
  },
  messageInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    height: 90,
    fontSize: 13,
    color: '#1E293B',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  primaryActionBtn: {
    height: 46,
    borderRadius: Radius.lg,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mailAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  mailAppText: {
    fontSize: 13,
    color: '#1A73E8',
    fontWeight: '600',
  },
});
