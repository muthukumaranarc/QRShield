import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface QRShieldLogoProps {
  size?: number;
  color?: string;
  badgeOnly?: boolean;
}

export const QRShieldLogo: React.FC<QRShieldLogoProps> = ({
  size = 64,
  color = '#1A73E8',
}) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>
          <LinearGradient id="innerShield" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#1E40AF" />
          </LinearGradient>
        </Defs>

        {/* Outer Shield Outline */}
        <Path
          d="M50 8L16 22V50C16 71.5 30.5 91.2 50 96C69.5 91.2 84 71.5 84 50V22L50 8Z"
          fill="url(#shieldGrad)"
        />

        {/* Inner Shield Body */}
        <Path
          d="M50 15L23 26V50C23 67.5 34.5 83.5 50 88C65.5 83.5 77 67.5 77 50V26L50 15Z"
          fill="url(#innerShield)"
        />

        {/* Crisp Checkmark */}
        <Path
          d="M42 58.5L32.5 49L28 53.5L42 67.5L72 37.5L67.5 33L42 58.5Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
};
