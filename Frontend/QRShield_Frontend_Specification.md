# QRShield --- Frontend Implementation Specification for Antigravity

## 1. Your Role

Act as a senior React Native engineer and mobile UI/UX designer. Build
the **QRShield** mobile frontend as a polished, production-minded
Android-first app using **React Native + Expo + TypeScript**.

Use this document as the source of truth for the frontend scope, visual
direction, screens, interactions, components, and implementation
constraints. Inspect the existing project before changing anything.
Preserve working code and conventions where possible. Do not rebuild
unrelated parts of the repository.

## 2. Product Goal

QRShield helps people evaluate a QR code or URL **before opening it**.
It scans QR codes, extracts the destination URL, presents a clear risk
assessment, and lets the user decide what to do.

Important safety/product rules: - **Never automatically open a scanned
URL.** - Do not claim that a URL is guaranteed safe. Use language such
as "No obvious risk indicators found" instead of "100% safe." - Clearly
distinguish an analysis result from a verified fact. If a check is
unavailable, say so. - Make risky actions explicit and deliberate. A
high-risk result must make "Don't open" the clearest primary action. -
Use realistic mock data initially if the backend is not ready. Keep mock
data behind a small service/repository layer so it can later be replaced
by API calls.

## 3. Technical Requirements

-   Framework: React Native with Expo.
-   Language: TypeScript.
-   Navigation: use Expo Router if it is already configured; otherwise
    use React Navigation or the simplest compatible navigation approach.
    Do not install a second navigation system unnecessarily.
-   QR scanning: use an Expo-compatible camera/barcode scanning package
    already present in the project if possible. If none exists, choose a
    currently supported Expo-compatible package and document the
    install/configuration commands. Handle camera permission denial
    gracefully.
-   Icons: use the project's existing icon package if available;
    otherwise use `@expo/vector-icons`.
-   Styling: use reusable StyleSheet-based components or the existing
    styling system. Avoid adding a large UI library solely for this
    page.
-   Backend: Spring Boot API will be integrated later. Implement typed
    service functions and mock responses for now.
-   Keep the app compatible with Expo Go when feasible. If a feature
    requires a development build, explain that clearly rather than
    silently breaking the setup.
-   Do not add secrets, API keys, or production credentials to the
    frontend.

## 4. Visual Direction

Create a refined, Google/Material-inspired interface without copying
Google's logos or branding. The design should feel calm, modern,
trustworthy, and native to Android.

### Design principles

-   Prioritize the live camera preview and scan target.
-   Use rounded surfaces, restrained elevation, clear hierarchy,
    generous spacing, and accessible touch targets.
-   Use Material-inspired blue as the main accent, neutral surfaces, and
    semantic risk colors.
-   Avoid excessive gradients, glassmorphism, clutter, tiny labels, and
    decorative cards that do not help the task.
-   Use subtle animation only where it improves understanding (e.g.,
    scanning line, result sheet entrance).
-   The UI should look carefully designed on a real phone, not like a
    web dashboard squeezed into mobile.

### Suggested palette

-   Primary blue: `#1A73E8`
-   Dark camera overlay: `#101418`
-   Main text: `#202124`
-   Secondary text: `#5F6368`
-   Light surface: `#FFFFFF`
-   App background: `#F7F9FC`
-   Border: `#DADCE0`
-   High risk: `#D93025`
-   Medium risk: `#F9AB00`
-   Low risk: `#188038`

Use semantic colors consistently. Ensure text contrast remains readable
over both the camera preview and bottom sheet.

### Shape, spacing, and typography

-   Use a consistent spacing scale (4, 8, 12, 16, 20, 24, 32).
-   Cards and bottom sheets: approximately 20--28 px corner radius.
-   Buttons: approximately 14--18 px corner radius, with at least 48 px
    height.
-   Use platform-native system fonts unless the project already has a
    bundled font.
-   Support small phones and larger Android devices; respect safe areas
    and system bars.

## 5. Main Screen: Live QR Scanner With In-Camera Risk Popup

This is the highest-priority screen and should receive the most visual
polish.

### Default camera state

1.  A full-screen camera preview fills the main area.
2.  Top status/safe area remains readable with a subtle dark overlay.
3.  Header row:
    -   QRShield icon/wordmark on the left.
    -   Flashlight toggle and gallery/image-picker action on the right.
    -   Use simple line icons and accessible labels.
