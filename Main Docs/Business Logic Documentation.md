# The Return of Attention - Business Logic Documentation

## 📋 Overview
This document defines the complete business logic, rules, workflows, and decision-making processes for "The Return of Attention" meditation application. It serves as the authoritative reference for implementing all core business functionality.

**Application**: The Return of Attention - PAHM Meditation App  
**Methodology**: Present Attention and Happiness Matrix (PAHM) by A.C. Amarasighe  
**Architecture**: Single-Point v3 Strict Mode  
**Target Users**: Meditation practitioners seeking lasting happiness through attention awareness

---

## 🎯 CORE BUSINESS RULES

### **1. User Journey Progression Rules**
- **Linear Progression**: Users must complete stages sequentially (no skipping)
- **Stage 1 Foundation**: Timer-only sessions building physical stillness
- **Stage 2+ Matrix**: Timer + PAHM Matrix for attention tracking
- **Unlock Conditions**: Previous stage completion + specific requirements
- **Minimum Practice**: Each stage has mandatory session/hour requirements

### **2. Session Completion Rules**
- **Stage 1**: Sessions complete when timer reaches zero
- **Stage 2+**: Sessions complete when timer reaches zero AND user has tracked attention
- **Quality Assessment**: Optional user self-rating (1-10 scale)
- **Progress Tracking**: All sessions count toward stage completion requirements
- **Data Persistence**: All session data saved for happiness calculation

### **3. Happiness Score Calculation Rules**
- **Mandatory Data**: Both questionnaire AND self-assessment required
- **Enhancement Data**: Practice sessions enhance but don't enable calculation
- **Recalculation**: Score updates when new assessment or session data available
- **Score Range**: 0-100 with user level assignment
- **Weighted Components**: 8 components with specific weight percentages

---

## 🔄 BUSINESS WORKFLOWS

## **WORKFLOW 1: User Onboarding & Setup**

### **Step 1: Initial Registration**
```
User Registration → Email Verification → Profile Creation
```

**Business Rules:**
- Valid email address required
- Password minimum 8 characters
- Email verification required before app access
- Profile completion triggers assessment flow

### **Step 2: Personal Information Collection**
```
Personal Info Form → Validation → Storage → Assessment Flow
```

**Required Fields:**
- Age (minimum 13 years)
- Gender selection
- Nationality dropdown
- Current country
- Account creation timestamp (auto-generated)

**Business Rules:**
- Age validation: 13-120 years
- All fields mandatory for progression
- Data used in happiness calculation weighting

### **Step 3: One-Time Questionnaire Collection**
```
27-Field Questionnaire → Individual Field Validation → Scoring → Initial Self-Assessment Unlock
```

**Collection Rules:**
- **Timing**: Collected only once after account creation
- **No Type Variants**: Unlike self-assessment, questionnaire has no different types
- **Mandatory**: Required before accessing any meditation stages

**Questionnaire Structure (27 Fields):**

**Personal & Background (6 fields):**
- `experienceLevel` (multiple choice): beginner/intermediate/advanced
- `mainGoals` (array): stress reduction, focus, emotional balance, etc.
- `ageRange` (multiple choice): age brackets
- `location` (multiple choice): geographic region
- `occupation` (multiple choice): profession categories
- `educationLevel` (multiple choice): education levels

**Lifestyle Metrics (4 slider fields 1-10):**
- `sleepPattern`: sleep quality rating
- `physicalActivity`: activity level
- `dietPattern`: diet quality
- `screenTime`: daily screen hours

**Social & Environmental (4 fields):**
- `stressTrigers` (array): work, relationships, health, etc.
- `dailyRoutine` (multiple choice): structured/flexible/chaotic
- `socialConnections` (slider 1-10): social connection strength
- `workLifeBalance` (slider 1-10): balance rating

**Mental & Emotional Awareness (6 slider fields 1-10):**
- `emotionalAwareness`: self-awareness level
- `stressResponse`: stress management ability  
- `decisionMaking`: decision confidence
- `selfReflection`: reflection frequency
- `thoughtPatterns`: thought clarity
- `mindfulnessInDailyLife`: daily mindfulness practice

