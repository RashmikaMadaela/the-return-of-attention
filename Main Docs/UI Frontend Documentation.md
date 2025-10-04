# UI Frontend Documentation
**The Return of Attention - Meditation App**

## Table of Contents
1. [Project Overview](#project-overview)
2. [Application Architecture](#application-architecture)
3. [Page Structure & Components](#page-structure--components)
4. [Navigation System](#navigation-system)
5. [Authentication Flow](#authentication-flow)
6. [Stage Progression Logic](#stage-progression-logic)
7. [PAHM Matrix System](#pahm-matrix-system)
8. [Component Library](#component-library)
9. [Data Flow & State Management](#data-flow--state-management)
10. [User Interactions & Logic](#user-interactions--logic)
11. [Admin Dashboard](#admin-dashboard)
12. [Implementation Roadmap](#implementation-roadmap)

---

## Project Overview

**The Return of Attention** is a comprehensive meditation and mindfulness web application built with Next.js 14, featuring a progressive 6-stage journey system based on the PAHM (Physical, Attention, Happiness, Mindfulness) methodology.

### Core Features
- **6-Stage Progressive Journey**: Physical Stillness → Thought Patterns → Dot Tracking → Tool-Free Practice → Sustained Presence → Integration & Teaching
- **PAHM Matrix Assessment**: Interactive 3x3 grid for tracking attention patterns
- **Daily Emotional Notes**: Mood tracking and journaling system
- **Personalized Dashboard**: User progress tracking and analytics
- **Admin Management**: Complete user and stage management system
- **Responsive Design**: Mobile-first approach with desktop optimization

---

## Application Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Backend**: API Routes with Prisma ORM
- **Database**: PostgreSQL with Supabase
- **Authentication**: Custom auth system with email verification
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context + Zustand stores

### Folder Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── (public)/          # Public pages (landing, auth)
│   ├── (auth)/            # Authentication pages
│   ├── (onboarding)/      # Questionnaire & setup
│   ├── (app)/             # Protected app pages
│   ├── (admin)/           # Admin dashboard
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript definitions
```

---

## Page Structure & Components

### 1. Landing Page (`/`)
**Purpose**: Introduce the application and convert visitors to users

**Layout Components**:
- **Hero Section**: 3x3 PAHM matrix visualization with core message
- **Navigation Bar**: Logo, Register/Login buttons
- **Problem/Solution Section**: "Sound Familiar?" vs "What If There's a Way Out?"
- **Journey Overview**: 6-stage progression explanation
- **Call-to-Action**: "Ready to Begin?" section with signup prompts
- **Footer**: Quote, copyright, contact info

**Key Elements**:
- Interactive PAHM matrix preview (non-functional, visual only)
- Emotional state cards (Mind won't quiet, Constant worry, etc.)
- Stage progression cards with descriptions
- Action buttons: "Practice Today!", "Start Your Journey!", "Learn More"

**State Management**: Static content, no complex state needed

### 2. Authentication Pages

#### Signup Page (`/register`)
**Purpose**: User registration with email/password

**Components**:
- **Split Layout**: Welcome message (left) + Registration form (right)
- **Form Fields**: Email, Password, Confirm Password
- **Social Login**: Google OAuth integration
- **Terms Checkbox**: Privacy policy agreement
- **Action Buttons**: Sign Up, "Already have account?" link

**Validation Logic**:
- Email format validation
- Password strength requirements
- Password confirmation matching
- Terms acceptance required

#### Login Page (`/signin`)
**Purpose**: User authentication

**Components**:
- **Split Layout**: Welcome message + Login form
- **Form Fields**: Email, Password
- **Social Login**: Google OAuth
- **Forgot Password**: Password reset link
- **Account Creation**: "Don't have account?" link

**Authentication Flow**:
- Credential validation
- Session creation
- Redirect to dashboard or onboarding

#### Personal Info Page (`/personal-info`)
**Purpose**: Collect additional user data after initial signup

**Components**:
- **Progressive Form**: 5-step data collection
- **Form Fields**: Full Name, Age, Gender, Nationality, Country
- **Dropdown Selectors**: Country/nationality selection
- **Navigation**: Back/Finish buttons

**Data Validation**:
- Required field validation
- Age range validation
- Dropdown selection validation

### 3. Onboarding Flow

#### Questionnaire System (`/questionnaire`)
**Purpose**: Comprehensive user assessment for personalization

**Progress Tracking**:
- **Phase Indicators**: "Question 1-9 of 27", "33%", "Phase 1: Experience Level"
- **Progress Bar**: Visual completion indicator
- **Phase Labels**: Experience Level → Demographics → Mindfulness Specific

**Question Types & Components**:

1. **Slider Questions**:
   - Experience Level (1-10 scale)
   - Mindfulness Experience (1-10 scale)
   - Visual feedback with current value display

2. **Multiple Choice Grid**:
   - Goals selection (Stress Reduction, Better Sleep, etc.)
   - Checkbox interface with "Select all that apply"

3. **Button Grid Selection**:
   - Age Range (6 options: 18-24, 25-34, 35-44, 45-54, 55-64, 65+)
   - Location (Urban, Suburban, Rural, Quiet suburb, Busy city center)
   - Occupation (12 options from Software Developer to Other)
   - Education Level (High school to PhD/Doctorate)

4. **Advanced Questions**:
   - Meditation Background (Never tried to Teacher training)
   - Practice Goals (Daily minutes to Spiritual awakening)
   - Preferred Duration (5-60 minutes)
   - Biggest Challenges (Time consistency to Physical discomfort)

5. **Text Input**:
   - Additional Information (free-form textarea)

**Navigation Logic**:
- Back/Next buttons with validation
- Skip logic based on previous answers
- Final "Finish" button for completion

**Data Processing**:
- Real-time form validation
- Progress persistence
- Personalization algorithm input

### 4. Main Application Dashboard

#### Home Dashboard (`/dashboard`)
**Purpose**: Central hub for user journey and quick access

**Core Components**:
- **Progress Overview**: Current stage indicator and completion status
- **Quick Actions**: Start practice, view notes, check analytics
- **Current Stage Card**: Active stage with description and actions
- **Recent Activity**: Last sessions, notes, assessments
- **Navigation Hub**: Access to all main sections

**State Requirements**:
- User progress data
- Current stage information
- Recent activity feed
- Quick access metrics

### 5. Stage System Pages

#### Stage Overview (`/mind-recovery/stage-[id]`)
**Purpose**: Individual stage management and practice sessions

**Stage 1: Physical Stillness**
**Components**:
- **Stage Header**: "Stage 1: Physical Stillness" with description
- **Practice Grid**: 6 practice sessions in 2x3 layout
- **Session Cards**: Duration, completion status, unlock state
- **Practice Types**:
  - T1-T5: Physical Stillness (10-30 minutes progression)
  - PAHM Matrix Introduction
- **Progress Tracking**: Sessions completed (X/3 format)
- **Action Buttons**: "Start", "Completed", "Locked" states

**Unlock Logic Implementation**:
```typescript
// Stage progression logic
const isStageUnlocked = (stageId: number, userProgress: UserProgress) => {
  if (stageId === 1) return true; // Stage 1 always unlocked
  
  const previousStageComplete = userProgress.stages[stageId - 1]?.completed;
  return previousStageComplete;
};

const isSessionUnlocked = (sessionId: string, completedSessions: string[]) => {
  // Sequential unlock: each session unlocks after previous completion
  const sessionIndex = parseInt(sessionId.replace('T', ''));
  if (sessionIndex === 1) return true;
  
  const previousSession = `T${sessionIndex - 1}`;
  return completedSessions.includes(previousSession);
};
```

**Similar Structure for Stages 2-6**:
- Stage 2: Understanding Thought Patterns
- Stage 3: Dot Tracking Practice  
- Stage 4: Tool-Free Practice
- Stage 5: Sustained Presence
- Stage 6: Integration & Teaching

### 6. PAHM Matrix System

#### PAHM Practice Page (`/pahm-matrix`)
**Purpose**: Interactive attention tracking and awareness training

**Core Interface**:
- **3x3 Grid Layout**: 9 position matrix
- **Position Labels**:
  - Center: "PRESENT" (highlighted as default)
  - Top Row: "NOSTALGIA", "LIKES", "ANTICIPATION"
  - Middle Row: "PAST", "PRESENT", "FUTURE"  
  - Bottom Row: "REGRET", "DISLIKES", "WORRY"

**Interaction Logic**:
```typescript
interface PAHMPosition {
  id: string;
  label: string;
  description: string;
  category: 'past' | 'present' | 'future';
  valence: 'positive' | 'neutral' | 'negative';
}

const pahmPositions: PAHMPosition[] = [
  { id: 'nostalgia', label: 'NOSTALGIA', category: 'past', valence: 'positive' },
  { id: 'likes', label: 'LIKES', category: 'present', valence: 'positive' },
  { id: 'anticipation', label: 'ANTICIPATION', category: 'future', valence: 'positive' },
  { id: 'past', label: 'PAST', category: 'past', valence: 'neutral' },
  { id: 'present', label: 'PRESENT', category: 'present', valence: 'neutral' },
  { id: 'future', label: 'FUTURE', category: 'future', valence: 'neutral' },
  { id: 'regret', label: 'REGRET', category: 'past', valence: 'negative' },
  { id: 'dislikes', label: 'DISLIKES', category: 'present', valence: 'negative' },
  { id: 'worry', label: 'WORRY', category: 'future', valence: 'negative' }
];
```

**Educational Component**:
- **Position Explanations**: Detailed descriptions of each attention state
- **Benefits List**: Practice benefits and outcomes
- **Philosophy Section**: Theoretical background from "The Return of Attention"

**Data Tracking**:
- Click patterns and frequency
- Time spent in each position
- Session duration and engagement metrics

### 7. Daily Notes System

#### Daily Notes Page (`/daily-notes`)
**Purpose**: Emotional check-ins and mood tracking

**Interface Components**:
- **Header**: "Emotional Check-ins" with subtitle
- **Mode Toggle**: "Quick Log" vs "Detailed" entry options
- **Emotion Grid**: 3x4 grid of emotion cards with emojis
- **Emotion Options**:
  - Row 1: Happy 😊, Excited 🤩, Calm 😌, Confident 💪, Peaceful 🕊️
  - Row 2: Energetic ⚡, Neutral 😐, Tired 😴, Bored 😑, Sad 😢
  - Row 3: Anxious 😰, Frustrated 😤
- **History Panel**: Previous emotional entries with timestamps
- **Entry Details**: Emotion type, trigger, time logged

**Quick Log Flow**:
1. User selects emotion from grid
2. Optional trigger selection
3. Automatic timestamp
4. Entry saved to history

**Detailed Entry Flow**:
1. Emotion selection
2. Text description input
3. Trigger identification
4. Intensity rating
5. Additional notes
6. Save with full context

**Data Structure**:
```typescript
interface EmotionalEntry {
  id: string;
  userId: string;
  emotion: string;
  emoji: string;
  intensity: number; // 1-10 scale
  trigger?: string;
  notes?: string;
  timestamp: Date;
  entryType: 'quick' | 'detailed';
}
```

### 8. Analytics & Progress

#### My Analytics Page (`/analytics`)
**Purpose**: Personal progress visualization and insights

**Dashboard Components**:
- **Progress Charts**: Stage completion over time
- **Emotion Trends**: Mood patterns and insights
- **Practice Streaks**: Consistency tracking
- **PAHM Insights**: Attention pattern analysis
- **Goal Progress**: Personal objective tracking

**Chart Types**:
- Line charts for progress over time
- Bar charts for session frequency
- Heatmaps for practice consistency
- Pie charts for emotion distribution

### 9. Self-Assessment System

#### Self-Assessment Pages
**Purpose**: Periodic evaluation using PAHM methodology

**Assessment Interface**:
- **Progress Tracking**: "Beginner Assessment", "Mid Assessment", "Final Assessment"
- **Category Grid**: Physical senses evaluation
- **Assessment Categories**:
  - Food & Taste
  - Scents & Aromas  
  - Sound & Music
  - Visual & Beauty
  - Touch & Texture
  - Thoughts
- **Response Options**: Preference scale with "No preference" default
- **Navigation**: Back button and completion tracking

**Assessment Flow**:
1. Category selection
2. Preference rating
3. Progress saving
4. Results compilation
5. Personalized feedback

#### Self-Assessment Completion (`/assessment-complete`)
**Purpose**: Results presentation and next steps

**Completion Interface**:
- **Celebration**: "🎉 Great Job!" with encouraging message
- **Journey Preview**: 6-stage system overview
- **Stage Cards**: Visual preview of upcoming stages
- **Action Buttons**: "Start Your Journey" or "Back to Self-Assessment"
- **Progress Context**: Achievement acknowledgment

---

## Navigation System

### Main Navigation Bar
**Components**: Persistent across all app pages

**Navigation Items**:
- **Home**: Dashboard access
- **Mind Recovery**: Stage system (locked until stage 1 complete)
- **Daily Notes**: Emotional tracking
- **My Analytics**: Progress visualization (empty page for now)
- **Learn**: Educational content
- **Wisdom Guide**: Advanced teachings (empty page for now)
- **User Menu**: Profile, settings, logout

**State-Based Display Logic**:
```typescript
const navigationItems = [
  { label: 'Home', href: '/dashboard', restricted: false },
  { 
    label: 'Mind Recovery', 
    href: '/mind-recovery', 
    restricted: !user.onboardingComplete,
    tooltip: 'Complete onboarding to unlock'
  },
  { label: 'Daily Notes', href: '/daily-notes', restricted: false },
  { label: 'My Analytics', href: '/analytics', restricted: false },
  { label: 'Learn', href: '/learn', restricted: false },
  { label: 'Wisdom Guide', href: '/wisdom', restricted: false }
];
```

**Visual States**:
- **Active**: Current page highlighting
- **Locked**: Grayed out with lock icon for restricted access
- **Notification Badges**: Unread counts or alerts
- **Responsive**: Mobile menu collapse

---

## Authentication Flow

### Registration Process
1. **Landing Page**: User clicks "Register" or "Practice Today!"
2. **Signup Form**: Email/password collection with validation
3. **Email Verification**: Verification email sent, user must confirm
4. **Personal Info**: Additional user data collection
5. **Questionnaire**: Comprehensive assessment (27 questions)
6. **Self-Assessment**: PAHM-based evaluation
7. **Welcome Dashboard**: Onboarding complete, access unlocked

### Login Process
1. **Login Form**: Credential input
2. **Authentication**: Server validation
3. **Session Creation**: JWT token generation
4. **Dashboard Redirect**: Direct to main app interface

### Password Management
- **Reset Flow**: Email-based password reset
- **Change Password**: In-app password modification
- **Security Settings**: Account management options

---

## Stage Progression Logic

### Core Progression Rules

#### Stage Unlock Conditions
```typescript
interface StageUnlockLogic {
  stage1: boolean; // Always unlocked
  stage2: boolean; // Unlocked after Stage 1 completion
  stage3: boolean; // Unlocked after Stage 2 completion 
  stage4: boolean; // Unlocked after Stage 3 completion
  stage5: boolean; // Unlocked after Stage 4 completion
  stage6: boolean; // Unlocked after Stage 5 completion
}

// Special unlock condition: "Mind recovery unlocks after completing first stage"
const checkMindRecoveryUnlock = (userProgress: UserProgress): boolean => {
  return userProgress.stages.stage1?.completed || false;
};
```

#### Session Progression Within Stages
```typescript
interface SessionProgress {
  sessionId: string;
  completed: boolean;
  attempts: number;
  bestDuration: number;
  unlocked: boolean;
}

const calculateSessionUnlock = (
  stageId: number, 
  sessionIndex: number, 
  completedSessions: SessionProgress[]
): boolean => {
  // First session in any stage is always unlocked
  if (sessionIndex === 0) return true;
  
  // Subsequent sessions unlock after previous completion
  const previousSession = completedSessions[sessionIndex - 1];
  return previousSession?.completed || false;
};
```

#### Stage Completion Criteria
```typescript
interface StageCompletion {
  requiredSessions: string[];
  optionalSessions: string[];
  completionThreshold: number; // Percentage needed
}

const stageCompletionRules: Record<number, StageCompletion> = {
  1: {
    requiredSessions: ['T1', 'T2', 'T3', 'T4', 'T5'],
    optionalSessions: ['PAHM_INTRO'],
    completionThreshold: 100 // All required sessions must be completed
  },
  // Similar rules for stages 2-6
};
```

### Progress Tracking Implementation

#### User Progress State
```typescript
interface UserProgress {
  userId: string;
  currentStage: number;
  stages: {
    [stageId: number]: {
      unlocked: boolean;
      completed: boolean;
      sessions: SessionProgress[];
      completionDate?: Date;
    }
  };
  totalSessions: number;
  streakDays: number;
  lastActivity: Date;
}
```

#### Progress Update Logic
```typescript
const updateUserProgress = async (
  userId: string, 
  stageId: number, 
  sessionId: string
) => {
  // 1. Mark session as completed
  await markSessionComplete(userId, stageId, sessionId);
  
  // 2. Check stage completion
  const stageComplete = await checkStageCompletion(userId, stageId);
  
  // 3. Unlock next stage if current stage completed
  if (stageComplete) {
    await unlockNextStage(userId, stageId + 1);
  }
  
  // 4. Update global progress metrics
  await updateProgressMetrics(userId);
  
  // 5. Trigger notifications/achievements
  await checkAchievements(userId);
};
```

---

## PAHM Matrix System

### Matrix Layout & Interaction

#### Grid Structure
```typescript
const PAHMMatrix: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<string>('present');
  const [clickHistory, setClickHistory] = useState<PositionClick[]>([]);
  
  return (
    <div className="pahm-matrix grid grid-cols-3 gap-4 w-full max-w-2xl">
      {pahmPositions.map((position) => (
        <PAHMPosition
          key={position.id}
          position={position}
          isSelected={selectedPosition === position.id}
          onClick={() => handlePositionClick(position)}
        />
      ))}
    </div>
  );
};
```

#### Position Click Handling
```typescript
const handlePositionClick = (position: PAHMPosition) => {
  // 1. Update selected state
  setSelectedPosition(position.id);
  
  // 2. Record click for analytics
  const click = {
    positionId: position.id,
    timestamp: new Date(),
    sessionId: currentSessionId
  };
  setClickHistory(prev => [...prev, click]);
  
  // 3. Track attention patterns
  trackAttentionPattern(position);
  
  // 4. Provide educational feedback
  showPositionDescription(position);
};
```

#### Educational Content Integration
```typescript
interface PositionDescription {
  title: string;
  explanation: string;
  benefits: string[];
  practiceGuidance: string;
}

const positionDescriptions: Record<string, PositionDescription> = {
  present: {
    title: "Present (Center)",
    explanation: "Pure awareness in the here and now. This is the state of mindfulness where attention is anchored in the present moment without judgment.",
    benefits: [
      "Increased clarity and focus",
      "Reduced anxiety and stress",
      "Enhanced emotional regulation"
    ],
    practiceGuidance: "Return to this center position whenever you notice your attention wandering."
  },
  // Similar descriptions for all 9 positions
};
```

### Data Analytics & Insights

#### Session Analytics
```typescript
interface PAHMSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  positionClicks: PositionClick[];
  dominantPositions: string[];
  attentionPatterns: AttentionPattern[];
  insights: SessionInsight[];
}

const generateSessionInsights = (session: PAHMSession): SessionInsight[] => {
  const insights = [];
  
  // Analyze time spent in each quadrant
  const timeDistribution = calculateTimeDistribution(session.positionClicks);
  
  // Identify attention patterns
  const patterns = identifyPatterns(session.positionClicks);
  
  // Generate personalized feedback
  if (timeDistribution.present > 0.6) {
    insights.push({
      type: 'positive',
      message: 'Excellent present-moment awareness in this session!'
    });
  }
  
  return insights;
};
```

---

## Component Library

### Core UI Components

#### 1. Button Components
```typescript
// Primary Action Button
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Stage Card Button
interface StageButtonProps {
  stage: StageInfo;
  status: 'locked' | 'available' | 'completed';
  onClick: () => void;
}

// Session Card Button  
interface SessionButtonProps {
  session: SessionInfo;
  status: 'locked' | 'start' | 'completed';
  onClick: () => void;
}
```

#### 2. Form Components
```typescript
// Input Field with Validation
interface ValidatedInputProps {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

// Dropdown Selector
interface DropdownProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Checkbox with Label
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}
```

#### 3. Progress Components
```typescript
// Progress Bar
interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning';
}

// Stage Progress Indicator
interface StageProgressProps {
  currentStage: number;
  totalStages: number;
  stageNames: string[];
}

// Session Counter
interface SessionCounterProps {
  completed: number;
  total: number;
  label: string;
}
```

#### 4. Layout Components
```typescript
// Page Container
interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
}

// Card Container
interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  shadow?: boolean;
}

// Split Layout (Auth Pages)
interface SplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string;
}
```

#### 5. Interactive Components
```typescript
// Emotion Selector Grid
interface EmotionGridProps {
  emotions: EmotionOption[];
  selectedEmotion?: string;
  onSelect: (emotion: string) => void;
}

// PAHM Matrix Grid
interface PAHMMatrixProps {
  selectedPosition?: string;
  onPositionClick: (position: PAHMPosition) => void;
  showDescriptions?: boolean;
}

// Rating Slider
interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  labels: string[];
}
```

### Responsive Design Patterns

#### Breakpoint System
```css
/* Mobile First Approach */
.component {
  /* Mobile styles (default) */
  @apply w-full p-4;
}

@media (min-width: 640px) {
  /* Tablet styles */
  .component {
    @apply p-6;
  }
}

@media (min-width: 1024px) {
  /* Desktop styles */
  .component {
    @apply p-8 max-w-6xl mx-auto;
  }
}
```

#### Grid Responsive Patterns
```css
/* Responsive Grid Layouts */
.stage-grid {
  @apply grid gap-4;
  @apply grid-cols-1;        /* Mobile: 1 column */
  @apply sm:grid-cols-2;     /* Tablet: 2 columns */
  @apply lg:grid-cols-3;     /* Desktop: 3 columns */
}

.emotion-grid {
  @apply grid gap-3;
  @apply grid-cols-2;        /* Mobile: 2 columns */
  @apply sm:grid-cols-3;     /* Tablet: 3 columns */ 
  @apply lg:grid-cols-5;     /* Desktop: 5 columns */
}

.pahm-matrix {
  @apply grid grid-cols-3 gap-2;
  @apply sm:gap-4;           /* Larger gaps on bigger screens */
  @apply lg:gap-6;
}
```

---

## Data Flow & State Management

### Global State Architecture

#### User Context
```typescript
interface UserContextState {
  user: User | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  currentStage: number;
  loading: boolean;
}

const UserContext = createContext<UserContextState | null>(null);

// Usage in components
const { user, isAuthenticated, currentStage } = useUser();
```

#### Progress Store (Zustand)
```typescript
interface ProgressStore {
  userProgress: UserProgress;
  currentSession: SessionData | null;
  
  // Actions
  updateProgress: (stageId: number, sessionId: string) => void;
  startSession: (stageId: number, sessionId: string) => void;
  completeSession: (sessionData: SessionData) => void;
  loadUserProgress: (userId: string) => Promise<void>;
}

const useProgressStore = create<ProgressStore>((set, get) => ({
  // Implementation
}));
```

#### UI State Management
```typescript
interface UIStore {
  sidebarOpen: boolean;
  currentModal: string | null;
  notifications: Notification[];
  
  // Actions
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: Notification) => void;
}
```

### API Integration

#### Data Fetching Patterns
```typescript
// Custom hooks for data fetching
const useUserProgress = (userId: string) => {
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => fetchUserProgress(userId),
    enabled: !!userId,
  });
};

const useStageData = (stageId: number) => {
  return useQuery({
    queryKey: ['stage', stageId],
    queryFn: () => fetchStageData(stageId),
  });
};

// Mutation hooks for updates
const useCompleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: completeSessionAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
    },
  });
};
```

#### API Route Structure
```typescript
// /api/progress/[userId]/route.ts
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const progress = await getUserProgress(params.userId);
  return NextResponse.json(progress);
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const sessionData = await request.json();
  const updatedProgress = await updateUserProgress(params.userId, sessionData);
  return NextResponse.json(updatedProgress);
}
```

---

## User Interactions & Logic

### Session Management

#### Practice Session Flow
```typescript
const PracticeSession: React.FC<{ stageId: number; sessionId: string }> = ({
  stageId,
  sessionId
}) => {
  const [sessionState, setSessionState] = useState<'ready' | 'active' | 'paused' | 'completed'>('ready');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  
  const startSession = () => {
    setSessionState('active');
    setStartTime(new Date());
    // Initialize session tracking
    trackSessionStart(stageId, sessionId);
  };
  
  const completeSession = () => {
    setSessionState('completed');
    const sessionData = {
      stageId,
      sessionId,
      startTime,
      endTime: new Date(),
      duration
    };
    
    // Save session data and update progress
    saveSessionData(sessionData);
    updateUserProgress(stageId, sessionId);
  };
  
  return (
    <SessionInterface
      state={sessionState}
      onStart={startSession}
      onComplete={completeSession}
      duration={duration}
    />
  );
};
```

#### Timer & Duration Tracking
```typescript
const useSessionTimer = (isActive: boolean) => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);
  
  return {
    seconds,
    minutes: Math.floor(seconds / 60),
    formattedTime: formatTime(seconds)
  };
};
```

### Form Validation & Submission

#### Progressive Form Validation
```typescript
const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  
  const validateField = (field: keyof T, value: any) => {
    const rule = validationRules[field];
    if (!rule) return null;
    
    const error = rule.validate(value);
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };
  
  const isFormValid = () => {
    return Object.values(errors).every(error => !error);
  };
  
  return {
    values,
    errors,
    setValues,
    validateField,
    isFormValid
  };
};
```

#### Questionnaire Logic
```typescript
const QuestionnaireFlow: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  
  const questions = useMemo(() => getQuestionsByPhase(currentPhase), [currentPhase]);
  
  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-advance logic
    if (shouldAutoAdvance(questionId, answer)) {
      goToNextQuestion();
    }
  };
  
  const goToNextQuestion = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else if (currentPhase < 3) {
      setCurrentPhase(prev => prev + 1);
      setCurrentQuestion(1);
    } else {
      // Complete questionnaire
      submitQuestionnaire(answers);
    }
  };
  
  return (
    <QuestionnaireInterface
      phase={currentPhase}
      question={currentQuestion}
      totalQuestions={27}
      onAnswer={handleAnswer}
      onNext={goToNextQuestion}
    />
  );
};
```

### Notification System

#### Notification Types & Triggers
```typescript
interface NotificationConfig {
  sessionComplete: {
    title: string;
    message: string;
    type: 'success';
    actions: NotificationAction[];
  };
  stageUnlocked: {
    title: string;
    message: string;
    type: 'achievement';
    actions: NotificationAction[];
  };
  streakMilestone: {
    title: string;
    message: string;
    type: 'celebration';
  };
}

