export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface OptionResponse {
  id: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuestionResponse {
  id: string;
  examId: string;
  creatorId: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderIndex: number;
  explanation?: string;
  options: OptionResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicOptionResponse {
  id: string;
  optionText: string;
  orderIndex: number;
}

export interface PublicQuestionResponse {
  id: string;
  examId: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderIndex: number;
  options: PublicOptionResponse[];
}

export interface QuestionAnswerKeyItem {
  questionId: string;
  questionType: QuestionType;
  points: number;
  orderIndex: number;
  explanation?: string;
  correctOptionIds: string[];
  correctOptions: OptionResponse[];
}

export interface ExamAnswerKeyResponse {
  examId: string;
  totalQuestions: number;
  totalPoints: number;
  questions: QuestionAnswerKeyItem[];
}

export interface OptionRequest {
  id?: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface CreateQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderIndex?: number;
  explanation?: string;
  options: OptionRequest[];
}

export interface UpdateQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderIndex?: number;
  explanation?: string;
  options: OptionRequest[];
}

