import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { QRShieldLogo } from '../components/QRShieldLogo';
import { Colors } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Login');
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <QRShieldLogo size={96} />
        <Text style={styles.brandTitle}>QRShield</Text>
        <Text style={styles.tagline}>Scan  ·  Check  ·  Stay Safe</Text>
      </View>

      {/* Decorative Wave Graphic at Bottom */}
      <View style={styles.waveContainer}>
        <Svg width={SCREEN_WIDTH} height={120} viewBox={`0 0 ${SCREEN_WIDTH} 120`} fill="none">
          <Path
            d={`M 0 60 Q ${SCREEN_WIDTH * 0.25} 10, ${SCREEN_WIDTH * 0.5} 50 T ${SCREEN_WIDTH} 30 L ${SCREEN_WIDTH} 120 L 0 120 Z`}
            fill="#EFF6FF"
          />
          <Path
            d={`M 0 80 Q ${SCREEN_WIDTH * 0.3} 35, ${SCREEN_WIDTH * 0.6} 70 T ${SCREEN_WIDTH} 55 L ${SCREEN_WIDTH} 120 L 0 120 Z`}
            fill="#DBEAFE"
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
    marginTop: 16,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
