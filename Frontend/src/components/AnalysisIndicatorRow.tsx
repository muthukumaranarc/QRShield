import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnalysisIndicator } from '../types/analysis';
import { Colors, Radius, Spacing } from '../constants/theme';

interface AnalysisIndicatorRowProps {
  indicator: AnalysisIndicator;
}

export const AnalysisIndicatorRow: React.FC<AnalysisIndicatorRowProps> = ({ indicator }) => {
  const getSeverityStyle = () => {
    switch (indicator.severity) {
      case 'HIGH':
        return {
          icon: 'alert-circle' as const,
          color: Colors.riskHighText,
          bg: Colors.riskHighBg,
          border: Colors.riskHighBorder,
          badgeText: 'HIGH',
        };
      case 'MEDIUM':
        return {
          icon: 'warning' as const,
          color: Colors.riskMediumText,
          bg: Colors.riskMediumBg,
          border: Colors.riskMediumBorder,
          badgeText: 'MEDIUM',
        };
      case 'LOW':
        return {
          icon: 'shield-checkmark' as const,
          color: Colors.riskLowText,
          bg: Colors.riskLowBg,
          border: Colors.riskLowBorder,
          badgeText: 'LOW',
        };
      case 'INFO':
      default:
        return {
          icon: 'information-circle' as const,
          color: Colors.primary,
          bg: Colors.primaryLight,
          border: Colors.border,
          badgeText: 'INFO',
        };
    }
  };

  const styleConfig = getSeverityStyle();

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: styleConfig.bg }]}>
        <Ionicons name={styleConfig.icon} size={20} color={styleConfig.color} />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {indicator.title}
          </Text>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: styleConfig.bg, borderColor: styleConfig.border },
            ]}
          >
            <Text style={[styles.severityBadgeText, { color: styleConfig.color }]}>
              {styleConfig.badgeText}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{indicator.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.xs,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
