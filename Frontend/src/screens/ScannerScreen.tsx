import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScanAnalysis } from '../types/analysis';
import { RootStackParamList } from '../types/navigation';
import { AnalysisService } from '../services/analysisService';
import { HistoryService } from '../services/historyService';
import { ScanFrameOverlay } from '../components/ScanFrameOverlay';
import { ScanResultSheet } from '../components/ScanResultSheet';
import { CameraPermissionState } from '../components/CameraPermissionState';
import { Radius, Spacing, Shadows } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ScannerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<ScanAnalysis | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const scanLockRef = useRef(false);

  useEffect(() => {
    if (isFocused) {
      const timer = setTimeout(() => {
        scanLockRef.current = false;
        setIsProcessing(false);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setTorch(false);
    }
  }, [isFocused]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanLockRef.current || isSheetVisible || isProcessing) {
      return;
    }

    scanLockRef.current = true;
    setIsProcessing(true);

    try {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}

      navigation.navigate('Analyzing', { targetUrl: data, source: 'SCAN' });
    } catch {
      scanLockRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        navigation.navigate('Analyzing', {
          imageUri: result.assets[0].uri,
          source: 'GALLERY',
        });
      }
    } catch {
      Alert.alert('Gallery Error', 'Could not access photo library.');
    }
  };

  const handleSimulateScan = (type: 'SAFE' | 'DANGER' | 'MEDIUM') => {
    const url =
      type === 'SAFE'
        ? 'https://example.com'
        : type === 'DANGER'
        ? 'https://phishing-site.net/verify'
        : 'https://bit.ly/3xSummerDiscount';

    navigation.navigate('Analyzing', { targetUrl: url, source: 'SCAN' });
  };

  if (!permission) {
    return <View style={styles.darkBackground} />;
  }

  if (!permission.granted) {
    return (
      <CameraPermissionState
        onRequestPermission={requestPermission}
        canAskAgain={permission.canAskAgain}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Live Camera View - Always full screen with explicit dimensions to prevent half-screen glitch when navigating back */}
      <CameraView
        style={[
          styles.cameraFull,
          { width: windowWidth, height: windowHeight },
        ]}
        facing={facing}
        enableTorch={torch}
        barcodeScannerSettings={
          isFocused && !isSheetVisible && !isProcessing
            ? { barcodeTypes: ['qr'] }
            : undefined
        }
        onBarcodeScanned={
          isFocused && !isSheetVisible && !isProcessing
            ? handleBarcodeScanned
            : undefined
        }
      />

      {/* Custom Viewfinder Frame */}
      <ScanFrameOverlay isScanning={isFocused && !isSheetVisible && !isProcessing} />

      {/* Top Header - Screen 7 Layout */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <Text style={styles.headerSubtitle}>Point your camera at a QR code</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Bottom Controls Area - Screen 7 Layout */}
      <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 16) + 10 }]}>
        {/* Flash & Gallery Quick Round Icons */}
        <View style={styles.quickIconsRow}>
          <TouchableOpacity
            style={[styles.quickIconCircle, torch && styles.quickIconCircleActive]}
            onPress={() => setTorch(!torch)}
          >
            <Ionicons
              name={torch ? 'flash' : 'flash-outline'}
              size={22}
              color={torch ? '#FFD600' : '#FFFFFF'}
            />
            <Text style={styles.quickIconLabel}>Flash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickIconCircle}
            onPress={handlePickImage}
          >
            <Ionicons name="images-outline" size={22} color="#FFFFFF" />
            <Text style={styles.quickIconLabel}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Upload from Gallery Button */}
        <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage}>
          <Text style={styles.uploadBtnText}>Upload from Gallery</Text>
        </TouchableOpacity>

        <Text style={styles.privacyNote}>We don't store your images.</Text>

        {/* Simulator Demo Quick Test Pills */}
        <View style={styles.demoBar}>
          <Text style={styles.demoLabel}>Demo Test:</Text>
          <TouchableOpacity
            style={[styles.demoPill, { backgroundColor: '#DCFCE7' }]}
            onPress={() => handleSimulateScan('SAFE')}
          >
            <Text style={[styles.demoPillText, { color: '#16A34A' }]}>Safe Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoPill, { backgroundColor: '#FEE2E2' }]}
            onPress={() => handleSimulateScan('DANGER')}
          >
            <Text style={[styles.demoPillText, { color: '#DC2626' }]}>High Risk</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* In-Camera Risk Sheet */}
      <ScanResultSheet
        visible={isSheetVisible}
        analysis={activeAnalysis}
        onDismiss={() => {
          setIsSheetVisible(false);
          setActiveAnalysis(null);
          setTimeout(() => {
            scanLockRef.current = false;
          }, 800);
        }}
        onViewDetails={analysis => {
          setIsSheetVisible(false);
          navigation.navigate('AnalysisDetails', { analysis });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  cameraFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  darkBackground: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  quickIconsRow: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 20,
  },
  quickIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  quickIconCircleActive: {
    opacity: 0.9,
  },
  quickIconLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: 4,
  },
  uploadBtn: {
    width: '100%',
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Shadows.card,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 10,
  },
  demoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  demoPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  demoPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
