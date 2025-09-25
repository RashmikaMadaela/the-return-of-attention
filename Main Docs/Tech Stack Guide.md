# Tech Stack Guide for "The Return of Attention"

## 📋 Project Requirements Analysis

Based on the project documentation, your meditation app needs:

### **Core Features:**
- User authentication (manual + Google OAuth)
- Multi-step questionnaire system
- Self-assessment tracking with 6 categories
- Interactive PAHM matrix sessions with precise click tracking
- Real-time session timers and audio playback
- Happiness score calculations
- Daily notes and mood tracking
- Admin dashboard with analytics
- Responsive web + mobile experience

### **Technical Requirements:**
- Real-time data synchronization
- Precise timestamp tracking for meditation sessions
- Complex data relationships (users, assessments, sessions, scores)
- File storage for audio content
- High availability and scalability
- Strong security for user data
- Analytics and reporting capabilities

---

## 🏗️ FINALIZED TECH STACK

### **🎯 CHOSEN STACK: Next.js Full-Stack + Prisma + Supabase + Vercel**

```bash
Complete Production-Ready Solution:
├── Next.js 14 (App Router + API Routes)
├── React 18 + TypeScript
├── Prisma ORM
├── Supabase PostgreSQL (Database + Auth)
├── Vercel (Hosting + Deployment)
├── Tailwind CSS
├── NextAuth.js (Authentication)
├── Zustand (Client State)
├── React Hook Form + Zod
├── Framer Motion
└── PWA Support
```

### **🚀 Why This Stack is PERFECT for Your Project:**

#### **1. Vercel + Next.js Benefits:**
- **Zero Configuration**: Automatic builds and deployments
- **Global CDN**: Fast worldwide performance
- **Serverless Functions**: API routes scale automatically
- **Preview Deployments**: Test every branch/PR automatically
- **Built-in Analytics**: Performance monitoring included
- **Easy Domain Setup**: Custom domains with one click

#### **2. Supabase + PostgreSQL Advantages:**
- **Managed PostgreSQL**: No database maintenance required
- **Real-time Subscriptions**: Built-in real-time features
- **Automatic Backups**: Daily backups included
- **Row Level Security**: Advanced security features
- **Dashboard**: Visual database management
- **Free Tier**: 500MB database, 50MB file storage
- **Auth Integration**: Can complement NextAuth.js

#### **3. Perfect Match for Your Requirements:**
- **Complex Data Relationships**: User assessments, session tracking, happiness scores
- **Real-time Features**: Can add Supabase real-time for live session updates
- **PAHM Matrix Tracking**: Precise timestamp tracking with PostgreSQL
- **Admin Dashboard**: Rich queries and analytics with SQL
- **Scalability**: Both platforms handle growth excellently
- **Cost Effective**: Generous free tiers, pay-as-you-scale

### **Database Strategy**

#### **🎯 PostgreSQL + Prisma Schema Design**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Profile Information
  profile   UserProfile?
  
  // Authentication
  accounts  Account[]
  sessions  Session[]
  
  // App Data
  questionnaire    Questionnaire?
  selfAssessments  SelfAssessment[]
  meditationSessions MeditationSession[]
  dailyNotes      DailyNote[]
  happinessScores HappinessScore[]
  
  // Admin
  isAdmin   Boolean @default(false)
  
  @@map("users")
}

model UserProfile {
  id          String @id @default(cuid())
  userId      String @unique
  age         Int?
  gender      String?
  nationality String?
  currentCountry String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_profiles")
}

model Questionnaire {
  id        String   @id @default(cuid())
  userId    String   @unique
  // No type field - questionnaire collected only once after account creation
  
  // Personal & Background Information
  experienceLevel              String?   // Multiple choice: 'beginner', 'intermediate', 'advanced'
  mainGoals                   String[]  // Multiple choice array: meditation goals
  ageRange                    String?   // Multiple choice: age brackets
  location                    String?   // Multiple choice: geographic region
  occupation                  String?   // Multiple choice: profession categories
  educationLevel              String?   // Multiple choice: education levels
  
  // Meditation & Mindfulness Background
  meditationBackground        String?   // Multiple choice: experience levels
  sleepPattern               Int?      // Slider 1-10: sleep quality rating
  physicalActivity           Int?      // Slider 1-10: activity level
  stressTrigers              String[]  // Multiple choice array: stress sources
  dailyRoutine               String?   // Multiple choice: routine structure
  dietPattern                Int?      // Slider 1-10: diet quality
  screenTime                 Int?      // Slider 1-10: daily screen hours
  
  // Social & Lifestyle
  socialConnections          Int?      // Slider 1-10: social connection strength
  workLifeBalance           Int?      // Slider 1-10: work-life balance rating
  
  // Mental & Emotional Awareness
  emotionalAwareness         Int?      // Slider 1-10: self-awareness level
  stressResponse             Int?      // Slider 1-10: stress management ability
  decisionMaking             Int?      // Slider 1-10: decision confidence
  selfReflection             Int?      // Slider 1-10: reflection frequency
  thoughtPatterns            Int?      // Slider 1-10: thought clarity
  mindfulnessInDailyLife     Int?      // Slider 1-10: daily mindfulness practice
  
  // Detailed Meditation Experience
  mindfulnessExperience      String?   // Multiple choice: experience type
  meditationBackgroundDetail String?   // Multiple choice: detailed background
  practiceGoals              String[]  // Multiple choice array: specific goals
  preferredDuration          Int?      // Slider 1-10: session length preference
  biggestChallenges          String[]  // Multiple choice array: practice obstacles
  motivation                 Int?      // Slider 1-10: motivation level

  isCompleted DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("questionnaires")
}

model SelfAssessment {
  id     String @id @default(cuid())
  userId String
  type   AssessmentType // initial, mid, final
  
  foodTaste       String // "none", "some", "strong"
  scentsAromas    String // "none", "some", "strong"
  soundsMusic     String // "none", "some", "strong"
  visualBeauty    String // "none", "some", "strong"
  touchTextures   String // "none", "some", "strong"
  thoughtsMental  String // "none", "some", "strong"
  
  completedAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("self_assessments")
}

