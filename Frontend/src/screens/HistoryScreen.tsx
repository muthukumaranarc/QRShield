import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScanAnalysis } from '../types/analysis';
import { HistoryService } from '../services/historyService';
import { Colors, Radius, Spacing, Shadows } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterChip = 'All' | 'Safe' | 'Suspicious' | 'Malicious';

export const HistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();

  const [history, setHistory] = useState<ScanAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const categoryParam =
        activeFilter === 'Safe' ? 'LOW' :
        activeFilter === 'Suspicious' ? 'MEDIUM' :
        activeFilter === 'Malicious' ? 'HIGH' : undefined;

      const data = await HistoryService.getScanHistory(categoryParam, searchQuery);
      setHistory(data);
    } catch {
      // keep existing
    }
  }, [activeFilter, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused, loadHistory]);

  const handleDeleteItem = (id: string, domainOrUrl?: string) => {
    Alert.alert(
      'Delete Scan Record',
      `Delete "${domainOrUrl || 'this item'}" from scan history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await HistoryService.deleteScanItem(id);
            setHistory(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Scan History',
      'Are you sure you want to delete all saved scan history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await HistoryService.clearScanHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const formatScanDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Recent';
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const filteredItems = history.filter(item => {
    // Filter chip
    if (activeFilter === 'Safe' && item.riskLevel !== 'LOW') return false;
    if (activeFilter === 'Suspicious' && item.riskLevel !== 'MEDIUM') return false;
    if (activeFilter === 'Malicious' && item.riskLevel !== 'HIGH') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDomain = item.domain?.toLowerCase().includes(q);
      const matchUrl = item.normalizedUrl?.toLowerCase().includes(q);
      const matchContent = item.originalContent?.toLowerCase().includes(q);
      return matchDomain || matchUrl || matchContent;
    }

    return true;
  });

  const getRiskBadgeConfig = (level: string) => {
    switch (level) {
      case 'LOW':
        return {
          label: 'Safe',
          icon: 'checkmark-circle' as const,
          color: '#16A34A',
          bg: '#DCFCE7',
          border: '#86EFAC',
        };
      case 'MEDIUM':
        return {
          label: 'Suspicious',
          icon: 'alert-circle' as const,
          color: '#B45309',
          bg: '#FEF3C7',
          border: '#FDE68A',
        };
      case 'HIGH':
        return {
          label: 'Malicious',
          icon: 'close-circle' as const,
          color: '#B91C1C',
          bg: '#FEE2E2',
          border: '#FCA5A5',
        };
      default:
        return {
          label: 'Unknown',
          icon: 'help-circle' as const,
          color: '#475569',
          bg: '#F1F5F9',
          border: '#CBD5E1',
        };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan History</Text>
        </View>

        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar - Screen 12 */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scan history..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips: All, Safe, Suspicious, Malicious */}
      <View style={styles.chipsSection}>
        {(['All', 'Safe', 'Suspicious', 'Malicious'] as const).map(chip => {
          const isActive = activeFilter === chip;
          return (
            <TouchableOpacity
              key={chip}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(chip)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Scan Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 24 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        renderItem={({ item }) => {
          const badge = getRiskBadgeConfig(item.riskLevel);
          return (
            <TouchableOpacity
              style={styles.historyCard}
              onPress={() => navigation.navigate('Result', { analysis: item })}
              activeOpacity={0.7}
            >
              <View style={[styles.statusIconCircle, { backgroundColor: badge.bg }]}>
                <Ionicons name={badge.icon} size={20} color={badge.color} />
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.domainName} numberOfLines={1}>
                  {item.domain || item.originalContent}
                </Text>
                <View
                  style={[
                    styles.tagBadge,
                    { backgroundColor: badge.bg, borderColor: badge.border },
                  ]}
                >
                  <Text style={[styles.tagText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.dateText}>{formatScanDate(item.analyzedAt)}</Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteItem(item.id, item.domain || item.originalContent)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Delete scan record"
                >
                  <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#94A3B8" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>No Scans Found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || activeFilter !== 'All'
                ? 'Try a different keyword or filter.'
                : 'Scanned codes will appear here.'}
            </Text>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearBtn: {
    padding: 6,
  },
  searchSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  chipsSection: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#1A73E8',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.xl,
    gap: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  statusIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
    gap: 4,
  },
  domainName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  deleteBtn: {
    padding: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
