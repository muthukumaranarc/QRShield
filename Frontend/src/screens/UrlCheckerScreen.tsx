import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { RootStackParamList } from '../types/navigation';
import { parseAndValidatePayload } from '../utils/urlValidation';
import { Radius, Spacing, Shadows } from '../constants/theme';

type RouteProps = RouteProp<RootStackParamList, 'UrlChecker'>;

export const UrlCheckerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProps>();

  const [inputUrl, setInputUrl] = useState(route.params?.initialUrl || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a link to check.');
      return;
    }

    const parsed = parseAndValidatePayload(trimmed);
    if (!parsed.isValidWebUrl) {
      setErrorMessage(parsed.errorMessage || 'Invalid web link format.');
      return;
    }

    setErrorMessage(null);
    navigation.navigate('Analyzing', { targetUrl: parsed.normalizedUrl || trimmed, source: 'LINK' });
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setInputUrl(text.trim());
        setErrorMessage(null);
      }
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
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

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Text style={styles.title}>Check Link</Text>
        <Text style={styles.subtitle}>Paste a URL to check its safety.</Text>

        {/* Input Box */}
        <View style={styles.inputCard}>
          <View style={[styles.inputRow, errorMessage ? styles.inputRowError : null]}>
            <Ionicons name="link-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              placeholder="https://example.com"
              placeholderTextColor="#94A3B8"
              value={inputUrl}
              onChangeText={text => {
                setInputUrl(text);
                if (errorMessage) setErrorMessage(null);
              }}
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={handleAnalyze}
            />
            {inputUrl.length > 0 ? (
              <TouchableOpacity onPress={() => setInputUrl('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handlePaste} style={styles.pasteBadge}>
                <Text style={styles.pasteText}>Paste</Text>
              </TouchableOpacity>
            )}
          </View>

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {/* Analyze Link Button */}
          <TouchableOpacity
            style={[styles.analyzeBtn, !inputUrl.trim() && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={!inputUrl.trim()}
          >
            <Text style={styles.analyzeBtnText}>Analyze Link</Text>
          </TouchableOpacity>
        </View>

        {/* OR Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Scan QR Code Button */}
        <TouchableOpacity
          style={styles.scanQrBtn}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Ionicons name="qr-code-outline" size={18} color="#1A73E8" style={{ marginRight: 8 }} />
          <Text style={styles.scanQrBtnText}>Scan QR Code</Text>
        </TouchableOpacity>

        {/* Quick test chips */}
        <View style={styles.presetsRow}>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setInputUrl('https://example.com')}
          >
            <Text style={styles.presetChipText}>Safe (example.com)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setInputUrl('https://phishing-site.net/verify')}
          >
            <Text style={styles.presetChipText}>Suspicious (phishing-site.net)</Text>
          </TouchableOpacity>
        </View>

        {/* Security Footnote */}
        <View style={styles.footnoteRow}>
          <View style={styles.shieldIconWrapper}>
            <Ionicons name="shield-checkmark" size={18} color="#1A73E8" />
          </View>
          <Text style={styles.footnoteText}>
            We check for phishing, malware, and other online threats.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 24,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: 14,
  },
  inputRowError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  pasteBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  pasteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A73E8',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  analyzeBtn: {
    backgroundColor: '#1A73E8',
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  analyzeBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  scanQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#1A73E8',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    ...Shadows.card,
  },
  scanQrBtnText: {
    color: '#1A73E8',
    fontSize: 14,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    justifyContent: 'center',
  },
  presetChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A73E8',
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shieldIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  footnoteText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
});
