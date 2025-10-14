/**
 * QUESTIONNAIRE DATA NORMALIZATION
 * Converts UI-friendly strings to calculation-compatible format
 * 
 * Purpose: Bridge the gap between user-facing UI labels and backend calculation logic
 * All normalization functions are case-insensitive and handle missing values gracefully
 */

import { Questionnaire } from '@prisma/client'

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalize Physical Activity
 * UI sends: "Sedentary (minimal exercise)", "Light (occasional walks)", etc.
 * Calculation needs: "sedentary", "light", "moderate", "active", "very_active"
 */
export function normalizePhysicalActivity(value: string | null | undefined): string {
  if (!value) return 'sedentary'
  
  const normalized = value.toLowerCase().trim()
  
  const mapping: Record<string, string> = {
    'sedentary (minimal exercise)': 'sedentary',
    'light (occasional walks)': 'light',
    'moderate (regular exercise)': 'moderate',
    'active (frequent exercise)': 'active',
    'very active (yoga, meditation)': 'very_active'
  }
  
  return mapping[normalized] || 'sedentary'
}

/**
 * Normalize Work-Life Balance
 * UI sends: "Perfect integration of work and practice", "Excellent balance", etc.
 * Calculation needs: "excellent", "good", "struggle"
 */
export function normalizeWorkLifeBalance(value: string | null | undefined): string {
  if (!value) return 'good'
  
  const normalized = value.toLowerCase().trim()
  
  // Map to 3 categories: excellent, good, struggle
  const excellentPatterns = ['perfect integration', 'excellent balance']
  const goodPatterns = ['good boundaries', 'sometimes struggle but generally good']
  const strugglePatterns = ['work dominates', 'struggling to find balance']
  
  if (excellentPatterns.some(pattern => normalized.includes(pattern))) {
    return 'excellent'
  }
  
  if (strugglePatterns.some(pattern => normalized.includes(pattern))) {
    return 'struggle'
  }
  
  if (goodPatterns.some(pattern => normalized.includes(pattern))) {
    return 'good'
  }
  
  return 'good' // Default
}

/**
 * Normalize Stress Response
 * UI sends: "Usually manage well", "Observe and let go", "Get overwhelmed easily", etc.
 * Calculation needs: "manage_well", "observe_let_go", "usually_manage", "overwhelmed"
 */
export function normalizeStressResponse(value: string | null | undefined): string {
  if (!value) return 'usually_manage'
  
  const normalized = value.toLowerCase().trim()
  
  const mapping: Record<string, string> = {
    'observe and let go': 'observe_let_go',
    'usually manage well': 'manage_well',
    'take deep breaths and calm down': 'usually_manage',
    'talk to someone': 'usually_manage',
    'get overwhelmed easily': 'overwhelmed',
    'react emotionally': 'overwhelmed'
  }
  
  return mapping[normalized] || 'usually_manage'
}

/**
 * Normalize Decision Making
 * UI sends: "Balanced approach", "Intuitive with mindful consideration", etc.
 * Calculation needs: "intuitive_mindful", "mindful", "balanced", "overthink"
 */
export function normalizeDecisionMaking(value: string | null | undefined): string {
  if (!value) return 'balanced'
  
  const normalized = value.toLowerCase().trim()
  
  const mapping: Record<string, string> = {
    'intuitive with mindful consideration': 'intuitive_mindful',
    'balanced approach': 'balanced',
    'careful analysis': 'mindful',
    'ask for advice': 'balanced',
    'impulsive decisions': 'balanced',
    'overthink everything': 'overthink'
  }
  
  return mapping[normalized] || 'balanced'
}

/**
 * Normalize Thought Patterns
 * UI sends: "Peaceful and accepting", "Anxious and scattered", etc.
 * Calculation needs: "peaceful", "anxious", "neutral"
 */
export function normalizeThoughtPatterns(value: string | null | undefined): string {
  if (!value) return 'neutral'
  
  const normalized = value.toLowerCase().trim()
  
  // Map to 3 categories: peaceful, anxious, neutral
  if (normalized.includes('peaceful')) {
    return 'peaceful'
  }
  
  if (normalized.includes('anxious') || normalized.includes('scattered') || 
      normalized.includes('negative') || normalized.includes('pessimistic')) {
    return 'anxious'
  }
  
  return 'neutral' // Default for mixed, positive, optimistic, etc.
}

/**
 * Normalize Daily Mindfulness
 * UI sends: "Constant awareness and presence", "Try to be mindful but forget", etc.
 * Calculation needs: "constant", "try_to_be", "autopilot"
 */
