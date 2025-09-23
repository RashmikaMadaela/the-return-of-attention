import { z } from 'zod'

// User profile validation
export const userProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  timezone: z.string().optional(),
  preferredSessionTime: z.string().optional(),
  notificationsEnabled: z.boolean().default(true),
  reminderFrequency: z.enum(['daily', 'weekly', 'custom', 'none']).optional(),
})

// Authentication validation
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
})

// Session validation
export const meditationSessionSchema = z.object({
  stageId: z.string().cuid('Invalid stage ID'),
  sessionType: z.enum(['timer', 'pahm']),
  duration: z.number().min(30, 'Session must be at least 30 seconds').max(7200, 'Session cannot exceed 2 hours'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  mood: z.enum(['excited', 'happy', 'calm', 'neutral', 'tired', 'stressed', 'sad']).optional(),
  focusRating: z.number().min(1, 'Rating must be between 1-10').max(10, 'Rating must be between 1-10').optional(),
  enjoymentRating: z.number().min(1, 'Rating must be between 1-10').max(10, 'Rating must be between 1-10').optional(),
})

// PAHM session validation
export const pahmClickSchema = z.object({
  position: z.object({
    row: z.number().min(0).max(2),
    col: z.number().min(0).max(2),
  }),
  timestamp: z.date(),
  orderIndex: z.number().min(0),
})

export const pahmSessionSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
  matrixType: z.string().default('3x3'),
  clicks: z.array(pahmClickSchema),
})

// Questionnaire validation
export const questionnaireAnswerSchema = z.object({
  questionId: z.string().cuid('Invalid question ID'),
  answer: z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    z.boolean(),
  ]),
})

export const questionnaireSubmissionSchema = z.object({
  questionnaireId: z.string().cuid('Invalid questionnaire ID'),
  answers: z.array(questionnaireAnswerSchema),
})

// Self-assessment validation
export const selfAssessmentSchema = z.object({
  category: z.enum([
    'physical-health',
    'mental-clarity', 
    'emotional-balance',
    'social-connections',
    'personal-growth',
    'life-balance',
    'mindfulness',
    'overall-satisfaction'
  ]),
  ratings: z.record(z.string(), z.number().min(0).max(100)),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

// Daily notes validation
export const dailyNoteSchema = z.object({
  date: z.date(),
  emojiMood: z.string().optional(),
  detailedNotes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  emotions: z.array(z.object({
    emotion: z.string(),
    intensity: z.number().min(1).max(10),
  })).optional(),
  gratitude: z.string().max(500, 'Gratitude must be less than 500 characters').optional(),
  insights: z.string().max(500, 'Insights must be less than 500 characters').optional(),
})

// Happiness component validation
export const happinessComponentsSchema = z.object({
  physicalHealth: z.number().min(0).max(100),
  mentalClarity: z.number().min(0).max(100),
  emotionalBalance: z.number().min(0).max(100),
  socialConnections: z.number().min(0).max(100),
  personalGrowth: z.number().min(0).max(100),
  lifeBalance: z.number().min(0).max(100),
  mindfulness: z.number().min(0).max(100),
  overallSatisfaction: z.number().min(0).max(100),
})

// Admin validation
export const adminUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'moderator']).default('admin'),
  isActive: z.boolean().default(true),
})

// API response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

// Export types inferred from schemas
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type MeditationSessionInput = z.infer<typeof meditationSessionSchema>
export type PAHMSessionInput = z.infer<typeof pahmSessionSchema>
export type PAHMClickInput = z.infer<typeof pahmClickSchema>
export type QuestionnaireSubmissionInput = z.infer<typeof questionnaireSubmissionSchema>
export type SelfAssessmentInput = z.infer<typeof selfAssessmentSchema>
export type DailyNoteInput = z.infer<typeof dailyNoteSchema>
export type HappinessComponentsInput = z.infer<typeof happinessComponentsSchema>
export type AdminUserInput = z.infer<typeof adminUserSchema>
export type ApiResponseType = z.infer<typeof apiResponseSchema>