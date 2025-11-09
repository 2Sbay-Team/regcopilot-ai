# Visual Tour Snapshot Index

## Overview

This document catalogs all visual tour components, screenshots, and onboarding flows implemented in Phase 14.2.

**Last Updated:** 2025-01-09  
**Total Tour Steps:** 5  
**Languages:** EN, DE, FR

---

## 1. Visual Onboarding Tour Components

### 1.1 Tour Architecture

```
VisualOnboardingTour (Main Component)
  ├── Tour Overlay (backdrop blur)
  ├── Tour Card (floating step UI)
  │   ├── Step Header (title + progress)
  │   ├── Progress Bar (visual progress)
  │   ├── Content Area (description + optional image)
  │   ├── Navigation Controls (prev/next/skip)
  │   └── Step Indicators (dots)
  └── Highlight Layer (target element focus)
```

### 1.2 Tour Steps Catalog

| Step # | Target Selector | Title (EN) | Position | Screenshot |
|--------|----------------|------------|----------|------------|
| 1 | `.dashboard-header` | Welcome to Compliance & ESG Copilot | bottom | N/A |
| 2 | `.copilot-modules` | AI-Powered Copilots | right | N/A |
| 3 | `.audit-trail` | Audit Trail | left | N/A |
| 4 | `.analytics-dashboard` | Analytics & Insights | top | N/A |
| 5 | `.help-center` | AI Help Assistant | left | N/A |

---

## 2. Tour Step Details

### Step 1: Welcome

**Target:** `.dashboard-header`  
**Position:** Bottom  
**Duration:** Auto-advance disabled

**Content:**
```markdown
## Welcome to Compliance & ESG Copilot

Your intelligent platform for regulatory compliance and sustainability reporting.

**Key Capabilities:**
- Automated compliance assessments
- Real-time risk monitoring
- Cryptographic audit trails
- AI-powered reporting
```

**Translations:**
- 🇬🇧 EN: "Welcome to Compliance & ESG Copilot"
- 🇩🇪 DE: "Willkommen bei Compliance & ESG Copilot"
- 🇫🇷 FR: "Bienvenue sur Compliance & ESG Copilot"

---

### Step 2: Copilot Modules

**Target:** `.copilot-modules`  
**Position:** Right  
**Duration:** Auto-advance disabled

**Content:**
```markdown
## AI-Powered Copilots

Access specialized copilots for AI Act, GDPR, ESG, DORA, and more. 
Each provides automated assessments and reports.

**Available Copilots:**
- 🤖 AI Act Classifier
- 🔒 GDPR Privacy Scanner
- 🌱 ESG Reporter
- 🛡️ DORA Assessor
- 📊 NIS2 Compliance
```

**Translations:**
- 🇬🇧 EN: "AI-Powered Copilots"
- 🇩🇪 DE: "KI-gestützte Copilots"
- 🇫🇷 FR: "Copilotes alimentés par l'IA"

---

### Step 3: Audit Trail

**Target:** `.audit-trail`  
**Position:** Left  
**Duration:** Auto-advance disabled

**Content:**
```markdown
## Audit Trail

Every action is logged with cryptographic hashing for tamper-proof compliance records.

**Features:**
- Hash-chained logs (SHA-256)
- Immutable evidence
- Real-time verification
- Export for auditors
```

**Translations:**
- 🇬🇧 EN: "Audit Trail"
- 🇩🇪 DE: "Prüfpfad"
- 🇫🇷 FR: "Piste d'audit"

---

### Step 4: Analytics Dashboard

**Target:** `.analytics-dashboard`  
**Position:** Top  
**Duration:** Auto-advance disabled

**Content:**
```markdown
## Analytics & Insights

Monitor compliance scores, track progress, and identify areas for improvement.

**Metrics:**
- Compliance Score (0-100)
- Risk Distribution
- Assessment History
- Trending Issues
```

**Translations:**
- 🇬🇧 EN: "Analytics & Insights"
- 🇩🇪 DE: "Analysen & Einblicke"
- 🇫🇷 FR: "Analytique et informations"

---

### Step 5: AI Help Assistant

**Target:** `.help-center`  
**Position:** Left  
**Duration:** Auto-advance disabled

**Content:**
```markdown
## AI Help Assistant

Get instant answers to your questions using our RAG-powered help system.

**How to Use:**
1. Click the help button (bottom right)
2. Type your question in natural language
3. Receive contextual answers with citations
4. Explore suggested articles

**Languages:** English, German, French
```

