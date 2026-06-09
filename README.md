# MCQMate

MCQMate is a full-stack MCQ practice platform for building timed exams from class, subject, chapter, and board-paper content. The app includes authentication, premium access, dynamic exam generation, history, bookmarks, feedback reporting, review analytics, PDF-friendly review output, and a responsive light/dark UI.

## Current Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, next-themes, lucide-react, KaTeX
- Backend: Django 6, Django REST Framework, Simple JWT, Jazzmin admin, WhiteNoise
- Database: PostgreSQL via `DATABASE_URL`
- Typical deployment: Vercel for `frontend`, Render for `backend`

## Features

- Hierarchical selection flow for class level, subject, and chapters.
- Premium chapter locking based on subscription status.
- Randomized question fetching with configurable question count and time limit.
- Timed exam interface with desktop pagination, mobile scrolling, keyboard shortcuts, and auto-submit.
- Result summary with score, correct/wrong/skipped breakdown, and premium-gated answer review.
- User dashboard with account details, subscription status, exam history, and bookmarks.
- Bookmark and question feedback/reporting support.
- PDF-friendly review page using the browser print dialog.
- Responsive navbar, including logged-in user greeting on mobile and desktop.
- Dark mode support with persisted theme handling.

## Repository Structure

```text
mcq/
├── backend/
│   ├── exams/                 # MCQ content, exam history, bookmarks, feedback APIs
│   ├── users/                 # Custom users, auth, subscriptions, checkout APIs
│   ├── mcq_project/           # Django settings, URLs, ASGI/WSGI
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/app/               # Next.js App Router pages
│   ├── src/components/        # UI, selection, exam, and dashboard components
│   ├── src/hooks/             # Exam keyboard shortcuts
│   ├── src/lib/api.ts         # Frontend API client and shared types
│   ├── package.json
│   └── next.config.ts
├── README.md
└── project_summary.md
```

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DEBUG=True
SECRET_KEY=replace-me
DATABASE_URL=postgres://user:password@host:5432/dbname
```

Run the API:

```bash
python manage.py migrate
python manage.py runserver
```

Backend default URL: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Run the app:

```bash
npm run dev
```

Frontend default URL: `http://localhost:3000`

## Production Checks

From `frontend/`:

```bash
npm run lint
npm run build
```

For backend deployment, set `DEBUG=False`, provide a strong `SECRET_KEY`, configure `DATABASE_URL`, run migrations, and serve with Gunicorn/Render or an equivalent WSGI host.

## Environment Variables

Backend:

- `DEBUG`
- `SECRET_KEY`
- `DATABASE_URL`
- `RENDER_EXTERNAL_HOSTNAME` when deployed on Render

Frontend:

- `NEXT_PUBLIC_API_URL`

## Maintainer

Md. Jihad Islam
