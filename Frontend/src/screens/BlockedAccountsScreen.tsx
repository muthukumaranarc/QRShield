import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlockedDomainsService, BlockedDomainItem } from '../services/blockedDomainsService';
import { Radius, Spacing, Shadows } from '../constants/theme';

export const BlockedAccountsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [blockedList, setBlockedList] = useState<BlockedDomainItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [domainToBlock, setDomainToBlock] = useState('');
  const [reasonToBlock, setReasonToBlock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadBlocked = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await BlockedDomainsService.getBlockedDomains();
      setBlockedList(list);
    } catch {
      // offline
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlocked();
  }, [loadBlocked]);

  const handleAddBlock = async () => {
    if (!domainToBlock.trim()) return;
    const added = await BlockedDomainsService.blockDomain(
      domainToBlock.trim(),
      reasonToBlock.trim() || 'Blocked by user'
    );
    setBlockedList(prev => [added, ...prev.filter(b => b.id !== added.id && b.domain !== added.domain)]);
    setDomainToBlock('');
    setReasonToBlock('');
    setModalVisible(false);
  };

  const handleUnblock = (item: BlockedDomainItem) => {
    Alert.alert('Unblock Domain', `Are you sure you want to unblock ${item.domain}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        style: 'destructive',
        onPress: async () => {
          await BlockedDomainsService.unblockDomain(item.id);
          setBlockedList(prev => prev.filter(d => d.id !== item.id));
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Accounts</Text>
        <View style={{ width: 40 }} />
      </View>

      {blockedList.length === 0 ? (
        <View style={styles.emptyContainer}>
          {/* Ban Person Circle Icon - Screen 15 */}
          <View style={styles.iconCircle}>
            <Ionicons name="person-circle-outline" size={60} color="#94A3B8" />
            <View style={styles.banBadge}>
              <Ionicons name="ban" size={24} color="#DC2626" />
            </View>
          </View>

          <Text style={styles.emptyTitle}>No Blocked Accounts</Text>
          <Text style={styles.emptySubtitle}>You haven't blocked any accounts yet.</Text>

          <TouchableOpacity
            style={styles.blockBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.blockBtnText}>Block New Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={blockedList}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: Spacing.xl }}
          renderItem={({ item }) => (
            <View style={styles.blockedRow}>
              <View style={styles.domainInfo}>
                <Ionicons name="ban-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.domainText}>{item.domain}</Text>
                  {item.reason && <Text style={{ fontSize: 11, color: '#64748B' }}>{item.reason}</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleUnblock(item)}>
                <Text style={styles.unblockText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.blockBtn, { marginTop: 20 }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.blockBtnText}>Block Another Account</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Block Domain Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Block Domain or Link</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. deceptive-site.com"
              placeholderTextColor="#94A3B8"
              value={domainToBlock}
              onChangeText={setDomainToBlock}
              autoCapitalize="none"
            />
            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleAddBlock}
              >
                <Text style={styles.modalConfirmText}>Block</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 60,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  banBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 28,
  },
  blockBtn: {
    width: '100%',
    maxWidth: 280,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  blockBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  domainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  domainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  unblockText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.sheet,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 16,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: '#1A73E8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
