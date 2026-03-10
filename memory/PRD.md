# 1CoFounder.com - Product Requirements Document

## Overview
A nonprofit web platform for healthcare innovators to find co-founders and collaborate. Built with Next.js 14, MongoDB, and Tailwind CSS.

**App URL**: https://medical-match-1.preview.emergentagent.com

## Core Features (All Implemented ✅)
1. **Email Authentication** — JWT-based signup/login with secure token storage
2. **Multi-step Onboarding** — 4-step profile builder (About, Skills/Interests, Startup Prefs, Looking For)
3. **Find Cofounders** — Swipeable profile cards with smart compatibility matching, Skip/Interested actions
4. **Matching System** — Mutual interest creates a match, unlocks messaging
5. **Messaging** — Real-time chat between matched users with unread counters
6. **Healthcare Problems** — Post challenges, join projects, contact creators
7. **Projects Hub** — Create/join projects with progress tracking and team members
8. **Profile Summary** — View completed profile with Edit capability (not re-onboarding)

## Design System (Implemented ✅)
- **Color Palette**: Teal/emerald health-tech gradient (#0f766e → #14b8a6)
- **Typography**: Clean, bold headings (extrabold), relaxed body text
- **Brand Assets**: Manavta + 1CoFounder combined logo (header/nav), 1CoFounder icon (favicon/auth), "A Manavta Foundation Initiative" in footer
- **Components**: Rounded corners (xl-3xl), gradient buttons, glass-morphism navbar
- **Animations**: Fade-in-up, slide-out swipe, match celebration, pulse glow
- **Pattern**: Healthcare cross SVG pattern on hero backgrounds
- **Tags**: Color-coded skill/interest badges with 20+ unique color mappings
- **Images**: Indian clinicians and engineers in healthcare settings (Unsplash)

## Architecture
```
/app
├── app/
│   ├── api/[[...path]]/route.js  — All backend API routes
│   ├── page.js                    — All frontend components (SPA)
│   ├── layout.js                  — Root layout
│   └── globals.css                — Global styles, animations, design system
├── lib/mongodb.js                 — MongoDB connection
├── tailwind.config.js             — Extended with health-tech colors
└── .env                           — MONGO_URL, JWT_SECRET, NEXT_PUBLIC_BASE_URL
```

## API Endpoints
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/users/discover`, `PUT /api/users/profile`
- `POST /api/swipes`
- `GET /api/conversations`, `GET /api/messages/:id`, `POST /api/messages`
- `GET /api/problems`, `POST /api/problems`, `POST /api/problems/:id/join`
- `GET /api/projects`, `POST /api/projects`, `POST /api/projects/:id/join`

## Test Credentials
- priya@test.com / password123 (Doctor, Mumbai)
- rahul@test.com / password123 (Engineer, Bangalore)

## What's Been Completed (March 2026)
- [x] Full MVP with all core features
- [x] UI/UX overhaul with health-tech design system
- [x] Profile summary view (fix: no longer shows onboarding for completed profiles)
- [x] data-testid attributes on all interactive elements
- [x] Responsive design
- [x] Brand logos integrated (Manavta + 1CoFounder header, 1CoFounder favicon)
- [x] Footer updated with "A Manavta Foundation Initiative"
- [x] Comprehensive frontend testing — all passed

## Upcoming Tasks
- [ ] **P1**: Google & LinkedIn social login (requires API keys from user)
- [ ] **P2**: Refactor monolithic page.js into smaller components
- [ ] **P2**: Refactor monolithic route.js into separate API route files
