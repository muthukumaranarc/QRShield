import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '../types/analysis';
import { Colors, Radius, Spacing } from '../constants/theme';

interface RiskScoreProps {
  score: number | null;
  riskLevel: RiskLevel;
  size?: 'md' | 'lg';
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  riskLevel,
  size = 'md',
}) => {
  const getColor = () => {
    switch (riskLevel) {
      case 'HIGH':
        return { text: Colors.riskHighText, bg: Colors.riskHighBg, border: Colors.riskHigh };
      case 'MEDIUM':
        return { text: Colors.riskMediumText, bg: Colors.riskMediumBg, border: Colors.riskMedium };
      case 'LOW':
        return { text: Colors.riskLowText, bg: Colors.riskLowBg, border: Colors.riskLow };
      default:
        return { text: Colors.riskUnknownText, bg: Colors.riskUnknownBg, border: Colors.riskUnknown };
    }
  };

  const color = getColor();
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.container,
        isLarge ? styles.containerLg : styles.containerMd,
        { backgroundColor: color.bg, borderColor: color.border },
      ]}
      accessibilityRole="text"
      accessibilityLabel={score !== null ? `Risk score ${score} out of 100` : 'Risk score not available'}
    >
      <Text style={[styles.scoreText, isLarge && styles.scoreTextLg, { color: color.text }]}>
        {score !== null ? score : '—'}
      </Text>
      <Text style={[styles.denomText, isLarge && styles.denomTextLg, { color: color.text }]}>
        /100
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  containerMd: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  containerLg: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  scoreTextLg: {
    fontSize: 22,
  },
  denomText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
    marginLeft: 2,
  },
  denomTextLg: {
    fontSize: 13,
  },
});
