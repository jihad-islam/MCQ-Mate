# Learning Guide: MCQMate Architecture & Data Flow

Welcome to the internal workings of MCQMate! This guide provides a beginner-friendly overview of how the various pieces of the tech stack work together. Read on to understand the structural implementation and reverse-engineer the project's logic.

## 1. Project Overview

MCQMate is a full-stack platform built with:
- **Frontend**: Next.js (React), Tailwind CSS, TypeScript
- **Backend**: Django, Django REST Framework (DRF), PostgreSQL
- **Design Pattern**: Client-Server architecture linked via REST API.

## 2. Django Randomizing Queryset

In exams, questions need to appear randomly to discourage memorizing option locations or question orders.

### The Backend Logic
In Django, we achieve this by using SQL's native random functionality applied through the ORM. Whenever an exam is generated, Django creates a random representation of the exact subset of questions required.

```python
# Pseudo-code representation of the method inside Django views
questions = Question.objects.filter(chapter=chapter_id).order_by('?')[:mcq_count]
```
- The `.order_by('?')` function tells the database to assign a random value to each row and sort by it.
- `[:mcq_count]` uses SQL `LIMIT` to only grab the number of questions the user configured.
This approach prevents performance lags on the server because the randomization occurs in the database engine (PostgreSQL), which handles random sorting much more efficiently than a `for` loop in Python would.

## 3. Next.js Search Params Handling State

To ensure the exam configuration remains stable across accidental reloads, the state is managed securely via URL query parameters, managed through Next.js natively.

### The Flow
1. User dictates configurations in `page.tsx` (`chapterId=4`, `mcqCount=10`, `timeLimit=15`).
2. The frontend uses `URLSearchParams` to convert this state into a URL string: `?chapterId=4&mcqCount=10&timeLimit=15`.
3. `router.push('/exam?…')` navigates the user to the Exam page.
4. On `exam/page.tsx`, Next.js's `useSearchParams()` hook reads the URL line directly to instantiate React State variables correctly. The user's choices are completely retained just by reading the browser path context!

## 4. Timer Sync Logic

The `Timer.tsx` component is independent and functional, maintaining synchronization natively from its load point.

- **Initialization**: Once the questions load, the layout renders the Timer, passing down `timeLimit`.
- **Decrement Cycle**: Inside `Timer.tsx`, a `setInterval` hook initiates a 1-second countdown, refreshing local state every exactly 1000 milliseconds.
- **Completion Event Dispatch**: When the clock hits `0`, the Timer dispatches a vanilla JavaScript event:
  `window.dispatchEvent(new Event('timeUp'))`
- **Listener Sink**: `ExamInterface.tsx` features an `useEffect` hook listening specifically for 'timeUp'. When triggered, it forces an automated API submittal of the student's current answers.

## 5. Overall Data Flow (Backend -> Frontend -> Select)

Understanding the data traversal:

1. **Request Initiation (Frontend)**: User clicks "Start Exam". URL holds parameters.
2. **API Handshake (Frontend -> Backend)**: `fetchQuestionsByChapter()` requests REST endpoint `/api/exams/questions/?chapter=X&count=Y`.
3. **Database Lookout (Backend)**: Django reads parameters, filters PostgreSQL with `order_by('?')`, creates an immutable list of queries. 
4. **Serialization (Backend -> Frontend)**: Django REST Framework converts Python Models to JSON data and sends it across `fetch`. 
5. **UI Population (Frontend)**: `ExamInterface.tsx` saves this JSON in a `const [questions, setQuestions]` Array State and maps rendering cards.
6. **User Interaction (Frontend)**: Student clicks an option. `handleOptionSelect(question_id, option_id)` stores data loosely in a `UserAnswers` object `{ [key: number]: number }`.
7. **Submission Protocol (Frontend -> Backend)**: On Submit/TimeUp, the frontend maps answers to a single massive array, dispatching it to `/api/exams/submit/`.
8. **Final Parsing (Backend -> Frontend)**: Django calculates the score by validating keys against the canonical database and returns a scored JSON payload (`{ score: 90, wrong_answers: ... }`), which Next.js elegantly formats.

