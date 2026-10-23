import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Shadows } from '../constants/theme';

interface StatCardProps {
  label: string;
  value: number;
  iconName: keyof typeof Ionicons.glyphMap;
  variant: 'total' | 'high' | 'medium' | 'low';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  iconName,
  variant,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'high':
        return {
          bg: Colors.riskHighBg,
          text: Colors.riskHighText,
          iconColor: Colors.riskHigh,
        };
      case 'medium':
        return {
          bg: Colors.riskMediumBg,
          text: Colors.riskMediumText,
          iconColor: Colors.riskMedium,
        };
      case 'low':
        return {
          bg: Colors.riskLowBg,
          text: Colors.riskLowText,
          iconColor: Colors.riskLow,
        };
      case 'total':
      default:
        return {
          bg: Colors.primaryLight,
          text: Colors.primary,
          iconColor: Colors.primary,
        };
    }
  };

  const styleConfig = getVariantStyles();

  return (
    <View style={styles.card} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
      <View style={[styles.iconContainer, { backgroundColor: styleConfig.bg }]}>
        <Ionicons name={iconName} size={18} color={styleConfig.iconColor} />
      </View>
      <Text style={[styles.value, { color: styleConfig.text }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
