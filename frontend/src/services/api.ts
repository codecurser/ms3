import { 
  CreateQuestionRequest, 
  UpdateQuestionRequest, 
  QuestionResponse, 
  PublicQuestionResponse, 
  ExamAnswerKeyResponse 
} from '../types/question';

const QUESTION_API_BASE = import.meta.env.VITE_QUESTION_API_BASE || 'http://localhost:8083/api/v1';
const EXAM_API_BASE = import.meta.env.VITE_EXAM_API_BASE || 'https://ms2-w51n.onrender.com/api/v1';
const AUTH_API_BASE = import.meta.env.VITE_AUTH_API_BASE || 'https://microservice-based-examination-1.onrender.com/api/v1/auth';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

export const getStoredUserEmail = () => localStorage.getItem('user_email') || 'creator@examportal.com';
export const setStoredUserEmail = (email: string) => localStorage.setItem('user_email', email);

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    if (res.status === 401) {
      console.warn('Unauthorized (401), session expired');
      removeAuthToken();
      window.location.href = '/login';
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || (res.status === 403 ? 'Access forbidden (403)' : 'API request failed'));
  }
  return res.json();
};

export const api = {
  // MS1: Auth
  login: async (credentials: { email?: string; username?: string; password: string }) => {
    const payload = credentials.email 
      ? { email: credentials.email, password: credentials.password } 
      : { email: credentials.username, password: credentials.password };
      
    const res = await fetch(`${AUTH_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // MS2: Exams (Helper to fetch user's exams to select from)
  getExams: async () => {
    const token = getAuthToken();
    const res = await fetch(`${EXAM_API_BASE}/exams`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(res);
  },

  // MS3: Questions (Creator Protected)
  getQuestionsForExam: async (examId: string): Promise<QuestionResponse[]> => {
    const token = getAuthToken();
    const res = await fetch(`${QUESTION_API_BASE}/exams/${examId}/questions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(res);
  },

  getQuestionById: async (questionId: string): Promise<QuestionResponse> => {
    const token = getAuthToken();
    const res = await fetch(`${QUESTION_API_BASE}/questions/${questionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(res);
  },

  createQuestion: async (examId: string, data: CreateQuestionRequest): Promise<QuestionResponse> => {
    const token = getAuthToken();
    const res = await fetch(`${QUESTION_API_BASE}/exams/${examId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateQuestion: async (questionId: string, data: UpdateQuestionRequest): Promise<QuestionResponse> => {
    const token = getAuthToken();
    const res = await fetch(`${QUESTION_API_BASE}/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    const token = getAuthToken();
    const res = await fetch(`${QUESTION_API_BASE}/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete question');
    }
  },

  // MS3: Public Student View (Sanitized without isCorrect)
  getPublicQuestions: async (examId: string): Promise<PublicQuestionResponse[]> => {
    const res = await fetch(`${QUESTION_API_BASE}/public/exams/${examId}/questions`);
    return handleResponse(res);
  },

  // MS3: Internal Grading View (MS4)
  getAnswerKey: async (examId: string): Promise<ExamAnswerKeyResponse> => {
    const res = await fetch(`${QUESTION_API_BASE}/internal/exams/${examId}/answer-key`);
    return handleResponse(res);
  }
};