**Meditation Experience (7 fields):**
- `meditationBackground` (multiple choice): experience type
- `mindfulnessExperience` (multiple choice): apps/classes/books
- `meditationBackgroundDetail` (multiple choice): detailed background
- `practiceGoals` (array): specific meditation goals
- `preferredDuration` (slider 1-10): session length preference
- `biggestChallenges` (array): time, focus, consistency, etc.
- `motivation` (slider 1-10): motivation level

**Business Rules:**
- Single comprehensive submission (27 fields)
- Each field individually assessed and weighted
- Progress auto-saved for partial completion
- Completion triggers self-assessment availability
- All responses weighted in happiness calculation algorithms

### **Step 4: Progressive Self-Assessment System**
```
6-Category Assessment → Type-Based Scoring → Attachment Analysis → Progress Tracking
```

**Assessment Types & Timing:**
- **"initial"**: Mandatory after account creation (enables stage access)
- **"mid"**: Required after completing stages 1-3 (spiritual progress tracking)  
- **"final"**: Required after completing all 6 stages (transformation measurement)

**Assessment Categories (Same for All Types):**
1. **Food Taste** (3-choice attachment scale: "none", "some", "strong")
2. **Scents & Aromas** (3-choice attachment scale: "none", "some", "strong")
3. **Sounds & Music** (3-choice attachment scale: "none", "some", "strong")
4. **Visual & Beauty** (3-choice attachment scale: "none", "some", "strong")
5. **Touch & Textures** (3-choice attachment scale: "none", "some", "strong")
6. **Thoughts & Mental Images** (3-choice attachment scale: "none", "some", "strong")

**Scoring System (Consistent Across All Types):**
- **"none" (non-attachment)**: +12 bonus points per category
- **"some" attachment**: -7 penalty points per category  
- **"strong" attachment**: -15 penalty points per category

**Business Rules:**
- All 6 categories required for completion
- 3-choice scale per category: "none", "some", "strong"
- Completion enables happiness score calculation
- Reassessment available every 30 days

---

## **WORKFLOW 2: Stage Progression System**

### **Stage 1: Seeker (Timer-Only Sessions)**
```
T1 → T2 → T3 → T4 → T5 → PAHM Learning → Stage 2 Unlock
```

**Sub-Stage Requirements:**
- **T1**: 3 sessions × 10 minutes = 0.5 hours
- **T2**: 4 sessions × 15 minutes = 1.0 hour
- **T3**: 6 sessions × 20 minutes = 2.0 hours
- **T4**: 6 sessions × 25 minutes = 2.5 hours
- **T5**: 10 sessions × 30 minutes = 5.0 hours

**Business Rules:**
- Sequential completion required (T1 → T2 → T3 → T4 → T5)
- Minimum session count enforced per sub-stage
- Timer-only interface (no PAHM Matrix)
- PAHM learning module required before Stage 2 unlock
- Total: 29 sessions, 11.5 hours minimum

**Unlock Logic for Next Sub-Stage:**
```typescript
function canUnlockNextSubStage(currentSubStage: string, sessionsCompleted: number): boolean {
  const requirements = {
    'T1': 3, 'T2': 4, 'T3': 6, 'T4': 6, 'T5': 10
  };
  return sessionsCompleted >= requirements[currentSubStage];
}
```

### **Stage 2-6: PAHM Matrix Stages**
```
Stage Requirements → Session Practice → Progress Tracking → Stage Completion → Next Stage Unlock
```

**Requirements by Stage:**
- **Stage 2 (Trainee)**: 30 sessions × 30 minutes = 15 hours
- **Stage 3 (Beginner)**: 30 sessions × 30 minutes = 15 hours
- **Stage 4 (Practitioner)**: 40 sessions × 30 minutes = 20 hours
- **Stage 5 (Master)**: 50 sessions × 30 minutes = 25 hours
- **Stage 6 (Illuminator)**: 60 sessions × 30 minutes = 30 hours

**Business Rules:**
- **Minimum Duration**: 30-minute minimum sessions with user extension capability
- **Duration Control**: Time slider allows users to extend beyond minimum requirements
- **Fixed Mind Recovery**: Fixed durations for mind recovery exercises (non-adjustable):
  - Morning Recharge: 5 minutes
  - Mid-Day Reset: 3 minutes
  - Emotional Reset: 5 minutes
  - Work-Home Transition: 5 minutes
  - Bedtime Wind Down: 8 minutes