4.  Center a square/rounded-corner scanning frame with four visible
    corner brackets.
5.  Add a subtle animated blue scan line while scanning is active.
    Respect reduced-motion preferences if supported.
6.  Place a concise instruction near the frame, such as "Align a QR code
    inside the frame."
7.  Bottom camera controls:
    -   Main scan mode: "QR code"
    -   Optional secondary modes only if they can be implemented
        honestly (do not show inactive-looking controls that do
        nothing).
    -   A clear, easy-to-tap gallery button.
    -   Camera switch only if supported by the selected camera
        component.
8.  The camera screen must not look crowded. Keep the preview visually
    dominant.

### Result popup / bottom sheet over the live camera

When a QR code is detected and decoded, pause duplicate detections and
show a bottom sheet over the camera preview. Do not navigate away
automatically. The camera can remain visible and slightly dimmed behind
the sheet.

The result sheet must include: - A compact status icon. - Risk label and
score, e.g. **HIGH RISK · 85/100**. - A readable destination URL with
wrapping/truncation and a copy action. - One or two concise,
plain-language reasons, e.g. "The link redirects to a different,
unfamiliar domain." - A recommendation line, e.g. "We recommend not
opening this link." - Primary button: **Don't open this link**. -
Secondary, visually less prominent action: **Open anyway** (only if the
app supports opening links; it must require an explicit tap and show a
clear warning/confirmation for high-risk results). - A tertiary action:
**View analysis details**. - A way to dismiss the sheet and scan another
code.

Risk-state behavior: - **High:** red semantic indicator, strong warning
hierarchy, "Don't open this link" as the primary action. - **Medium:**
amber indicator and balanced warning. - **Low:** green indicator, but
avoid "guaranteed safe" claims. - **Unknown / analysis unavailable:**
neutral indicator, explain that the URL could not be fully checked, and
recommend caution.

Use a real bottom-sheet implementation if the project already has one.
Otherwise create an accessible modal/bottom-sheet-style component with
React Native primitives and a dimmed backdrop. Ensure it fits on smaller
screens and can scroll if the reason text is long.

### Important implementation behavior

-   Prevent the same QR result from opening the sheet repeatedly while
    the sheet is already visible.
-   Provide a clear "Scan again" or dismiss action that resets the scan
    state.
-   Never launch the URL as a side effect of detection.
-   Clipboard copy should show a small confirmation/toast.
-   If URL opening is implemented, validate the URL scheme and only
    allow `https:` and `http:`. For high risk, show a confirmation step
    before opening.
-   If permission is denied, show an attractive empty state with a short
    explanation and a button to open settings when the platform supports
    it.
-   Handle invalid QR content, empty values, unsupported schemes, and
    non-URL QR payloads with appropriate messages.

## 6. URL Checker Screen

Provide a separate screen or accessible mode to paste/type a URL
manually.

Include: - Clear title: "Check a link". - URL input with a useful
placeholder such as `https://example.com`. - Paste action using the
clipboard API if available and permission-safe. - Clear input action. -
Primary button: "Analyze link". - Inline validation for empty input,
malformed URLs, and unsupported schemes. - Loading state during
analysis. - Result state reusing the same risk result component as the
scanner. - Never open the URL automatically after analysis.

Keep the layout clean and easy to use with one hand.

## 7. Analysis Details Screen

Create a details view that explains why a link received its risk rating.

Include: - Risk level and score. - Destination URL and copy action. -
Summary recommendation. - A list of detected indicators, each with a
clear label, short explanation, and severity indicator. - A separate
"Checks performed" section showing status such as: - URL format
validation - Domain/host analysis - Redirect check - Threat-intelligence
lookup - Mark unavailable checks as "Not available" or "Not checked"; do
not imply they passed. - If using mock data, label the result as a
demo/mock analysis in development mode.

Use accessible icons and avoid technical jargon where possible. If a
technical term is necessary, explain it in plain language.

## 8. Scan History Screen

Create a history list of previous analyses.

Include: - Screen title "Scan history". - Search field for URL/domain. -
Filter chips: All, High, Medium, Low, Unknown. - Each row/card shows
risk icon, domain or URL, risk label, and relative or formatted scan
time. - Empty state with a helpful message and a "Scan a QR code"
action. - Tap an item to open its analysis details. - Provide a clear
action to clear history, with a confirmation dialog. - Persist history
locally using a suitable Expo-compatible storage option if the backend
is not connected. Keep persistence logic behind a repository/service
layer so it can later use the backend. - Do not store more sensitive
information than needed. Make it clear in the UI if history is stored
locally during the prototype.