model MeditationSession {
  id        String   @id @default(cuid())
  userId    String
  stageId   String
  sessionId String
  
  // Session Data
  startTime    DateTime
  endTime      DateTime?
  duration     Int? // in seconds
  posture      String?
  completed    Boolean @default(false)
  
  // PAHM Matrix Data (for applicable sessions)
  pahmMatrixClicks PahmMatrixClick[]
  
  // Session Feedback
  reflection SessionReflection?
  
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("meditation_sessions")
}

model HardwareDevice {
  id        String   @id @default(cuid())
  deviceId  String   @unique
  deviceType String  // "pahm_matrix"
  firmware  String
  buttons   Int      @default(9)
  status    DeviceStatus @default(disconnected)
  
  // Connection tracking
  lastSeen     DateTime?
  calibratedAt DateTime?
  
  // Relationships
  sessions     MeditationSession[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("hardware_devices")
}

model PahmMatrixClick {
  id        String @id @default(cuid())
  sessionId String
  buttonId  String
  timestamp Int // milliseconds from session start
  clickCount Int @default(1)
  
  // Hardware integration fields
  deviceId  String?  // Optional - for hardware clicks
  intensity Int?     // Optional - for pressure-sensitive buttons
  
  session MeditationSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@map("pahm_matrix_clicks")
}

// Update existing MeditationSession model
model MeditationSession {
  id        String   @id @default(cuid())
  userId    String
  stageId   String
  sessionId String
  
  // Session Data
  startTime    DateTime
  endTime      DateTime?
  duration     Int? // in seconds
  posture      String?
  completed    Boolean @default(false)
  
  // Hardware integration
  hardwareDeviceId String?
  inputMethod      InputMethod @default(web) // web, hardware
  
  // PAHM Matrix Data (for applicable sessions)
  pahmMatrixClicks PahmMatrixClick[]
  
  // Session Feedback
  reflection SessionReflection?
  
  createdAt DateTime @default(now())
  
  user           User @relation(fields: [userId], references: [id], onDelete: Cascade)
  hardwareDevice HardwareDevice? @relation(fields: [hardwareDeviceId], references: [id])
  
  @@map("meditation_sessions")
}

// New Enums
enum DeviceStatus {
  disconnected
  connecting
  connected
  calibrated
  error
}

enum InputMethod {
  web
  hardware
  hybrid
}

model SessionReflection {
  id        String @id @default(cuid())
  sessionId String @unique
  
  feeling    Int? // 1-10 scale
  challenges String?
  insights   String?
  
  createdAt DateTime @default(now())
  
  session MeditationSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@map("session_reflections")
}

model DailyNote {
  id     String @id @default(cuid())
  userId String
  type   NoteType // emoji, detailed
  
  // Emoji note
  emoji String?
  
  // Detailed note
  note      String?
  emotion   String?
  intensity Int? // 1-10 scale
  trigger   String?
  
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("daily_notes")
}

model HappinessScore {
  id     String @id @default(cuid())
  userId String
  
  score        Float
  calculatedAt DateTime @default(now())
  
  // Calculation components (for transparency)
  questionnaireWeight Float?
  assessmentWeight    Float?
  sessionWeight       Float?
  dailyNotesWeight    Float?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("happiness_scores")
}

// NextAuth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

// Enums
enum AssessmentType {
  initial
  mid
  final
}

enum NoteType {
  emoji
  detailed
}
```

#### **Key Database Design Benefits:**
- **Type Safety**: All database operations are type-checked
- **Relationships**: Clear foreign key relationships with cascade deletes
- **Flexibility**: JSON-like flexibility where needed (questionnaire responses)
- **Performance**: Optimized queries with proper indexing
- **Data Integrity**: ACID transactions for happiness score calculations
- **Future Ready**: Schema designed to accommodate hardware integration when needed

### **Authentication & Security**

```bash
Next.js Auth Stack:
├── NextAuth.js (Complete auth solution)
├── Google OAuth Provider
├── JWT Strategy
├── Prisma Adapter (automatic session management)
├── bcryptjs (Password hashing)
├── Zod (Input validation)
└── CSRF Protection (built-in)
```

**NextAuth.js Configuration Example:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.isAdmin = token.isAdmin
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### **File Storage & Media**

```bash
Storage Stack:
├── Vercel Blob (Simple file uploads)
├── AWS S3 (Production scale)
├── Cloudinary (Image optimization)
└── Local storage (Development)
```

### **Real-time & Performance**

```bash
Performance Features:
├── Next.js Server Components (Better performance)
├── Socket.io/WebSocket (Real-time sessions & future hardware)
├── React Query/SWR (Data fetching & caching)
├── Redis (Optional - for session caching)
└── Vercel Edge Functions (Global performance)
```

### **🔌 Future Hardware Integration (Provision)**

```bash
Hardware Integration (Future):
├── WebSocket API (Real-time communication)
├── ESP32 Support (9-button PAHM matrix)
├── Device Management System
└── Hybrid Input Mode (Web + Hardware)
```

**Future Implementation Strategy:**
- **Phase 1**: Build complete web application with software PAHM matrix
- **Phase 2**: Add WebSocket infrastructure for real-time features
- **Phase 3**: Integrate ESP32 hardware via WebSocket communication
- **Phase 4**: Enhance with device management and calibration

**Current Focus**: Web-based application with provision for future hardware enhancement

---

## 🚀 UPDATED SETUP GUIDE

### **Phase 1: Next.js Full-Stack Setup**

#### **1. Create Next.js Project**
```bash
# Create project with all necessary features
npx create-next-app@latest meditation-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd meditation-app
```

#### **2. Install Core Dependencies**
```bash
# Database & ORM
npm install prisma @prisma/client
npm install -D prisma

# Authentication
npm install next-auth @next-auth/prisma-adapter
npm install bcryptjs
npm install -D @types/bcryptjs

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# UI & State Management
npm install zustand framer-motion lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install @radix-ui/react-slider @radix-ui/react-toast

# Real-time & Hardware Integration (Future)
npm install socket.io-client # For future real-time features
npm install -D @types/socket.io-client

# Utilities
npm install date-fns clsx tailwind-merge
```

#### **3. Initialize Prisma**
```bash
# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env with DATABASE_URL
```

#### **4. Database Setup**
```bash
# Option 1: Local PostgreSQL
brew install postgresql  # macOS
# or
sudo apt install postgresql  # Ubuntu

# Option 2: Cloud PostgreSQL
# - Supabase (Free tier: 500MB)
# - Railway (Free tier: 1GB)
# - Neon (Free tier: 3GB)
# - PlanetScale (Free tier: 5GB)
```

### **Phase 2: Project Structure (Optimized for The Return of Attention)**

```
the-return-of-attention/
├── prisma/
│   ├── schema.prisma              # Complete database schema with all models
│   ├── migrations/                # Database migrations history
│   ├── seed.ts                    # Seed data for stages, sessions, initial data
│   └── seeds/                     # Seed data files
│       ├── stages.json            # 6 stages with sub-stages (T1-T5 for Stage 1)
│       ├── session-types.json     # Timer-only vs PAHM matrix sessions
│       └── admin-users.json       # Initial admin user data
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Public route group (before authentication)
│   │   │   ├── page.tsx           # Landing/Welcome page
│   │   │   ├── about/
│   │   │   │   └── page.tsx       # About page with PAHM methodology
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx       # Privacy policy
│   │   │   ├── terms/
│   │   │   │   └── page.tsx       # Terms of service
│   │   │   └── layout.tsx         # Public layout (header with sign in/up)
│   │   ├── (auth)/                # Authentication route group
│   │   │   ├── signin/
│   │   │   │   └── page.tsx       # Sign in page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx       # Sign up page
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx       # Email verification page
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx       # Forgot password page
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx       # Password reset page
│   │   │   └── layout.tsx         # Auth layout (minimal, centered)
│   │   ├── (onboarding)/          # Onboarding route group (authenticated)
│   │   │   ├── personal-info/
│   │   │   │   └── page.tsx       # Personal information collection
│   │   │   ├── questionnaire/
│   │   │   │   ├── page.tsx       # Multi-step questionnaire
│   │   │   │   ├── step/
│   │   │   │   │   └── [stepNumber]/
│   │   │   │   │       └── page.tsx # Individual questionnaire steps (1-6)
│   │   │   │   └── success/
│   │   │   │       └── page.tsx   # Questionnaire completion success
│   │   │   ├── self-assessment/
│   │   │   │   ├── page.tsx       # 6-category self-assessment (3-choice scale)
│   │   │   │   └── success/
│   │   │   │       └── page.tsx   # Self-assessment completion & happiness score
│   │   │   └── layout.tsx         # Onboarding layout with progress indicator
│   │   ├── (app)/                 # Main application route group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Main dashboard (happiness score, stages, assessment status)
│   │   │   ├── progress/
│   │   │   │   └── page.tsx       # Detailed progress overview
│   │   │   ├── stages/
│   │   │   │   ├── page.tsx       # Stages overview (integrated in dashboard)
│   │   │   │   └── [stageId]/
│   │   │   │       ├── page.tsx   # Individual stage page
│   │   │   │       └── sessions/
│   │   │   │           └── [sessionId]/
│   │   │   │               └── page.tsx # Session preparation
│   │   │   ├── sessions/
│   │   │   │   ├── preparation/
│   │   │   │   │   └── [sessionId]/
│   │   │   │   │       └── page.tsx # Session preparation page
│   │   │   │   ├── posture/
│   │   │   │   │   └── [sessionId]/
│   │   │   │   │       └── page.tsx # Posture selection page
│   │   │   │   ├── practice/
│   │   │   │   │   └── [sessionId]/
│   │   │   │   │       ├── timer/
│   │   │   │   │       │   └── page.tsx # Stage 1 timer-only sessions
│   │   │   │   │       └── pahm/
│   │   │   │   │           └── page.tsx # Stage 2+ PAHM matrix sessions
│   │   │   │   └── completion/
│   │   │   │       └── [sessionId]/
│   │   │   │           └── page.tsx # Session completion & feedback
│   │   │   ├── mind-recovery/
│   │   │   │   └── page.tsx       # Mind Recovery page (unlocked after Stage 1)
│   │   │   ├── daily-notes/
│   │   │   │   └── page.tsx       # Daily notes & mood tracking
│   │   │   ├── profile/
│   │   │   │   └── page.tsx       # User profile & account settings
│   │   │   ├── help/
│   │   │   │   └── page.tsx       # Help & support page
│   │   │   └── layout.tsx         # Main app layout with navigation
│   │   ├── (admin)/               # Admin route group
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx       # Admin dashboard
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx   # Admin-specific login
│   │   │   │   ├── users/
│   │   │   │   │   ├── page.tsx   # User management page
│   │   │   │   │   └── [userId]/
│   │   │   │   │       └── page.tsx # Individual user details
│   │   │   │   ├── sessions/
│   │   │   │   │   └── page.tsx   # Session management & analytics
│   │   │   │   ├── system/
│   │   │   │   │   └── page.tsx   # System monitoring
│   │   │   │   └── analytics/
│   │   │   │       └── page.tsx   # Analytics & reports
│   │   │   └── layout.tsx         # Admin layout with admin navigation
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts   # NextAuth.js configuration
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts   # User registration
│   │   │   │   ├── verify-email/
│   │   │   │   │   └── route.ts   # Email verification
│   │   │   │   └── reset-password/
│   │   │   │       └── route.ts   # Password reset
│   │   │   ├── user/
│   │   │   │   ├── profile/
│   │   │   │   │   └── route.ts   # GET/PUT user profile
│   │   │   │   ├── personal-info/
│   │   │   │   │   └── route.ts   # PUT personal information
│   │   │   │   ├── preferences/
│   │   │   │   │   └── route.ts   # GET/PUT user preferences
│   │   │   │   ├── change-password/
│   │   │   │   │   └── route.ts   # PUT password change
│   │   │   │   └── delete-account/
│   │   │   │       └── route.ts   # DELETE account
│   │   │   ├── assessment/
│   │   │   │   ├── questionnaire/
│   │   │   │   │   ├── route.ts   # POST questionnaire submission
│   │   │   │   │   └── status/
│   │   │   │   │       └── route.ts # GET questionnaire status
│   │   │   │   ├── self-assessment/
│   │   │   │   │   └── route.ts   # POST self-assessment submission
│   │   │   │   ├── history/
│   │   │   │   │   └── route.ts   # GET assessment history
│   │   │   │   └── type/
│   │   │   │       └── route.ts   # GET assessment type check
│   │   │   ├── stages/
│   │   │   │   ├── route.ts       # GET all stages
│   │   │   │   └── [stageId]/
│   │   │   │       ├── route.ts   # GET individual stage
│   │   │   │       └── unlock/
│   │   │   │           └── route.ts # GET stage unlock check
│   │   │   ├── session/
│   │   │   │   ├── start/
│   │   │   │   │   └── route.ts   # POST session start
│   │   │   │   ├── update/
│   │   │   │   │   └── route.ts   # PUT session update
│   │   │   │   ├── complete/
│   │   │   │   │   └── route.ts   # POST session completion
│   │   │   │   ├── history/
│   │   │   │   │   └── route.ts   # GET session history
│   │   │   │   └── progress/
│   │   │   │       └── route.ts   # GET user progress
│   │   │   ├── pahm/
│   │   │   │   ├── start/
│   │   │   │   │   └── route.ts   # POST PAHM session start
│   │   │   │   ├── click/
│   │   │   │   │   └── route.ts   # POST PAHM click tracking
│   │   │   │   ├── complete/
│   │   │   │   │   └── route.ts   # POST PAHM session completion
│   │   │   │   └── session/
│   │   │   │       └── [sessionId]/
│   │   │   │           └── route.ts # GET PAHM session data
│   │   │   ├── progress/
│   │   │   │   ├── overview/
│   │   │   │   │   └── route.ts   # GET user progress overview
│   │   │   │   └── stages/
│   │   │   │       └── route.ts   # GET stage progression
│   │   │   ├── notes/
│   │   │   │   ├── emoji/
│   │   │   │   │   └── route.ts   # POST emoji note submission
│   │   │   │   ├── detailed/
│   │   │   │   │   └── route.ts   # POST detailed note submission
│   │   │   │   ├── history/
│   │   │   │   │   └── route.ts   # GET notes history
│   │   │   │   └── trends/
│   │   │   │       └── route.ts   # GET mood trends
│   │   │   ├── happiness/
│   │   │   │   ├── calculate/
│   │   │   │   │   └── route.ts   # POST happiness score calculation
│   │   │   │   ├── history/
│   │   │   │   │   └── route.ts   # GET happiness score history
│   │   │   │   ├── breakdown/
│   │   │   │   │   └── route.ts   # GET happiness score breakdown
│   │   │   │   └── trends/
│   │   │   │       └── route.ts   # GET happiness trends
│   │   │   └── admin/
│   │   │       ├── auth/
│   │   │       │   └── login/
│   │   │       │       └── route.ts # POST admin login
│   │   │       ├── users/
│   │   │       │   ├── route.ts   # GET admin user list
│   │   │       │   ├── [userId]/
│   │   │       │   │   └── route.ts # GET/PUT/DELETE admin user operations
│   │   │       │   └── bulk/
│   │   │       │       └── route.ts # POST bulk user operations
│   │   │       ├── stats/
│   │   │       │   └── route.ts   # GET system statistics
│   │   │       ├── analytics/
│   │   │       │   ├── users/
│   │   │       │   │   └── route.ts # GET user analytics
│   │   │       │   ├── sessions/
│   │   │       │   │   └── route.ts # GET session analytics
│   │   │       │   └── happiness/
│   │   │       │       └── route.ts # GET happiness analytics
│   │   │       ├── system/
│   │   │       │   └── monitor/
│   │   │       │       └── route.ts # GET system monitoring
│   │   │       └── sessions/
│   │   │           └── manage/
│   │   │               └── route.ts # POST session management
│   │   ├── globals.css            # Global styles with meditation theme
│   │   ├── layout.tsx             # Root layout
│   │   ├── loading.tsx            # Global loading UI
│   │   ├── error.tsx              # Global error UI
│   │   ├── not-found.tsx          # 404 page
│   │   └── favicon.ico
│   ├── components/                # Reusable components
│   │   ├── ui/                    # Base UI components (shadcn/ui style)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── badge.tsx
│   │   │   └── loading.tsx
│   │   ├── auth/                  # Authentication components
│   │   │   ├── signin-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── reset-password-form.tsx
│   │   │   ├── auth-guard.tsx
│   │   │   └── oauth-buttons.tsx
│   │   ├── onboarding/            # Onboarding flow components
│   │   │   ├── personal-info-form.tsx
│   │   │   ├── questionnaire/
│   │   │   │   ├── questionnaire-step.tsx
│   │   │   │   ├── progress-indicator.tsx
│   │   │   │   └── step-navigation.tsx
│   │   │   ├── self-assessment/
│   │   │   │   ├── assessment-category.tsx
│   │   │   │   ├── attachment-scale.tsx
│   │   │   │   └── assessment-progress.tsx
│   │   │   └── completion-success.tsx
│   │   ├── dashboard/             # Dashboard components
│   │   │   ├── happiness-score-display.tsx
│   │   │   ├── assessment-status-overview.tsx
│   │   │   ├── stages-overview.tsx
│   │   │   ├── stage-card.tsx
│   │   │   ├── progress-summary.tsx
│   │   │   ├── streak-counter.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── stages/                # Stage-related components
│   │   │   ├── stage-details.tsx
│   │   │   ├── stage-progression.tsx
│   │   │   ├── session-list.tsx
│   │   │   ├── unlock-requirements.tsx
│   │   │   └── stage-completion-badge.tsx
│   │   ├── sessions/              # Session components
│   │   │   ├── session-preparation.tsx
│   │   │   ├── posture-selection.tsx
│   │   │   ├── timer/
│   │   │   │   ├── meditation-timer.tsx
│   │   │   │   ├── timer-controls.tsx
│   │   │   │   └── session-guidance.tsx
│   │   │   ├── pahm/
│   │   │   │   ├── pahm-matrix.tsx
│   │   │   │   ├── matrix-button.tsx
│   │   │   │   ├── matrix-explanation.tsx
│   │   │   │   └── click-tracking.tsx
│   │   │   ├── session-completion.tsx
│   │   │   ├── session-feedback.tsx
│   │   │   └── session-summary.tsx
│   │   ├── mind-recovery/         # Mind Recovery components
│   │   │   ├── exercise-card.tsx
│   │   │   ├── exercise-recommendation.tsx
│   │   │   └── recovery-timer.tsx
│   │   ├── progress/              # Progress tracking components
│   │   │   ├── progress-overview.tsx
│   │   │   ├── happiness-trends.tsx
│   │   │   ├── session-statistics.tsx
│   │   │   ├── achievement-badges.tsx
│   │   │   └── progress-charts.tsx
│   │   ├── daily-notes/           # Daily notes components
│   │   │   ├── emoji-mood-selector.tsx
│   │   │   ├── detailed-notes-form.tsx
│   │   │   ├── emotion-intensity-slider.tsx
│   │   │   ├── notes-history.tsx
│   │   │   └── mood-trends.tsx
│   │   ├── profile/               # Profile & settings components
│   │   │   ├── profile-form.tsx
│   │   │   ├── account-settings.tsx
│   │   │   ├── password-change.tsx
│   │   │   ├── privacy-settings.tsx
│   │   │   └── data-export.tsx
│   │   ├── admin/                 # Admin components
│   │   │   ├── admin-auth-guard.tsx
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── user-management/
│   │   │   │   ├── user-table.tsx
│   │   │   │   ├── user-details.tsx
│   │   │   │   ├── user-search.tsx
│   │   │   │   └── bulk-operations.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── analytics-charts.tsx
│   │   │   │   ├── user-engagement.tsx
│   │   │   │   ├── session-analytics.tsx
│   │   │   │   └── happiness-analytics.tsx
│   │   │   ├── system/
│   │   │   │   ├── system-monitor.tsx
│   │   │   │   ├── performance-metrics.tsx
│   │   │   │   └── error-logs.tsx
│   │   │   └── session-management.tsx
│   │   ├── layout/                # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── breadcrumbs.tsx
│   │   └── common/                # Common reusable components
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── confirmation-dialog.tsx
│   │       ├── data-table.tsx
│   │       ├── chart-wrapper.tsx
│   │       └── page-header.tsx
│   ├── lib/                       # Utilities & configurations
│   │   ├── prisma.ts              # Prisma client setup
│   │   ├── auth.ts                # NextAuth.js configuration
│   │   ├── validations/           # Zod validation schemas
│   │   │   ├── auth.ts            # Auth form validations
│   │   │   ├── user.ts            # User profile validations
│   │   │   ├── questionnaire.ts   # Questionnaire validations
│   │   │   ├── assessment.ts      # Self-assessment validations (3-choice scale)
│   │   │   ├── session.ts         # Session validations
│   │   │   ├── notes.ts           # Daily notes validations
│   │   │   └── admin.ts           # Admin operations validations
│   │   ├── calculations/          # Business logic calculations
│   │   │   ├── happiness.ts       # Happiness score algorithm
│   │   │   ├── stage-progression.ts # Stage unlock logic
│   │   │   ├── session-requirements.ts # Session completion logic
│   │   │   └── analytics.ts       # Analytics calculations
│   │   ├── utils.ts               # General utility functions
│   │   ├── constants.ts           # App constants and configurations
│   │   ├── middleware.ts          # Auth middleware
│   │   ├── emails.ts              # Email templates and sending
│   │   ├── api-client.ts          # API client utilities
│   │   └── stores/                # Zustand stores
│   │       ├── auth-store.ts      # Authentication state
│   │       ├── session-store.ts   # Current session state
│   │       ├── ui-store.ts        # UI state management
│   │       ├── assessment-store.ts # Assessment progress state
│   │       └── progress-store.ts  # User progress state
│   ├── types/                     # TypeScript type definitions
│   │   ├── auth.ts                # Authentication types
│   │   ├── user.ts                # User and profile types
│   │   ├── questionnaire.ts       # Questionnaire types
│   │   ├── assessment.ts          # Self-assessment types (3-choice scale)
│   │   ├── session.ts             # Meditation session types
│   │   ├── pahm.ts                # PAHM matrix types
│   │   ├── stage.ts               # Stage progression types
│   │   ├── happiness.ts           # Happiness calculation types
│   │   ├── notes.ts               # Daily notes types
│   │   ├── admin.ts               # Admin types
│   │   ├── api.ts                 # API response types
│   │   └── database.ts            # Prisma generated types
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-auth.ts            # Authentication hooks
│   │   ├── use-session.ts         # Session management hooks
│   │   ├── use-timer.ts           # Meditation timer hooks
│   │   ├── use-pahm-matrix.ts     # PAHM matrix interaction hooks
│   │   ├── use-happiness.ts       # Happiness score hooks
│   │   ├── use-progress.ts        # Progress tracking hooks
│   │   ├── use-debounce.ts        # Debounce utility hook
│   │   └── use-api.ts             # API interaction hooks
│   └── styles/                    # Additional styles
│       ├── globals.css            # Global styles and meditation theme
│       ├── components.css         # Component-specific styles
│       └── meditation-theme.css   # PAHM methodology themed styles
├── public/                        # Static files
│   ├── audio/                     # Meditation audio files
│   │   ├── stage1/                # Stage 1 timer guidance audio
│   │   ├── stage2+/               # PAHM matrix guidance audio
│   │   ├── mind-recovery/         # Mind Recovery exercise audio
│   │   └── general/               # General meditation sounds
│   ├── images/                    # Images and graphics
│   │   ├── stages/                # Stage-specific images
│   │   ├── pahm/                  # PAHM matrix illustrations
│   │   ├── postures/              # Meditation posture guides
│   │   ├── icons/                 # App icons and SVGs
│   │   └── logos/                 # App logos and branding
│   ├── docs/                      # Documentation files
│   │   ├── pahm-methodology.pdf   # PAHM methodology guide
│   │   ├── user-manual.pdf        # User manual
│   │   └── privacy-policy.pdf     # Privacy policy document
│   ├── favicon.ico
│   ├── manifest.json              # PWA manifest
│   ├── robots.txt
│   └── sitemap.xml
├── tests/                         # Test files (future)
│   ├── __mocks__/                 # Test mocks
│   ├── api/                       # API route tests
│   ├── components/                # Component tests
│   ├── lib/                       # Utility function tests
│   └── e2e/                       # End-to-end tests
├── docs/                          # Additional documentation
│   ├── api-documentation.md       # API documentation
│   ├── deployment-guide.md        # Deployment instructions
│   ├── database-schema.md         # Database schema documentation
│   └── contributing.md            # Contribution guidelines
├── .env                           # Environment variables template
├── .env.local                     # Local environment (git ignored)
├── .env.example                   # Environment variables example
├── .gitignore                     # Git ignore rules
├── .eslintrc.json                 # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration with meditation theme
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Dependency lock file
├── README.md                      # Project documentation
└── vercel.json                    # Vercel deployment configuration
```

### **Key Structure Benefits for Our Meditation App:**

#### **1. Route Organization Aligned with User Journey:**
- **(public)**: Landing and info pages for unauthenticated users
- **(auth)**: Complete authentication flow
- **(onboarding)**: Step-by-step onboarding with assessments
- **(app)**: Main application with all meditation features
- **(admin)**: Secure admin interface

#### **2. Component Organization by Feature:**
- **Meditation-specific components**: Timer, PAHM matrix, session management
- **Assessment components**: Questionnaire and self-assessment flows
- **Progress tracking**: Happiness scores, stage progression
- **Admin tools**: User management, analytics, system monitoring

#### **3. Business Logic Separation:**
- **`lib/calculations/`**: All happiness and progression algorithms
- **`lib/validations/`**: Input validation for each feature
- **`lib/stores/`**: State management for complex user flows

#### **4. Type Safety Throughout:**
- **Feature-specific types**: Each major feature has dedicated type definitions
- **Database types**: Prisma-generated types for type-safe database operations
- **API types**: Consistent API response types

#### **5. Scalable File Organization:**
- **Nested API routes**: Clear organization of all 50+ API endpoints
- **Component hierarchy**: Reusable UI components with meditation-specific variants
- **Asset organization**: Audio, images, and docs organized by feature

#### **6. Future-Ready Architecture:**
- **Hardware integration provision**: Ready for ESP32 PAHM matrix integration
- **Real-time features**: Structure supports WebSocket integration
- **Testing framework**: Organized test structure for future testing implementation
- **Documentation**: Comprehensive docs for maintenance and contribution
│   └── styles/                    # Additional styles
│       └── globals.css
├── public/                        # Static files
│   ├── audio/                     # Meditation audio files
│   ├── images/                    # Images and icons
│   └── favicon.ico
├── .env                           # Environment variables
├── .env.local                     # Local environment (git ignored)
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

### **Phase 3: Environment Configuration**

#### **Environment Variables (.env.local)**
```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
# Get this from Supabase Dashboard → Settings → Database

# NextAuth.js
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"
# For production: NEXTAUTH_URL="https://your-app.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Supabase Additional Features
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
# Get these from Supabase Dashboard → Settings → API

# Optional: File Storage (Supabase Storage or Vercel Blob)
# Supabase Storage (included in free tier)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# OR Vercel Blob
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Hardware Integration (Future)
HARDWARE_WEBSOCKET_PORT=8080  # For future WebSocket server
```

#### **Supabase Setup Steps:**

**Step 1: Create Supabase Project**
```bash
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended)
4. Click "New project"
5. Choose your organization
6. Enter project details:
   - Name: "meditation-app" or "the-return-of-attention"
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to your target users
   - Pricing: Start with Free tier
