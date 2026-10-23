import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RiskLevel } from '../types/analysis';
import { Colors, Radius, Spacing } from '../constants/theme';

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  score?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  riskLevel,
  score,
  size = 'md',
  showScore = false,
}) => {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          icon: 'alert-circle' as const,
          bg: Colors.riskHighBg,
          text: Colors.riskHighText,
          border: Colors.riskHighBorder,
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM RISK',
          icon: 'warning' as const,
          bg: Colors.riskMediumBg,
          text: Colors.riskMediumText,
          border: Colors.riskMediumBorder,
        };
      case 'LOW':
        return {
          label: 'LOW RISK',
          icon: 'shield-checkmark' as const,
          bg: Colors.riskLowBg,
          text: Colors.riskLowText,
          border: Colors.riskLowBorder,
        };
      case 'UNKNOWN':
      default:
        return {
          label: 'NOT VERIFIED',
          icon: 'help-circle' as const,
          bg: Colors.riskUnknownBg,
          text: Colors.riskUnknownText,
          border: Colors.riskUnknownBorder,
        };
    }
  };

  const config = getRiskConfig();

  const iconSizes = { sm: 12, md: 15, lg: 18 };
  const fontSizes = { sm: 11, md: 13, lg: 14 };
  const paddings = {
    sm: { paddingHorizontal: 6, paddingVertical: 2 },
    md: { paddingHorizontal: 10, paddingVertical: 4 },
    lg: { paddingHorizontal: 14, paddingVertical: 6 },
  };

  const displayText =
    showScore && typeof score === 'number'
      ? `${config.label} · Risk: ${score}/100`
      : config.label;

  return (
    <View
      style={[
        styles.badge,
        paddings[size],
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Security evaluation: ${displayText}`}
    >
      <Ionicons
        name={config.icon}
        size={iconSizes[size]}
        color={config.text}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: config.text, fontSize: fontSizes[size] }]}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
