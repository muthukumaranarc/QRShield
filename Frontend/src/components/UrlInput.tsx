import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface UrlInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  errorMessage?: string | null;
  placeholder?: string;
  autoFocus?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChangeText,
  onClear,
  errorMessage,
  placeholder = 'https://example.com',
  autoFocus = false,
}) => {
  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        onChangeText(text.trim());
      }
    } catch {
      // Ignore clipboard read error
    }
  };

  const hasError = !!errorMessage;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
        ]}
      >
        <Ionicons
          name="link-outline"
          size={20}
          color={hasError ? Colors.riskHigh : Colors.textSecondary}
          style={styles.prefixIcon}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          returnKeyType="done"
          accessibilityLabel="Enter web address to analyze"
        />

        {value.length > 0 ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Clear URL input"
          >
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.pasteButton}
            onPress={handlePaste}
            accessibilityRole="button"
            accessibilityLabel="Paste URL from clipboard"
          >
            <Ionicons name="clipboard-outline" size={15} color={Colors.primary} />
            <Text style={styles.pasteButtonText}>Paste</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasError && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={Colors.riskHighText} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputContainerError: {
    borderColor: Colors.riskHigh,
    backgroundColor: Colors.riskHighBg,
  },
  prefixIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: Colors.text,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  pasteButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  errorText: {
    color: Colors.riskHighText,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
