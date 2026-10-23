import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing security indicators...',
  submessage = 'Verifying domain reputation, redirect path, and threat registries',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {submessage ? <Text style={styles.submessage}>{submessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xl,
  },
  spinnerWrapper: {
    marginBottom: Spacing.lg,
  },
  message: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  submessage: {
    ...Typography.subtext,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 18,
  },
});
