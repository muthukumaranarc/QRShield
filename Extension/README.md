# QRShield Chrome Extension — React + TypeScript + Manifest V3

A production-grade, security-focused Google Chrome extension built with **React 18**, **TypeScript (Strict Mode)**, **Vite**, and **Chrome Extension Manifest V3**. 

The extension inspects visited websites and active tabs in real-time, communicating with the QRShield cybersecurity backend to analyze domain reputation, deceptive credential phishing keywords, unencrypted HTTP protocols, and malicious redirect hops.

---

## 1. Core Architectural & Security Features

- **Automated Navigation Scanning:** Background Service Worker listens to `chrome.webNavigation.onCompleted` and `chrome.tabs.onUpdated` to automatically evaluate websites as you browse.
- **In-Page Floating Security Banner:** Content script injects a sleek, isolated Shadow DOM security badge on visited pages:
  - **SAFE:** Shows green pill `🛡️ SAFE (15/100)`, auto-minimizes after 7 seconds to a discreet floating shield icon so normal browsing is never obstructed.
  - **SUSPICIOUS / MALICIOUS:** Displays prominent amber/red alerts with active warning signs (e.g. Unencrypted HTTP, MitM threats), with a one-click **"Report ↗"** button to view the full detailed report modal.
- **Chrome Toolbar Dynamic Badging:** Extension icon badge in Chrome's toolbar updates in real-time (`✓` green, `!` amber, `✕` red, `...` analyzing) across tabs.
- **Instant Pre-analyzed Popup:** Opening the popup automatically renders the pre-computed analysis report without requiring manual clicks.
- **Protected Page Safeguards:** Gracefully identifies and skips browser-internal schemes (`chrome://`, `chrome-extension://`, `about:`, `file:`, `devtools:`) or restricted Chrome Web Store pages.
- **Transport Security Normalization Guard:** Plain unencrypted `http://` connections and responses with active warning signs are strictly prohibited from receiving a `SAFE` verdict; they are elevated to `SUSPICIOUS` (score $\ge 50/100$).
- **Strict Content Security Policy (MV3):** Employs `"script-src 'self'; object-src 'self';"` in `manifest.json`. Never utilizes `eval`, dynamic remote code execution, or inline script injection.
- **Fail-Secure Verdict Model:** Network failures, server timeouts, or malformed responses are classified as **`ERROR`** or **`UNKNOWN`** — **never** assumed or displayed as safe.
- **Shadow DOM Isolation:** In-page injected report cards utilize an isolated Shadow Root, ensuring zero style pollution to or from host web pages.

---

## 2. Project Structure

```
Extension/
├── public/
│   ├── manifest.json            # Chrome Manifest V3 declaration with service worker & content script
│   └── icons/                   # Security shield extension icons (16, 32, 48, 128)
├── src/
│   ├── background/
│   │   └── service-worker.ts    # Background navigation watcher, toolbar badging & deduplicated caching
│   ├── content/
│   │   └── content-script.ts    # Isolated Shadow DOM floating security pill & interactive report card
│   ├── popup/
│   │   ├── main.tsx             # React DOM entry point
│   │   ├── App.tsx              # Main popup controller with instant auto-display & re-scan
│   │   ├── components/
│   │   │   ├── UrlPreview.tsx   # Domain preview & active tab status
│   │   │   ├── LoadingState.tsx # Radar pulse animation & step checklist
│   │   │   ├── AnalysisResult.tsx # Verdict banner, threat score, indicators & disclaimers
│   │   │   └── ErrorState.tsx   # Failure diagnosis, recovery advice & retry button
│   │   └── styles/
│   │       └── popup.css        # Accessible, high-contrast, compact styling (380px)
│   ├── services/
│   │   ├── api.ts               # HTTP client with timeout, fallback endpoints & health checking
│   │   ├── storage.ts           # chrome.storage.local caching & settings synchronization
│   │   ├── urlValidation.ts     # URL parsing, scheme checking & query parameter sanitization
│   │   ├── responseValidation.ts# Contract validation, transport security guards & text sanitization
│   │   └── tabService.ts        # Chrome activeTab query with dev fallback
│   ├── types/
│   │   ├── analysis.ts          # Core TypeScript types (Verdict, ThreatIndicator, AnalysisResponse)
│   │   ├── messages.ts          # Extension runtime messaging interfaces
│   │   └── chrome.ts            # Extension environment definitions
│   └── test/
│       ├── setup.ts             # Vitest test runner configuration with chrome API mocks
│       ├── urlValidation.test.ts # Protocol, scheme & sanitization unit tests
│       ├── responseValidation.test.ts # Schema, verdict, score & transport security tests
│       └── api.test.ts          # API timeout, fallback & health check unit tests
│       └── api.test.ts          # Fetch dispatch, 500 error & abort controller unit tests
├── index.html                   # Popup HTML host file
├── vite.config.ts               # Vite bundler configuration (Rollup input & output)
├── vitest.config.ts             # Vitest unit test configuration
├── tsconfig.json                # TypeScript strict configuration
├── .env.example                 # Sample environment variables
└── README.md                    # Documentation
```

---

## 3. Prerequisites & Local Setup