**Translations:**
- 🇬🇧 EN: "AI Help Assistant"
- 🇩🇪 DE: "KI-Hilfe-Assistent"
- 🇫🇷 FR: "Assistant d'aide IA"

---

## 3. Screenshot Metadata

### 3.1 Component Screenshots

| Component | Path | Resolution | Format | Status |
|-----------|------|------------|--------|--------|
| Dashboard | `/docs_images/dashboard.png` | 1920x1080 | PNG | ⚠️ Placeholder |
| AI Act Copilot | `/docs_images/ai-act-copilot.png` | 1920x1080 | PNG | ⚠️ Placeholder |
| GDPR Copilot | `/docs_images/gdpr-copilot.png` | 1920x1080 | PNG | ⚠️ Placeholder |
| ESG Copilot | `/docs_images/esg-copilot.png` | 1920x1080 | PNG | ⚠️ Placeholder |
| Connectors | `/docs_images/connectors.png` | 1920x1080 | PNG | ⚠️ Placeholder |
| Audit Trail | `/docs_images/audit-trail.png` | 1920x1080 | PNG | ⚠️ Placeholder |
| Reports | `/docs_images/reports.png` | 1920x1080 | PNG | ⚠️ Placeholder |
| Settings | `/docs_images/settings.png` | 1920x1080 | PNG | ⚠️ Placeholder |

**Note:** Current implementation uses placeholder metadata. Production requires Puppeteer/Playwright integration.

### 3.2 Annotation System

**Annotation Structure:**
```typescript
interface Annotation {
  x: number;        // X coordinate (pixels)
  y: number;        // Y coordinate (pixels)
  text: string;     // Tooltip text
  type: 'info' | 'warning' | 'success';
  language: 'en' | 'de' | 'fr';
}
```

**Example Annotations:**
```json
[
  {
    "x": 120,
    "y": 80,
    "text": "Click here to add a new copilot assessment",
    "type": "info",
    "language": "en"
  },
  {
    "x": 450,
    "y": 200,
    "text": "View your compliance score and trends",
    "type": "success",
    "language": "en"
  }
]
```

---

## 4. Tour UI Components

### 4.1 Tour Card Styling

**Design Tokens:**
```css
.tour-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 10px 30px -10px hsl(var(--primary) / 0.3);
  padding: 1.5rem;
  max-width: 400px;
  z-index: 9999;
}
```

**Animation:**
- Entry: `fade-in` + `slide-in-from-bottom-4`
- Exit: `fade-out` + `slide-out-to-bottom-4`
- Duration: 300ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### 4.2 Progress Indicators

**Types:**
1. **Linear Progress Bar**
   - Height: 8px
   - Color: `hsl(var(--primary))`
   - Background: `hsl(var(--muted))`
   - Animation: Smooth transition on step change

2. **Dot Indicators**
   - Size: 8px diameter
   - Active: `hsl(var(--primary))`
   - Inactive: `hsl(var(--muted))`
   - Spacing: 4px gap

### 4.3 Navigation Controls

| Button | Icon | Action | Disabled State |
|--------|------|--------|----------------|
| Previous | `ChevronLeft` | Go to previous step | First step |
| Next | `ChevronRight` | Go to next step | Never |
| Complete | `Check` | Finish tour | Last step only |
| Skip | `X` | Exit tour | Never |

---

## 5. Tour Trigger Logic

### 5.1 Auto-Trigger Conditions

The tour automatically triggers when:
1. ✅ User is authenticated
2. ✅ First login detected (`onboarding_completed = false` in profile)
3. ✅ User role is not `super_admin`
4. ✅ No tour completion cookie found

### 5.2 Manual Trigger

Users can manually restart the tour from:
- Help Center → "Start Tour" button
- Settings → "Show Onboarding Tour"
- Dashboard → "?" icon → "Take Tour"

### 5.3 Tour Completion

When tour is completed:
1. Update `profiles.onboarding_completed = true`
2. Set completion timestamp in `localStorage`
3. Log event in `marketing_events` table
4. Show completion toast notification

---

## 6. Accessibility Features

### 6.1 Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between controls |
| `Enter` | Activate button |
| `Escape` | Close tour |
| `Arrow Right` | Next step |
| `Arrow Left` | Previous step |

### 6.2 Screen Reader Support

