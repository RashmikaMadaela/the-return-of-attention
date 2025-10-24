"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const happiness_calculation_1 = require("../src/lib/business-logic/happiness-calculation");
// Helper to create ISO date string offset by days
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
// Minimal mocks matching expected shapes (use any to avoid strict typing issues)
const makeQuestionnaire = (overrides = {}) => ({
    emotionalAwareness: 1,
    sleepPattern: 5,
    physicalActivity: 'sedentary',
    workLifeBalance: 'fair',
    stressResponse: 'usually_manage',
    experienceLevel: 1,
    mindfulnessExperience: 1,
    decisionMaking: 'balanced',
    mindfulnessInDailyLife: 'try_to_be',
    socialConnections: 'average',
    motivation: 'neutral',
    ...overrides
});
const makeSelfAssessment = (overrides = {}) => ({
    foodTaste: 'some',
    scentsAromas: 'some',
    soundsMusic: 'some',
    visualBeauty: 'some',
    touchTextures: 'some',
    thoughtsImages: 'some',
    ...overrides
});
const makeSession = (overrides = {}) => ({
    id: Math.random().toString(36).slice(2, 9),
    status: 'completed',
    duration: 20, // minutes
    createdAt: daysAgo(1),
    qualityRating: 3,
    sessionType: 'meditation',
    ...overrides
});
const makeDailyNote = (mood, daysOffset = 0) => ({
    id: Math.random().toString(36).slice(2, 9),
    moodRating: mood,
    createdAt: daysAgo(daysOffset)
});
function runScenario(name, questionnaire, selfAssessment, sessions, pahmSessions, stageProgress, dailyNotes) {
    console.log('\n=== Scenario:', name, '===');
    const result = (0, happiness_calculation_1.calculateHappinessScore)(questionnaire, selfAssessment, sessions, pahmSessions, stageProgress, dailyNotes);
    console.log('Components:');
    console.log(JSON.stringify(result.components, null, 2));
    console.log('Final Score:', result.finalScore);
    console.log('User Level:', result.userLevel);
}
// Scenario 1: Baseline user (low values)
const q1 = makeQuestionnaire();
const sa1 = makeSelfAssessment();
const s1 = [];
const p1 = [];
const stages1 = [];
const notes1 = [makeDailyNote(5, 3), makeDailyNote(5, 10)];
runScenario('Baseline - neutral', q1, sa1, s1, p1, stages1, notes1);
// Scenario 2: Intermediate progress (some sessions, better self-assessment)
const q2 = makeQuestionnaire({
    emotionalAwareness: 6,
    sleepPattern: 7,
    physicalActivity: 'moderate',
    workLifeBalance: 'good',
    stressResponse: 'manage_well',
    experienceLevel: 4,
    mindfulnessExperience: 3,
    decisionMaking: 'mindful',
    mindfulnessInDailyLife: 'try_to_be',
    socialConnections: 'good',
    motivation: 'somewhat_motivated'
});
const sa2 = makeSelfAssessment({
    foodTaste: 'none',
    scentsAromas: 'some',
    soundsMusic: 'some',
    visualBeauty: 'none',
    touchTextures: 'some',
    thoughtsImages: 'some'
});
const sessions2 = Array.from({ length: 20 }).map((_, i) => makeSession({ duration: 25, createdAt: daysAgo(i + 1), qualityRating: 4 }));
const pahmSessions2 = sessions2.map(s => ({ ...s, session: s }));
const stages2 = [];
const notes2 = [makeDailyNote(7, 1), makeDailyNote(6, 3), makeDailyNote(8, 10)];
runScenario('Intermediate - building practice', q2, sa2, sessions2, pahmSessions2, stages2, notes2);
// Scenario 3: Advanced user (lots of practice, high quality, strong self-assessment)
const q3 = makeQuestionnaire({
    emotionalAwareness: 9,
    sleepPattern: 9,
    physicalActivity: 'very_active',
    workLifeBalance: 'excellent',
    stressResponse: 'observe_let_go',
    experienceLevel: 9,
    mindfulnessExperience: 8,
    decisionMaking: 'intuitive_mindful',
    mindfulnessInDailyLife: 'constant',
    socialConnections: 'deep_meaningful',
    motivation: 'very_motivated'
});
const sa3 = makeSelfAssessment({
    foodTaste: 'none',
    scentsAromas: 'none',
    soundsMusic: 'none',
    visualBeauty: 'none',
    touchTextures: 'none',
    thoughtsImages: 'none'
});
const sessions3 = Array.from({ length: 250 }).map((_, i) => makeSession({ duration: 45, createdAt: daysAgo(i % 60), qualityRating: 5 }));
const pahmSessions3 = sessions3.map(s => ({ ...s, session: s }));
const stages3 = [];
const notes3 = [makeDailyNote(9, 1), makeDailyNote(8, 2), makeDailyNote(9, 5), makeDailyNote(8, 10), makeDailyNote(9, 15)];
runScenario('Advanced - high practice & quality', q3, sa3, sessions3, pahmSessions3, stages3, notes3);
console.log('\nTests completed.');