- Minimum session count per stage enforced
- Previous stage completion required for unlock
- PAHM click data recorded for each session
- Quality assessment optional but recommended

---

## **WORKFLOW 3: PAHM Matrix Session Logic**

### **Session Start Process**
```
Session Preparation → Session Configuration Menu → Timer + Matrix Interface → Practice → Session Completion
```

**Session Preparation:**
- Display session information (stage, duration, type)
- Show session objectives and guidance
- Present session configuration options

**Session Configuration Menu:**
- **Posture Selection**: Choose meditation position
  - Sitting position (recommended)
  - Lying position (alternative)
  - Walking position (advanced)
  - Custom position (user defined)
- **Duration Configuration**: Adjust session length
  - Meditation Sessions: Duration slider (minimum per stage + user extension)
  - Mind Recovery Exercises: Fixed durations (NO duration slider):
    - Morning Recharge: 5 minutes
    - Mid-Day Reset: 3 minutes
    - Emotional Reset: 5 minutes
    - Work-Home Transition: 5 minutes
    - Bedtime Wind Down: 8 minutes
- **Audio Options**: Customize session audio experience
  - Guided voice-over: Enable/disable meditation guidance
  - Bell rings: Enable/disable session start/end/interval bells
  - Volume control: Audio level adjustment (0-100%)

### **PAHM Matrix Interaction Rules**
```
Attention Awareness → Matrix Position Selection → Click Recording → Pattern Tracking
```

**Matrix Positions & Logic:**
```
┌─────────────┬─────────────┬─────────────┐
│   REGRET    │    PAST     │  NOSTALGIA  │
│(Past+Dislike)│(Past+Neutral)│(Past+Likes) │
├─────────────┼─────────────┼─────────────┤
│  DISLIKES   │   PRESENT   │    LIKES    │
│(Present+Dis.)│(Present+Neu.)│(Present+Like)│
├─────────────┼─────────────┼─────────────┤
│   WORRY     │   FUTURE    │ANTICIPATION │
│(Future+Dis.) │(Future+Neu.) │(Future+Like)│
└─────────────┴─────────────┴─────────────┘
```

**Click Recording Rules:**
- Each click records: position, timestamp, session order
- No minimum or maximum clicks required
- Observation without judgment emphasized
- Pattern tracking for happiness calculation

### **Session Completion Logic**
```
Timer Completion → Click Summary → Reflection → Data Save → Progress Update
```

**Completion Requirements:**
- Full 30-minute timer completion
- At least one matrix interaction (recommended, not enforced)
- Optional quality rating (1-10 scale)
- Optional session notes/insights

---

## **WORKFLOW 4: Happiness Score Calculation**

### **Calculation Trigger Conditions**
```
Assessment Completion Check → Data Validation → Component Calculation → Final Score → User Level Assignment
```

**Trigger Requirements (STRICT Mode):**
- ✅ Questionnaire completed (all 6 steps)
- ✅ Self-assessment completed (all 6 categories)
- ⚡ Practice sessions enhance but not required

### **Component Calculation Logic**

#### **Component 1: Current State Assessment (12% weight)**
```typescript
function calculateCurrentState(questionnaire: any, emotionalNotes: any[]): number {
  let score = 0;
  
  // Emotional awareness (slider 1-10)
  score += questionnaire.emotionalAwareness * 8;
  
  // Sleep pattern (slider 1-10)
  score += questionnaire.sleepPattern * 6;
  
  // Physical activity (slider 1-10) - direct scoring
  score += questionnaire.physicalActivity * 2.5;
  
  // Work-life balance (slider 1-10) - direct scoring
  score += questionnaire.workLifeBalance * 2;
  
  // Stress response (slider 1-10) - direct scoring
  score += questionnaire.stressResponse * 1.5;
  
  // Diet pattern (slider 1-10) - new field
  score += questionnaire.dietPattern * 1.2;
  
  // Social connections (slider 1-10) - new field
  score += questionnaire.socialConnections * 1.8;
  
  // Recent mood average from daily notes
  if (emotionalNotes.length > 0) {
    const avgMood = emotionalNotes.reduce((sum, note) => sum + note.moodRating, 0) / emotionalNotes.length;
    score += avgMood * 8;
  }
  
  return score;
}
```

