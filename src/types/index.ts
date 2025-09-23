// User types
export interface UserProfile {
  id: string;
  userId: string;
  fullName?: string;
  dateOfBirth?: Date;
  gender?: string;
  location?: string;
  phoneNumber?: string;
  timezone?: string;
  preferredSessionTime?: string;
  notificationsEnabled: boolean;
  reminderFrequency?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Session types
export interface MeditationSessionData {
  id: string;
  userId: string;
  stageId: string;
  sessionType: 'timer' | 'pahm';
  duration: number;
  completedAt?: Date;
  isCompleted: boolean;
  notes?: string;
  mood?: string;
  focusRating?: number;
  enjoymentRating?: number;
}

// PAHM types
export interface PAHMSessionData {
  id: string;
  userId: string;
  sessionId: string;
  matrixType: string;
  totalClicks: number;
  sessionData: any;
}

export interface PAHMClick {
  position: { row: number; col: number };
  timestamp: Date;
  orderIndex: number;
}

export interface PAHMMatrix {
  rows: number;
  cols: number;
  clicks: PAHMClick[];
}

// Assessment types
export interface QuestionnaireAnswer {
  questionId: string;
  answer: any;
  answeredAt: Date;
}

export interface SelfAssessmentData {
  category: string;
  ratings: Record<string, number>;
  notes?: string;
}

// Stage progression types
export interface StageData {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  requirements: any;
  isActive: boolean;
}

export interface ProgressData {
  currentStage: number;
  completedSessions: number;
  totalSessionTime: number;
  streakDays: number;
  happinessScore: number;
}

// Daily notes types
export interface DailyNoteData {
  date: Date;
  emojiMood?: string;
  detailedNotes?: string;
  emotions?: Array<{ emotion: string; intensity: number }>;
  gratitude?: string;
  insights?: string;
}

// Happiness calculation types
export interface HappinessComponents {
  physicalHealth: number;
  mentalClarity: number;
  emotionalBalance: number;
  socialConnections: number;
  personalGrowth: number;
  lifeBalance: number;
  mindfulness: number;
  overallSatisfaction: number;
}

export interface HappinessScore {
  totalScore: number;
  components: HappinessComponents;
  calculatedAt: Date;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: ValidationError[];
  success: boolean;
}