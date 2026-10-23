import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { QRShieldLogo } from './QRShieldLogo';

export const RadarShield: React.FC = () => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulseAnim = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createPulseAnim(pulse1, 0);
    const anim2 = createPulseAnim(pulse2, 800);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [pulse1, pulse2]);

  return (
    <View style={styles.container}>
      {/* Outer Pulse Ring 1 */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [
              {
                scale: pulse1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.2],
                }),
              },
            ],
            opacity: pulse1.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0.6, 0.2, 0],
            }),
          },
        ]}
      />

      {/* Pulse Ring 2 */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [
              {
                scale: pulse2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.8],
                }),
              },
            ],
            opacity: pulse2.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0.5, 0.15, 0],
            }),
          },
        ]}
      />

      {/* Static Inner Glow */}
      <View style={styles.centerGlow}>
        <QRShieldLogo size={76} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  centerGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});
