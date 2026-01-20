/**
 * COMPREHENSIVE VALIDATION SCHEMAS
 * Centralized validation for all API endpoints using Zod
 * Ensures consistency across the entire backend system
 */

import { z } from 'zod'

// ============================================================================
// AUTHENTICATION VALIDATION SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address')
})

// ============================================================================
// USER PROFILE VALIDATION SCHEMAS
// ============================================================================

export const personalInfoSchema = z.object({
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Age cannot exceed 120'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  nationality: z.string().min(1, 'Nationality is required'),
  country: z.string().min(1, 'Country is required')
})

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal(''))
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// ============================================================================
// QUESTIONNAIRE VALIDATION SCHEMA (27 FIELDS)
// ============================================================================

export const questionnaireSchema = z.object({
  // Phase 1: Demographics & Background (7 fields)
  experienceLevel: z.number().int().min(1).max(10), // Updated: 1-10 scale
  mainGoals: z.array(z.string()).min(1, 'Select at least one goal'),
  ageRange: z.string().min(1, 'Age range is required'),
  location: z.string().min(1, 'Location is required'),
  occupation: z.string().min(1, 'Occupation is required'),
  educationLevel: z.string().min(1, 'Education level is required'),
  meditationBackground: z.string().min(1, 'Meditation background is required'),
  
  // Phase 2: Lifestyle Patterns (8 fields)
  sleepPattern: z.number().int().min(1).max(10), // Updated: 1-10 scale
  physicalActivity: z.string().min(1, 'Physical activity level is required'),
  stressTrigers: z.array(z.string()).min(1, 'Select at least one stress trigger'),
  dailyRoutine: z.string().min(1, 'Daily routine description is required'),
  dietPattern: z.string().min(1, 'Diet pattern is required'),
  screenTime: z.string().min(1, 'Screen time is required'),
  socialConnections: z.string().min(1, 'Social connections description is required'),
  workLifeBalance: z.string().min(1, 'Work-life balance description is required'),
  
  // Phase 3: Thinking Patterns (6 fields)
  emotionalAwareness: z.number().int().min(1).max(10), // Updated: 1-10 scale (was 3-9)
  stressResponse: z.string().min(1, 'Stress response is required'),
  decisionMaking: z.string().min(1, 'Decision making style is required'),
  selfReflection: z.string().min(1, 'Self reflection frequency is required'),
  thoughtPatterns: z.string().min(1, 'Thought patterns description is required'),
  mindfulnessInDailyLife: z.string().min(1, 'Mindfulness practice description is required'),
  
  // Phase 4: Mindfulness Specific (6 fields)
  mindfulnessExperience: z.number().int().min(1).max(10), // Updated: 1-10 scale (was 1-8)
  meditationBackgroundDetail: z.string().min(1, 'Detailed meditation background is required'),
  practiceGoals: z.string().min(1, 'Practice goals are required'),
  preferredDuration: z.string().min(1, 'Preferred duration is required'),
  biggestChallenges: z.string().min(1, 'Biggest challenges selection is required'),
  motivation: z.string().min(1, 'Motivation is required')
})

// ============================================================================
// SELF-ASSESSMENT VALIDATION SCHEMA
// ============================================================================

export const selfAssessmentSchema = z.object({
  type: z.enum(['initial', 'mid', 'final']),
  foodTaste: z.enum(['none', 'some', 'strong']),
  scentsAromas: z.enum(['none', 'some', 'strong']),
  soundsMusic: z.enum(['none', 'some', 'strong']),
  visualBeauty: z.enum(['none', 'some', 'strong']),
  touchTextures: z.enum(['none', 'some', 'strong']),
  thoughtsImages: z.enum(['none', 'some', 'strong'])
})

// ============================================================================
// SESSION & STAGE VALIDATION SCHEMAS
// ============================================================================

export const sessionStartSchema = z.object({
  stageNumber: z.number().min(1).max(6),
  subStage: z.string().optional(), // 'T1', 'T2', etc. for Stage 1
  sessionType: z.enum(['timer_only', 'pahm_matrix', 'mind_recovery']),
  duration: z.number().min(1).max(120), // 1-120 minutes
  posture: z.enum(['sitting', 'cushion', 'half-lotus', 'lying', 'standing', 'full-lotus', 'burmese', 'seiza', 'other']).optional(),
  exerciseType: z.string().optional(), // For mind recovery exercises
  meditationBells: z.boolean().optional().default(true), // Audio: Meditation bells
  voiceCommands: z.boolean().optional().default(true), // Audio: Voice commands
  useRemote: z.boolean().optional().default(false) // Whether user uses a remote for PAHM sessions
})