### System Prerequisites
- **Node.js:** `v18.0.0` or higher (verified on Node `v24.13.0`)
- **Package Manager:** `npm` (v9 or higher) or `pnpm`
- **Browser:** Google Chrome (v109+ for full Manifest V3 support) or Chromium-based browsers (Brave, Edge)

### Installation
```bash
# Navigate to the extension folder
cd Extension

# Install dependencies
npm install
```

### Environment Configuration
The extension reads configuration through Vite environment variables. Copy the example file:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the QRShield backend server | `http://60.8.4.50:8080` |
| `VITE_API_ENDPOINT` | URL analysis endpoint path | `/api/v1/url-analysis` |
| `VITE_API_TIMEOUT_MS` | Request timeout before aborting (ms) | `8000` |

---

## 4. Development & Production Commands

```bash
# 1. Run local development preview server (Hot Module Replacement)
npm run dev

# 2. Run unit test suite (Vitest)
npm test

# 3. Run unit tests in interactive watch mode
npm run test:watch

# 4. Compile TypeScript & build the Chrome Extension
npm run build
```

Upon running `npm run build`, Vite packages the extension into the **`Extension/dist/`** directory:
- `dist/manifest.json` (MV3 configuration)
- `dist/index.html` (Popup HTML)
- `dist/assets/popup.js` (Compiled React code)
- `dist/assets/popup.css` (Styles)
- `dist/icons/` (16x16, 32x32, 48x48, 128x128 icons)

---

## 5. Loading the Extension into Google Chrome

1. Open Google Chrome and navigate to:
   ```
   chrome://extensions/
   ```
2. Enable **"Developer mode"** via the toggle switch in the upper-right corner.
3. Click the **"Load unpacked"** button in the upper-left corner.
4. Select the **`Extension/dist`** directory in the file dialog.
5. The extension **"QRShield — URL & Phishing Inspector"** will appear in your installed extensions list.
6. Click the Chrome toolbar **Extensions puzzle icon** and pin **QRShield** to your browser toolbar.

---

## 6. Backend API Request & Response Contract

### Request Contract
- **HTTP Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Endpoint:** `/api/v1/url-analysis` (or `/api/scan/analyze`)
- **Body Schema:**
  ```json
  {
    "url": "https://example.com"
  }
  ```

### Response Contract
- **Success Status:** `200 OK`
- **Body Schema:**
  ```json
  {
    "url": "https://example.com",
    "verdict": "SAFE",
    "riskScore": 5,
    "summary": "No significant threats detected.",
    "indicators": [
      {
        "id": "ind_1",
        "title": "TLS Encryption Active",
        "description": "Valid certificate issued by trusted authority.",
        "severity": "LOW"
      }
    ],
    "analyzedAt": "2026-10-24T10:00:00Z"
  }
  ```

### Supported Verdicts
- **`SAFE`**: Scored below 35. Legitimate domain, no deceptive brand keywords or malicious downloads.
- **`SUSPICIOUS`**: Scored between 35 and 69. Obfuscated redirect wrappers, unencrypted HTTP, or newly registered domains.
- **`MALICIOUS`**: Scored 70 and above. Confirmed phishing form, deceptive typosquatting domain, or malware payload.
- **`UNKNOWN`**: Threat intelligence lookup inconclusive or destination unreachable.

*Note on QRShield Spring Boot Backend Compatibility:* The extension adapter (`responseValidation.ts`) automatically accepts either the proposed contract or the QRShield Spring Boot backend schema (`riskCategory`, `status`, `warningSigns`), ensuring seamless integration across versions.

---

## 7. Backend CORS Configuration Requirements

Because the Chrome extension sends HTTP `fetch` requests from a `chrome-extension://<EXTENSION_ID>` origin, the backend server must allow CORS headers.

### Spring Boot Configuration Example:
```java
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("chrome-extension://*", "http://localhost:*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
```

---

## 8. Manual Testing Verification Checklist

| # | Test Scenario | Steps | Expected Result |
| :-: | :--- | :--- | :--- |
| **1** | **Normal Web Page** | Open `https://example.com`, click QRShield icon in toolbar. | Popup detects domain `example.com`. No network request is sent until "Analyze URL" is clicked. |
| **2** | **Analyze Action** | Click "Analyze URL". | Shows radar pulsing animation, queries backend, transitions to green **`SAFE`** verdict. |
| **3** | **Internal Page Block** | Open `chrome://extensions`, open popup. | Detects browser protected page. "Analyze URL" button is replaced with informative lock notification. |
| **4** | **Server Down / Offline** | Stop the backend or disconnect network, click "Analyze URL". | Shows **`Analysis Failed`** with retry button. Does **not** display the site as safe. |
| **5** | **Request Cancellation** | Click "Analyze URL", immediately click "Cancel Request". | In-flight fetch is aborted via AbortController; popup resets to initial state cleanly. |

---

## 9. Unit Testing Suite

The project includes unit tests covering URL validation, sanitization, response parsing, error handling, and XSS prevention:

```bash
cd Extension
npm test
```

**Results:**
```
 ✓ src/test/urlValidation.test.ts (15 tests)
 ✓ src/test/responseValidation.test.ts (9 tests)
 ✓ src/test/api.test.ts (6 tests)

Test Files  3 passed (3)
     Tests  30 passed (30)
```