## 9. Dashboard / Overview Screen

Provide a compact overview screen with: - A clear welcome/header area. -
A prominent "Scan QR code" primary action. - A secondary "Check a link"
action. - Summary statistics: total scans, high-risk links, medium-risk
links, low-risk links. - A small recent scans section with a "View all"
action. - A concise safety tip, e.g. "Preview the destination before
opening unfamiliar QR links."

Avoid complex charts unless they add real value. The dashboard should
remain lightweight and mobile-first.

## 10. Navigation

Use a simple, predictable navigation structure. Preferred bottom
tabs: 1. Home 2. Scan 3. History

The "Check a link" action can be on Home and accessible from the scanner
screen. Analysis details can be a stack screen/modal.

Requirements: - Make the Scan tab visually prominent without obstructing
the other tabs. - Ensure back navigation behaves naturally. - Preserve
the scan result until the user dismisses it or starts another scan. -
Use accessible labels for tab icons. - If the existing app has a
different established navigation system, adapt rather than replacing it
unnecessarily.

## 11. Reusable Components

Build reusable, typed components where appropriate: - `RiskBadge` or
`RiskPill` - `RiskScore` - `ScanResultSheet` - `ScanFrameOverlay` -
`CameraPermissionState` - `UrlInput` - `AnalysisIndicatorRow` -
`HistoryItem` - `StatCard` - `EmptyState` - `LoadingState` -
`ErrorState` - `PrimaryButton` / `SecondaryButton` if the app needs
shared button styling

Avoid overengineering. Components should be reusable where there is a
genuine repeated pattern.

## 12. Frontend Data Model

Use TypeScript types similar to the following and adapt names to the
existing project conventions:

``` ts
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export type CheckStatus =
  | "PASSED"
  | "WARNING"
  | "FAILED"
  | "NOT_CHECKED"
  | "UNAVAILABLE";

export interface AnalysisIndicator {
  id: string;
  title: string;
  description: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH";
  status: CheckStatus;
}

export interface ScanAnalysis {
  id: string;
  originalContent: string;
  normalizedUrl?: string;
  domain?: string;
  riskScore: number | null;
  riskLevel: RiskLevel;
  summary: string;
  recommendation: string;
  indicators: AnalysisIndicator[];
  checks: {
    name: string;
    status: CheckStatus;
    message: string;
  }[];
  analyzedAt: string;
  analysisSource: "MOCK" | "BACKEND";
}
```

Keep risk score optional/null for unknown analysis; do not force a
fabricated numeric score when analysis is unavailable.

## 13. Mock Analysis Service and Future Backend Integration

Create a clean API/repository boundary, for example: -
`src/services/analysisService.ts` - `src/services/historyService.ts` -
`src/types/analysis.ts` - `src/constants/theme.ts`

Adapt paths to the repository's current structure.

The analysis service should expose functions such as: -
`analyzeUrl(url: string): Promise<ScanAnalysis>` -
`analyzeQrPayload(payload: string): Promise<ScanAnalysis>` -
`getScanHistory(): Promise<ScanAnalysis[]>` -
`getDashboardStats(): Promise<DashboardStats>` -
`clearScanHistory(): Promise<void>`

For now, return predictable mock data with realistic loading delays only
if needed to demonstrate UI states. Do not use random scores that change
on every render. Clearly mark mock responses as
`analysisSource: "MOCK"`.

Prepare the service boundary for the future Spring Boot API: -
`POST /api/scans` - `GET /api/scans` - `GET /api/scans/{id}` -
`GET /api/dashboard/stats`

Use an environment variable such as `EXPO_PUBLIC_API_BASE_URL` for the
API base URL when integration begins. Never hardcode private
credentials. Do not implement server-side URL fetching or security
checks in the mobile app; those belong in the backend.

## 14. Accessibility and Usability

-   Maintain strong color contrast.
-   Add accessible labels and hints to icon-only controls.
-   Use touch targets of at least approximately 44--48 px.
-   Do not use color as the only risk indicator; include text and an
    icon.
