# 1CoFounder.com - Product Requirements Document

## Original Problem Statement
Build a nonprofit web platform for healthcare innovators to find co-founders. Features include profile creation, co-founder discovery (swiping), matching, messaging, problem board, project hub, and admin panel.

## Architecture
- **Frontend**: Next.js 14, React, Tailwind CSS, Shadcn/UI. Monolithic SPA in `app/page.js` with view-switching via `currentView` state.
- **Backend**: Next.js API Routes in `app/api/[[...path]]/route.js`. 
- **Database**: MongoDB (Mongoose).
- **Email**: Resend (transactional emails).
- **Auth**: Custom JWT (token in localStorage as `1cf_token`).

## Core Files
- `/app/app/page.js` - All user-facing frontend views
- `/app/app/api/[[...path]]/route.js` - All backend API logic  
- `/app/app/admin/page.js` - Admin panel (separate page)
- `/app/.env` - Environment variables
- `/app/next.config.js` - Next.js configuration (standalone output, MongoDB external package)

## What's Been Implemented

### Phase 1: Core MVP ✅
- User auth (email/password), onboarding, profiles
- Co-founder discovery with swipe mechanism
- Matching and real-time messaging
- Healthcare problem board
- Project hub

### Phase 2: UI/UX & Branding ✅
- Full visual redesign with teal/emerald theme
- Brand logo integration (Manavta Foundation)

### Phase 3: Admin Panel ✅
- Dashboard with 9 analytics stat cards
- User management (search, filter, verify, suspend, delete)
- Content moderation (problems, projects, reports)
- Activity logs

### Phase 4: Onboarding V2 ✅
- Searchable multi-select for skills (grouped by category)
- Searchable multi-select for interests
- Dynamic country/city dropdowns

### Phase 5: Production Readiness ✅ (Completed Mar 10, 2026)
- **Backend**: Email verification, notifications, rate limiting, blocking, reporting, settings endpoints, profile completeness
- **Frontend Integration** (Fixed Mar 10, 2026):
  - Settings page integrated inline (Account, Password, Notifications, Privacy tabs)
  - Legal pages integrated inline (Terms, Privacy Policy, Community Guidelines)
  - Report & Block buttons fixed on Discover cards (was using undefined `idx` variable)
  - Notification dropdown already working in navbar
  - Admin dashboard already displaying all analytics
  - Cleaned up redundant standalone page files

### Phase 6: Deployment Fixes ✅ (Fixed Mar 10, 2026)
- Health check endpoint (`/api/health`) moved outside MongoDB connection dependency — prevents Kubernetes restart loops when DB is slow
- MongoDB `getDb()` connection with error handling, retry on failure, and configurable timeouts (10s connect, 10s server selection)
- Admin panel API calls switched from `NEXT_PUBLIC_BASE_URL` to relative paths (`/api/...`) — prevents failures when env var is missing in production
- Production build verified: all routes compile successfully with `output: 'standalone'`

### Phase 7: Logo Fix + Email Verification ✅ (Completed Mar 11, 2026)
- **Logo Fix**: Moved logos from `/public/` to static Next.js imports (`import logoHeaderImg from './logo-header.jpeg'`). Logos now bundled into `_next/static/media/` and work reliably in standalone production builds.
- **Email Verification (New Users Only)**:
  - Signup no longer auto-logs in. Returns `email_verification_required: true` and shows "Check your email" screen.
  - Login blocks unverified new users (users with `requires_verification: true` flag).
  - Old/existing users are grandfathered in — no verification required.
  - Resend verification works without auth (accepts `{ email }` in request body).
  - Verification link redirects to `/?verified=true` showing success banner.
  - 60-second cooldown on resend button.

## Test Accounts
- Regular: `priya@test.com` / `password123`
- Regular: `rahul@test.com` / `password123`
- Admin: `admin@1cofounder.com` / `admin123`

## Backlog / Future Tasks
- **P1**: Social Logins (Google/LinkedIn) — Requires user API keys
- **P2**: Further UI/UX enhancements, user feedback integration
