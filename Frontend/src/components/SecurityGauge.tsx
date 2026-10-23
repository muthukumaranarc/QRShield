import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface SecurityGaugeProps {
  score: number;
  grade?: string;
  isDanger?: boolean;
}

export const SecurityGauge: React.FC<SecurityGaugeProps> = ({
  score,
  grade = score >= 80 ? 'Grade: A' : score >= 50 ? 'Grade: C' : 'Poor',
  isDanger = score < 60,
}) => {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // Semicircle arc: 180 degrees from Math.PI to 0
  // Background track path
  const bgPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  // Clamped angle for current score: 0 to 100 maps to 0 to Math.PI
  const clampedScore = Math.max(0, Math.min(100, score));
  const angle = Math.PI * (clampedScore / 100);
  const endX = cx - radius * Math.cos(angle);
  const endY = cy - radius * Math.sin(angle);
  const largeArcFlag = 0;
  const fillPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  const primaryColor = isDanger ? '#DC2626' : '#16A34A';
  const trackColor = isDanger ? '#FEE2E2' : '#DCFCE7';

  return (
    <View style={styles.container}>
      <Svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.7}`}>
        {/* Track */}
        <Path
          d={bgPath}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />

        {/* Value Arc */}
        {score > 0 && (
          <Path
            d={fillPath}
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Svg>

      <View style={styles.contentOverlay}>
        <Text style={styles.title}>Security Score</Text>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreValue, { color: primaryColor }]}>{score}</Text>
          <Text style={styles.denom}>/100</Text>
        </View>
        <Text style={[styles.grade, { color: primaryColor }]}>{grade}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  contentOverlay: {
    position: 'absolute',
    top: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  denom: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 2,
  },
  grade: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
