import { z } from 'zod';

// Valid emotion options for dropdown
const emotionOptions = [
  // Positive emotions
  'happy', 'peaceful', 'grateful', 'excited', 'loved', 'confident', 
  'content', 'joyful', 'calm', 'hopeful',
  // Negative emotions  
  'anxious', 'angry', 'sad', 'fearful', 'frustrated', 'guilty', 
  'ashamed', 'overwhelmed', 'stressed', 'lonely',
  // Neutral emotions
  'curious', 'focused', 'alert', 'contemplative', 'balanced', 
  'thoughtful', 'reflective', 'present'
] as const;

// Valid trigger options for dropdown
const triggerOptions = [
  // Work
  'work_stress', 'work_success', 'work_conflict', 'work_deadline', 'work_meeting',
  // Relationships
  'family_interaction', 'friend_connection', 'romantic_relationship', 'social_event', 'conflict_resolution',
  // Personal
  'meditation_practice', 'exercise', 'health_concern', 'achievement', 'personal_growth',
  // Daily Life
  'commute', 'weather', 'news', 'technology', 'routine_disruption',
  // Internal
  'thoughts', 'memories', 'physical_sensation', 'spiritual_experience', 'realization',
  // Other
  'financial_concern', 'time_pressure', 'decision_making', 'unexpected_event', 'creative_inspiration'
] as const;

// Quick emoji note validation
export const emojiNoteSchema = z.object({
  type: z.literal('emoji'),
  moodRating: z.number()
    .min(1, 'Mood rating must be at least 1')
    .max(10, 'Mood rating cannot exceed 10'),
  timestamp: z.string().datetime().optional(),
});

// Detailed emotion note validation (matching UI structure)
export const detailedNoteSchema = z.object({
  type: z.literal('detailed'),
  emotion: z.enum(emotionOptions, {
    message: 'Please select a valid emotion from the dropdown'
  }),
  intensity: z.number()
    .min(1, 'Intensity must be at least 1')
    .max(10, 'Intensity cannot exceed 10'),
  context: z.string()
    .max(500, 'Context description cannot exceed 500 characters')
    .optional(),
  trigger: z.enum(triggerOptions, {
    message: 'Please select a valid trigger option'
  }).optional(),
  timestamp: z.string().datetime().optional(),
});

// Combined note validation schema
export const dailyNoteSchema = z.discriminatedUnion('type', [
  emojiNoteSchema,
  detailedNoteSchema
]);

// Query parameters for notes history
export const notesHistoryQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  type: z.enum(['emoji', 'detailed']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  moodMin: z.coerce.number().min(1).max(10).optional(),
  moodMax: z.coerce.number().min(1).max(10).optional(),
  emotion: z.enum(emotionOptions).optional(),
  trigger: z.enum(triggerOptions).optional(),
});

// Helper functions for emotional analysis
export const getEmotionCategory = (emotion: string): 'positive' | 'negative' | 'neutral' => {
  const positiveEmotions = ['happy', 'peaceful', 'grateful', 'excited', 'loved', 'confident', 'content', 'joyful', 'calm', 'hopeful'];
  const negativeEmotions = ['anxious', 'angry', 'sad', 'fearful', 'frustrated', 'guilty', 'ashamed', 'overwhelmed', 'stressed', 'lonely'];
  
  if (positiveEmotions.includes(emotion)) return 'positive';
  if (negativeEmotions.includes(emotion)) return 'negative';
  return 'neutral';
};

export const getIntensityLabel = (intensity: number): 'mild' | 'moderate' | 'intense' => {
  if (intensity <= 3) return 'mild';
  if (intensity <= 6) return 'moderate';
  return 'intense';
};

export const getIntensityDisplayLabel = (intensity: number): string => {
  if (intensity <= 3) return 'Mild';
  if (intensity <= 6) return 'Moderate';
  return 'Intense';
};

// Recommended actions based on emotion and intensity
export const getRecommendedAction = (emotion: string, intensity: number): string => {
  const category = getEmotionCategory(emotion);
  const level = getIntensityLabel(intensity);
  
  if (category === 'negative') {
    if (level === 'intense') return 'guided_meditation';
    if (level === 'moderate') return 'breathing_exercise';
    return 'mindful_awareness';
  }
  
  if (category === 'positive') {
    return 'gratitude_practice';
  }
  
  return 'present_moment_awareness';
};

// TypeScript types
export type EmotionOption = typeof emotionOptions[number];
export type TriggerOption = typeof triggerOptions[number];
export type EmojiNoteData = z.infer<typeof emojiNoteSchema>;
export type DetailedNoteData = z.infer<typeof detailedNoteSchema>;
export type DailyNoteData = z.infer<typeof dailyNoteSchema>;
export type NotesHistoryQuery = z.infer<typeof notesHistoryQuerySchema>;