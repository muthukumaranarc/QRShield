import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

export const TrendLineChart: React.FC = () => {
  const width = 300;
  const height = 90;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Smooth bezier curve points:
  // Points (x, y): (10, 70), (55, 60), (100, 75), (145, 45), (190, 50), (240, 20), (290, 15)
  const linePath = 'M 10 70 C 40 70, 50 60, 60 60 C 80 60, 90 75, 105 75 C 130 75, 140 45, 155 45 C 175 45, 185 50, 200 50 C 225 50, 235 22, 250 20 C 270 18, 280 15, 290 15';
  const areaPath = `${linePath} L 290 85 L 10 85 Z`;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Gradient Fill under curve */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Blue Line */}
        <Path d={linePath} stroke="#2563EB" strokeWidth={3} fill="none" strokeLinecap="round" />

        {/* Highlight Peak Dot */}
        <Circle cx={290} cy={15} r={4.5} fill="#2563EB" stroke="#FFFFFF" strokeWidth={2} />
      </Svg>

      <View style={styles.daysRow}>
        {days.map((day, idx) => (
          <Text key={idx} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 290,
    marginTop: 6,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
});