export function normalizeMindfulnessInDailyLife(value: string | null | undefined): string {
  if (!value) return 'try_to_be'
  
  const normalized = value.toLowerCase().trim()
  
  const mapping: Record<string, string> = {
    'constant awareness and presence': 'constant',
    'regular mindful moments': 'try_to_be',
    'try to be mindful but forget': 'try_to_be',
    'occasionally remember to be present': 'try_to_be',
    'always distracted and multitasking': 'autopilot',
    'live on autopilot': 'autopilot'
  }
  
  return mapping[normalized] || 'try_to_be'
}

/**
 * Normalize Social Connections
 * UI sends: "Deep, meaningful relationships", "Few but close relationships", etc.
 * Calculation needs: "deep_meaningful", "few_but_close", "good", "average", "mostly_isolated"
 */
export function normalizeSocialConnections(value: string | null | undefined): string {
  if (!value) return 'average'
  
  const normalized = value.toLowerCase().trim()
  
  const mapping: Record<string, string> = {
    'deep, meaningful relationships': 'deep_meaningful',
    'strong support network': 'deep_meaningful', // Map to same high category
    'good friends and family relationships': 'good',
    'few but close relationships': 'few_but_close',
    'superficial social media connections': 'average',
    'mostly isolated': 'mostly_isolated'
  }
  
  return mapping[normalized] || 'average'
}

// ============================================================================
// MASTER NORMALIZATION FUNCTION
// ============================================================================

/**
 * Normalize entire questionnaire object
 * Applies all normalization functions to questionnaire data
 * 
 * @param questionnaire - Raw questionnaire data from UI/API
 * @returns Normalized questionnaire ready for happiness calculation
 */
export function normalizeQuestionnaire(questionnaire: Partial<Questionnaire>): Partial<Questionnaire> {
  return {
    ...questionnaire,
    // Normalize string fields that need conversion
    physicalActivity: questionnaire.physicalActivity 
      ? normalizePhysicalActivity(questionnaire.physicalActivity)
      : null,
    
    workLifeBalance: questionnaire.workLifeBalance 
      ? normalizeWorkLifeBalance(questionnaire.workLifeBalance)
      : null,
    
    stressResponse: questionnaire.stressResponse 
      ? normalizeStressResponse(questionnaire.stressResponse)
      : null,
    
    decisionMaking: questionnaire.decisionMaking 
      ? normalizeDecisionMaking(questionnaire.decisionMaking)
      : null,
    
    thoughtPatterns: questionnaire.thoughtPatterns 
      ? normalizeThoughtPatterns(questionnaire.thoughtPatterns)
      : null,
    
    mindfulnessInDailyLife: questionnaire.mindfulnessInDailyLife 
      ? normalizeMindfulnessInDailyLife(questionnaire.mindfulnessInDailyLife)
      : null,
    
    socialConnections: questionnaire.socialConnections 
      ? normalizeSocialConnections(questionnaire.socialConnections)
      : null
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a normalized value is valid for a specific field
 * Useful for testing and debugging
 */
export function isValidNormalizedValue(field: string, value: string): boolean {
  const validValues: Record<string, string[]> = {
    physicalActivity: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    workLifeBalance: ['excellent', 'good', 'struggle'],
    stressResponse: ['observe_let_go', 'manage_well', 'usually_manage', 'overwhelmed'],
    decisionMaking: ['intuitive_mindful', 'mindful', 'balanced', 'overthink'],
    thoughtPatterns: ['peaceful', 'anxious', 'neutral'],
    mindfulnessInDailyLife: ['constant', 'try_to_be', 'autopilot'],
    socialConnections: ['deep_meaningful', 'few_but_close', 'good', 'average', 'mostly_isolated']
  }
  
  return validValues[field]?.includes(value) || false
}

/**
 * Get all valid normalized values for a field
 * Useful for documentation and testing
 */
export function getValidValues(field: string): string[] {
  const validValues: Record<string, string[]> = {
    physicalActivity: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    workLifeBalance: ['excellent', 'good', 'struggle'],
    stressResponse: ['observe_let_go', 'manage_well', 'usually_manage', 'overwhelmed'],
    decisionMaking: ['intuitive_mindful', 'mindful', 'balanced', 'overthink'],
    thoughtPatterns: ['peaceful', 'anxious', 'neutral'],
    mindfulnessInDailyLife: ['constant', 'try_to_be', 'autopilot'],
    socialConnections: ['deep_meaningful', 'few_but_close', 'good', 'average', 'mostly_isolated']
  }
  
  return validValues[field] || []
}

// ============================================================================
// LOGGING & DEBUGGING
// ============================================================================

/**
 * Log normalization for debugging purposes
 * Can be used in development to track what's being converted
 */
export function logNormalization(field: string, original: string, normalized: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Normalization] ${field}:`, {
      original,
      normalized,
      isValid: isValidNormalizedValue(field, normalized)
    })
  }
}
