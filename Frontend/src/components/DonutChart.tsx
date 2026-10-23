import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface DonutSlice {
  label: string;
  count: number;
  color: string;
}

interface DonutChartProps {
  safe?: number;
  suspicious?: number;
  dangerous?: number;
  unknown?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  safe = 96,
  suspicious = 18,
  dangerous = 6,
  unknown = 4,
}) => {
  const data: DonutSlice[] = [
    { label: 'Safe', count: Math.max(safe, 0), color: '#16A34A' },
    { label: 'Suspicious', count: Math.max(suspicious, 0), color: '#F59E0B' },
    { label: 'Malicious', count: Math.max(dangerous, 0), color: '#DC2626' },
    { label: 'Unknown', count: Math.max(unknown, 0), color: '#64748B' },
  ];

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const size = 110;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <View style={styles.container}>
      {/* SVG Donut Circle */}
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {data.map((item, index) => {
              const strokeDashoffset = circumference - (item.count / total) * circumference;
              const rotationAngle = accumulatedPercent * 360;
              accumulatedPercent += item.count / total;

              return (
                <Circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  transform={`rotate(${rotationAngle}, ${size / 2}, ${size / 2})`}
                />
              );
            })}
          </G>
        </Svg>
      </View>

      {/* Legend Column */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendCount}>{item.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 24,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  legendCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
});
