import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppLanguage } from '../context/LanguageContext';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const LanguageSelectionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { language, setLanguage } = useAppLanguage();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {/* English Option */}
          <TouchableOpacity
            style={[styles.langOption, styles.optionBorder]}
            onPress={() => setLanguage('en')}
          >
            <View style={styles.langLeft}>
              <Text style={styles.flag}>🇬🇧</Text>
              <Text style={styles.langText}>English</Text>
            </View>
            <Ionicons
              name={language === 'en' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={language === 'en' ? '#1A73E8' : '#CBD5E1'}
            />
          </TouchableOpacity>

          {/* Tamil Option */}
          <TouchableOpacity
            style={styles.langOption}
            onPress={() => setLanguage('ta')}
          >
            <View style={styles.langLeft}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.langText}>தமிழ் (Tamil)</Text>
            </View>
            <Ionicons
              name={language === 'ta' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={language === 'ta' ? '#1A73E8' : '#CBD5E1'}
            />
          </TouchableOpacity>
        </View>
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  langText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
});