#### **Component 2: Attachment-Based Happiness (20% weight)**
```typescript
function calculateAttachmentScore(selfAssessment: any): number {
  let attachmentScore = 0;
  
  const categories = ['food', 'scents', 'sounds', 'visual', 'touch', 'thoughts'];
  
  categories.forEach(category => {
    const choice = selfAssessment[category];
    
    if (choice === 'none') {
      // Non-attachment: +12 bonus
      attachmentScore += 12;
    } else if (choice === 'some') {
      // Some attachment: -7 penalty
      attachmentScore -= 7;
    } else if (choice === 'strong') {
      // Strong attachment: -15 penalty
      attachmentScore -= 15;
    }
  });
  
  return attachmentScore;
}
```

#### **Component 3: PAHM Development (25% weight - Primary)**
```typescript
function calculatePAHMScore(questionnaire: any, sessions: any[]): number {
  // Assessment foundation using new slider fields
  const assessmentFoundation = 
    (questionnaire.experienceLevel === 'beginner' ? 1 : questionnaire.experienceLevel === 'intermediate' ? 2 : 3) * 2.5 + 
    (questionnaire.mindfulnessInDailyLife * 2) +  // Using new slider field
    (questionnaire.motivation * 1.5);              // Using new slider field
  
  // Practice realization bonuses
  let practiceBonus = 0;
  
  if (sessions.length > 0) {
    // Session count bonus
    if (sessions.length >= 100) practiceBonus += 35;
    else if (sessions.length >= 50) practiceBonus += 30;
    else if (sessions.length >= 25) practiceBonus += 25;
    // ... additional thresholds
    
    // Total hours bonus
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    if (totalHours >= 100) practiceBonus += 40;
    else if (totalHours >= 50) practiceBonus += 35;
    // ... additional thresholds
    
    // Quality bonus
    const avgQuality = sessions.reduce((sum, s) => sum + (s.quality || 0), 0) / sessions.length;
    if (avgQuality >= 4.5) practiceBonus += 25;
    else if (avgQuality >= 4.0) practiceBonus += 20;
    // ... additional thresholds
  }
  
  return assessmentFoundation + practiceBonus;
}
```

### **Final Score Calculation**
```typescript
function calculateFinalHappinessScore(components: any): number {
  const finalScore = Math.round(
    (components.pahmScore * 0.25) +           // 25% - Primary component
    (components.attachmentScore * 0.20) +     // 20% - Attachment flexibility
    (components.emotionalStability * 0.18) +  // 18% - Stability progress
    (components.currentState * 0.12) +        // 12% - Current mood/state
    (components.emotionalRegulation * 0.10) + // 10% - Regulation skills
    (components.mindRecovery * 0.08) +        // 8% - Recovery effectiveness
    (components.socialConnection * 0.04) +    // 4% - Social bonds
    (components.practiceConsistency * 0.03)   // 3% - Consistency
  );
  
  return Math.max(0, Math.min(100, finalScore)); // Clamp 0-100
}
```

### **User Level Assignment**
```typescript
function assignUserLevel(score: number): string {
  if (score >= 80) return "Enlightened Seeker";
  if (score >= 65) return "Advanced Seeker";
  if (score >= 50) return "Progressing Seeker";
  if (score >= 35) return "Awakening Seeker";
  if (score >= 20) return "Active Seeker";
  return "Seeker";
}
```

---

## **WORKFLOW 5: Daily Notes & Tracking**

### **Daily Notes Collection**
```
Emotion Trigger → Structured Entry → Emotion Analysis → Pattern Analysis → Happiness Update
```

**Note Types:**
1. **Quick Emoji**: Simple mood rating (1-10 scale)
2. **Detailed Log**: Structured emotional tracking (matches UI form)

