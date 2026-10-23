import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NotificationService, AppNotification } from '../services/notificationService';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const NotificationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    NotificationService.getNotifications().then(setNotifications);
  }, []);

  const handleMarkAllRead = async () => {
    const updated = await NotificationService.markAllAsRead();
    setNotifications(updated);
  };

  const handleClearAll = () => {
    Alert.alert('Clear Notifications', 'Are you sure you want to clear all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await NotificationService.clearNotifications();
          setNotifications([]);
        },
      },
    ]);
  };

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'warning':
        return { name: 'warning' as const, color: '#DC2626', bg: '#FEE2E2' };
      case 'success':
        return { name: 'shield-checkmark' as const, color: '#16A34A', bg: '#DCFCE7' };
      case 'info':
      default:
        return { name: 'information-circle' as const, color: '#1A73E8', bg: '#EFF6FF' };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        renderItem={({ item }) => {
          const iconConfig = getIconConfig(item.type);
          return (
            <View style={[styles.card, !item.read && styles.cardUnread]}>
              <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
                <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardTime}>{item.time}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={54} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up with security alerts.</Text>
          </View>
        }
        ListFooterComponent={
          notifications.length > 0 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
              <Text style={styles.clearBtnText}>Clear All Notifications</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  markReadText: {
    fontSize: 13,
    color: '#1A73E8',
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.xl,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  cardUnread: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FAFCFF',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A73E8',
  },
  cardMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  clearBtn: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
