import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { Colors, Radius, Spacing, Shadows } from '../constants/theme';

interface AccountMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AccountMenuModal: React.FC<AccountMenuModalProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  if (!visible) return null;

  const handleAction = (action: () => void) => {
    onClose();
    setTimeout(() => {
      action();
    }, 150);
  };

  const menuItems = [
    {
      label: 'View Profile',
      icon: 'person-outline' as const,
      onPress: () => navigation.navigate('Profile'),
    },
    {
      label: 'History',
      icon: 'time-outline' as const,
      onPress: () => navigation.navigate('MainTabs', { screen: 'History' } as any),
    },
    {
      label: 'Theme',
      icon: 'color-palette-outline' as const,
      onPress: () => navigation.navigate('ThemeSelection'),
    },
    {
      label: 'Language',
      icon: 'globe-outline' as const,
      onPress: () => navigation.navigate('LanguageSelection'),
    },
    {
      label: 'Blocked Accounts',
      icon: 'ban-outline' as const,
      onPress: () => navigation.navigate('BlockedAccounts'),
    },
    {
      label: 'Settings',
      icon: 'settings-outline' as const,
      onPress: () => navigation.navigate('Settings'),
    },
    {
      label: 'Help & Support',
      icon: 'help-circle-outline' as const,
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      label: 'Log Out',
      icon: 'log-out-outline' as const,
      color: Colors.riskHigh,
      onPress: () => logout(),
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleAction(item.onPress)}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={item.color || Colors.textSecondary}
                style={styles.icon}
              />
              <Text style={[styles.menuText, item.color ? { color: item.color } : null]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  menuContainer: {
    position: 'absolute',
    top: 56,
    right: Spacing.xl,
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.floating,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
  },
  menuItemLast: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
    paddingTop: 10,
  },
  icon: {
    marginRight: Spacing.md,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
});
