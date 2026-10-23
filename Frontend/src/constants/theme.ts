import { Platform } from 'react-native';

export const LightColors = {
  // Brand & Accents
  primary: '#1A73E8',
  primaryHover: '#1557B0',
  primaryLight: '#E8F0FE',
  primaryContrast: '#FFFFFF',

  // Surfaces & Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceActive: '#E2E8F0',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',

  // Text
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Camera & Dark Overlays
  cameraOverlay: '#0F172A',
  cameraOverlaySemi: 'rgba(15, 23, 42, 0.75)',
  cameraScrim: 'rgba(0, 0, 0, 0.65)',
  cameraCardBg: '#1E293B',

  // Safe (Green) - Screen 10
  riskSafe: '#16A34A',
  riskSafeBg: '#DCFCE7',
  riskSafeText: '#15803D',
  riskSafeBorder: '#86EFAC',
  riskLow: '#16A34A',
  riskLowBg: '#DCFCE7',
  riskLowText: '#15803D',
  riskLowBorder: '#86EFAC',

  // Suspicious (Amber / Orange) - Screen 11
  riskSuspicious: '#F59E0B',
  riskSuspiciousBg: '#FEF3C7',
  riskSuspiciousText: '#B45309',
  riskSuspiciousBorder: '#FDE68A',
  riskMedium: '#F59E0B',
  riskMediumBg: '#FEF3C7',
  riskMediumText: '#B45309',
  riskMediumBorder: '#FDE68A',

  // Malicious / High Risk (Red) - Screen 11
  riskHigh: '#DC2626',
  riskHighBg: '#FEE2E2',
  riskHighText: '#B91C1C',
  riskHighBorder: '#FCA5A5',

  // Unknown / Neutral (Blue-gray)
  riskUnknown: '#64748B',
  riskUnknownBg: '#F1F5F9',
  riskUnknownText: '#475569',
  riskUnknownBorder: '#CBD5E1',

  // Quick stats card backgrounds
  statScansBg: '#EFF6FF',
  statScansText: '#1D4ED8',
  statSafeBg: '#ECFDF5',
  statSafeText: '#047857',
  statSuspiciousBg: '#FFFBEB',
  statSuspiciousText: '#B45309',
};

export const DarkColors = {
  // Brand & Accents
  primary: '#3B82F6',
  primaryHover: '#60A5FA',
  primaryLight: '#1E3A8A',
  primaryContrast: '#FFFFFF',

  // Surfaces & Backgrounds
  background: '#0B0F19',
  surface: '#111827',
  surfaceSubtle: '#1F2937',
  surfaceActive: '#374151',
  border: '#1F2937',
  borderLight: '#1F2937',

  // Text
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#111827',

  // Camera & Dark Overlays
  cameraOverlay: '#0B0F19',
  cameraOverlaySemi: 'rgba(11, 15, 25, 0.85)',
  cameraScrim: 'rgba(0, 0, 0, 0.75)',
  cameraCardBg: '#1F2937',

  // Safe
  riskSafe: '#22C55E',
  riskSafeBg: '#064E3B',
  riskSafeText: '#86EFAC',
  riskSafeBorder: '#059669',
  riskLow: '#22C55E',
  riskLowBg: '#064E3B',
  riskLowText: '#86EFAC',
  riskLowBorder: '#059669',

  // Suspicious
  riskSuspicious: '#FBBF24',
  riskSuspiciousBg: '#78350F',
  riskSuspiciousText: '#FDE68A',
  riskSuspiciousBorder: '#D97706',
  riskMedium: '#FBBF24',
  riskMediumBg: '#78350F',
  riskMediumText: '#FDE68A',
  riskMediumBorder: '#D97706',

  // Malicious
  riskHigh: '#EF4444',
  riskHighBg: '#7F1D1D',
  riskHighText: '#FCA5A5',
  riskHighBorder: '#DC2626',

  // Unknown
  riskUnknown: '#9CA3AF',
  riskUnknownBg: '#1F2937',
  riskUnknownText: '#E5E7EB',
  riskUnknownBorder: '#374151',

  // Quick stats card backgrounds
  statScansBg: '#1E3A8A',
  statScansText: '#93C5FD',
  statSafeBg: '#064E3B',
  statSafeText: '#86EFAC',
  statSuspiciousBg: '#78350F',
  statSuspiciousText: '#FDE68A',
};

export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  sheet: 28,
  full: 999,
} as const;

export const Typography = {
  h1: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 32,
    color: LightColors.text,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    color: LightColors.text,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: LightColors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 21,
    color: LightColors.text,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 21,
    color: LightColors.text,
  },
  subtext: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: LightColors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    color: LightColors.textSecondary,
  },
  mono: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: LightColors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
} as const;

export const Shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  sheet: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  floating: {
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