**Detailed Log Components (UI Structure):**
- **Emotion Selection**: Single emotion from dropdown (required)
- **Intensity Slider**: 1-10 scale with labels (Mild/Moderate/Intense)
- **Context Description**: "What's happening Today" - optional situational text
- **Trigger Selection**: "What triggered this" - optional dropdown selection
- **Auto-Analysis**: Emotion category, intensity level, recommended actions

**UI Form Fields:**
- **Emotion Dropdown**: "How are you feeling?" with categorized options
- **Intensity Slider**: Shows current value (e.g., "5/10") with Mild→Intense scale
- **Context Text Area**: Optional description of current situation
- **Trigger Dropdown**: Optional selection of what caused the emotion
- **Submit Button**: "Log Emotion" saves the structured entry

**Business Rules:**
- Multiple entries per day allowed (real-time emotion tracking)
- Single emotion focus per entry (simplified from multi-emotion system)
- Auto-categorization into positive/negative/neutral emotions
- Intensity-based recommended actions (breathing, meditation, awareness)
- Each entry timestamped for chronological tracking
- Historical entries viewable with filtering and analysis
- Data feeds into happiness calculation reflection component
- Trend analysis for emotional pattern recognition

---

## **WORKFLOW 6: Mind Recovery System**

### **Access Control Logic**
```
Stage Completion Check → PAHM Learning Check → Mind Recovery Unlock → Exercise Selection → Quick Practice
```

**Unlock Requirements:**
- ✅ Stage 1 completed (all T1-T5 sub-stages)
- ✅ PAHM Matrix introduction learning resource completed
- ❌ Stage 2 completion NOT required (unlocks after Stage 1 + PAHM learning)

**Business Rules:**
- Mind Recovery unlocks immediately after Stage 1 completion AND PAHM learning
- Provides bridge between Stage 1 (timer-only) and Stage 2 (full PAHM sessions)
- Offers quick 5-minute PAHM Matrix exercises for immediate relief
- Does not count toward stage progression requirements

### **Mind Recovery Exercise Types**
All exercises use **Fixed duration timer + PAHM Matrix interface**:

1. **Morning Recharge** 
   - **Purpose**: Start day with clarity and focus
   - **Duration**: 5 minutes
   - **Session Type**: Quick PAHM Matrix
   - **Best Time**: Morning routine

2. **Mid-Day Reset**
   - **Purpose**: Quick refresh to maintain focus
   - **Duration**: 3 minutes  
   - **Session Type**: Quick PAHM Matrix
   - **Best Time**: Lunch break, afternoon

3. **Emotional Reset** (Recommended)
   - **Purpose**: Settle emotions and find balance
   - **Duration**: 5 minutes
   - **Session Type**: Quick PAHM Matrix
   - **Best Time**: During emotional turbulence

4. **Work-Home Transition**
   - **Purpose**: Shift from work mode to personal time
   - **Duration**: 5 minutes
   - **Session Type**: Quick PAHM Matrix
   - **Best Time**: End of workday

5. **Bedtime Wind Down**
   - **Purpose**: Gentle preparation for restful sleep
   - **Duration**: 8 minutes
   - **Session Type**: Quick PAHM Matrix
   - **Best Time**: Before bedtime

### **Exercise Recommendation Logic**
```typescript
function recommendMindRecoveryExercise(
  currentTime: Date, 
  recentMood: number, 
  lastSessionTime: Date,
  userContext: string
): string {
  const hour = currentTime.getHours();
  
  // Time-based recommendations
  if (hour >= 6 && hour <= 10) {
    return "Morning Recharge";
  }
  
  if (hour >= 11 && hour <= 14) {
    return "Mid-Day Reset";
  }
  
  if (hour >= 17 && hour <= 19) {
    return "Work-Home Transition";
  }
  
  // Mood-based recommendations
  if (recentMood <= 4) {
    return "Emotional Reset"; // Marked as RECOMMENDED
  }
  
  // Context-based recommendations
  if (userContext === "stressed" || userContext === "overwhelmed") {
    return "Emotional Reset";
  }
  
  // Default recommendation
  return "Mid-Day Reset";
}
```

### **Quick PAHM Matrix Session Logic**
```
Exercise Selection → Session Preparation → 5-Minute Timer + Matrix → Completion → Brief Reflection
```

