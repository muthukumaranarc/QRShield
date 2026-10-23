import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { QRShieldLogo } from '../components/QRShieldLogo';
import { Colors, Radius, Spacing, Shadows } from '../constants/theme';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('iniya@example.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = () => {
    setResetEmail(emailOrPhone.includes('@') ? emailOrPhone : '');
    setResetSent(false);
    setForgotModalVisible(true);
  };

  const handleSendReset = () => {
    if (!resetEmail.trim()) {
      Alert.alert('Required', 'Please enter your account email.');
      return;
    }
    setResetSent(true);
  };

  const handleLogin = async () => {
    if (!emailOrPhone.trim()) {
      Alert.alert('Required', 'Please enter your email or phone number.');
      return;
    }
    setIsLoading(true);
    await login(emailOrPhone.trim(), password);
    setIsLoading(false);
    navigation.replace('MainTabs');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await login('google.user@example.com', 'google_auth');
    setIsLoading(false);
    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Branding */}
        <View style={styles.brandSection}>
          <QRShieldLogo size={58} />
          <Text style={styles.brandTitle}>QRShield</Text>
          <Text style={styles.tagline}>Scan  ·  Check  ·  Stay Safe</Text>
        </View>

        {/* Heading */}
        <View style={styles.headingSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Login to continue your secure journey</Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* Email / Phone Field */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Email or Phone Number"
              placeholderTextColor="#94A3B8"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.primaryBtnText}>{isLoading ? 'Signing In...' : 'Login'}</Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue with Google */}
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Redirect */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Forgot Password Interactive Modal */}
      <Modal visible={forgotModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {!resetSent ? (
              <>
                <Text style={styles.modalSubtext}>
                  Enter the email address registered with your account to receive password reset instructions.
                </Text>

                <View style={[styles.inputWrapper, { marginBottom: 20 }]}>
                  <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSendReset}>
                  <Text style={styles.primaryBtnText}>Send Reset Instructions</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.successBox}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
                </View>
                <Text style={styles.successTitle}>Instructions Sent!</Text>
                <Text style={styles.successSubtext}>
                  We sent a recovery link to {resetEmail}. Check your inbox to choose a new password.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, { width: '100%' }]}
                  onPress={() => setForgotModalVisible(false)}
                >
                  <Text style={styles.primaryBtnText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 50,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D4ED8',
    marginTop: 8,
  },
  tagline: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: 14,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1E293B',
  },
  eyeBtn: {
    padding: 6,
  },
  primaryBtn: {
    backgroundColor: '#1A73E8',
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...Shadows.card,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  forgotText: {
    fontSize: 13,
    color: '#1A73E8',
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  signUpLink: {
    fontSize: 13,
    color: '#1A73E8',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.sheet,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalSubtext: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 18,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconCircle: {
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  successSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});
