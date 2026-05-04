
export enum AppMode {
  Study = 'study',
  Quiz = 'quiz',
  Practice = 'practice',
}

export interface Standard {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
}

export interface QuizQuestion {
    question: string;
    options?: string[]; // Empty for short-answer
    correctAnswer: string;
    explanation: string;
}
