import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScanAnalysis } from '../types/analysis';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { RiskBadge } from './RiskBadge';

interface HistoryItemProps {
  item: ScanAnalysis;
  onPress: () => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onPress }) => {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Scan record for ${item.domain || item.originalContent}, risk level ${item.riskLevel}`}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.domainText} numberOfLines={1}>
            {item.domain || 'Direct Text / Payload'}
          </Text>
          <Text style={styles.timeText}>{formatTime(item.analyzedAt)}</Text>
        </View>

        <Text style={styles.urlText} numberOfLines={1}>
          {item.normalizedUrl || item.originalContent}
        </Text>

        <View style={styles.bottomRow}>
          <RiskBadge riskLevel={item.riskLevel} score={item.riskScore} size="sm" showScore={true} />
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  domainText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  urlText: {
    fontSize: 12,
    fontFamily: Typography.mono.fontFamily,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
