import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootTabParamList, RootStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { UrlCheckerScreen } from '../screens/UrlCheckerScreen';
import { AnalyzingScreen } from '../screens/AnalyzingScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { AnalysisDetailsScreen } from '../screens/AnalysisDetailsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BlockedAccountsScreen } from '../screens/BlockedAccountsScreen';
import { LanguageSelectionScreen } from '../screens/LanguageSelectionScreen';
import { ThemeSelectionScreen } from '../screens/ThemeSelectionScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PrivacySecurityScreen } from '../screens/PrivacySecurityScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { ScoreBreakdownScreen } from '../screens/ScoreBreakdownScreen';
import { Colors } from '../constants/theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1A73E8',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return (
              <Ionicons
                name={focused ? 'shield' : 'shield-outline'}
                size={22}
                color={color}
              />
            );
          } else if (route.name === 'Dashboard') {
            return (
              <Ionicons
                name={focused ? 'bar-chart' : 'bar-chart-outline'}
                size={22}
                color={color}
              />
            );
          } else if (route.name === 'History') {
            return (
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={22}
                color={color}
              />
            );
          } else if (route.name === 'Profile') {
            return (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            );
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Auth Flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      {/* Main App Tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Core Security Scan Flow */}
      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="UrlChecker"
        component={UrlCheckerScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Analyzing"
        component={AnalyzingScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="AnalysisDetails"
        component={AnalysisDetailsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ScoreBreakdown"
        component={ScoreBreakdownScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />

      {/* Notifications */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      {/* Settings & Support */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="BlockedAccounts" component={BlockedAccountsScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
};
