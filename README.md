# 🎓 MCQMate

> **An interactive, full-stack Multiple-Choice Question (MCQ) platform designed for dynamic learning and randomized exam practice.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Django](https://img.shields.io/badge/Django-5-092E20?logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Hosted_on-Render-46E3B7?logo=render)

**MCQMate** is a responsive web application that helps students practice MCQs in a highly structured way. By selecting their specific Class, Subject, and Chapter, users get a uniquely randomized set of questions. The built-in timer and instant analytics encourage active learning and better time management.

🌍 **Live Demo:** [Click here to visit MCQMate]([https://mcq-mate-fy8h.vercel.app/])  
🔗 **Backend API Endpoint:** [Render API Link]([https://mcq-mate-backend.onrender.com/api/])

---

## ✨ Key Features

- **Dynamic Navigation:** Hierarchical data selection (Level ➔ Subject ➔ Chapter).
- **Randomized Question Engine:** Fetches a uniquely shuffled set of questions from the backend every time an exam starts.
- **Smart Timer & Auto-Submit:** Exams are strictly timed and will automatically submit when the clock runs out.
- **Instant Result Analytics:** Displays a detailed scorecard showing total score, correct/wrong answers, and a comprehensive breakdown of the exam.
- **Super Responsive UI:** Beautifully crafted with Tailwind CSS to ensure a seamless experience on mobile phones, tablets, and desktop screens.
- **Admin Dashboard:** Fully configured Django (Jazzmin) admin panel for easy content management and JSON uploads.

---

## ⚡ Tech Stack

### Frontend
- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

### Backend
- **Framework:** Django & Django REST Framework
- **Database:** PostgreSQL (Hosted on Neon.tech)
- **Deployment:** Render (with Gunicorn & Whitenoise)

---

## 🚀 Local Development Setup

If you want to run this project locally, follow these steps:

### 1. Clone the Repository
```bash
git clone [https://github.com/jihad-islam/MCQ-Mate.git](https://github.com/jihad-islam/MCQ-Mate.git)
cd MCQ-Mate
```

### 2. Backend Setup (Django)
Open a terminal and navigate to the `backend` folder:
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your database variables
# DEBUG=True
# DATABASE_URL=your_neon_postgres_url

# Run migrations and start server
python manage.py migrate
python manage.py runserver
```
*The backend API will run on `http://127.0.0.1:8000/`*

### 3. Frontend Setup (Next.js)
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend

# Install Node modules
npm install

# Create a .env.local file and link the API
# NEXT_PUBLIC_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

# Start the development server
npm run dev
```
*The frontend UI will run on `http://localhost:3000/`*

---

## 👨‍💻 Developed By

**Md. Jihad Islam** GitHub: [@jihad-islam](https://github.com/jihad-islam)

---

## 📄 License
This project is open-source and available under the [MIT License](https://choosealicense.com/licenses/mit/).