7. Click "Create new project"
8. Wait 2-3 minutes for setup to complete
```

**Step 2: Get Connection Details**
```bash
1. In your Supabase dashboard
2. Go to Settings → Database
3. Scroll down to "Connection string"
4. Copy the "URI" format string
5. Replace [YOUR-PASSWORD] with your database password
6. This is your DATABASE_URL for .env.local
```

**Step 3: Optional - Get API Keys**
```bash
1. Go to Settings → API
2. Copy "Project URL" (NEXT_PUBLIC_SUPABASE_URL)
3. Copy "anon public" key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Copy "service_role" key (SUPABASE_SERVICE_ROLE_KEY)
# These are for advanced Supabase features (real-time, storage)
```

# Optional: Real-time (if needed)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-cluster"

# Hardware Integration
HARDWARE_WEBSOCKET_PORT=8080  # For future WebSocket server
```

#### **Cloud Database Setup (Supabase):**

**1. Create Supabase Project**
```bash
# Go to: https://supabase.com
# 1. Sign up/Sign in
# 2. Create new project
# 3. Choose region (closest to your users)
# 4. Set database password (save this!)
# 5. Wait for project to be ready (~2 minutes)
```

**2. Get Database Connection String**
```bash
# In Supabase Dashboard:
# Settings → Database → Connection string
# Copy the URI format connection string
# Example: postgresql://postgres:[password]@[host]:5432/postgres
```

