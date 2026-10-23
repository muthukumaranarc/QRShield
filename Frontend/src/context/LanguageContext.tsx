import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LanguageCode = 'en' | 'ta';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LANGUAGE_KEY = '@qrshield_language';

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    appTitle: 'QRShield',
    tagline: 'Scan · Check · Stay Safe',
    goodMorning: 'Good Morning,',
    greetingSubtitle: 'Stay safe, scan smart!',
    scanQr: 'Scan QR',
    pasteLink: 'Paste Link',
    quickStats: 'Quick Stats',
    recentActivity: 'Recent Activity',
    viewAll: 'View All',
    scans: 'Scans',
    safe: 'Safe',
    suspicious: 'Suspicious',
    malicious: 'Malicious',
    unknown: 'Unknown',
    dashboard: 'Dashboard',
    overview: 'Overview',
    scanStats: 'Scan Stats',
    riskAnalysis: 'Risk Analysis',
    totalScans: 'Total Scans',
    scanResults: 'Scan Results',
    securityScore: 'Security Score',
    history: 'Scan History',
    profile: 'My Account',
    settings: 'Settings',
    helpSupport: 'Help & Support',
    theme: 'Theme',
    language: 'Language',
    blockedAccounts: 'Blocked Accounts',
    logOut: 'Log Out',
  },
  ta: {
    appTitle: 'கியூஆர்ஷீல்ட்',
    tagline: 'ஸ்கேன் · சரிபார் · பாதுகாப்பாய் இரு',
    goodMorning: 'காலை வணக்கம்,',
    greetingSubtitle: 'பாதுகாப்பாக இருங்கள், புத்திசாலியாக ஸ்கேன் செய்யுங்கள்!',
    scanQr: 'ஸ்கேன் செய்',
    pasteLink: 'இணைப்பை ஒட்டு',
    quickStats: 'விரைவு புள்ளிவிவரங்கள்',
    recentActivity: 'சமீபத்திய செயல்பாடு',
    viewAll: 'அனைத்தையும் காட்டு',
    scans: 'ஸ்கேன்கள்',
    safe: 'பாதுகாப்பானது',
    suspicious: 'சந்தேகத்திற்குரியது',
    malicious: 'ஆபத்தானது',
    unknown: 'தெரியாதது',
    dashboard: 'கட்டுப்பாட்டகம்',
    overview: 'மேலோட்டம்',
    scanStats: 'ஸ்கேன் விவரம்',
    riskAnalysis: 'ஆபத்து பகுப்பாய்வு',
    totalScans: 'மொத்த ஸ்கேன்கள்',
    scanResults: 'ஸ்கேன் முடிவுகள்',
    securityScore: 'பாதுகாப்பு மதிப்பெண்',
    history: 'வரலாறு',
    profile: 'என் கணக்கு',
    settings: 'அமைப்புகள்',
    helpSupport: 'உதவி & ஆதரவு',
    theme: 'தீம்',
    language: 'மொழி',
    blockedAccounts: 'தடுக்கப்பட்ட கணக்குகள்',
    logOut: 'வெளியேறு',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then(saved => {
      if (saved === 'en' || saved === 'ta') {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => {});
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useAppLanguage = () => useContext(LanguageContext);
