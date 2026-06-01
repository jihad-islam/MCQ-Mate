const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

export interface Level {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
  level: number;
}

export interface Chapter {
  id: number;
  name: string;
  subject: number;
  total_mcqs: number;
  is_free: boolean; // Freemium UI এর জন্য নতুন ফিল্ড add করা হলো
}

export interface Option {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  image_url?: string;
  board_reference?: string;
  chapter: number;
  chapter_name?: string;
  options: Option[];
}

export interface ExamSubmitPayload {
  served_question_ids: number[];
  answers: Array<{
    question_id: number;
    selected_option_id?: number | null;
  }>;
}

export interface ExamResult {
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  breakdown: Array<{
    question_id: number;
    correct_option_id: number;
    explanation: string | null;
  }>;
}

export async function fetchLevels(): Promise<Level[]> {
  const response = await fetch(`${API_BASE_URL}/levels/`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch levels');
  return response.json();
}

export async function fetchSubjectsByLevel(levelId: number): Promise<Subject[]> {
  const response = await fetch(`${API_BASE_URL}/subjects/`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch subjects');
  const subjects = await response.json();
  return subjects.filter((subject: Subject) => subject.level === levelId);
}

export async function fetchChaptersBySubject(subjectId: number): Promise<Chapter[]> {
  const response = await fetch(`${API_BASE_URL}/chapters/`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch chapters');
  const chapters = await response.json();
  return chapters.filter((chapter: Chapter) => chapter.subject === subjectId);
}

// UPDATE: Changed chapterId to chapterIds (string) to handle multiple chapters
export async function fetchQuestionsByChapter(chapterIds: string, limit?: number): Promise<Question[]> {
  const url = limit 
    ? `${API_BASE_URL}/questions/?chapterIds=${chapterIds}&mcqCount=${limit}`
    : `${API_BASE_URL}/questions/?chapterIds=${chapterIds}`;
  
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch questions');
  
  const data = await response.json();
  return (data && data.results) ? data.results : data;
}

export async function submitExam(payload: ExamSubmitPayload): Promise<ExamResult> {
  const response = await fetch(`${API_BASE_URL}/submit-exam/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) throw new Error('Failed to submit exam');
  return response.json();
}

// ==========================================
// PHASE 4: TRACKING & FEEDBACK APIs
// ==========================================

export interface ExamHistoryStats {
  avg_score: number;
  total_exams: number;
  total_questions: number;
}

export interface ExamHistoryItem {
  id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  wrong_question_ids: number[];
  created_at: string;
}

export interface BookmarkItem {
  id: number;
  question: Question;
  created_at: string;
}

// History Fetch API
export async function fetchUserHistory(token: string): Promise<{ stats: ExamHistoryStats, history: ExamHistoryItem[] }> {
  const response = await fetch(`${API_BASE_URL}/history/`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

// Bookmarks Fetch API
export async function fetchBookmarks(token: string): Promise<BookmarkItem[]> {
  const response = await fetch(`${API_BASE_URL}/bookmarks/`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Failed to fetch bookmarks');
  return response.json();
}

// Toggle Bookmark API
export async function toggleBookmark(token: string, questionId: number): Promise<{ message: string, is_bookmarked: boolean }> {
  const response = await fetch(`${API_BASE_URL}/bookmarks/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question_id: questionId })
  });
  if (!response.ok) throw new Error('Failed to toggle bookmark');
  return response.json();
}

// Submit Feedback API
export async function submitFeedback(token: string, payload: { question: number, issue_type: string, message?: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/feedback/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Failed to submit feedback');
  return response.json();
}