**3. Configure Environment Variables**
```env
# .env.local
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
# Replace [YOUR-PASSWORD] and [YOUR-HOST] with actual values from Supabase
```

---

## 🔧 DEVELOPMENT WORKFLOW

### **🔌 Hardware Integration Provision (Future)**

To prepare for future ESP32 PAHM matrix integration, the application architecture includes:

#### **Database Schema Preparation:**
```prisma
// Future hardware support in Prisma schema
model PahmMatrixClick {
  id        String @id @default(cuid())
  sessionId String
  buttonId  String
  timestamp Int // milliseconds from session start
  clickCount Int @default(1)
  
  // Future hardware fields (optional)
  deviceId  String?  // For hardware device identification
  inputType String   @default("web") // "web" or "hardware"
  
  session MeditationSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@map("pahm_matrix_clicks")
}

model MeditationSession {
  id        String   @id @default(cuid())
  userId    String
  stageId   String
  sessionId String
  
  // Session Data
  startTime    DateTime
  endTime      DateTime?
  duration     Int? // in seconds
  posture      String?
  completed    Boolean @default(false)
  
  // Future hardware provision
  inputMethod  String @default("web") // "web", "hardware", "hybrid"
  
  // PAHM Matrix Data (for applicable sessions)
  pahmMatrixClicks PahmMatrixClick[]
  
  // Session Feedback
  reflection SessionReflection?
  
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("meditation_sessions")
}
```