export const sessionUpdateSchema = z.object({
  sessionId: z.string().cuid(),
  status: z.enum(['STARTED', 'AWAITING_REFLECTION', 'COMPLETED', 'NOT_COMPLETED', 'ABANDONED']).optional(),
  qualityRating: z.number().min(1).max(10).optional(),
  insights: z.string().max(1000).optional()
})

export const sessionCompleteSchema = z.object({
  sessionId: z.string().cuid(),
  // Optional duration fields: clients may send the planned duration or the actual practiced duration
  duration: z.number().min(0).optional(),
  actualDuration: z.number().min(0).optional(),
  shouldCountAsSession: z.boolean().optional(), // Whether session meets minimum duration requirement
  qualityRating: z.number().int().min(1).max(10).optional(),
  insights: z.string().max(1000).optional(),
  pahmData: z.object({
    patternNotes: z.string().max(500).optional(),
    totalClicks: z.number().int().min(0).optional(),
    clickData: z.array(z.object({
      position: z.string(),
      timestamp: z.string(),
      timeFromStart: z.number(),
      coordinates: z.object({
        x: z.number(),
        y: z.number()
      }).optional()
    })).optional()
  }).optional(),
  challenges: z.object({
    mindWandering: z.boolean().default(false),
    physicalDiscomfort: z.boolean().default(false),
    sleepiness: z.boolean().default(false),
    restlessness: z.boolean().default(false),
    strongEmotions: z.boolean().default(false),
    externalDistractions: z.boolean().default(false),
    notes: z.string().max(500).optional()
  }).optional()
})

export const pahmClickSchema = z.object({
  sessionId: z.string().cuid(),
  position: z.enum(['regret', 'past', 'nostalgia', 'dislikes', 'present', 'likes', 'worry', 'future', 'anticipation']),
  timestamp: z.string().datetime(),
  clickOrder: z.number().min(1)
})

// ============================================================================
// DAILY NOTES VALIDATION SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional().nullable()
})

export const dailyNoteSchema = z.object({
  type: z.enum(['emoji', 'detailed']),
  moodRating: z.number().min(1).max(10).optional(),
  emotion: z.string().optional(),
  intensity: z.number().min(1).max(10).optional(),
  context: z.string().max(1000).optional(),
  trigger: z.string().optional(),
  notes: z.string().max(2000).optional()
})

export const happinessCalculationSchema = z.object({
  // Component scores (aligned with documentation v3)
  currentStateScore: z.number().min(0).max(100),          // Component 1: 12%
  attachmentScore: z.number().min(0).max(100),            // Component 2: 20%
  pahmScore: z.number().min(0).max(100),                  // Component 3: 25% PRIMARY
  emotionalStabilityScore: z.number().min(0).max(100),    // Component 4: 18%
  mindRecoveryScore: z.number().min(0).max(100),          // Component 5: 8%
  emotionalRegulationScore: z.number().min(0).max(100),   // Component 6: 10%
  practiceConsistencyScore: z.number().min(0).max(100),   // Component 7: 3%
  socialConnectionScore: z.number().min(0).max(100),      // Component 8: 4%
  // STRICT mode metadata - both must be true for valid calculation
  questionnaireBased: z.boolean().default(false),
  selfAssessmentBased: z.boolean().default(false),
  practiceEnhanced: z.boolean().default(false)
})

// ============================================================================
// ADMIN VALIDATION SCHEMAS
// ============================================================================

export const adminUserSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['admin', 'super_admin']),
  permissions: z.array(z.string())
})

export const adminStatsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metric: z.enum(['users', 'sessions', 'happiness', 'assessments']).optional()
})

// ============================================================================
// PAGINATION & QUERY SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// ============================================================================
// UTILITY VALIDATION FUNCTIONS
// ============================================================================

export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errors = result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
  } catch (error) {
    return { success: false, errors: ['Invalid request format'] }
  }
}

export function createValidationResponse(errors: string[]) {
  return Response.json({
    success: false,
    message: 'Validation failed',
    errors
  }, { status: 400 })
}

// ============================================================================
// RESPONSE SCHEMAS FOR CONSISTENCY
// ============================================================================

export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.any().optional()
})

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.string()).optional(),
  code: z.string().optional()
})

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
export type QuestionnaireInput = z.infer<typeof questionnaireSchema>
export type SelfAssessmentInput = z.infer<typeof selfAssessmentSchema>
export type SessionStartInput = z.infer<typeof sessionStartSchema>
export type SessionCompleteInput = z.infer<typeof sessionCompleteSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type DailyNoteInput = z.infer<typeof dailyNoteSchema>
export type HappinessCalculationInput = z.infer<typeof happinessCalculationSchema>
export type PaginationInput = z.infer<typeof paginationSchema>