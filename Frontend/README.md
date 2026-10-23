# QRShield Mobile Frontend

QRShield is a mobile security application built with **React Native, Expo, and TypeScript** that helps users evaluate QR codes and web links **before opening them**. It features a full-screen live camera scanner with an in-camera risk-warning popup, manual URL checker, detailed security assessments, search/filter history, and a security dashboard.

---

## 🚀 Getting Started

### 1. Install Dependencies
Navigate into the `Frontend` directory and install packages:
```bash
cd Frontend
npm install
```

### 2. Run the App
Start the Expo development server:
```bash
npm run start
```

- **Run on Android device or emulator**: Press `a` in the terminal or run `npm run android`
- **Run on iOS simulator**: Press `i` in the terminal or run `npm run ios`
- **Scan via Expo Go**: Open the Expo Go app on your physical mobile device and scan the generated terminal QR code.

### 3. Verify TypeScript Types
```bash
npm run typecheck
```

---

## 📱 Features Implemented

1. **Live Camera QR Scanner (`ScannerScreen`)**:
   - Camera viewfinder powered by `expo-camera` (`CameraView`) with custom bracket overlays and animated scanning laser.
   - Flashlight / torch toggle and front/back camera switching.
   - Gallery QR photo picker via `expo-image-picker`.
   - Built-in simulation triggers (`High Risk`, `Medium`, `Low Risk`) for immediate interactive testing in emulators.
   - Haptic feedback on barcode detection.
   - Beautiful, Google/Material-inspired **in-camera risk popup bottom sheet** that dims the camera and surfaces:
     - Risk pill and numerical score (e.g. `HIGH RISK · 85/100`).
     - Wrapped/truncated URL preview with quick clipboard copy.
     - Concise risk reasons and clear recommendation banner.
     - Strong primary action: **"Don't open this link"** (closes sheet and resumes scanning safely).
     - Secondary action: **"Open anyway"** (requires explicit confirmation dialog for high-risk links).
     - Tertiary action: **"View analysis details"** linking directly to the full security report.

2. **URL Checker (`UrlCheckerScreen`)**:
   - Clean manual input with clipboard paste and clear actions.
   - Real-time inline syntax validation (detects empty inputs, non-web protocols, and malformed URLs).
   - Quick one-tap demo preset buttons (`Phishing Demo`, `Shortened Link`, `Safe Domain`).
   - Loading state and analysis result card.

3. **Detailed Security Analysis (`AnalysisDetailsScreen`)**:
   - Comprehensive risk score gauge and evaluation badges.
   - Plain-language indicator rows with severity badges (`HIGH`, `MEDIUM`, `LOW`, `INFO`).
   - "Checks Performed" audit grid:
     - URL Format Validation
     - Domain & Host Analysis
     - Redirect Chain Inspection
     - Threat Intelligence Lookup
   - Status indicators: `PASSED`, `WARNING`, `FAILED`, `NOT_CHECKED`, `UNAVAILABLE`.
   - Native OS sharing integration.

4. **Scan History (`HistoryScreen`)**:
   - Persists all scans locally using `@react-native-async-storage/async-storage`.
   - Real-time search by domain or full URL.
   - Filter chips: `All`, `High Risk`, `Medium Risk`, `Low Risk`, `Unknown`.
   - Clear history action with confirmation dialog.
   - Empty state illustration with quick navigation back to scanner.

5. **Security Overview Dashboard (`HomeScreen`)**:
   - Quick action hero buttons for live QR scanning and manual link checking.
   - Summary statistics grid (Total scans, High-risk flagged, Medium-risk, Clean).
   - Recent scan records preview.
   - Educational mobile security tips.

---

## 🔌 Mock Data vs. Spring Boot API Integration

### Current Status (Prototype / Heuristic Mode)
- **Source of Data:** The app currently runs in local heuristic mode using `analysisService.ts` and `historyService.ts`.
- **Behavior:** Realistic deterministic rules evaluate hostnames (e.g., raw IP hosts flag as High Risk, deceptive keywords like `paypal-security` flag as High Risk, shorteners like `bit.ly` flag as Medium Risk, recognized HTTPS domains like `google.com` flag as Low Risk).
- **History Storage:** Local persistent caching via `AsyncStorage`.

### Ready for Spring Boot Integration
The service layer is already architected for the backend API:
- Configure the environment variable:
  ```env
  EXPO_PUBLIC_API_BASE_URL=http://your-backend-host:8080
  ```
- Endpoints prepared:
  - `POST /api/scans` -> Submit a QR payload or URL for backend security analysis
  - `GET /api/scans` -> Fetch persisted scan history
  - `GET /api/dashboard/stats` -> Fetch aggregated security statistics