const useNotifications = () => {
  const showNotification = (type: keyof NotificationConfig, data?: any) => {
    const config = notificationConfigs[type];
    const notification = {
      id: generateId(),
      ...config,
      timestamp: new Date(),
      data
    };
    
    // Display notification
    toast(notification);
    
    // Store for notification center
    addNotificationToStore(notification);
  };
  
  return { showNotification };
};
```

---

## Admin Dashboard

### Admin Navigation & Layout

#### Admin Route Structure
```
/admin/
├── dashboard          # Overview metrics and analytics
├── user-management    # User CRUD operations
├── stage-testing      # Stage control and testing
└── settings          # System configuration
```

#### Admin Navigation Component
```typescript
const AdminNavigation: React.FC = () => {
  const navItems = [
    { label: 'User Progress', href: '/admin/dashboard', icon: '📊' },
    { label: 'User Management', href: '/admin/user-management', icon: '👥' },
    { label: 'Stage Testing', href: '/admin/stage-testing', icon: '🎯' }
  ];
  
  return (
    <nav className="admin-nav">
      {navItems.map(item => (
        <AdminNavItem key={item.href} {...item} />
      ))}
    </nav>
  );
};
```

### User Management Interface

#### User List & Controls
```typescript
const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'creationDate' | 'lastSignIn'>('creationDate');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');
  
  const userActions = [
    { label: 'Reset', action: 'reset', variant: 'secondary' },
    { label: 'Disable', action: 'disable', variant: 'warning' },
    { label: 'Revoke', action: 'revoke', variant: 'warning' },
    { label: 'Delete', action: 'delete', variant: 'danger' }
  ];
  
  return (
    <AdminContainer title="User Management System">
      <UserFilters 
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        sortBy={sortBy}
        onSort={setSortBy}
        filterBy={filterBy}
        onFilter={setFilterBy}
      />
      
      <UserTable 
        users={filteredUsers}
        actions={userActions}
        onAction={handleUserAction}
      />
    </AdminContainer>
  );
};
```

#### User Action Handlers
```typescript
const handleUserAction = async (userId: string, action: UserAction) => {
  const confirmationMessage = getConfirmationMessage(action);
  
  if (!confirm(confirmationMessage)) return;
  
  try {
    switch (action) {
      case 'reset':
        await resetUserProgress(userId);
        showNotification(`User progress reset successfully`);
        break;
        
      case 'disable':
        await disableUser(userId);
        showNotification(`User account disabled`);
        break;
        
      case 'delete':
        await deleteUser(userId);
        showNotification(`User account deleted`);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Refresh user list
    refetchUsers();
  } catch (error) {
    showErrorNotification(`Failed to ${action} user: ${error.message}`);
  }
};
```

### Stage Testing Controls

#### Stage Control Interface
```typescript
const StageTestingPage: React.FC = () => {
  const stages = [
    { id: 1, name: 'Physical Readiness', description: 'Building the foundation through physical stillness' },
    { id: 2, name: 'Understanding Thought Patterns', description: 'Learning to observe without attachment' },
    { id: 3, name: 'Dot Tracking Practice', description: 'Developing sustained attention' },
    { id: 4, name: 'Tool-Free Practice', description: 'Practicing without external supports' },
    { id: 5, name: 'Sustained Presence', description: 'Maintaining presence throughout daily activities' },
    { id: 6, name: 'Integration & Teaching', description: 'Fully integrating the practice into your life' }
  ];
  
  const stageActions = ['Unlock', 'Reset', 'Time Skip'];
  
  return (
    <AdminContainer title="Stage-by-Stage Testing Suite">
      <StageControlDefinitions />
      
      <div className="stage-controls-grid">
        {stages.map(stage => (
          <StageControlCard
            key={stage.id}
            stage={stage}
            actions={stageActions}
            onAction={(action) => handleStageAction(stage.id, action)}
          />
        ))}
      </div>
    </AdminContainer>
  );
};
```

#### Stage Action Implementation
```typescript
const handleStageAction = async (stageId: number, action: string) => {
  try {
    switch (action) {
      case 'Unlock':
        await unlockStageForAllUsers(stageId);
        showNotification(`Stage ${stageId} unlocked for all users`);
        break;
        
      case 'Reset':
        await resetStageForAllUsers(stageId);
        showNotification(`Stage ${stageId} reset for all users`);
        break;
        
      case 'Time Skip':
        await skipTimeDependentElements(stageId);
        showNotification(`Time-dependent elements skipped for Stage ${stageId}`);
        break;
    }
  } catch (error) {
    showErrorNotification(`Failed to ${action.toLowerCase()} stage: ${error.message}`);
  }
};
```

### Analytics Dashboard

#### Metrics Overview
```typescript
const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  
  const metricCards = [
    { title: 'Practice Sessions', value: metrics?.totalSessions, icon: '🔥' },
    { title: 'Mind Recovery Sessions', value: metrics?.mindRecoverySessions, icon: '🌱' },
    { title: 'Daily Emotional Notes', value: metrics?.emotionalNotes, icon: '📝' },
    { title: 'User Progress', value: metrics?.userProgress, icon: '📊' },
    { title: 'Users', value: metrics?.totalUsers, icon: '👥' },
    { title: 'Questionnaires', value: metrics?.questionnaires, icon: '📋' },
    { title: 'Self Assessments', value: metrics?.selfAssessments, icon: '🔍' },
    { title: 'Onboarding Progress', value: metrics?.onboardingProgress, icon: '📈' }
  ];
  
  return (
    <AdminContainer title="User Progress Dashboard">
      <div className="metrics-grid">
        {metricCards.map(card => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>
    </AdminContainer>
  );
};
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
**Objective**: Core infrastructure and authentication

**Components to Build**:
1. **Project Setup**
   - Next.js 14 configuration
   - Tailwind CSS setup with design system
   - Database schema implementation
   - Environment configuration

2. **Authentication System**
   - User registration/login forms
   - Email verification flow
   - Password reset functionality
   - Session management

3. **Basic Layout Components**
   - Navigation bar
   - Page containers
   - Button library
   - Form components

4. **Landing Page**
   - Hero section with PAHM matrix preview
   - Feature sections
   - Call-to-action components

### Phase 2: Onboarding Flow (Weeks 4-6)
**Objective**: Complete user onboarding experience

**Components to Build**:
1. **Personal Information Collection**
   - Multi-step form interface
   - Dropdown selectors
   - Form validation

2. **Questionnaire System**
   - Progress tracking
   - Question type components (slider, multiple choice, text)
   - Phase-based navigation
   - Data persistence

3. **Self-Assessment Interface**
   - PAHM-based evaluation
   - Assessment completion flow
   - Results presentation

### Phase 3: Core Application (Weeks 7-10)
**Objective**: Main application functionality

**Components to Build**:
1. **Dashboard Interface**
   - Progress overview
   - Quick actions
   - Recent activity feed

2. **Stage System**
   - Stage overview pages
   - Session management
   - Progress tracking
   - Unlock logic implementation

3. **PAHM Matrix Implementation**
   - Interactive grid interface
   - Click tracking
   - Educational content
   - Analytics collection

4. **Daily Notes System**
   - Emotion selection grid
   - Entry forms (quick/detailed)
   - History display
   - Data storage

### Phase 4: Analytics & Progress (Weeks 11-13)
**Objective**: User insights and progress visualization

**Components to Build**:
1. **Personal Analytics**
   - Progress charts
   - Emotion trends
   - Practice streaks
   - PAHM insights

2. **Achievement System**
   - Milestone tracking
   - Notification system
   - Badge/reward interface

3. **Data Export**
   - Progress reports
   - Personal data export
   - Sharing capabilities

### Phase 5: Admin Dashboard (Weeks 14-16)
**Objective**: Administrative controls and management

**Components to Build**:
1. **User Management**
   - User list interface
   - Search and filtering
   - User actions (reset, disable, delete)
   - Bulk operations

2. **Stage Testing Controls**
   - Stage unlock/reset functionality
   - Time skip capabilities
   - Testing interface

3. **Analytics Dashboard**
   - System metrics
   - User behavior insights
   - Performance monitoring

### Phase 6: Polish & Optimization (Weeks 17-20)
**Objective**: Performance, accessibility, and user experience refinement

**Enhancements**:
1. **Performance Optimization**
   - Code splitting
   - Image optimization
   - Database query optimization
   - Caching implementation

2. **Accessibility Improvements**
   - WCAG AA compliance
   - Keyboard navigation
   - Screen reader support
   - Focus management

3. **Mobile Optimization**
   - Touch interactions
   - Responsive layout refinement
   - Mobile-specific features

4. **Testing & Quality Assurance**
   - Unit test coverage
   - Integration tests
   - E2E testing
   - Performance testing

### Technology Integration Notes

#### Database Relationships
```sql
-- Core tables with relationships
Users (id, email, password, onboarding_complete, current_stage)
UserProgress (user_id, stage_id, completed, completion_date)
Sessions (user_id, stage_id, session_id, duration, completed_at)
PAHMClicks (session_id, position_id, timestamp)
EmotionalEntries (user_id, emotion, intensity, trigger, timestamp)
Questionnaires (user_id, answers_json, completed_at)
SelfAssessments (user_id, assessment_type, results_json, completed_at)
```

#### API Endpoints Planning
```typescript
// Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/reset-password

// User Progress
GET /api/progress/[userId]
POST /api/progress/[userId]/session
PUT /api/progress/[userId]/stage

// PAHM Matrix
POST /api/pahm/session
GET /api/pahm/analytics/[userId]

// Daily Notes
GET /api/notes/[userId]
POST /api/notes/[userId]

// Admin
GET /api/admin/users
POST /api/admin/users/[userId]/action
GET /api/admin/metrics
POST /api/admin/stages/[stageId]/action
```

This comprehensive documentation provides the complete blueprint for implementing the UI frontend of The Return of Attention meditation app. Each section includes detailed component specifications, logic requirements, and implementation guidance to ensure a cohesive and functional user experience.