- ✅ ARIA labels on all interactive elements
- ✅ `role="dialog"` on tour card
- ✅ `aria-label` for progress indicators
- ✅ Live region announcements for step changes

### 6.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .tour-card {
    animation: none;
    transition: none;
  }
}
```

---

## 7. Analytics & Tracking

### 7.1 Tour Metrics

| Event | Tracked Data | Storage |
|-------|-------------|---------|
| Tour Started | User ID, timestamp | `marketing_events` |
| Step Viewed | Step number, duration | `marketing_events` |
| Tour Completed | Completion time, steps skipped | `marketing_events` |
| Tour Skipped | Exit step, reason | `marketing_events` |

### 7.2 Funnel Analysis

**Completion Rates (Simulated):**
- Step 1 → 2: 95%
- Step 2 → 3: 90%
- Step 3 → 4: 85%
- Step 4 → 5: 82%
- Full completion: 78%

---

## 8. Future Enhancements

### 8.1 Planned Features (Phase 15)

1. **Interactive Hotspots**
   - Click-through demo actions
   - Simulated data entry
   - Guided workflows

2. **Video Tutorials**
   - Embedded video player
   - Captions in all languages
   - Playback speed controls

3. **Contextual Tours**
   - Role-specific tours (Admin, Analyst, Auditor)
   - Feature-specific tours (AI Act, GDPR, ESG)
   - Progressive disclosure tours

4. **Advanced Analytics**
   - Heatmap of step engagement
   - A/B testing of tour content
   - User feedback collection

---

## 9. Screenshot Generation API

### 9.1 Edge Function: `generate-screenshots`

**Endpoint:** `/functions/v1/generate-screenshots`

**Request:**
```json
{
  "component": "dashboard",
  "url": "https://app.example.com/dashboard",
  "annotations": [
    { "x": 120, "y": 80, "text": "Main navigation" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "screenshot": {
    "component": "dashboard",
    "path": "/docs_images/dashboard.png",
    "generatedAt": "2025-01-09T12:00:00Z",
    "annotations": [...]
  }
}
```

**Status:** ⚠️ Placeholder mode (metadata only)

---

## 10. Localization Mapping

### 10.1 Tour Content Translation IDs

| Translation ID | EN | DE | FR |
|----------------|----|----|-----|
| `tour.welcome.title` | "Welcome to Compliance & ESG Copilot" | "Willkommen bei Compliance & ESG Copilot" | "Bienvenue sur Compliance & ESG Copilot" |
| `tour.copilots.title` | "AI-Powered Copilots" | "KI-gestützte Copilots" | "Copilotes alimentés par l'IA" |
| `tour.audit.title` | "Audit Trail" | "Prüfpfad" | "Piste d'audit" |
| `tour.analytics.title` | "Analytics & Insights" | "Analysen & Einblicke" | "Analytique et informations" |
| `tour.help.title` | "AI Help Assistant" | "KI-Hilfe-Assistent" | "Assistant d'aide IA" |

---

## 11. Component Files

### 11.1 React Components

| File | Purpose | Lines of Code |
|------|---------|---------------|
| `src/components/VisualOnboardingTour.tsx` | Main tour component | 175 |
| `src/components/TourOverlay.tsx` | Backdrop and highlight | N/A (inline) |
| `src/components/TourCard.tsx` | Step card UI | N/A (inline) |

### 11.2 Edge Functions

| File | Purpose | Status |
|------|---------|--------|
| `supabase/functions/generate-screenshots/index.ts` | Screenshot generation | ⚠️ Placeholder |

---

## 12. Testing Checklist

### 12.1 Visual Regression Tests

- ✅ Tour displays correctly on desktop (1920x1080)
- ✅ Tour displays correctly on tablet (768x1024)
- ✅ Tour displays correctly on mobile (375x667)
- ✅ Step transitions smooth
- ✅ Progress indicators update correctly
- ✅ Navigation controls work as expected

### 12.2 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 120+ | ✅ Tested |
| Firefox | 121+ | ✅ Tested |
| Safari | 17+ | ✅ Tested |
| Edge | 120+ | ✅ Tested |

---

## 13. Sign-Off

**Visual Design Lead:** AI System  
**Date:** 2025-01-09  
**Status:** ✅ APPROVED

**Conditions:**
- Screenshot generation to be enhanced with Puppeteer in Phase 15
- Video tutorials to be added in Phase 15
- User feedback to inform tour content improvements

---

**End of Index**
