import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AnalysisService } from '../services/analysisService';
import { HistoryService } from '../services/historyService';
import { RadarShield } from '../components/RadarShield';
import { Radius, Spacing } from '../constants/theme';

type RouteProps = RouteProp<RootStackParamList, 'Analyzing'>;

export const AnalyzingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProps>();
  const { targetUrl, imageUri, source } = route.params;

  const [steps, setSteps] = useState([
    { title: imageUri ? 'Extracting QR Code Image' : 'URL Format Check', done: false },
    { title: 'Domain & Infrastructure', done: false },
    { title: 'Threat Intelligence Lookup', done: false },
    { title: 'Redirect & Payload Inspection', done: false },
  ]);

  useEffect(() => {
    let cancelled = false;

    // Visual step progression
    const timer1 = setTimeout(() => {
      if (!cancelled) setSteps(s => [{ ...s[0], done: true }, s[1], s[2], s[3]]);
    }, 400);

    const timer2 = setTimeout(() => {
      if (!cancelled) setSteps(s => [s[0], { ...s[1], done: true }, s[2], s[3]]);
    }, 850);

    const timer3 = setTimeout(() => {
      if (!cancelled) setSteps(s => [s[0], s[1], { ...s[2], done: true }, s[3]]);
    }, 1300);

    const timer4 = setTimeout(async () => {
      if (!cancelled) {
        setSteps(s => [s[0], s[1], s[2], { ...s[3], done: true }]);

        let analysis;
        if (imageUri) {
          analysis = await AnalysisService.uploadQrImage(imageUri);
        } else {
          analysis = await AnalysisService.analyzeUrlOrPayload(
            targetUrl || '',
            source === 'SCAN' ? 'QR_SCAN' : 'MANUAL_URL'
          );
        }

        await HistoryService.saveScanResult(analysis);
        navigation.replace('Result', { analysis });
      }
    }, 1700);

    return () => {
      cancelled = true;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [targetUrl, imageUri, source, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Cancel analysis"
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Radar pulsing shield animation */}
        <RadarShield />

        {/* Text */}
        <Text style={styles.title}>Scanning for threats...</Text>
        <Text style={styles.subtitle}>This may take a few seconds.</Text>

        {/* Checklist */}
        <View style={styles.checklist}>
          {steps.map((step, index) => (
            <View key={index} style={styles.checkItem}>
              <View
                style={[
                  styles.checkCircle,
                  step.done ? styles.checkCircleDone : styles.checkCirclePending,
                ]}
              >
                <Ionicons
                  name={step.done ? 'checkmark' : 'ellipse'}
                  size={step.done ? 14 : 8}
                  color={step.done ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
              <Text style={[styles.checkText, step.done && styles.checkTextDone]}>
                {step.title}
              </Text>
            </View>
          ))}
        </View>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Cancel analysis"
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 28,
  },
  checklist: {
    width: '100%',
    maxWidth: 280,
    gap: 14,
    marginBottom: 36,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkCircleDone: {
    backgroundColor: '#16A34A',
  },
  checkCirclePending: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  checkText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  checkTextDone: {
    color: '#1E293B',
    fontWeight: '600',
  },
  cancelBtn: {
    width: '100%',
    maxWidth: 280,
    height: 46,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#1A73E8',
    fontSize: 14,
    fontWeight: '600',
  },
});