**Session Interface Differences from Stage Sessions:**
- **Duration**: Fixed 5 minutes (vs 30 minutes for Stage 2+)
- **Matrix**: Same 3×3 PAHM Matrix interface
- **Purpose**: Quick attention awareness and reset
- **Tracking**: Clicks recorded but separate from stage progress
- **Completion**: No stage advancement, pure recovery benefit

**5-Minute Session Structure:**
```typescript
interface MindRecoverySession {
  type: 'mind_recovery';
  exercise: 'morning_recharge' | 'mid_day_reset' | 'emotional_reset' | 'work_home_transition' | 'bedtime_wind_down';
  duration: 3 | 5 | 8; // Fixed durations: 3 min (Mid-Day Reset), 5 min (Morning Recharge/Emotional Reset/Work-Home Transition), 8 min (Bedtime Wind Down)
  timer: {
    display: 'countdown';
    alerts: 'start' | 'end';
  };
  pahmMatrix: {
    grid: 3x3Matrix;
    positions: PAHMPositions;
    quickMode: true; // Indicates quick recovery session
  };
  tracking: {
    totalClicks: number;
    sessionComplete: boolean;
    contributes_to_stage: false; // Does not count toward stage progress
    contributes_to_happiness: true; // Enhances happiness calculation
  };
}
```

### **Data Recording Rules**
```
Session Completion → Click Data Save → Recovery Metrics Update → Happiness Enhancement
```

**What Gets Recorded:**
- ✅ PAHM Matrix click patterns and timestamps
- ✅ Exercise type and completion time
- ✅ Session quality rating (optional)
- ✅ Brief mood check (before/after)
- ❌ Does NOT count toward stage progression
- ✅ DOES enhance happiness calculation (Mind Recovery component)

