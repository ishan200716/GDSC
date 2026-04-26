<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase" />
  <img src="https://img.shields.io/badge/Gemini_AI-1.5_Flash-blue?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss" />
</p>

# 🌐 CommunityPulse

**AI-Powered Community Needs Intelligence Platform**

CommunityPulse is a real-time crisis response and community needs management platform built for the **Google Solution Challenge**. It uses **Gemini AI** to automatically process NGO survey data, score urgency levels, and intelligently match volunteers to community needs based on skills, location, and availability.

---

## ✨ Features

| Feature | Description |
|---|---|
| **📊 Mission Control Dashboard** | Real-time feed of community needs with urgency badges, Google Maps visualization with dark/night mode, and AI-generated insights |
| **📤 AI Survey Processing** | Drag-and-drop CSV upload with automated Gemini AI extraction — converts raw survey text into structured, scored community needs |
| **🤝 Intelligent Volunteer Matching** | AI-powered matching engine that pairs volunteers to needs based on skills, service radius, and availability with explainable scores |
| **📈 Analytics Dashboard** | Interactive Recharts visualizations — category donut charts, urgency trend lines, animated KPI cards with count-up effects |
| **🙋 Volunteer Registration** | Full registration flow with skill chip selection, availability day toggles, Google Places autocomplete for city lookup |
| **🗺️ Interactive Needs Map** | Google Maps integration with urgency-colored circle markers, click-to-inspect InfoWindows, dark mode styling |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 3.4 + Glassmorphism Design System |
| **AI Engine** | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| **Database** | Firebase Firestore (real-time sync via `onSnapshot`) |
| **Authentication** | Firebase Auth |
| **Maps** | Google Maps JavaScript API (`@googlemaps/js-api-loader`) |
| **Charts** | Recharts (PieChart, AreaChart) |
| **Animations** | Framer Motion |
| **UI Primitives** | Radix UI (Dialog, Select) |
| **Deployment** | Firebase Hosting + GitHub Actions CI/CD |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Firebase** project with Firestore, Auth, and Storage enabled
- A **Google Gemini API** key
- A **Google Maps Platform** API key (Maps JavaScript API + Places API)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/community-pulse.git
cd community-pulse

# 2. Install dependencies
npm install

# 3. Create environment variables
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
GEMINI_API_KEY=your_gemini_api_key
```

```bash
# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏗️ Project Structure

```
├── app/
│   ├── page.tsx                    # Landing / Hero page
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── loading.tsx                 # Global loading state
│   ├── error.tsx                   # Global error boundary
│   └── (app)/                      # Authenticated route group
│       ├── layout.tsx              # Dashboard shell (Sidebar + Header)
│       ├── dashboard/page.tsx      # Mission Control
│       ├── upload/page.tsx         # AI Survey Processing
│       ├── volunteers/page.tsx     # Volunteer Management
│       ├── matches/page.tsx        # AI Matching Engine
│       ├── analytics/page.tsx      # Analytics Dashboard
│       └── register/page.tsx       # Volunteer Registration
├── components/
│   ├── ui/                         # Reusable design system components
│   │   ├── GlassCard.tsx           # Glassmorphism container
│   │   ├── GradientButton.tsx      # Animated gradient button
│   │   ├── UrgencyBadge.tsx        # Urgency level indicator
│   │   ├── CategoryChip.tsx        # Toggleable skill/category chip
│   │   ├── GlassInput.tsx          # Glass-styled input field
│   │   ├── StatCard.tsx            # KPI metric card
│   │   ├── Sidebar.tsx             # Navigation sidebar / bottom nav
│   │   └── SkeletonCard.tsx        # Loading skeleton variants
│   └── dashboard/
│       ├── Header.tsx              # Dashboard header bar
│       ├── NeedCard.tsx            # Community need feed card
│       └── NeedsMap.tsx            # Google Maps visualization
├── hooks/
│   ├── useNeeds.ts                 # Real-time Firestore needs listener
│   └── useMediaQuery.ts           # Responsive breakpoint hook
├── lib/
│   ├── firebase.ts                 # Firebase init + Firestore helpers
│   ├── gemini.ts                   # Gemini AI service (3 functions)
│   ├── fonts.ts                    # Next.js font configuration
│   └── utils.ts                    # Utility functions (cn, etc.)
├── types/
│   └── index.ts                    # All TypeScript interfaces & enums
├── firebase.json                   # Firebase Hosting configuration
├── firestore.rules                 # Firestore Security Rules
├── .github/workflows/deploy.yml    # CI/CD pipeline
├── DESIGN.md                       # Design system documentation
└── tailwind.config.js              # Tailwind CSS configuration
```

---

## 🚢 Deployment

### Automatic (CI/CD)

Every push to `main` triggers the GitHub Actions pipeline which:
1. Runs ESLint and TypeScript type checking
2. Builds the Next.js application
3. Deploys to Firebase Hosting

Pull requests automatically get preview deployments.

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON for deployment |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `GEMINI_API_KEY` | Google Gemini API key |

### Manual

```bash
# Build the application
npm run build

# Deploy to Firebase
npx firebase deploy --only hosting

# Deploy Firestore rules
npx firebase deploy --only firestore:rules
```

---

## 🔐 Security

- **Firestore Rules** enforce authenticated access on all collections
- **Match writes** are restricted — only the assigned volunteer can update match status
- **Document deletion** is disabled across all collections
- **Environment variables** are excluded from version control via `.gitignore`
- **Security headers** (X-Frame-Options, X-Content-Type-Options, CSP) configured in Firebase Hosting

---

## 👥 Team

| Role | Name |
|---|---|
| **Full Stack Developer** | Ishan |
| **UI/UX Designer** | Team Member 2 |
| **ML / AI Engineer** | Team Member 3 |
| **Backend / DevOps** | Team Member 4 |

---

## 📄 License

This project is built for the **Google Solution Challenge 2026**. All rights reserved.

---

<p align="center">
  Built with ❤️ for communities that need it most.
</p>
