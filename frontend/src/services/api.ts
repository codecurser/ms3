import { 
  CreateQuestionRequest, 
  UpdateQuestionRequest, 
  QuestionResponse, 
  PublicQuestionResponse, 
  ExamAnswerKeyResponse 
} from '../types/question';

export const getQuestionApiBase = () => {
  const custom = localStorage.getItem('question_api_base');
  if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  return (import.meta.env.VITE_QUESTION_API_BASE || 'https://ms3-1.onrender.com/api/v1').replace(/\/+$/, '');
};

export const setQuestionApiBase = (url: string) => {
  localStorage.setItem('question_api_base', url.trim().replace(/\/+$/, ''));
};

export const getExamApiBase = () => {
  const custom = localStorage.getItem('exam_api_base');
  if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  return (import.meta.env.VITE_EXAM_API_BASE || 'https://ms2-w51n.onrender.com/api/v1').replace(/\/+$/, '');
};

export const getAuthApiBase = () => {
  const custom = localStorage.getItem('auth_api_base');
  if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  return (import.meta.env.VITE_AUTH_API_BASE || 'https://microservice-based-examination-1.onrender.com/api/v1/auth').replace(/\/+$/, '');
};

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

export const getStoredUserEmail = () => localStorage.getItem('user_email') || 'creator@examportal.com';
export const setStoredUserEmail = (email: string) => localStorage.setItem('user_email', email);

const safeFetch = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
      if (window.location.protocol === 'https:' && isLocal) {
        throw new Error(`Browser blocked request to local backend (${url}) due to HTTPS mixed-content. Please enter your Render backend URL in the API settings bar.`);
      }
      throw new Error(`Cannot reach ${url}. If using Render free tier, the backend may take 40-50s to wake up from cold sleep.`);
    }
    throw err;
  }
};

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
  // Health check
  checkHealth: async (baseUrl: string) => {
    const rootUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
    const res = await safeFetch(`${rootUrl}/health`);
    return handleResponse(res);
  },

  // MS1: Auth
  login: async (credentials: { email?: string; username?: string; password: string }) => {
    const payload = credentials.email 
      ? { email: credentials.email, password: credentials.password } 
      : { email: credentials.username, password: credentials.password };
      
    const res = await safeFetch(`${getAuthApiBase()}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // MS2: Exams (Helper to fetch user's exams to select from)
  getExams: async () => {
    const token = getAuthToken();
    const res = await safeFetch(`${getExamApiBase()}/exams`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(res);
  },

  // MS3: Questions (Creator Protected)
  getQuestionsForExam: async (examId: string): Promise<QuestionResponse[]> => {
    const token = getAuthToken();
    const res = await safeFetch(`${getQuestionApiBase()}/exams/${examId}/questions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(res);
  },

  getQuestionById: async (questionId: string): Promise<QuestionResponse> => {
    const token = getAuthToken();
    const res = await safeFetch(`${getQuestionApiBase()}/questions/${questionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(res);
  },

  createQuestion: async (examId: string, data: CreateQuestionRequest): Promise<QuestionResponse> => {
    const token = getAuthToken();
    const res = await safeFetch(`${getQuestionApiBase()}/exams/${examId}/questions`, {
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
    const res = await safeFetch(`${getQuestionApiBase()}/questions/${questionId}`, {
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
    const res = await safeFetch(`${getQuestionApiBase()}/questions/${questionId}`, {
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
    const res = await safeFetch(`${getQuestionApiBase()}/public/exams/${examId}/questions`);
    return handleResponse(res);
  },

  // MS3: Internal Grading View (MS4)
  getAnswerKey: async (examId: string): Promise<ExamAnswerKeyResponse> => {
    const res = await safeFetch(`${getQuestionApiBase()}/internal/exams/${examId}/answer-key`);
    return handleResponse(res);
  }
};
