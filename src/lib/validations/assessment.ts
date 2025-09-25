import { z } from 'zod';

// Questionnaire Validation Schema (27 Questions)
export const QuestionnaireSchema = z.object({
  // Phase 1: Demographics & Background
  experienceLevel: z.number().min(1).max(10),
  mainGoals: z.array(z.string()).min(1, "At least one goal must be selected"),
  ageRange: z.string().min(1, "Age range is required"),
  location: z.string().min(1, "Location is required"),
  occupation: z.string().min(1, "Occupation is required"),
  educationLevel: z.string().min(1, "Education level is required"),
  meditationBackground: z.string().min(1, "Meditation background is required"),

  // Phase 2: Lifestyle Patterns
  sleepPattern: z.number().min(1).max(10),
  physicalActivity: z.string().min(1, "Physical activity level is required"),
  stressTrigers: z.array(z.string()).min(1, "At least one stress trigger must be selected"),
  dailyRoutine: z.string().min(1, "Daily routine is required"),
  dietPattern: z.string().min(1, "Diet pattern is required"),
  screenTime: z.string().min(1, "Screen time is required"),
  socialConnections: z.string().min(1, "Social connections is required"),
  workLifeBalance: z.string().min(1, "Work life balance is required"),

  // Phase 3: Thinking Patterns
  emotionalAwareness: z.number().min(3).max(9),
  stressResponse: z.string().min(1, "Stress response is required"),
  decisionMaking: z.string().min(1, "Decision making is required"),
  selfReflection: z.string().min(1, "Self reflection is required"),
  thoughtPatterns: z.string().min(1, "Thought patterns is required"),
  mindfulnessInDailyLife: z.string().min(1, "Mindfulness in daily life is required"),

  // Phase 4: Mindfulness Specific
  mindfulnessExperience: z.number().min(1).max(8),
  meditationBackgroundDetail: z.string().min(1, "Meditation background detail is required"),
  practiceGoals: z.string().min(1, "Practice goals is required"),
  preferredDuration: z.string().min(1, "Preferred duration is required"),
  biggestChallenges: z.string().min(1, "Biggest challenges is required"),
  motivation: z.string().min(1, "Motivation is required"),
});

// Self Assessment Validation Schema (6 Categories)
export const SelfAssessmentSchema = z.object({
  type: z.enum(['initial', 'mid', 'final']),
  foodTaste: z.enum(['none', 'some', 'strong']),
  scentsAromas: z.enum(['none', 'some', 'strong']),
  soundsMusic: z.enum(['none', 'some', 'strong']),
  visualBeauty: z.enum(['none', 'some', 'strong']),
  touchTextures: z.enum(['none', 'some', 'strong']),
  thoughtsImages: z.enum(['none', 'some', 'strong']),
});

// Scoring helper for Self Assessment
export const calculateSelfAssessmentScore = (assessment: {
  foodTaste: string;
  scentsAromas: string;
  soundsMusic: string;
  visualBeauty: string;
  touchTextures: string;
  thoughtsImages: string;
}) => {
  const scoreMap = {
    'none': 12,    // "I don't have particular preferences for this"
    'some': -7,    // "I have some preferences, but I'm flexible"
    'strong': -15  // "I have strong preferences and specific likes/dislikes"
  };

  const scores = [
    scoreMap[assessment.foodTaste as keyof typeof scoreMap],
    scoreMap[assessment.scentsAromas as keyof typeof scoreMap],
    scoreMap[assessment.soundsMusic as keyof typeof scoreMap],
    scoreMap[assessment.visualBeauty as keyof typeof scoreMap],
    scoreMap[assessment.touchTextures as keyof typeof scoreMap],
    scoreMap[assessment.thoughtsImages as keyof typeof scoreMap],
  ];

  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  
  return {
    individualScores: {
      foodTaste: scores[0],
      scentsAromas: scores[1],
      soundsMusic: scores[2],
      visualBeauty: scores[3],
      touchTextures: scores[4],
      thoughtsImages: scores[5],
    },
    totalScore,
    interpretation: totalScore > 0 ? 'Low Attachment' : 
                   totalScore > -50 ? 'Moderate Attachment' : 
                   'High Attachment'
  };
};

export type QuestionnaireInput = z.infer<typeof QuestionnaireSchema>;
export type SelfAssessmentInput = z.infer<typeof SelfAssessmentSchema>;