-   Ensure long URLs wrap or truncate without breaking the layout.
-   Support keyboard visibility and safe-area insets on the URL checker.
-   Show visible loading, empty, success, and error states.
-   Avoid blocking dialogs for every normal action; reserve confirmation
    for destructive actions and high-risk URL opening.

## 15. Error and Edge Cases

Handle: - Camera permission denied or revoked. - No camera available. -
QR code not detected. - Duplicate QR detection. - QR content that is
plain text rather than a URL. - Malformed URL. - Unsupported URL scheme
such as `javascript:`, `file:`, or custom schemes. - Network/backend
unavailable. - Analysis timeout or partial checks. - Empty history. -
Clipboard failure. - URL too long for display. - User dismissing the
result sheet while the camera is active.

All errors should be understandable to a normal user and should not
crash the app.

## 16. Suggested Project Organization

Adapt this structure to the existing codebase rather than forcing it if
a similar structure already exists:

``` text
src/
  components/
    AnalysisIndicatorRow.tsx
    CameraPermissionState.tsx
    EmptyState.tsx
    HistoryItem.tsx
    RiskBadge.tsx
    RiskScore.tsx
    ScanFrameOverlay.tsx
    ScanResultSheet.tsx
    StatCard.tsx
    UrlInput.tsx
  constants/
    theme.ts
  screens/
    HomeScreen.tsx
    ScannerScreen.tsx
    UrlCheckerScreen.tsx
    HistoryScreen.tsx
    AnalysisDetailsScreen.tsx
  services/
    analysisService.ts
    historyService.ts
  types/
    analysis.ts
  utils/
    urlValidation.ts
```

## 17. Implementation Plan

Work in this order and keep the app runnable after each phase:

### Phase 1 --- Inspect and establish

-   Inspect the current repository, package manager, Expo version,
    navigation, and existing UI.
-   Report the current structure briefly.
-   Confirm the app runs before making large changes, if practical.
-   Do not overwrite working project configuration without a reason.

### Phase 2 --- Theme and navigation

-   Define theme tokens and reusable typography/button/card styles.
-   Set up or adapt navigation.
-   Add safe-area handling.

### Phase 3 --- Scanner screen first

-   Build the full-screen camera experience.
-   Add scan frame, scan line, flashlight/gallery controls, and
    permission/error states.
-   Build the risk-result bottom sheet over the live camera.
-   Use the supplied visual reference from the conversation if it is
    available in the workspace/context. Follow the design direction in
    this document if it is not.

### Phase 4 --- URL checker and details

-   Add manual URL checking.
-   Reuse the risk result UI.
-   Add analysis details with indicators and check statuses.

### Phase 5 --- History and Home

-   Add local/mock history persistence, search, filters, and empty
    states.
-   Add dashboard statistics and recent scans.

### Phase 6 --- Quality pass

-   Check small-screen layout, scrolling, safe areas, and keyboard
    behavior.
-   Test all primary interactions.
-   Fix TypeScript errors, lint/build errors, and broken imports.
-   Confirm camera permission denial and mock/backend failure states
    work.
-   Remove dead buttons and placeholder controls that look interactive
    but do nothing.

## 18. Definition of Done

The frontend is complete when: - The app starts successfully using the
repository's documented Expo command. - The scanner screen is visually
polished and camera-first. - A detected QR code opens an in-camera
result sheet, not the browser. - Risk states HIGH, MEDIUM, LOW, and
UNKNOWN are represented clearly. - "Don't open this link" is the
strongest action for a high-risk result. - The URL checker validates
input and shows the same analysis UI. - Details, history search/filter,
dashboard stats, and navigation work with mock data. - Loading, empty,
permission-denied, and error states are present. - All visible controls
work or are clearly disabled with an explanation. - Mock results are
clearly distinguishable from real backend analysis. - No URL is opened
automatically, and no safety guarantee is made. - TypeScript/build
errors introduced by the implementation are resolved. - A short README
section explains how to run the app and which parts currently use mock
data.

## 19. Final Response Required From Antigravity

After implementation, report: 1. What screens and components were
created. 2. Important files changed or added. 3. Commands to install
dependencies and run the app. 4. Any Expo camera setup or
development-build requirement. 5. What currently uses mock data and what
is ready for Spring Boot integration. 6. Tests/build checks performed
and any remaining issues.

Do not claim a feature works unless you have implemented and checked it.
Prioritize a beautiful, reliable scanner screen with the in-camera risk
popup over adding unnecessary features.
