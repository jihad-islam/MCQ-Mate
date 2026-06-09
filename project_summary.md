# MCQMate - Project Summary

## Overview

MCQMate is a full-stack MCQ practice and exam platform. Students can choose a class level, subject, and one or more chapters, configure the question count and time limit, then take a randomized timed exam. Logged-in users can track exam history, manage bookmarks, report question issues, and access premium-only content based on subscription status.

## Current Application State

- Frontend is a Next.js 16 App Router application using React 19, TypeScript, Tailwind CSS 4, next-themes, lucide-react, and KaTeX rendering.
- Backend is a Django 6 + Django REST Framework API using Simple JWT authentication, Jazzmin admin, PostgreSQL, and WhiteNoise static serving.
- The homepage is the primary exam setup screen, with responsive class/subject/chapter selection and exam configuration panels.
- The global navbar supports desktop and mobile layouts, theme toggling, auth-aware links, and a logged-in user greeting on both desktop and mobile.
- The exam page supports timed exam taking, desktop pagination, mobile stacked questions, keyboard shortcuts, auto-submit, and persisted submitted-result recovery.
- The result and review flows show score analytics, explanations, answer states, bookmarks, feedback reporting, and PDF-friendly printing.
- The dashboard provides account details, subscription status, history, bookmarks, and profile editing.
- Checkout supports multi-plan selection and bKash transaction submission.

## Folder Structure

```text
mcq/
├── backend/
│   ├── exams/
│   │   ├── management/commands/import_mcqs.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── services.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── users/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── mcq_project/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   │   ├── checkout/
│   │   ├── dashboard/
│   │   ├── exam/
│   │   ├── login/
│   │   ├── review/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── src/components/
│   │   ├── dashboard/
│   │   ├── exam/
│   │   ├── selection/
│   │   └── ui/
│   ├── src/hooks/useExamShortcuts.tsx
│   ├── src/lib/api.ts
│   ├── next.config.ts
│   ├── package.json
│   └── tailwind.config.ts
├── README.md
└── project_summary.md
```

## Key Frontend Files

- `frontend/src/app/page.tsx`: Homepage exam setup container. Holds selected chapters, available MCQ count, requested question count, time limit, validation errors, and navigation to `/exam`.
- `frontend/src/components/ui/Navbar.tsx`: Auth-aware global navbar with desktop and mobile layouts, theme toggle placement, logged-in greeting, dashboard/logout links, login/checkout links, and mobile dropdown.
- `frontend/src/components/selection/SelectionFlow.tsx`: Fetches levels, subjects, and chapters. Handles premium-locked chapter clicks and reports selected chapter IDs plus available MCQ totals to the homepage.
- `frontend/src/components/selection/ExamConfig.tsx`: Captures question count and time limit while showing selected total MCQ availability.
- `frontend/src/app/exam/page.tsx`: Reads exam query parameters, fetches questions, handles loading/error states, and renders the timer plus exam interface.
- `frontend/src/components/exam/ExamInterface.tsx`: Manages answers, current question, submit state, persisted result recovery, time-up auto-submit, and keyboard shortcuts.
- `frontend/src/components/exam/QuestionCard.tsx`: Renders questions, options, images, board/chapter labels, bookmark actions, and feedback reporting.
- `frontend/src/components/exam/ResultView.tsx`: Displays score analytics and gates detailed review behind premium access.
- `frontend/src/app/review/page.tsx`: Shows answer review, explanations, bookmark/report actions, and print/PDF-friendly content.
- `frontend/src/app/dashboard/page.tsx`: Fetches the authenticated profile and coordinates dashboard overview, history, and bookmark tabs.
- `frontend/src/lib/api.ts`: Central API client and shared frontend TypeScript interfaces.

## Key Backend Areas

- `backend/exams/models.py`: Level, subject, chapter, board paper, question, option, exam history, bookmarks, and question feedback models.
- `backend/exams/views.py`: API endpoints for content fetching, exam submission, history, bookmarks, and feedback.
- `backend/exams/services.py`: Shared exam/domain service logic.
- `backend/users/models.py`: Custom user and subscription-related models.
- `backend/users/views.py`: Authentication, profile, subscription plan, checkout, and checkout settings endpoints.
- `backend/mcq_project/settings.py`: Production-oriented Django settings for JWT auth, PostgreSQL, CORS, WhiteNoise, HTTPS security flags, and Jazzmin admin.

## Production Readiness Notes

- Frontend lint passes with `npm run lint`.
- Frontend production build passes with `npm run build`.
- Next.js external image support is configured for `i.ibb.co`.
- Client-only browser storage reads are guarded through client effects to reduce hydration risk.
- Unused default Next.js public SVG assets have been removed.
- User-facing errors remain in UI state; redundant production console logging has been removed from the touched frontend paths.
