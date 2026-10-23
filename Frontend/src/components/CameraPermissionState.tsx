import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Shadows, Typography } from '../constants/theme';

interface CameraPermissionStateProps {
  onRequestPermission: () => void;
  canAskAgain?: boolean;
}

export const CameraPermissionState: React.FC<CameraPermissionStateProps> = ({
  onRequestPermission,
  canAskAgain = true,
}) => {
  const handleOpenSettings = () => {
    Linking.openSettings().catch(() => {
      // Fallback
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="camera-reverse-outline" size={38} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Camera Access Needed</Text>

        <Text style={styles.description}>
          QRShield inspects QR code destinations directly in real-time. Camera access is required to scan QR codes on your device.
        </Text>

        <View style={styles.buttonContainer}>
          {canAskAgain ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRequestPermission}
              accessibilityRole="button"
              accessibilityLabel="Allow camera access"
            >
              <Ionicons name="camera-outline" size={18} color={Colors.primaryContrast} style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleOpenSettings}
              accessibilityRole="button"
              accessibilityLabel="Open system settings to enable camera"
            >
              <Ionicons name="settings-outline" size={18} color={Colors.primaryContrast} style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>Open Device Settings</Text>
            </TouchableOpacity>
          )}

          {canAskAgain && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleOpenSettings}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <Text style={styles.secondaryButtonText}>Open System Settings</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cameraOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...Shadows.card,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.subtext,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
  },
  btnIcon: {
    marginRight: Spacing.xs,
  },
  primaryButtonText: {
    color: Colors.primaryContrast,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
