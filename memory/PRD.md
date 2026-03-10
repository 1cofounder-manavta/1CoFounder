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

## Test Accounts
- Regular: `priya@test.com` / `password123`
- Regular: `rahul@test.com` / `password123`
- Admin: `admin@1cofounder.com` / `admin123`

## Backlog / Future Tasks
- **P1**: Social Logins (Google/LinkedIn) — Requires user API keys
- **P2**: Further UI/UX enhancements, user feedback integration
