import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeContext';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const ThemeSelectionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { mode, setMode } = useAppTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Light Mode Card - Screen 17 */}
        <TouchableOpacity
          style={[styles.themeCard, mode === 'light' && styles.themeCardActive]}
          onPress={() => setMode('light')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="sunny-outline" size={20} color="#1A73E8" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Light Mode</Text>
            </View>
            <Ionicons
              name={mode === 'light' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={mode === 'light' ? '#1A73E8' : '#CBD5E1'}
            />
          </View>

          {/* Mini Light Preview */}
          <View style={styles.previewBoxLight}>
            <View style={styles.miniHeaderLight} />
            <View style={styles.miniCardLight} />
            <View style={styles.miniCardLight} />
          </View>
        </TouchableOpacity>

        {/* Dark Mode Card - Screen 17 */}
        <TouchableOpacity
          style={[styles.themeCard, mode === 'dark' && styles.themeCardActive]}
          onPress={() => setMode('dark')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="moon-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Dark Mode</Text>
            </View>
            <Ionicons
              name={mode === 'dark' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={mode === 'dark' ? '#3B82F6' : '#CBD5E1'}
            />
          </View>

          {/* Mini Dark Preview */}
          <View style={styles.previewBoxDark}>
            <View style={styles.miniHeaderDark} />
            <View style={styles.miniCardDark} />
            <View style={styles.miniCardDark} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    padding: Spacing.xl,
    gap: 16,
  },
  themeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  themeCardActive: {
    borderColor: '#1A73E8',
    backgroundColor: '#F8FAFF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  previewBoxLight: {
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.lg,
    padding: 10,
    gap: 6,
  },
  miniHeaderLight: {
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    width: '40%',
  },
  miniCardLight: {
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  previewBoxDark: {
    backgroundColor: '#0F172A',
    borderRadius: Radius.lg,
    padding: 10,
    gap: 6,
  },
  miniHeaderDark: {
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    width: '40%',
  },
  miniCardDark: {
    height: 28,
    backgroundColor: '#1E293B',
    borderRadius: 6,
  },
});
