import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppTheme } from '../context/ThemeContext';
import { useAppLanguage } from '../context/LanguageContext';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { mode } = useAppTheme();
  const { language } = useAppLanguage();

  const settingsList = [
    {
      label: 'Account & Profile',
      icon: 'person-outline' as const,
      onPress: () => navigation.navigate('Profile'),
    },
    {
      label: 'Language',
      value: language === 'en' ? 'English' : 'தமிழ்',
      icon: 'globe-outline' as const,
      onPress: () => navigation.navigate('LanguageSelection'),
    },
    {
      label: 'Theme',
      value: mode === 'light' ? 'Light' : 'Dark',
      icon: 'color-palette-outline' as const,
      onPress: () => navigation.navigate('ThemeSelection'),
    },
    {
      label: 'Privacy & Security',
      icon: 'shield-outline' as const,
      onPress: () => navigation.navigate('PrivacySecurity'),
    },
    {
      label: 'Blocked Accounts',
      icon: 'ban-outline' as const,
      onPress: () => navigation.navigate('BlockedAccounts'),
    },
    {
      label: 'Scan History',
      icon: 'time-outline' as const,
      onPress: () => navigation.navigate('MainTabs', { screen: 'History' }),
    },
    {
      label: 'Notifications',
      icon: 'notifications-outline' as const,
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      label: 'Help & Support',
      icon: 'help-circle-outline' as const,
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      label: 'About QRShield',
      icon: 'information-circle-outline' as const,
      onPress: () => navigation.navigate('About'),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 }]}>
        <View style={styles.listCard}>
          {settingsList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.itemRow,
                index !== settingsList.length - 1 && styles.itemBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={18} color="#1A73E8" />
              </View>

              <Text style={styles.itemLabel}>{item.label}</Text>

              {item.value && <Text style={styles.itemValue}>{item.value}</Text>}

              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
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
  scrollContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  listCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  itemValue: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 24,
  },
});
