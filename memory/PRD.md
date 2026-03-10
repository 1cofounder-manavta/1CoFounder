# 1CoFounder.com - Product Requirements Document

## Overview
A nonprofit web platform for healthcare innovators to find co-founders and collaborate. Built with Next.js 14, MongoDB, and Tailwind CSS. A Manavta Foundation Initiative.

**App URL**: https://cofounder-ready.preview.emergentagent.com

## Core Features (All Implemented ✅)
1. **Email Authentication** — JWT-based signup/login with email verification via Resend
2. **Multi-step Onboarding** — 4-step profile builder with searchable skill/interest inputs, country/city dropdowns
3. **Find Cofounders** — Swipeable profile cards with smart compatibility matching, report/block buttons
4. **Matching System** — Mutual interest creates a match, unlocks messaging, sends email + in-app notifications
5. **Messaging** — Real-time chat between matched users with email notifications (throttled)
6. **Healthcare Problems** — Post challenges, join projects, contact creators
7. **Projects Hub** — Create/join projects with progress tracking and team members
8. **Profile Summary** — View completed profile with Edit, profile completeness percentage

## Production Readiness Features (All Implemented ✅)
9. **Email Verification** — Token-based verification on signup via Resend, resend capability
10. **Email Notifications** — Match, message, problem interest, project join (via Resend)
11. **In-App Notifications** — Bell icon in navbar, stored in DB, mark-all-read, auto-refresh
12. **Profile Settings** — /settings page with Account, Password, Notifications, Privacy tabs
13. **Profile Completeness** — Percentage display, higher completeness = higher discovery ranking
14. **Report & Block System** — Report profiles/problems, block users, auto-flag at 3+ reports
15. **Rate Limiting** — 30 swipes/day, 3 problem posts/day
16. **Admin Panel** — /admin with dashboard, user management, moderation, verification, reports, activity logs
17. **Admin Analytics** — Total users, matches, messages, active projects, flagged content
18. **Legal Pages** — /terms, /privacy, /community-guidelines

## Design System
- **Color Palette**: Teal/emerald health-tech gradient (#0f766e → #14b8a6)
- **Brand Assets**: Manavta + 1CoFounder combined logo (header/nav), 1CoFounder icon (favicon)
- **Footer**: "A Manavta Foundation Initiative" + legal page links
- **Skills Ontology**: ~120 structured skills across 6 categories (Clinical, Engineering, Biomedical, Research, Business, Health System)
- **Interests**: 31 healthcare domain interests
- **Country/City**: Full ISO country list + major cities for 40+ countries

## Architecture
```
/app
├── app/
│   ├── api/[[...path]]/route.js  — All backend API routes (~1300 lines)
│   ├── page.js                    — Main frontend SPA (~1980 lines)
│   ├── admin/page.js              — Admin panel SPA
│   ├── settings/page.js           — User settings page
│   ├── terms/page.js              — Terms of Service
│   ├── privacy/page.js            — Privacy Policy
│   ├── community-guidelines/page.js — Community Guidelines
│   ├── layout.js                  — Root layout with favicon
│   └── globals.css                — Global styles, animations
├── public/
│   ├── logo-header.jpeg           — Manavta + 1CoFounder combined logo
│   └── logo-icon.jpeg             — 1CoFounder icon (favicon)
├── tailwind.config.js
└── .env                           — MONGO_URL, JWT_SECRET, RESEND_API_KEY, SENDER_EMAIL
```

## API Endpoints
### Auth
- POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me
- GET /api/auth/verify?token=..., POST /api/auth/resend-verification

### Users
- GET /api/users/discover, PUT /api/users/profile
- PUT /api/users/password, PUT /api/users/notification-preferences
- POST /api/users/block, POST /api/users/unblock, GET /api/users/blocked

### Matching & Messaging
- POST /api/swipes (rate limited: 30/day)
- GET /api/conversations, GET /api/messages/:id, POST /api/messages

### Content
- GET /api/problems, POST /api/problems (rate limited: 3/day)
- POST /api/problems/:id/join
- GET /api/projects, POST /api/projects, POST /api/projects/:id/join

### Reports & Notifications
- POST /api/reports
- GET /api/notifications, POST /api/notifications/read

### Admin (requires is_admin=true)
- GET /api/admin/dashboard, /users, /problems, /projects, /verifications, /reports, /activity-logs, /moderation-queue
- PUT /api/admin/users/:id/verify, /suspend, /verifications/:id/approve, /reject, /problems/:id/hide
- DELETE /api/admin/users/:id, /problems/:id, /projects/:id

## Test Credentials
- priya@test.com / password123 (Doctor, Mumbai)
- rahul@test.com / password123 (Engineer, Bangalore)
- admin@1cofounder.com / admin123 (Admin)

## Deployment Status: ✅ READY
- All unbounded DB queries fixed with .limit()
- No hardcoded secrets or URLs
- Environment variables properly externalized
- Supervisor config valid
- Resend email integration active

## Upcoming Tasks
- [ ] **P1**: Google & LinkedIn social login (requires API keys)
- [ ] **P2**: Refactor monolithic page.js/route.js into smaller modules
- [ ] **P2**: Real-time messaging with WebSocket/SSE
- [ ] **P2**: Profile photo uploads
