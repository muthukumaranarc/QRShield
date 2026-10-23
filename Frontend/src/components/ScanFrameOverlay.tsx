import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

interface ScanFrameOverlayProps {
  isScanning: boolean;
  instructionText?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_SIZE = Math.min(SCREEN_WIDTH * 0.72, 280);
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

export const ScanFrameOverlay: React.FC<ScanFrameOverlayProps> = ({
  isScanning,
  instructionText = 'Align a QR code inside the frame',
}) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isScanning) {
      scanLineAnim.setValue(0);
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: FRAME_SIZE - 8,
            duration: 2200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      scanLineAnim.setValue(FRAME_SIZE / 2);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isScanning, scanLineAnim]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Semi-transparent scrim mask */}
      <View style={styles.topMask} />
      <View style={styles.centerRow}>
        <View style={styles.sideMask} />

        {/* The Viewfinder Box */}
        <View style={[styles.viewfinder, { width: FRAME_SIZE, height: FRAME_SIZE }]}>
          {/* 4 Corner Brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Animated Scanning Line */}
          {isScanning && (
            <Animated.View
              style={[
                styles.scanLineContainer,
                {
                  transform: [{ translateY: scanLineAnim }],
                },
              ]}
            >
              <View style={styles.scanLineGlow} />
              <View style={styles.scanLineCore} />
            </Animated.View>
          )}
        </View>

        <View style={styles.sideMask} />
      </View>

      <View style={styles.bottomMask}>
        {/* Instruction badge under the frame */}
        <View style={styles.instructionBadge}>
          <Text style={styles.instructionText}>{instructionText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topMask: {
    flex: 1,
    backgroundColor: Colors.cameraScrim,
  },
  centerRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  sideMask: {
    flex: 1,
    backgroundColor: Colors.cameraScrim,
  },
  bottomMask: {
    flex: 1.25,
    backgroundColor: Colors.cameraScrim,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  viewfinder: {
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderRadius: Radius.lg,
  },
  // Corners
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: Radius.md,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: Radius.md,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: Radius.md,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: Radius.md,
  },
  // Scan Line
  scanLineContainer: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    height: 16,
    justifyContent: 'center',
  },
  scanLineGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(26, 115, 232, 0.25)',
    borderRadius: Radius.full,
  },
  scanLineCore: {
    height: 2.5,
    backgroundColor: '#60A5FA',
    borderRadius: Radius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  instructionBadge: {
    backgroundColor: 'rgba(28, 34, 40, 0.88)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  instructionText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