## 6. Project Structure

Understanding the codebase layout is key to navigating MCQMate. 

### Frontend (Next.js Application)
- **`src/app/page.tsx`**: The main entry point (Homepage). It houses the hero section, the academic selector (SelectionFlow), and the config panel (ExamConfig). Evaluates parameters and routes to the exam dashboard.
- **`src/app/exam/page.tsx`**: The dashboard that serves the exam interface. It wraps data fetching in a `Suspense` boundary and controls loading/error conditions.
- **`src/app/review/page.tsx`**: Renders analytical breakdown of user submissions, cross-referencing which questions were right/wrong with their explanations.
- **`src/components/SelectionFlow.tsx`**: A sequential dropdown form where users specify Class, Subject, and Chapter to set the exam boundary.
- **`src/components/ExamConfig.tsx`**: Allows students to manually designate the number of MCQs and time limit.
- **`src/components/ExamInterface.tsx`**: The primary UI for handling active exam logic. Maps questions to UI cards, manages option selection (React State), handles pagination (Next/Previous), parses form submissions, and swaps the view to the Results/Scorecard screen.
- **`src/components/Timer.tsx`**: A standalone hook-driven countdown component. Triggers `timeUp` when it hits 0.
- **`src/components/FormattedMathText.tsx`**: Uses KaTeX libraries to beautifully render mathematical/algebraic notations inside questions or options correctly.
- **`src/lib/api.ts`**: The Axios abstraction layer bridging front-end HTTP requests securely directly to Django REST endpoints.

### Backend (Django REST Framework)
- **`mcq_project/`**: The core Django configuration directory (holding `settings.py`, `urls.py`, etc.).
- **`exams/models.py`**: Defines the PostgreSQL database schematic.
- **`exams/serializers.py`**: A DRF utility translating complex database instances into standard JSON dictionaries for Next.js to read, preventing circular relationships and hiding correct answers from initial exam payloads.
- **`exams/urls.py`**: Explicitly maps API URLs (like `/api/exams/questions/`) to designated Logic Views.
- **`exams/views.py`**: The logic epicenter. Houses functions like evaluating quiz scores (`submit_exam` mapping answers sequentially) or returning queried chapter modules.
- **`seed_data.py`** / **`import_mcqs.py`**: Custom utility scripts to populate the database natively from scratch or from spreadsheets, eliminating manual data entry.

## 7. Database Design & Logic

The PostgreSQL database mapped by Django's ORM follows a strict hierarchy designed for rigid academic curricula.

### Relational Hierarchy
The database design uses **One-to-Many Relationships (Foreign Keys)** cascading downstream:

1. **`Level` Model**: The absolute top of the tree. Represents an academic Class or Grade (e.g., "Class 10").
2. **`Subject` Model**: The specific subject. `ForeignKey(Level)` means multiple subjects can belong to one Class (e.g., "Physics" for "Class 10").
3. **`Chapter` Model**: Holds specific chapters representing curriculum milestones. `ForeignKey(Subject)` links it upstream (e.g., "Thermodynamics" for "Physics").
4. **`Question` Model**: The actual question string holding `ForeignKey(Chapter)`. Includes an `explanation` field for review screens.
5. **`Option` Model**: Represents individual `A`, `B`, `C`, `D` choices securely holding `ForeignKey(Question)`. Contains an `is_correct` boolean.

### System Logic
- **Data Protection**: Notice how `is_correct` inherently sits alongside `Option` inside the database. When Django pulls questions via `serializers.py` for standard tests, the serializer intentionally excludes the `is_correct` parameter. This prevents tech-savvy students from simply checking the browser's Network payload to find the right answers. Django grades against this unexposed boolean strictly upon Final Submission.
- **Cascading Deletes**: `on_delete=models.CASCADE` means if an Administrator deletes the "Physics" Subject, all related Chapters, Questions, and Options are automatically purged, maintaining database health recursively.

Happy engineering!