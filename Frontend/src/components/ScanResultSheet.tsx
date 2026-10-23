import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { ScanAnalysis } from '../types/analysis';
import { Colors, Radius, Spacing, Shadows, Typography } from '../constants/theme';
import { RiskBadge } from './RiskBadge';
import { Toast } from './Toast';

interface ScanResultSheetProps {
  visible: boolean;
  analysis: ScanAnalysis | null;
  onDismiss: () => void;
  onViewDetails: (analysis: ScanAnalysis) => void;
}

export const ScanResultSheet: React.FC<ScanResultSheetProps> = ({
  visible,
  analysis,
  onDismiss,
  onViewDetails,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!visible || !analysis) {
    return null;
  }

  const isHighRisk = analysis.riskLevel === 'HIGH';
  const isMediumRisk = analysis.riskLevel === 'MEDIUM';
  const isLowRisk = analysis.riskLevel === 'LOW';

  const handleCopyUrl = async () => {
    const textToCopy = analysis.normalizedUrl || analysis.originalContent;
    if (textToCopy) {
      await Clipboard.setStringAsync(textToCopy);
      setToastMessage('URL copied to clipboard');
    }
  };

  const handleOpenAnyway = () => {
    const targetUrl = analysis.normalizedUrl || analysis.originalContent;

    // Security validation: verify scheme
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      Alert.alert(
        'Unsupported Link Scheme',
        'QRShield only allows opening verified web links (HTTP/HTTPS) to protect your device.'
      );
      return;
    }

    if (isHighRisk) {
      Alert.alert(
        '⚠️ Dangerous Link Warning',
        'QRShield flagged this link as HIGH RISK. Opening it may expose your device to phishing, account theft, or malware.\n\nAre you sure you want to proceed?',
        [
          { text: 'Cancel (Recommended)', style: 'cancel' },
          {
            text: 'I Understand, Open',
            style: 'destructive',
            onPress: () => {
              Linking.openURL(targetUrl).catch(() => {
                Alert.alert('Error', 'Unable to open this URL on your device.');
              });
            },
          },
        ]
      );
    } else {
      Linking.openURL(targetUrl).catch(() => {
        Alert.alert('Error', 'Unable to open this URL on your device.');
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropDismissArea}
          activeOpacity={1}
          onPress={onDismiss}
          accessibilityLabel="Dismiss scan result sheet"
        />

        <View style={styles.sheetContainer}>
          {/* Grab handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header: Risk Pill & Dismiss button */}
            <View style={styles.headerRow}>
              <RiskBadge
                riskLevel={analysis.riskLevel}
                score={analysis.riskScore}
                showScore={true}
                size="md"
              />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onDismiss}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Close scan result"
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Target URL Preview with Copy */}
            <View style={styles.urlCard}>
              <View style={styles.urlIconWrapper}>
                <Ionicons
                  name={isHighRisk ? 'warning-outline' : 'globe-outline'}
                  size={18}
                  color={isHighRisk ? Colors.riskHigh : Colors.primary}
                />
              </View>

              <View style={styles.urlTextContainer}>
                <Text style={styles.urlDomain} numberOfLines={1}>
                  {analysis.domain || 'Scanned Content'}
                </Text>
                <Text style={styles.urlFull} numberOfLines={2} ellipsizeMode="middle">
                  {analysis.normalizedUrl || analysis.originalContent}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyUrl}
                accessibilityRole="button"
                accessibilityLabel="Copy URL to clipboard"
              >
                <Ionicons name="copy-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Reasons / Key Indicators */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Assessment Summary</Text>
              <Text style={styles.summaryText}>{analysis.summary}</Text>

              {analysis.indicators.length > 0 && (
                <View style={styles.indicatorCallout}>
                  <Ionicons
                    name={isHighRisk ? 'alert-circle' : 'information-circle'}
                    size={16}
                    color={isHighRisk ? Colors.riskHighText : Colors.riskMediumText}
                    style={styles.indicatorCalloutIcon}
                  />
                  <Text
                    style={[
                      styles.indicatorCalloutText,
                      { color: isHighRisk ? Colors.riskHighText : Colors.riskMediumText },
                    ]}
                  >
                    {analysis.indicators[0].title}: {analysis.indicators[0].description}
                  </Text>
                </View>
              )}
            </View>

            {/* Clear Recommendation Banner */}
            <View
              style={[
                styles.recommendationBanner,
                isHighRisk && styles.recommendationHigh,
                isMediumRisk && styles.recommendationMedium,
                isLowRisk && styles.recommendationLow,
              ]}
            >
              <Ionicons
                name={
                  isHighRisk
                    ? 'shield-outline'
                    : isMediumRisk
                    ? 'warning-outline'
                    : 'shield-checkmark-outline'
                }
                size={18}
                color={
                  isHighRisk
                    ? Colors.riskHighText
                    : isMediumRisk
                    ? Colors.riskMediumText
                    : Colors.riskLowText
                }
              />
              <Text
                style={[
                  styles.recommendationText,
                  {
                    color: isHighRisk
                      ? Colors.riskHighText
                      : isMediumRisk
                      ? Colors.riskMediumText
                      : Colors.riskLowText,
                  },
                ]}
              >
                {analysis.recommendation}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {/* Primary Action: Don't open this link */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isHighRisk ? styles.primaryButtonDanger : styles.primaryButtonSafe,
                ]}
                onPress={onDismiss}
                accessibilityRole="button"
                accessibilityLabel="Do not open this link and return to scanner"
              >
                <Ionicons
                  name={isHighRisk ? 'close-circle' : 'scan-outline'}
                  size={19}
                  color={Colors.primaryContrast}
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>
                  {isHighRisk ? "Don't open this link" : 'Done / Scan another'}
                </Text>
              </TouchableOpacity>

              {/* View Details Action */}
              <TouchableOpacity
                style={styles.tertiaryButton}
                onPress={() => {
                  onDismiss();
                  onViewDetails(analysis);
                }}
                accessibilityRole="button"
                accessibilityLabel="View full security analysis details"
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={17}
                  color={Colors.primary}
                  style={styles.buttonIcon}
                />
                <Text style={styles.tertiaryButtonText}>View analysis details</Text>
              </TouchableOpacity>

              {/* Secondary Less Prominent Action: Open anyway */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleOpenAnyway}
                accessibilityRole="button"
                accessibilityLabel="Open destination anyway"
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    isHighRisk && styles.secondaryButtonTextDim,
                  ]}
                >
                  {isHighRisk ? 'Open anyway (not recommended)' : 'Open in browser'}
                </Text>
                <Ionicons
                  name="open-outline"
                  size={15}
                  color={isHighRisk ? Colors.textMuted : Colors.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Toast Notification */}
          <Toast
            visible={!!toastMessage}
            message={toastMessage || ''}
            onDismiss={() => setToastMessage(null)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 20, 24, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    maxHeight: '82%',
    ...Shadows.sheet,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // URL preview box
  urlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  urlIconWrapper: {
    marginRight: Spacing.sm,
  },
  urlTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  urlDomain: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  urlFull: {
    fontSize: 12,
    fontFamily: Typography.mono.fontFamily,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  copyButton: {
    padding: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  // Summary & indicators
  summaryContainer: {
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  indicatorCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  indicatorCalloutIcon: {
    marginRight: Spacing.xs,
    marginTop: 2,
  },
  indicatorCalloutText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  // Recommendation banner
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  recommendationHigh: {
    backgroundColor: Colors.riskHighBg,
    borderColor: Colors.riskHighBorder,
  },
  recommendationMedium: {
    backgroundColor: Colors.riskMediumBg,
    borderColor: Colors.riskMediumBorder,
  },
  recommendationLow: {
    backgroundColor: Colors.riskLowBg,
    borderColor: Colors.riskLowBorder,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  // Actions
  actionsContainer: {
    gap: Spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    ...Shadows.card,
  },
  primaryButtonDanger: {
    backgroundColor: Colors.riskHigh,
  },
  primaryButtonSafe: {
    backgroundColor: Colors.primary,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  primaryButtonText: {
    color: Colors.primaryContrast,
    fontSize: 15,
    fontWeight: '600',
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
  },
  tertiaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingVertical: Spacing.xs,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  secondaryButtonTextDim: {
    color: Colors.textMuted,
  },
});