### **Business Benefits**
- **Immediate Access**: Available right after Stage 1 (no waiting for Stage 2)
- **Quick Relief**: 5-minute format for busy schedules
- **PAHM Introduction**: Gentle introduction to matrix before Stage 2
- **Happiness Enhancement**: Contributes to Mind Recovery component (8% weight)
- **Pattern Learning**: Users learn PAHM concepts through short practice
```

---

## **WORKFLOW 7: Admin Dashboard Logic**

### **User Management Rules**
```
Admin Authentication → Permission Check → User Operation → Audit Log → Update
```

**Admin Operations:**
- **View Users**: List with filtering and search
- **Edit Users**: Modify profile, progress, settings
- **Session Management**: Unlock stages, reset progress
- **Analytics**: View aggregated user data
- **System Monitoring**: Database, performance, errors

**Permission Levels:**
- **Super Admin**: Full system access
- **Content Admin**: User management only
- **Analytics Admin**: Read-only analytics
- **Support Admin**: User support functions

### **System Monitoring Logic**
```
Health Check → Metric Collection → Threshold Analysis → Alert Generation → Notification
```

**Monitored Metrics:**
- User registration rate
- Session completion rate
- Happiness score distribution
- Stage progression statistics
- Error rates and performance
- Database usage and health

---

## 🔒 SECURITY & VALIDATION RULES

### **Input Validation**
- **Email Format**: RFC 5322 compliant
- **Password Strength**: Minimum 8 characters, mixed case recommended
- **Age Range**: 13-120 years
- **Session Duration**: Fixed durations for Mind Recovery (Morning Recharge/Emotional Reset/Work-Home Transition: 5 min, Mid-Day Reset: 3 min, Bedtime Wind Down: 8 min) or 10-30+ minutes minimum (Stage sessions with user extension)
- **Quality Ratings**: 1-10 scale only
- **PAHM Clicks**: Valid matrix positions only

### **Data Privacy**
- **Personal Data**: Encrypted at rest
- **Session Data**: Anonymized for analytics
- **Happiness Scores**: Personal, not shared
- **Admin Access**: Audit logged
- **Data Export**: User-initiated only

### **Rate Limiting**
- **API Calls**: 100 requests per minute per user
- **Session Creation**: 1 session per 5 minutes
- **Assessment Updates**: 1 per day
- **Password Reset**: 3 attempts per hour

---

## 📊 BUSINESS INTELLIGENCE & ANALYTICS

### **User Analytics**
- **Engagement Metrics**: Session frequency, duration, completion rates
- **Progress Tracking**: Stage advancement, happiness score trends
- **Usage Patterns**: Peak usage times, feature adoption
- **Retention Analysis**: User lifecycle, churn prediction

### **Content Analytics**
- **Stage Effectiveness**: Completion rates per stage
- **Session Quality**: Average ratings, feedback analysis
- **Assessment Insights**: Common response patterns
- **Feature Usage**: Most/least used features

### **System Analytics**
- **Performance Metrics**: Response times, error rates
- **Capacity Planning**: User growth, resource utilization
- **Security Monitoring**: Login attempts, suspicious activity
- **Revenue Tracking**: Subscription metrics, conversion rates

---

## 🎯 KEY BUSINESS DECISIONS

### **1. Assessment Requirements**
**Decision**: Both questionnaire AND self-assessment mandatory for happiness calculation  
**Rationale**: Ensures comprehensive baseline for accurate scoring  
**Implementation**: Strict mode validation in calculation logic

### **2. Stage Progression**
**Decision**: Linear progression with no stage skipping  
**Rationale**: Builds proper foundation for advanced practices  
**Implementation**: Server-side validation of unlock requirements

### **3. PAHM Matrix Philosophy**
**Decision**: Observation without control emphasis  
**Rationale**: Aligns with A.C. Amarasighe's methodology for lasting happiness  
**Implementation**: UI messaging and educational content focus

### **4. Happiness Score Weighting**
**Decision**: PAHM Development as primary component (25%)  
**Rationale**: Core methodology should have highest impact  
**Implementation**: Weighted calculation with PAHM emphasis

### **5. Session Quality Over Quantity**
**Decision**: Quality ratings multiply benefits  
**Rationale**: Encourages mindful practice over mechanical completion  
**Implementation**: Quality bonuses in all calculation components

---

## 🔧 INTEGRATION POINTS

### **Database Triggers**
- **Session Completion**: Update user progress, recalculate happiness
- **Assessment Update**: Trigger happiness recalculation
- **Stage Completion**: Check unlock conditions for next stage
- **Daily Note**: Update mood trends, happiness components

### **External Integrations**
- **Email Service**: Verification, notifications, reminders
- **Analytics Service**: User behavior tracking, conversion metrics
- **Support System**: User feedback, help desk integration
- **Payment Processing**: Subscription management (future)

### **API Endpoints Business Logic**
- **Authentication**: Session management, security validation
- **User Management**: Profile updates, progress tracking
- **Session APIs**: Creation, completion, data recording
- **Assessment APIs**: Submission, validation, scoring
- **Happiness APIs**: Calculation, history, trends
- **Admin APIs**: User management, system monitoring

---

## 📚 QUICK REFERENCE

### **Critical Business Rules**
1. **Linear Progression**: No stage skipping allowed
2. **Assessment Completion**: Both required for happiness calculation
3. **Mind Recovery Access**: Unlocks after Stage 1 + PAHM learning (not Stage 2)
4. **PAHM Philosophy**: Observation without control
5. **Quality Emphasis**: Quality over quantity in all aspects
6. **Data Privacy**: User data protection paramount

### **Key Calculations**
- **Stage 1 Total**: 29 sessions, 11.5 hours minimum
- **Mind Recovery**: Quick PAHM Matrix exercises with specific durations (Morning Recharge/Emotional Reset/Work-Home Transition: 5 min, Mid-Day Reset: 3 min, Bedtime Wind Down: 8 min)
- **Total Journey**: 115.5+ hours across 6 stages
- **Happiness Score**: 0-100 with 8 weighted components
- **PAHM Weight**: 25% (highest single component)

### **State Transitions**
- **User**: Registration → Verification → Assessment → Practice → Progress
- **Session**: Preparation → Practice → Completion → Recording
- **Stage**: Unlock → Practice → Completion → Next Unlock
- **Happiness**: Assessment → Calculation → Display → Recalculation

---

**This business logic documentation provides the complete foundation for implementing all core functionality in "The Return of Attention" meditation application, ensuring consistent behavior and accurate implementation of the PAHM methodology.**