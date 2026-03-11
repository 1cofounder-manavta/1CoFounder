# 1CoFounder.com - Product Requirements Document

## Overview
A nonprofit platform (Manavta Foundation initiative) connecting healthcare innovators — doctors, engineers, researchers, business operators — to find co-founders and collaborate on healthcare solutions.

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes (modularized handlers)
- **Database**: MongoDB with direct driver (no Mongoose)
- **Email**: Resend (sandbox mode — only sends to `care@doormedcare.com`)
- **Auth**: Custom JWT-based email/password

## Architecture (Post-Modularization Feb 2026)

```
/app
├── app/
│   ├── api/[[...path]]/
│   │   ├── route.js              # Thin router (~90 lines) — dispatches to handlers
│   │   ├── lib/
│   │   │   ├── db.js             # MongoDB connection (cached)
│   │   │   ├── auth.js           # JWT verification, admin check
│   │   │   ├── email.js          # Resend email helpers
│   │   │   └── utils.js          # json(), rate limiting, notifications, profile scoring
│   │   └── handlers/
│   │       ├── auth.js           # Signup, login, verify, resend-verification
│   │       ├── users.js          # Discover, profile CRUD, block/unblock
│   │       ├── social.js         # Swipes, matches, messages, conversations, reports
│   │       ├── problems.js       # Problems CRUD + join/contact
│   │       ├── projects.js       # Projects CRUD + join/invite
│   │       ├── notifications.js  # Notifications list + mark read
│   │       └── admin.js          # Dashboard, users, moderation, reports, activity logs
│   ├── admin/page.js             # Admin panel frontend
│   ├── lib/
│   │   ├── api.js                # Shared API client (get/post/put/del)
│   │   └── helpers.js            # Shared UI helpers, colors, formatters
│   ├── constants.js              # Cities, skills, interests data
│   ├── page.js                   # Main frontend (all user views)
│   └── layout.js                 # Root layout
├── public/                       # Static assets
├── scripts/seed.js               # Database seeding script
└── .env                          # Environment config
```

## Completed Features
1. User auth (signup, login, JWT) with optional email verification
2. Profile onboarding (4-step wizard with 300+ cities, skills, interests)
3. Co-founder discovery (compatibility scoring, swipe mechanics)
4. Mutual matching with notifications
5. Real-time messaging between matches
6. Problems page (All/My tabs, create/edit/delete, join/contact creator)
7. Projects dashboard (create, invite matches, progress tracking)
8. Admin panel (/admin) — users, problems, projects, reports, moderation
9. Settings (account, password, notifications, privacy/blocks)
10. Mobile-first responsive UI with hamburger menu
11. Production-ready: rate limiting, cascading deletes, suspended user filtering
12. Database seeded: 101 users, 20 problems, 8 projects

## Phase History
- Phase 1-6: Core MVP (auth, profiles, discovery, messaging, problems, projects)
- Phase 7: Logo fix + email verification
- Phase 8: Mobile-first UI overhaul
- Phase 9: Data expansion (cities, skills) + feature overhaul (problems/projects)
- Phase 10: DB seeding + email verification rollback to optional
- Phase 11: Admin panel integration fix (cascade deletes, suspended user filtering)
- Phase 12: **Codebase modularization** — Backend split from 1400-line monolith to 12 focused modules

## Credentials
- Admin: `admin@1cofounder.ai` / `Admin@1cf2026`
- Seed users: `[name]@seed.1cofounder` / `Welcome@1cf`

## Backlog
- **P1**: Social Logins (Google/LinkedIn)
- **P2**: UI/UX enhancements, user feedback
- **P2**: Domain verification for Resend (real email delivery)
