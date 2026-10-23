import { ScanAnalysis } from './analysis';

export type RootTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: { screen?: keyof RootTabParamList } | undefined;
  Scanner: undefined;
  UrlChecker: { initialUrl?: string } | undefined;
  Analyzing: { targetUrl?: string; imageUri?: string; source: 'SCAN' | 'LINK' | 'GALLERY' };
  Result: { analysis: ScanAnalysis };
  AnalysisDetails: { analysis: ScanAnalysis };
  Settings: undefined;
  Profile: undefined;
  BlockedAccounts: undefined;
  LanguageSelection: undefined;
  ThemeSelection: undefined;
  HelpSupport: undefined;
  Notifications: undefined;
  PrivacySecurity: undefined;
  NotificationSettings: undefined;
  About: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  ScoreBreakdown: { score: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