#### **API Structure for Future Hardware:**
```typescript
// app/api/sessions/[id]/pahm/route.ts
// Designed to handle both web and hardware input

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { buttonId, timestamp, inputType = 'web', deviceId } = body
    
    const pahmClick = await prisma.pahmMatrixClick.create({
      data: {
        sessionId: params.id,
        buttonId: buttonId.toString(),
        timestamp,
        inputType, // Ready for "hardware" input
        deviceId,  // Ready for device identification
      },
    })
    
    return NextResponse.json({ success: true, data: pahmClick })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 })
  }
}
```

#### **Component Structure Ready for Hardware:**
```typescript
// components/sessions/pahm-matrix.tsx
// Built to support both web clicks and future hardware input

'use client'

export function PahmMatrix({ sessionId }: { sessionId: string }) {
  const [inputMethod, setInputMethod] = useState<'web' | 'hardware'>('web')
  
  const handleButtonClick = async (buttonId: number) => {
    // This function works for both web and future hardware
    await fetch(`/api/sessions/${sessionId}/pahm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buttonId,
        timestamp: Date.now(),
        inputType: inputMethod,
        deviceId: inputMethod === 'hardware' ? 'esp32_device_id' : null
      })
    })
  }
  
  return (
    <div className="pahm-matrix">
      {/* 3x3 button grid for web interface */}
      {/* Future: Disable when hardware is connected */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((buttonId) => (
          <button
            key={buttonId}
            onClick={() => handleButtonClick(buttonId)}
            disabled={inputMethod === 'hardware'}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            {buttonId}
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Future Hardware Implementation Plan:**
1. **Phase 2**: Add WebSocket server for real-time communication
2. **Phase 3**: Develop ESP32 firmware for 9-button matrix
3. **Phase 4**: Implement device pairing and management
4. **Phase 5**: Add hardware-web hybrid mode

### **1. Initial Setup Commands**
```bash
# 1. Create and setup project
npx create-next-app@latest meditation-app --typescript --tailwind --app
cd meditation-app

# 2. Install all dependencies
npm install prisma @prisma/client next-auth @next-auth/prisma-adapter
npm install bcryptjs react-hook-form @hookform/resolvers zod
npm install zustand framer-motion lucide-react date-fns
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-slider

# 3. Install dev dependencies
npm install -D @types/bcryptjs prisma

# 4. Initialize Prisma
npx prisma init

# 5. Setup database schema (copy the schema from above)
# Edit prisma/schema.prisma

# 6. Run first migration
npx prisma migrate dev --name init

# 7. Generate Prisma client
npx prisma generate

# 8. Start development server
npm run dev
```

### **2. API Development Pattern (Next.js API Routes)**
```typescript
// app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSessionSchema = z.object({
  stageId: z.string(),
  sessionId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { stageId, sessionId } = createSessionSchema.parse(body)

    const meditationSession = await prisma.meditationSession.create({
      data: {
        userId: session.user.id,
        stageId,
        sessionId,
        startTime: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: meditationSession,
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.meditationSession.findMany({
      where: { userId: session.user.id },
      include: {
        reflection: true,
        pahmMatrixClicks: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: sessions,
    })
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **3. Database Operations with Prisma**
```typescript
// lib/database/users.ts
import { prisma } from '@/lib/prisma'

export const userService = {
  async createUser(data: {
    email: string
    firstName: string
    lastName: string
    password: string
  }) {
    return await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      },
    })
  },

  async getUserWithProgress(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        questionnaire: true,
        selfAssessments: {
          orderBy: { completedAt: 'desc' },
        },
        meditationSessions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        happinessScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    })
  },

  async updateHappinessScore(userId: string, score: number) {
    return await prisma.happinessScore.create({
      data: {
        userId,
        score,
        calculatedAt: new Date(),
      },
    })
  },
}
```

### **4. Frontend Component with API Integration**
```typescript
// components/dashboard/happiness-score.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface HappinessScore {
  score: number
  calculatedAt: string
}

