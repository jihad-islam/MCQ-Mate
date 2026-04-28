# MCQMate 🎓
    
> Your personalized, randomized, and optimized Multiple-Choice Question (MCQ) practice partner.

![Version](https://img.shields.io/badge/Version-1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Django](https://img.shields.io/badge/Django-5-darkgreen)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)

MCQMate is a full-stack academic platform providing students with randomized, timed exams based on strict curriculums. It allows users to specify their Class, Subject, and Chapter to receive uniquely generated question suites, helping prevent route memorization and encouraging active learning.

---

## ⚡ Tech Stack

- **Frontend**: Next.js (TypeScript), Tailwind CSS.
- **Backend**: Django REST Framework (Python).
- **Database**: PostgreSQL (Production ready).

## ✨ Key Features

1. **Academic Structuring Logic**: Dropdown navigations dynamically fetch Class ➔ Subject ➔ Chapter taxonomies.
2. **Custom Configurations**: Define maximum variables (e.g. 20 random MCQs in 15 minutes).
3. **Responsive Interface**: Super mobile-optimized cards, supporting clean interfaces across iPhones, iPads, and native desktop screens.
4. **Automated Submittal Check**: Syncing visual timers auto-submit to Django upon expiry.
5. **Instant Analytics**: Detailed scorecard including percentage, total, correct mappings, and a visual UI breakdown.

---

## 🚀 Setup Instructions

Follow these steps to configure MCQMate on your local machine:

### 1. Backend (Django) Setup
```bash
# Navigate to backend directory
cd backend

# Create Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run migrations to setup DB
python manage.py makemigrations
python manage.py migrate

# (Optional) Seed the database with initial questions
python manage.py shell < seed_data.py

# Run development server
python manage.py runserver
```
*The backend API should now be running cleanly on `http://127.0.0.1:8000/`*

### 2. Frontend (Next.js) Setup
```bash
# Navigate to frontend directory in a separate terminal
cd frontend

# Install Node dependencies
npm install

# Start the interactive UI
npm run dev
```
*Your application is now viewable at `http://localhost:3000/`*

---

## 📜 Version History

- **v1.0 (Current)**:
  - Initial Production Refactor.
  - Complete Mobile Responsive Design overhauled (Flex mappings & Typography normalization).
  - Codebase extensively commented leveraging Clean Code readability protocols.
  - Performance improvements across React States.
- **v0.5.x**:
  - Implementation of Timers, API links, Django randomization functionality.
- **v0.1.x**:
  - Fundamental UI mocks and layout drafts.

## 👥 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/)