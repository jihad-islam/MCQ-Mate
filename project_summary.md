# MCQMate - Project Summary

## Overview
MCQMate is a full-stack SaaS application that functions as an MCQ (Multiple Choice Questions) practice partner. It allows users to construct custom exams by selecting a Level (e.g., HSC/SSC), Subject, and specific chapters. Users can set a time limit and a set number of questions. After taking the exam, a review page breaks down the results, offering correct answers and explanations.

## Application State
Currently, the application includes the following features:
- **Exam Configuration:** Users select levels, subjects, and chapters, and specify the question limit and timer.
- **Dynamic Exam Generation:** Fetches questions for the selected chapters from the backend API.
- **Exam Interface & Timer:** Questions are displayed alongside a timer, allowing navigation between questions, keyboard shortcuts (via `useExamShortcuts`), and auto-submission when the time runs out.
- **Review Page:** Shows detailed analytics (correct, wrong, score, explanations).
- **PDF Export:** Support for downloading reports or result summaries as PDF.

## Folder structure

```text
mcq/
├── backend/                  # Django Backend
│   ├── exams/                # Core Django App containing Models, Views, APIs
│   │   ├── management/commands/import_mcqs.py # Script for importing questions
│   │   ├── migrations/       # Database migrations
│   │   ├── models.py         # Defines Question, Option, Chapter, Subject, Level DB schema
│   │   ├── serializers.py    # DRF JSON transformers
│   │   ├── urls.py           # API routing
│   │   ├── views.py          # Viewsets and custom actions (submit-exam)
│   ├── mcq_project/          # Main Django configurations (settings, wsgi, asgi)
│   ├── .env                  # Environment Variables
│   ├── build.sh              # Build script for deployment
│   ├── manage.py             # Django entry point
│   ├── requirements.txt      # Python dependencies
├── frontend/                 # Next.js Frontend
│   ├── public/               # Public assets
│   ├── src/
│   │   ├── app/              # App Router Pages
│   │   │   ├── exam/page.tsx # Renders `ExamInterface` 
│   │   │   ├── review/page.tsx # Displays results/reviews after test
│   │   │   ├── globals.css   # Main CSS & Tailwind imports
│   │   │   ├── layout.tsx    # Root layout container
│   │   │   ├── page.tsx      # Entry flow (Level/Subject selection & Config)
│   │   ├── components/       # Reusable components
│   │   │   ├── exam/         # Components specific to the real-time exam (e.g., Timer, DesktopTimer, QuestionCard, ExamInterface, ResultView)
│   │   │   ├── selection/    # Flow components for intro page (SelectionFlow, ExamConfig)
│   │   │   ├── ui/           # Generic components (PdfDownloadButton, ThemeToggle, MultiSelectDropdown)
│   │   ├── hooks/            
│   │   │   ├── useExamShortcuts.tsx # Keyboard navigation mapping
│   │   ├── lib/              
│   │   │   ├── api.ts        # Fetch wrappers & TypeScript interfaces across the app
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.ts    # Tailwind styling config
│   ├── next.config.ts        # Next.js configurations
```

## Key Files Breakdown

### 1. `frontend/src/app/page.tsx`
This is the root page of the application that handles test setup:
- It maintains the state of selected chapters, number of questions, and exam duration.
- Renders the primary entry components: `<SelectionFlow>` (for picking classes, subjects, and chapters) and `<ExamConfig>` (for choosing constraints).
- Contains validation logic ensuring required selections are made before proceeding.
- Uses `sessionStorage` cleanup before starting a new exam.
- Navigates the user to `/exam` forwarding the configurations as query search params.

### 2. `frontend/src/lib/api.ts`
Acts as the bridge between Next.js and the Django backend API:
- **Interfaces:** Centralizes types defining `Level`, `Subject`, `Chapter`, `Question`, `Option`, `ExamSubmitPayload`, and `ExamResult`.
- **API Call Functions:** Includes wrappers using native `fetch` to get list configurations (`fetchLevels`, `fetchSubjectsByLevel`, `fetchChaptersBySubject`), and queries to dynamically fetch randomized `Question` items (`fetchQuestionsByChapter`). 
- **Submit Endpoints:** Houses `submitExam` which POSTs the user selections to calculate scores securely on the backend, returning correct answers and explanations.

### 3. `frontend/src/components/selection/SelectionFlow.tsx`
Handles the cascading dropdown selections required to retrieve a set of chapters. Uses UI dropdowns (`MultiSelectDropdown` & `SingleSelectDropdown`) and passes states upwards to `page.tsx` upon valid selection of modules to evaluate.

### 4. `frontend/src/components/exam/ExamInterface.tsx`
The primary controller for the actual exam instance:
- Orchestrates the timer, question rendering (`QuestionCard`), controls (`ExamControls`), and overall UI states (loading, exam runtime, auto-submit, result view).
- Interacts closely with `frontend/src/hooks/useExamShortcuts.tsx` for hotkeys (e.g., next question, select option).
- Keeps track of all selected options and submits payload to `lib/api.ts` when time limits are reached.

### 5. `backend/exams/views.py` (Backend API equivalent)
Contains the viewsets that provide data for components and validates the submission format receiving answers and generating dynamic performance metrics (correct answers, breakdowns) securely server-side before responding to `api.ts`.