export function HappinessScore() {
  const { data: session } = useSession()
  const [score, setScore] = useState<HappinessScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchHappinessScore()
    }
  }, [session])

  const fetchHappinessScore = async () => {
    try {
      const response = await fetch('/api/happiness')
      const data = await response.json()
      
      if (data.success) {
        setScore(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch happiness score:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />
  }

  if (!score) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800">
          Complete your assessments to see your happiness score
        </h3>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
      <h3 className="text-lg font-semibold mb-2">Your Happiness Score</h3>
      <div className="text-4xl font-bold">{score.score.toFixed(1)}</div>
      <p className="text-blue-100 text-sm mt-2">
        Last updated: {new Date(score.calculatedAt).toLocaleDateString()}
      </p>
    </div>
  )
}
```

---

## 📊 DEPLOYMENT STRATEGY

### **🎯 FINALIZED: Vercel Deployment**

```bash
Production Stack:
├── Frontend + Backend: Vercel (Next.js optimized)
├── Database: Supabase PostgreSQL
├── File Storage: Supabase Storage (or Vercel Blob)
├── Monitoring: Vercel Analytics
├── Domain: Custom domain via Vercel
└── SSL: Automatic HTTPS
```

#### **Vercel Deployment Guide:**

**Step 1: Prepare Your Repository**
```bash
# 1. Initialize Git repository
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repository
# Go to github.com → New repository
# Name: "meditation-app" or "the-return-of-attention"

# 3. Push to GitHub
git remote add origin https://github.com/yourusername/meditation-app.git
git branch -M main
git push -u origin main
```

**Step 2: Deploy to Vercel**
```bash
# Option 1: Vercel CLI (Recommended)
npm i -g vercel
vercel login
vercel --prod

# Option 2: Vercel Dashboard
# 1. Go to vercel.com
# 2. Sign up with GitHub
# 3. Click "New Project"
# 4. Import your GitHub repository
# 5. Configure settings (Framework Preset: Next.js)
# 6. Deploy
```

**Step 3: Configure Environment Variables in Vercel**
```bash
# In Vercel Dashboard → Project → Settings → Environment Variables
# Add all your .env.local variables:

DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional Supabase features:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Step 4: Database Migration**
```bash
# Run Prisma migration on production database
npx prisma migrate deploy

# Or use Vercel CLI
vercel env pull .env.local  # Download production env vars
npx prisma migrate deploy   # Apply migrations
npx prisma generate         # Generate client
```

**Step 5: Custom Domain (Optional)**
```bash
# In Vercel Dashboard → Project → Settings → Domains
# 1. Add your custom domain
# 2. Follow DNS configuration instructions
# 3. SSL is automatically configured
```

#### **Supabase Production Configuration:**

**Database Connection Pooling:**
```bash
# Supabase automatically handles connection pooling
# No additional configuration needed for most apps
# For high-traffic apps, consider:
# Settings → Database → Connection pooling → Enable
```

**Backup Configuration:**
```bash
# Supabase Free Tier:
# - Daily backups (7 days retention)
# - Point-in-time recovery (not available)

# For production apps, consider upgrading to Pro:
# - Point-in-time recovery
# - Longer backup retention
# - Better performance guarantees
```

---

## 🔍 MONITORING & ANALYTICS

### **Built-in Next.js Monitoring**
```bash
Monitoring Stack:
├── Vercel Analytics (Built-in web vitals)
├── Next.js built-in logging
├── Prisma query logging
└── Error boundaries
```

### **Advanced Monitoring (Optional)**
```typescript
// lib/monitoring.ts
import { withSentry } from '@sentry/nextjs'

// Error tracking
export const withErrorHandling = (handler: any) => {
  return withSentry(handler)
}

// Performance monitoring
export const trackPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined') {
    // Track in Vercel Analytics or Google Analytics
    console.log(`Performance: ${metric} = ${value}ms`)
  }
}
```

---

## 🚦 DEVELOPMENT PHASES

### **Phase 1: Foundation (2-3 weeks)**
✅ **Week 1: Basic Setup**
- Next.js project setup with TypeScript
- Prisma schema design and database setup
- NextAuth.js authentication (Google + credentials)
- Basic UI components with Tailwind

✅ **Week 2: Core Authentication**
- Sign up/sign in pages
- Email verification flow
- Password reset functionality
- User profile management

✅ **Week 3: Database & API Foundation**
- Complete Prisma schema implementation
- Basic API routes for users
- Database seeding for testing
- Error handling and validation

### **Phase 2: Core Features (4-5 weeks)**
✅ **Week 4: Questionnaire System**
- Multi-step questionnaire form
- Form validation with Zod
- Progress saving and completion tracking
- Success page and flow

✅ **Week 5: Self-Assessment**
- 6-category assessment interface
- 3-choice selection components (none/some/strong)
- Assessment history tracking
- Initial/mid/final assessment logic

✅ **Week 6: Basic Dashboard**
- Main dashboard layout
- Assessment status display
- Basic happiness score calculation
- Stage overview integration

✅ **Week 7: Session Foundation**
- Session preparation pages
- Posture selection interface
- Basic timer functionality
- Session completion flow

✅ **Week 8: PAHM Matrix**
- Interactive button matrix
- Click tracking with timestamps
- Session data storage
- Matrix analysis display

### **Phase 3: Advanced Features (3-4 weeks)**
✅ **Week 9: Happiness Algorithm**
- Complex happiness score calculation
- Historical score tracking
- Progress visualization
- Score breakdown analysis

✅ **Week 10: Daily Notes & Tracking**
- Emoji mood selection
- Detailed notes interface
- Mood trend visualization
- Historical notes view

✅ **Week 11: Admin Dashboard**
- Admin authentication
- User management interface
- Session analytics
- System monitoring

✅ **Week 12: Mind Recovery**
- Exercise recommendation system
- Time-based auto-suggestions
- Exercise tracking
- Progress monitoring

### **Phase 4: Polish & Deploy (2-3 weeks)**
✅ **Week 13: Performance & Security**
- Code optimization
- Security audit
- Performance testing
- Accessibility improvements

✅ **Week 14: Testing & Bug Fixes**
- End-to-end testing
- User acceptance testing
- Bug fixes and refinements
- Documentation completion

✅ **Week 15: Production Deployment**
- Production environment setup
- Database migration
- Domain configuration
- Launch and monitoring

---

## 💡 NEXT STEPS TO GET STARTED

### **🚀 Immediate Actions (This Week):**

1. **Set up development environment:**
```bash
# Run these commands in order
npx create-next-app@latest meditation-app --typescript --tailwind --app
cd meditation-app
npm install prisma @prisma/client next-auth @next-auth/prisma-adapter bcryptjs
npm install react-hook-form @hookform/resolvers zod zustand
npx prisma init
```

2. **Set up Supabase database:**
- **Go to**: https://supabase.com
- **Create account** with GitHub
- **Create new project**: "meditation-app"
- **Save database password** (you'll need this!)
- **Get connection string** from Settings → Database
- **Add to .env.local** as DATABASE_URL

3. **Copy the Prisma schema** (from the guide above) to `prisma/schema.prisma`

4. **Set up environment variables** in `.env.local`

5. **Run first migration:**
```bash
npx prisma migrate dev --name init
npx prisma generate
npm run dev  # Start development server
```

6. **Deploy to Vercel (when ready):**
```bash
npm i -g vercel
vercel login
vercel --prod
# Add environment variables in Vercel dashboard
```

### **🎯 Key Advantages of Your Finalized Stack:**

✅ **Single Codebase**: Frontend + Backend in one Next.js project  
✅ **Type Safety**: End-to-end TypeScript with Prisma  
✅ **Zero DevOps**: Supabase + Vercel handle all infrastructure  
✅ **Scalability**: Both platforms scale automatically  
✅ **Cost Effective**: Generous free tiers, pay-as-you-scale  
✅ **Global Performance**: Vercel's global CDN + Supabase regions  
✅ **Real-time Ready**: Supabase has built-in real-time subscriptions  
✅ **Backup & Security**: Automatic backups and security features  
✅ **Developer Experience**: Hot reload, preview deployments, easy debugging  

## � **Cost Breakdown:**

### **Free Tier Limits (Perfect for MVP and early users):**
- **Vercel Free**: 100GB bandwidth, unlimited personal projects
- **Supabase Free**: 500MB database, 1GB file storage, 50MB file uploads
- **Total Cost**: $0/month for development and early production

### **Scaling Costs (When you grow):**
- **Vercel Pro**: $20/month (500GB bandwidth, advanced features)
- **Supabase Pro**: $25/month (8GB database, 100GB file storage)
- **Total Cost**: $45/month for serious production usage

### **Enterprise Ready:**
Both platforms offer enterprise features when you need them:
- **Advanced security and compliance**
- **Priority support**
- **SLA guarantees**
- **Custom resource limits**

Your choice is **excellent** for this meditation app! The Next.js full-stack approach will save you significant development time and provide a better developer experience compared to separate frontend/backend repos.

**Would you like me to help you with the initial setup or create some starter code templates for any specific part of the application?**