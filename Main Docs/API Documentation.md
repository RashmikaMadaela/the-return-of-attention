# The Return of Attention - Complete API Documentation

## 📋 Overview
This comprehensive documentation covers all REST API endpoints for "The Return of Attention" PAHM meditation application. It includes complete specifications for methods, data types, purposes, authentication requirements, frontend integration patterns, and triggering events.

**Application**: The Return of Attention - PAHM Meditation App  
**Methodology**: Present Attention and Happiness Matrix (PAHM) by A.C. Amarasighe  
**API Architecture**: RESTful APIs with Next.js 14 App Router  
**Authentication**: NextAuth.js with session-based authentication  
**Database**: PostgreSQL with Prisma ORM  
**Real-time Features**: Server-sent events for session tracking

**Tech Stack**:
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM  
- **Authentication**: NextAuth.js with JWT tokens
- **Validation**: Zod schema validation
- **Security**: bcryptjs password hashing, rate limiting

---

## 🔐 AUTHENTICATION SYSTEM APIs

### **Authentication Flow Overview**
The authentication system supports email/password registration, Google OAuth, email verification, and password reset functionality.

### **POST /api/auth/register**
**Purpose**: Create new user account with email verification  
**Method**: POST  
**Authentication**: None (public endpoint)  
**Rate Limiting**: 5 requests per minute per IP

**Frontend Integration**: 
- Registration form submission
- Auto-redirect to email verification page
- Error handling for existing users

**Request Body**:
```typescript
{
  email: string;           // Valid email format
  password: string;        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  name: string;           // Display name (2-100 characters)  
  confirmPassword: string; // Must match password
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Account created successfully! You can now sign in immediately.",
  "data": {
    "id": "cuid_user_id",
    "email": "user@example.com", 
    "name": "John Doe",
    "emailVerified": "2024-01-01T00:00:00Z",
    "isActive": true
  }
}
```

**Error Responses**:
- **400**: Validation errors (password requirements, invalid email)
- **409**: User already exists
- **500**: Server error

**Triggers**:
- User clicks "Sign Up" button on registration page
- Form validation passes client-side
- Creates verification token in database
- Sends welcome email (currently console logged for testing)

---

### **POST /api/auth/verify-email**
**Purpose**: Verify user email address with token  
**Method**: POST  
**Authentication**: None (public endpoint)  
**Database Impact**: Updates user.emailVerified, removes verification token

**Frontend Integration**:
- Email verification page processes token from URL
- Auto-redirect to dashboard on success
- Shows resend verification option on failure

**Request Body**:
```typescript
{
  token: string; // Verification token from email link
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Email verified successfully! You can now access all features.",
  "data": {
    "verified": true,
    "verifiedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Triggers**:
- User clicks verification link in email
- Page component automatically calls API with token from URL params
- Removes expired tokens from database

---

### **POST /api/auth/reset-password**  
**Purpose**: Reset user password with email token  
**Method**: POST  
**Authentication**: None (public endpoint)  
**Rate Limiting**: 3 requests per hour per email

**Frontend Integration**:
- Password reset form with token validation
- Strength meter for new password
- Auto-redirect to signin on success

**Request Body**:
```typescript
{
  token: string;      // Reset token from email
  newPassword: string; // New password (same validation as registration)
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Password reset successfully. You can now sign in with your new password."
}
```

**Triggers**:
- User submits password reset form
- Token validated and not expired
- Password hashed and updated in database
- Removes reset token after successful use

---

### **POST /api/auth/resend-verification**
**Purpose**: Resend email verification token  
**Method**: POST  
**Authentication**: None (public endpoint)  
**Rate Limiting**: 1 request per 5 minutes per email

**Frontend Integration**:
- "Resend Verification" button on verification page
- Shows countdown timer after successful resend
- Handles already verified users gracefully

**Request Body**:
```typescript
{
  email: string; // Email address to resend verification
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Verification email sent successfully. Please check your inbox."
}
```

**Triggers**:
- User clicks "Resend Verification Email" button
- Creates new verification token
- Sends new verification email
- Previous tokens remain valid until expiry

---

## 👤 USER MANAGEMENT APIs

### **User Profile System Overview**
Complete user profile management with personal information, preferences, security, and account lifecycle management.

### **GET /api/user/profile**
**Purpose**: Retrieve complete user profile with statistics and completion tracking  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: users, user_profiles, questionnaires, self_assessments

**Frontend Integration**:
- Dashboard user info display
- Profile settings page data loading
- Navigation bar user details
- Progress tracking components

**Query Parameters**: None

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "cuid_user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "image": null,
    "emailVerified": "2024-01-01T00:00:00Z",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "profile": {
      "age": 28,
      "gender": "male", 
      "nationality": "United States",
      "country": "United States"
    },
    "completionStatus": {
      "hasProfile": true,
      "hasQuestionnaire": true, 
      "hasInitialAssessment": true,
      "profileCompleteness": 100
    },
    "statistics": {
      "totalSessions": 45,
      "completedStages": 2,
      "currentStreak": 7,
      "joinedDaysAgo": 30,
      "lastActivity": "2024-01-01T10:00:00Z"
    }
  }
}
```

**Error Responses**:
- **401**: User not authenticated
- **404**: User profile not found

**Triggers**:
- Page load on dashboard, profile settings
- Real-time updates after profile changes
- Navigation component mounting

---

### **PUT /api/user/profile**
**Purpose**: Update basic user profile information (name, image)  
**Method**: PUT  
**Authentication**: Authenticated user required  
**Validation**: Zod schema with name length limits

**Frontend Integration**:
- Profile settings form submission
- Image upload integration
- Real-time profile updates

**Request Body**:
```typescript
{
  name?: string;  // 2-100 characters
  image?: string; // Valid URL or null
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "cuid_user_id",
    "name": "Updated Name",
    "image": "https://example.com/avatar.jpg",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Triggers**:
- User submits profile edit form
- Avatar image upload completion
- Name change from settings page

---

### **GET /api/user/personal-info**
**Purpose**: Retrieve personal demographic information  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Table**: user_profiles

**Frontend Integration**:
- Personal information form pre-filling
- Onboarding step completion check
- Profile completeness calculation

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "age": 28,
    "gender": "prefer_not_to_say",
    "nationality": "United States", 
    "country": "Canada",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Error Responses**:
- **401**: User not authenticated
- **404**: Personal info not yet provided

---

### **POST /api/user/personal-info**
**Purpose**: Create initial personal information record  
**Method**: POST  
**Authentication**: Authenticated user required  
**Validation**: Age 13-120, valid gender/nationality values  
**Database Impact**: Creates user_profiles record with upsert logic

**Frontend Integration**:  
- Onboarding personal info step
- Required before accessing assessments
- Form validation and submission

**Request Body**:
```typescript
{
  age: number;        // 13-120 years
  gender: string;     // 'male' | 'female' | 'other' | 'prefer_not_to_say'  
  nationality: string; // Country name
  country: string;    // Current residence country
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Personal information saved successfully",
  "data": {
    "id": "cuid_profile_id",
    "age": 28,
    "gender": "prefer_not_to_say",
    "nationality": "United States",
    "country": "Canada", 
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

**Triggers**:
- User completes onboarding personal info form
- Profile creation after account registration  
- Updates happiness score calculation eligibility

---

### **PUT /api/user/personal-info**
**Purpose**: Update existing personal information  
**Method**: PUT  
**Authentication**: Authenticated user required  
**Validation**: Same as POST, partial updates allowed

**Frontend Integration**:
- Profile settings personal info section
- Information correction/updates
- Re-calculation of happiness scores

**Request Body**:
```typescript
{
  age?: number;        // Optional updates
  gender?: string;     
  nationality?: string;
  country?: string;    
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Personal information updated successfully",
  "data": {
    "age": 29,
    "gender": "prefer_not_to_say", 
    "nationality": "United States",
    "country": "Canada",
    "updatedAt": "2024-01-01T15:00:00Z"
  }
}
```

**Triggers**:
- User updates personal info in settings
- Age increment on birthday
- Location changes

---

### **GET /api/user/preferences**
**Purpose**: Retrieve user application preferences and settings  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Table**: Placeholder implementation for future features

**Frontend Integration**:
- Settings page preferences loading
- Theme and notification toggles
- Language and accessibility options

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "pushNotifications": false,
    "theme": "light",
    "language": "en",
    "reminderTime": "09:00",
    "timezone": "America/New_York"
  }
}
```

---

### **PUT /api/user/preferences**
**Purpose**: Update user application preferences  
**Method**: PUT  
**Authentication**: Authenticated user required  
**Validation**: Valid preference values only

**Frontend Integration**:
- Settings toggles and dropdowns
- Theme switching functionality
- Notification permission management

**Request Body**:
```typescript
{
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  reminderTime?: string; // HH:mm format
  timezone?: string;
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "emailNotifications": false,
    "theme": "dark",
    "updatedAt": "2024-01-01T16:00:00Z"
  }
}
```

---

### **PUT /api/user/change-password**
**Purpose**: Secure password change with current password verification  
**Method**: PUT  
**Authentication**: Authenticated user required  
**Rate Limiting**: 5 attempts per hour per user  
**Security**: bcryptjs verification and hashing

**Frontend Integration**:
- Security settings password form
- Current password verification
- Strong password requirements

**Request Body**:
```typescript
{
  currentPassword: string;  // Current password for verification
  newPassword: string;      // New password (same requirements as registration)
  confirmPassword: string;  // Must match newPassword
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:
- **400**: Validation errors, passwords don't match
- **401**: Current password incorrect  
- **429**: Too many attempts (rate limited)

**Triggers**:
- User submits password change form
- Security settings access
- Forced password update scenarios

---

### **DELETE /api/user/delete-account**
**Purpose**: Permanent account deletion with cascade data removal  
**Method**: DELETE  
**Authentication**: Authenticated user required  
**Security**: Password confirmation required  
**Database Impact**: Cascades delete all user data (sessions, assessments, notes)

**Frontend Integration**:
- Account settings danger zone
- Multi-step confirmation dialog
- Final password verification

**Request Body**:
```typescript
{
  password: string;        // Current password confirmation
  confirmation: string;    // Must be exactly "DELETE" 
  reason?: string;         // Optional deletion reason
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Account deleted successfully. We're sorry to see you go!"
}
```

**Error Responses**:
- **400**: Invalid confirmation text
- **401**: Incorrect password
- **500**: Deletion transaction failed

**Triggers**:
- User confirms account deletion in settings  
- Immediately logs out user
- Sends confirmation email
- Removes all related data

---

## 📋 ASSESSMENT SYSTEM APIs

### **Assessment Flow Overview**
Two-part assessment system: one-time 27-question questionnaire + progressive 6-category self-assessments (initial/mid/final) for spiritual progress tracking.

### **POST /api/assessment/questionnaire**
**Purpose**: Submit comprehensive one-time questionnaire (27 questions across 4 phases)  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Table**: questionnaires  
**Validation**: QuestionnaireSchema with all 27 fields

**Frontend Integration**:
- Multi-step questionnaire form (6 phases)
- Progress saving between steps
- Auto-advance to self-assessment on completion
- Required before stage access

**Business Rules**:
- ✅ **One-time only**: Cannot be submitted twice per user
- ✅ **All 27 questions required**: Complete submission only
- ✅ **Phase-based UI**: 6 progressive steps with validation
- ✅ **Triggers self-assessment**: Enables initial self-assessment on completion

**Request Body**:
```typescript
{
  // Phase 1: Demographics & Background (7 questions)
  experienceLevel: number;         // Q1: Slider 1-10 (Beginner to Expert)
  mainGoals: string[];            // Q2: Multi-select array
  ageRange: string;               // Q3: MCQ (18-24, 25-34, etc.)
  location: string;               // Q4: MCQ (Urban, Suburban, Rural)
  occupation: string;             // Q5: MCQ (Software Developer, Teacher, etc.)
  educationLevel: string;         // Q6: MCQ (High school, Bachelor's, etc.)
  meditationBackground: string;   // Q7: MCQ (Never tried, Some experience, etc.)
  
  // Phase 2: Lifestyle Patterns (8 questions)
  sleepPattern: number;           // Q8: Slider 1-10 (Very Poor to Excellent)
  physicalActivity: string;       // Q9: MCQ (Sedentary, Light, Moderate, etc.)
  stressTrigers: string[];        // Q10: Multi-select array
  dailyRoutine: string;           // Q11: MCQ (Very structured, Flexible, etc.)
  dietPattern: string;            // Q12: MCQ (Very healthy, Balanced, etc.)
  screenTime: string;             // Q13: MCQ (1-2 hours, 3-4 hours, etc.)
  socialConnections: string;      // Q14: MCQ (Deep relationships, etc.)
  workLifeBalance: string;        // Q15: MCQ (Perfect integration, etc.)
  
  // Phase 3: Thinking Patterns (6 questions)
  emotionalAwareness: number;     // Q16: Slider 3-9 (Low to Very High)
  stressResponse: string;         // Q17: MCQ (Observe and let go, etc.)
  decisionMaking: string;         // Q18: MCQ (Intuitive, Careful analysis, etc.)
  selfReflection: string;         // Q19: MCQ (Daily meditation, etc.)
  thoughtPatterns: string;        // Q20: MCQ (Peaceful, Optimistic, etc.)
  mindfulnessInDailyLife: string; // Q21: MCQ (Constant awareness, etc.)
  
  // Phase 4: Mindfulness Specific (6 questions)
  mindfulnessExperience: number;  // Q22: Slider 1-8 (No Experience to Advanced)
  meditationBackgroundDetail: string; // Q23: MCQ (None, Guided meditations, etc.)
  practiceGoals: string;          // Q24: MCQ (Liberation, Spiritual awakening, etc.)
  preferredDuration: string;      // Q25: MCQ (5 minutes, 10 minutes, etc.)
  biggestChallenges: string;      // Q26: MCQ (None, Finding time, etc.)
  motivation: string;             // Q27: MCQ (Service to others, etc.)
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Questionnaire submitted successfully",
  "data": {
    "id": "cuid_questionnaire_id",
    "completedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Error Responses**:
- **409**: Questionnaire already completed
- **400**: Validation errors (missing fields, invalid values)

**Triggers**:
- User completes all 6 phases of questionnaire
- Onboarding flow after personal info collection
- Enables happiness score calculation (partial)

---

### **GET /api/assessment/questionnaire**
**Purpose**: Retrieve user's completed questionnaire data  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Table**: questionnaires

**Frontend Integration**:
- Assessment results display
- Profile summary information
- Happiness score breakdown details

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "cuid_questionnaire_id",
    "isCompleted": "2024-01-01T12:00:00Z",
    
    // All 27 questionnaire fields with responses
    "experienceLevel": 5,
    "mainGoals": ["Stress Reduction", "Better Sleep"],
    "ageRange": "25-34 years",
    // ... all other fields
    
    "completionSummary": {
      "totalQuestions": 27,
      "answeredQuestions": 27,
      "completionPercentage": 100,
      "completedAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

**Error Responses**:
- **404**: Questionnaire not found/not completed

---

### **POST /api/assessment/self-assessment**  
**Purpose**: Submit progressive self-assessment (6 categories, 3 types: initial/mid/final)  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Table**: self_assessments  
**Validation**: SelfAssessmentSchema with all 6 categories + type

**Frontend Integration**:
- Self-assessment form with 3-choice radio buttons
- Progress tracking across assessment types
- Required for stage progression and happiness calculation

**Business Rules**:
- ✅ **3 Assessment Types**: initial (after account), mid (after stage 3), final (after stage 6)
- ✅ **6 Categories Required**: All must be answered per submission
- ✅ **Unique Per Type**: One assessment per type per user (upsert logic)
- ✅ **Scoring System**: "none" (+12), "some" (-7), "strong" (-15) per category
- ✅ **Spiritual Progress**: Tracks attachment reduction over time

**Request Body**:
```typescript
{
  type: 'initial' | 'mid' | 'final';  // Required assessment type
  
  // 6 Categories (3-choice scale each):
  foodTaste: 'none' | 'some' | 'strong';      // Food and flavors attachment
  scentsAromas: 'none' | 'some' | 'strong';   // Scents and fragrances  
  soundsMusic: 'none' | 'some' | 'strong';    // Sounds, music, audio
  visualBeauty: 'none' | 'some' | 'strong';   // Visual beauty, colors, sights
  touchTextures: 'none' | 'some' | 'strong';  // Textures, physical sensations
  thoughtsImages: 'none' | 'some' | 'strong'; // Thoughts, ideas, mental imagery
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Self-assessment submitted successfully",
  "data": {
    "id": "cuid_assessment_id",
    "type": "initial",
    "totalScore": 24,  // Sum of all category scores
    "scoreBreakdown": {
      "foodTaste": 12,      // "none" = +12
      "scentsAromas": -7,   // "some" = -7  
      "soundsMusic": -15,   // "strong" = -15
      "visualBeauty": 12,   // "none" = +12
      "touchTextures": -7,  // "some" = -7
      "thoughtsImages": 29   // "strong" = -15... wait this is wrong in my calculation
    },
    "interpretations": {
      "attachmentLevel": "Low-Moderate Attachment",
      "spiritualProgress": "Good foundation for PAHM practice",
      "strongestAttachments": ["soundsMusic", "thoughtsImages"],
      "leastAttachments": ["foodTaste", "visualBeauty"]
    },
    "createdAt": "2024-01-01T13:00:00Z"
  }
}
```

**Category Descriptions for Frontend**:
- **foodTaste**: "How would you describe your relationship with food and flavors?"
- **scentsAromas**: "How do you feel about different scents and fragrances?"
- **soundsMusic**: "What's your relationship with sounds, music, and audio?"
- **visualBeauty**: "How do you respond to visual beauty, colors, and sights?"
- **touchTextures**: "How do you feel about different textures and physical sensations?"
- **thoughtsImages**: "What's your relationship with thoughts, ideas, and mental imagery?"

**3-Choice Options for Frontend**:
- **"none"** (+12 points): "I don't have particular preferences for this"
- **"some"** (-7 points): "I have some preferences, but I'm flexible"
- **"strong"** (-15 points): "I have strong preferences and specific likes/dislikes"

**Triggers**:
- Initial: After questionnaire completion (onboarding)
- Mid: After completing stages 1-3 (unlock advanced stages)
- Final: After completing all 6 stages (transformation measurement)

---

### **GET /api/assessment/self-assessment**
**Purpose**: Retrieve user's self-assessment data with progression tracking  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Table**: self_assessments

**Frontend Integration**:
- Assessment results comparison page
- Progress visualization charts  
- Spiritual growth tracking dashboard

**Query Parameters**:
```typescript
?type=initial|mid|final  // Optional: filter by assessment type
?include=scores          // Optional: include detailed score breakdowns
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "assessments": [
      {
        "id": "cuid_assessment_id",
        "type": "initial", 
        "totalScore": 24,
        "categories": {
          "foodTaste": "none",
          "scentsAromas": "some",
          "soundsMusic": "strong",
          "visualBeauty": "none", 
          "touchTextures": "some",
          "thoughtsImages": "strong"
        },
        "createdAt": "2024-01-01T13:00:00Z"
      }
      // ... other assessments
    ],
    "progressAnalysis": {
      "totalAssessments": 1,
      "availableTypes": ["initial", "mid", "final"],
      "completedTypes": ["initial"],
      "nextAvailable": "mid",
      "progressTrend": "baseline", // "improving", "stable", "declining"
      "attachmentReduction": 0     // Percentage improvement from initial
    }
  }
}
```

---

### **GET /api/assessment/results**
**Purpose**: Comprehensive assessment results with happiness calculation readiness  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: questionnaires, self_assessments, happiness_scores

**Frontend Integration**:
- Assessment results overview page
- Happiness score calculation status
- Overall progress dashboard

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "questionnaire": {
      "isCompleted": true,
      "completedAt": "2024-01-01T12:00:00Z",
      "totalQuestions": 27
    },
    "selfAssessments": {
      "initial": {
        "isCompleted": true,
        "totalScore": 24,
        "completedAt": "2024-01-01T13:00:00Z"
      },
      "mid": {
        "isCompleted": false,
        "unlockCondition": "Complete stages 1-3"
      },
      "final": {
        "isCompleted": false,
        "unlockCondition": "Complete all 6 stages"
      }
    },
    "happinessCalculation": {
      "isEligible": true,  // Both questionnaire and initial assessment complete
      "hasScore": false,
      "lastCalculated": null,
      "requiredData": {
        "questionnaire": true,
        "initialAssessment": true,
        "practiceData": false  // Enhances but doesn't enable calculation
      }
    },
    "overallProgress": {
      "assessmentPhase": "initial_complete",
      "nextSteps": [
        "Calculate initial happiness score",
        "Begin Stage 1: Seeker meditation practice"
      ]
    }
  }
}
```

**Triggers**:
- Assessment results page loading
- Dashboard assessment status widget
- Happiness score calculation verification

---

### **DELETE /api/assessment/reset**
**Purpose**: Reset all assessment data (testing/development only)  
**Method**: DELETE  
**Authentication**: Authenticated user required  
**Environment**: Development only (disabled in production)

**Frontend Integration**:
- Admin/testing interface reset button
- Development mode assessment re-testing
- QA workflow reset functionality

**Success Response (200)**:
```json
{
  "success": true,
  "message": "All assessment data reset successfully",
  "data": {
    "deletedQuestionnaire": true,
    "deletedSelfAssessments": 2,
    "deletedHappinessScores": 1,
    "resetAt": "2024-01-01T16:00:00Z"
  }
}
```

**Triggers**:
- Testing interface reset button
- Development workflow resets
- QA assessment re-testing

---

## � ADMIN SYSTEM APIs

### **Admin Authentication & Access Control**
Administrative interface for system monitoring, user management, and advanced analytics with enhanced security and role-based permissions.

### **POST /api/admin/auth/login**
**Purpose**: Admin-specific authentication with enhanced security measures  
**Method**: POST  
**Authentication**: Admin credentials required  
**Security**: Additional validation, IP restrictions, audit logging

**Request Body**:
```typescript
{
  email: string;          // Admin email address
  password: string;       // Admin password  
  mfaToken?: string;      // Optional MFA token for enhanced security
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Admin authenticated successfully",
  "data": {
    "adminId": "cuid_admin_id",
    "userId": "cuid_user_id",
    "role": "admin",        // "admin" | "super_admin"
    "permissions": [
      "user_management",
      "system_monitoring", 
      "analytics_access",
      "session_management"
    ],
    "sessionExpiry": "2024-01-01T22:00:00Z",
    "lastLogin": "2024-01-01T09:00:00Z"
  }
}
```

---

### **GET /api/admin/users**
**Purpose**: Retrieve paginated list of all users with filtering and search  
**Method**: GET  
**Authentication**: Admin level required  
**Database Table**: users, user_profiles, questionnaires, self_assessments

**Query Parameters**:
```typescript
?page=1              // Page number (default: 1)
?limit=50            // Users per page (default: 50, max: 100)
?search=john         // Search by name or email
?status=active       // Filter: "active", "inactive", "verified", "unverified"
?stageNumber=2       // Filter by current stage
?joinedAfter=2024-01-01  // Registration date filter
?hasQuestionnaire=true   // Filter by questionnaire completion
?sort=joinedDate     // Sort: "joinedDate", "lastActivity", "name", "stage"
?order=desc          // Sort order: "asc", "desc"
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "cuid_user_id",
        "email": "user@example.com",
        "name": "John Doe",
        "isActive": true,
        "emailVerified": "2024-01-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z",
        "lastActivity": "2024-01-15T10:30:00Z",
        "profile": {
          "age": 30,
          "gender": "prefer_not_to_say",
          "nationality": "United States"
        },
        "progressSummary": {
          "currentStage": 2,
          "totalSessions": 45,
          "totalHours": 18.75,
          "happinessScore": 72.5,
          "userLevel": "PAHM Expert"
        },
        "completionStatus": {
          "questionnaire": true,
          "initialAssessment": true,
          "midAssessment": false,
          "finalAssessment": false
        }
      }
      // ... more users
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalUsers": 1250,
      "usersPerPage": 50,
      "hasNext": true,
      "hasPrevious": false
    },
    "filters": {
      "activeFilters": ["status=active"],
      "resultCount": 890,
      "searchTerm": null
    }
  }
}
```

---

### **GET /api/admin/users/[userId]**
**Purpose**: Get comprehensive details for specific user (admin view)  
**Method**: GET  
**Authentication**: Admin level required  
**Database Tables**: All user-related tables

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid_user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "isActive": true,
      "emailVerified": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActivity": "2024-01-15T10:30:00Z"
    },
    "detailedProgress": {
      "stages": {
        "completed": 1,
        "current": 2,
        "totalSessions": 45,
        "totalHours": 18.75
      },
      "assessments": {
        "questionnaire": { "completed": true, "completedAt": "2024-01-01T12:00:00Z" },
        "selfAssessments": [
          { "type": "initial", "score": 24, "completedAt": "2024-01-01T13:00:00Z" }
        ]
      },
      "happiness": {
        "currentScore": 72.5,
        "level": "PAHM Expert",
        "calculations": 3,
        "trend": "improving"
      }
    },
    "activitySummary": {
      "sessionsThisWeek": 5,
      "sessionsThisMonth": 18,
      "currentStreak": 7,
      "averageQuality": 7.2,
      "moodEntries": 45,
      "averageMood": 6.8
    },
    "systemData": {
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "signInCount": 67,
      "lastSignIn": "2024-01-15T09:00:00Z"
    }
  }
}
```

---

### **GET /api/admin/stats**
**Purpose**: Get comprehensive system-wide statistics and KPIs  
**Method**: GET  
**Authentication**: Admin level required  
**Database Tables**: All system tables for aggregation

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "systemOverview": {
      "totalUsers": 1250,
      "activeUsers": 890,        // Active in last 30 days
      "newUsersThisMonth": 87,
      "totalSessions": 15670,
      "totalPracticeHours": 6248.5,
      "averageSessionsPerUser": 12.5,
      "systemUptime": "99.9%"
    },
    
    "userEngagement": {
      "dailyActiveUsers": 245,
      "weeklyActiveUsers": 567,
      "monthlyActiveUsers": 890,
      "averageSessionDuration": 26.4,
      "sessionCompletionRate": 0.94,
      "userRetentionRates": {
        "day1": 0.85,
        "day7": 0.68,
        "day30": 0.45,
        "day90": 0.32
      }
    },
    
    "contentMetrics": {
      "completionRates": {
        "questionnaire": 0.85,
        "initialAssessment": 0.78,
        "stage1": 0.65,
        "stage2": 0.42,
        "stage3": 0.28,
        "stage4": 0.18,
        "stage5": 0.12,
        "stage6": 0.08
      },
      "averageTimeToComplete": {
        "questionnaire": "12 minutes",
        "initialAssessment": "8 minutes",
        "stage1": "15 days",
        "stage2": "21 days"
      }
    },
    
    "happinessMetrics": {
      "averageHappinessScore": 68.5,
      "scoreDistribution": {
        "0-29 (Seeker)": 125,
        "30-39 (Aware Seeker)": 198,
        "40-49 (PAHM Trainee)": 245,
        "50-59 (PAHM Beginner)": 312,
        "60-69 (PAHM Intermediate)": 223,
        "70-79 (PAHM Expert)": 98,
        "80-89 (Advanced Practitioner)": 37,
        "90-100 (Liberation Master)": 12
      },
      "averageImprovement": 4.2    // Points per month
    },
    
    "systemHealth": {
      "apiResponseTime": "145ms",
      "databaseConnections": 12,
      "errorRate": "0.02%",
      "storageUsed": "2.3GB",
      "backupStatus": "Success (2024-01-15T02:00:00Z)"
    }
  }
}
```

---


### **POST /api/admin/sessions/manage**
**Purpose**: Advanced session management tools for testing and debugging  
**Method**: POST  
**Authentication**: Admin level required  
**Use Cases**: Session unlocking, testing mode, data manipulation

**Request Body**:
```typescript
{
  action: 'unlock_stage' | 'reset_progress' | 'simulate_completion' | 'test_mode';
  userId: string;
  targetStage?: number;
  testDuration?: number;  // For test mode sessions
  reason?: string;        // Admin action reason
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Session management action completed successfully",
  "data": {
    "action": "unlock_stage",
    "userId": "cuid_user_id",
    "previousStage": 1,
    "newStage": 3,
    "timestamp": "2024-01-15T15:00:00Z",
    "adminId": "cuid_admin_id"
  }
}
```

---

## �😊 HAPPINESS SCORE SYSTEM APIs

### **Happiness Calculation Overview**
PAHM-based happiness scoring system with 8 weighted components calculating final score (0-100) and user spiritual level assignment.

### **POST /api/happiness**
**Purpose**: Calculate/recalculate happiness score using PAHM weighted algorithm  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Table**: happiness_scores  
**Validation**: HappinessCalculationSchema with 8 components

**Frontend Integration**:
- Happiness score calculation trigger button
- Assessment completion auto-calculation
- Progress dashboard score updates
- Re-calculation after new assessments/sessions/daily notes

**Prerequisites**:
- ✅ **Questionnaire completed**: All 27 questions answered
- ✅ **Initial self-assessment completed**: All 6 categories assessed  
- ✅ **Practice data optional**: Sessions enhance but don't block calculation

**Request Body**:
```typescript
{
  // 8 Score Components (0-100 each, calculated by frontend or auto-calculated)
  currentStateScore: number;    // Component 1: 12% weight - Current wellbeing state
  attachmentScore: number;      // Component 2: 20% weight - Self-assessment attachment levels
  pahmScore: number;           // Component 3: 25% weight - PAHM matrix practice progress  
  practiceScore: number;       // Component 4: 15% weight - Session consistency and quality
  progressScore: number;       // Component 5: 10% weight - Stage progression achievements
  consistencyScore: number;    // Component 6: 8% weight - Daily practice streak
  reflectionScore: number;     // Component 7: 5% weight - Daily notes and insights
  dailyLifeScore: number;      // Component 8: 5% weight - Mindfulness integration
  
  // Calculation metadata
  questionnaireBased: boolean;   // Based on questionnaire data
  selfAssessmentBased: boolean;  // Based on self-assessment data
  practiceEnhanced: boolean;     // Enhanced by practice session data
}
```

**PAHM Weighted Calculation**:
```typescript
finalScore = (
  currentStateScore * 0.12 +    // 12%
  attachmentScore * 0.20 +      // 20% 
  pahmScore * 0.25 +           // 25%
  practiceScore * 0.15 +       // 15%
  progressScore * 0.10 +       // 10%
  consistencyScore * 0.08 +    // 8%
  reflectionScore * 0.05 +     // 5%
  dailyLifeScore * 0.05        // 5%
);
```

**User Level Assignment**:
- **90-100**: Liberation Master (Advanced spiritual attainment)
- **80-89**: Advanced Practitioner (Deep PAHM mastery)
- **70-79**: PAHM Expert (Skilled matrix practice)
- **60-69**: PAHM Intermediate (Growing awareness)  
- **50-59**: PAHM Beginner (Foundation building)
- **40-49**: PAHM Trainee (Early stage practice)
- **30-39**: Aware Seeker (Awakening consciousness)
- **0-29**: Seeker (Beginning spiritual journey)

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Happiness score calculated and saved successfully",
  "data": {
    "id": "cuid_happiness_id",
    "finalScore": 72.5,
    "userLevel": "PAHM Expert",
    "components": {
      "currentStateScore": 68.0,
      "attachmentScore": 75.0,
      "pahmScore": 65.0,
      "practiceScore": 80.0,
      "progressScore": 60.0,
      "consistencyScore": 70.0,
      "reflectionScore": 85.0,
      "dailyLifeScore": 77.0
    },
    "calculatedAt": "2024-01-01T14:00:00Z",
    "metadata": {
      "questionnaireBased": true,
      "selfAssessmentBased": true, 
      "practiceEnhanced": true
    }
  }
}
```

**Triggers**:
- User clicks "Calculate Happiness Score" button
- Auto-calculation after completing assessments, any practice session, or daily notes 
- Re-calculation after significant practice milestones
- Periodic score updates (weekly/monthly)

---

### **GET /api/happiness**
**Purpose**: Retrieve happiness score history with trends and analytics  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Table**: happiness_scores

**Frontend Integration**:
- Happiness dashboard main display
- Progress charts and trend visualization
- Historical score comparison
- User level progression tracking

**Query Parameters**:
```typescript
?days=30           // Last N days (default: 30)
?start=2024-01-01  // Start date filter
?end=2024-01-31    // End date filter  
?limit=10          // Number of scores to return
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "scores": [
      {
        "id": "cuid_happiness_id",
        "finalScore": 72.5,
        "userLevel": "PAHM Expert",
        "components": {
          "currentStateScore": 68.0,
          "attachmentScore": 75.0,
          // ... all 8 components
        },
        "calculatedAt": "2024-01-01T14:00:00Z"
      }
      // ... historical scores
    ],
    "statistics": {
      "totalCalculations": 5,
      "averageFinalScore": 70.2,
      "highestScore": 75.5,
      "lowestScore": 65.0,
      "currentLevel": "PAHM Expert",
      "levelDistribution": {
        "PAHM Expert": 3,
        "PAHM Intermediate": 2
      },
      "trend": "improving",  // "improving", "stable", "declining"
      "componentAverages": {
        "currentStateScore": 67.8,
        "attachmentScore": 73.2,
        // ... averages for all 8 components
      }
    },
    "period": {
      "days": 30,
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }
}
```

**Triggers**:
- Happiness dashboard page loading
- Score history widget updates
- Progress tracking components
- Trend analysis views

---

## 🎯 STAGE PROGRESSION SYSTEM APIs

### **Stage System Overview** 
6-stage linear progression system: Stage 1 (timer-only sessions) + Stages 2-6 (PAHM Matrix sessions) with unlock requirements and completion tracking.

### **GET /api/stages**
**Purpose**: Retrieve all meditation stages with user progress and unlock status  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: stages, user_stage_progress, sessions

**Frontend Integration**:
- Main dashboard stages overview
- Stage selection interface
- Progress tracking widgets
- Navigation stage indicators

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_stage_1",
      "stageNumber": 1,
      "name": "Seeker",
      "description": "Foundation stage - Physical stillness mastery through timer-only sessions",
      "sessionType": "timer_only",
      "minSessions": 29,
      "minHours": 11.50,
      "hasSubStages": true,
      "subStages": [
        {
          "id": "T1",
          "name": "Initial Introduction", 
          "minDuration": 10,      // Minutes (user can extend via slider)
          "minSessions": 3,
          "minHours": 0.5,
          "isUnlocked": true,
          "isCompleted": true,
          "sessionsCompleted": 3,
          "hoursCompleted": 0.6   // Actual hours (user extended some sessions)
        },
        {
          "id": "T2", 
          "name": "Building Consistency",
          "minDuration": 15,      // Minutes (user can extend)
          "minSessions": 4,
          "minHours": 1.0,
          "isUnlocked": true,
          "isCompleted": false,
          "sessionsCompleted": 2,
          "hoursCompleted": 0.6
        }
        // ... T3, T4, T5 sub-stages
      ],
      "userProgress": {
        "isUnlocked": true,
        "isCompleted": false,
        "totalSessionsCompleted": 12,
        "totalHoursCompleted": 4.2,
        "currentSubStage": "T3",
        "completionPercentage": 41.4  // Based on hours completed
      },
      "unlockRequirements": [
        "Complete personal information",
        "Complete questionnaire", 
        "Complete initial self-assessment"
      ],
      "completionRequirements": [
        "Complete all sub-stages T1-T5",
        "Complete minimum 29 sessions total",
        "Complete minimum 11.5 hours total",
        "Pass PAHM readiness assessment"
      ]
    },
    {
      "id": "cuid_stage_2",
      "stageNumber": 2,
      "name": "PAHM Trainee",
      "description": "Introduction to Present Attention and Happiness Matrix tracking",
      "sessionType": "pahm_matrix",
      "minSessions": 30,
      "minHours": 15.0,
      "hasSubStages": false,
      "minDuration": 30,          // Minutes (user can extend via slider)
      "userProgress": {
        "isUnlocked": false,
        "isCompleted": false,
        "totalSessionsCompleted": 0,
        "totalHoursCompleted": 0,
        "completionPercentage": 0
      },
      "unlockRequirements": [
        "Complete Stage 1: Seeker",
        "Complete PAHM Matrix learning module"
      ]
    }
    // ... Stages 3-6
  ],
  "overallProgress": {
    "currentStage": 1,
    "completedStages": 0,
    "totalStages": 6,
    "overallCompletionPercentage": 6.9  // Based on total hours across all stages
  }
}
```

**Duration Control Rules**:
- **Meditation Sessions**: User can extend minimum duration via time slider
- **Mind Recovery Exercises**: Fixed 5-minute duration (non-adjustable)

**Triggers**:
- Dashboard page loading
- Stage navigation updates
- Progress tracking refreshes

---

### **GET /api/stages/[stageId]**
**Purpose**: Get detailed information for a specific meditation stage  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: stages, user_stage_progress, sessions

**Frontend Integration**:
- Individual stage detail pages
- Session planning interface
- Practice preparation screens

**URL Parameters**:
```typescript
stageId: string;  // Stage ID (cuid)
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "cuid_stage_1",
    "stageNumber": 1,
    "name": "Seeker",
    "description": "Foundation stage building physical stillness and sustained attention through progressive timer-only meditation sessions. This stage prepares practitioners for the PAHM Matrix methodology.",
    "sessionType": "timer_only",
    "minSessions": 29,
    "minHours": 11.50,
    "learningObjectives": [
      "Develop ability to maintain physical stillness for 30+ minutes",
      "Build foundation of sustained attention without distraction",
      "Establish consistent daily practice routine",
      "Prepare for PAHM Matrix awareness training"
    ],
    "subStages": [
      // Detailed sub-stage information as in GET /api/stages
    ],
    "sessionGuidance": {
      "postures": ["sitting", "lying", "walking"],
      "environment": "Quiet, comfortable space with minimal distractions",
      "preparation": "Set intention, adjust posture, begin timer",
      "during": "Maintain stillness, observe breath, note distractions without judgment",
      "completion": "Reflect on experience, rate session quality (optional)"
    },
    "progressRequirements": {
      "unlockNextStage": [
        "Complete all 5 sub-stages (T1-T5)",
        "Achieve 30-minute stillness capability",
        "Complete PAHM Matrix learning module"
      ]
    }
  }
}
```

**Triggers**:
- User clicks on specific stage card
- Stage detail page navigation
- Practice session preparation

---

### **GET /api/stages/[stageId]/unlock**
**Purpose**: Check unlock eligibility and requirements for a specific stage  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: stages, user_stage_progress, questionnaires, self_assessments

**Frontend Integration**:
- Stage lock/unlock status indicators
- Requirement checklist displays
- Progress guidance messages

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "stageId": "cuid_stage_2",
    "stageNumber": 2,
    "stageName": "PAHM Trainee", 
    "canUnlock": false,
    "isCurrentlyUnlocked": false,
    "requirements": [
      {
        "id": "complete_stage_1",
        "description": "Complete Stage 1: Seeker",
        "isMet": false,
        "progress": {
          "current": 12,
          "required": 29,
          "unit": "sessions",
          "percentage": 41.4
        }
      },
      {
        "id": "pahm_matrix_learning",
        "description": "Complete PAHM Matrix learning module",
        "isMet": false,
        "progress": {
          "current": 0,
          "required": 1,
          "unit": "modules",
          "percentage": 0
        }
      }
    ],
    "unmetRequirements": [
      "Complete remaining 17 sessions in Stage 1",
      "Complete PAHM Matrix learning module"
    ],
    "nextSteps": [
      "Continue practicing Stage 1 timer-only sessions",
      "Focus on T3: Deepening Practice (current sub-stage)",
      "Complete 7.3 more hours of practice"
    ],
    "estimatedUnlockDate": "2024-01-15T00:00:00Z"  // Based on current practice pace
  }
}
```

**Triggers**:
- Stage card hover/click on locked stages
- Progress tracking updates
- Requirement checking workflows

---

## 🧘‍♀️ SESSION MANAGEMENT APIs

### **Session System Overview**
Complete session lifecycle management for meditation practice: session creation, progress tracking, completion, and historical analysis across all stage types.

### **POST /api/session/start**
**Purpose**: Initialize new meditation or mind recovery session  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Tables**: sessions, user_stage_progress  
**Validation**: Session start requirements and stage eligibility

**Frontend Integration**:
- "Start Session" button on stage/exercise pages
- Session configuration menu (posture, duration, audio options)
- Timer interface initialization
- Audio preferences confirmation

**Session Configuration Options**:
- **Posture Selection**: "sitting", "lying", "walking", "custom" (all session types)
- **Duration Slider**: Adjust session length (meditation sessions only - NOT mind recovery)
- **Audio Options**: Enable/disable guided voice-over and bell rings
- **Mind Recovery Fixed Duration**: No duration slider for mind recovery exercises (fixed durations: Morning Recharge/Emotional Reset/Work-Home Transition: 5 min, Mid-Day Reset: 3 min, Bedtime Wind Down: 8 min)

**Request Body**:
```typescript
{
  stageId: string;                    // Stage or exercise ID
  stageNumber: number;                // 1-6 for meditation stages
  subStage?: string;                  // For Stage 1: "T1", "T2", "T3", "T4", "T5"
  sessionType: string;                // "timer_only", "pahm_matrix", "mind_recovery"
  duration: number;                   // Minutes - user can extend minimums via slider (NOT for mind_recovery)
  posture: string;                    // "sitting", "lying", "walking", "custom"
  audioOptions: {                     // Audio preferences for session
    guidedVoiceOver: boolean;         // Enable/disable voice guidance
    bellRings: boolean;               // Enable/disable bell sounds
    volume?: number;                  // Audio volume (0-100)
  };
  exerciseType?: string;              // For mind recovery: specific exercise type
}
```

**Duration Rules**:
- **Stage 1 Sessions**: 10-30+ minutes (user-adjustable via duration slider)
- **Stages 2-6 Sessions**: 30+ minutes minimum (user-adjustable via duration slider)  
- **Mind Recovery Exercises**: Fixed durations (NO duration slider - fixed time only):
  - Morning Recharge: 5 minutes
  - Mid-Day Reset: 3 minutes
  - Emotional Reset: 5 minutes
  - Work-Home Transition: 5 minutes
  - Bedtime Wind Down: 8 minutes

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Session started successfully",
  "data": {
    "sessionId": "cuid_session_id",
    "stageId": "cuid_stage_1", 
    "stageNumber": 1,
    "subStage": "T2",
    "sessionType": "timer_only",
    "duration": 15,
    "posture": "sitting",
    "status": "in_progress",
    "startedAt": "2024-01-01T10:00:00Z",
    "estimatedEndAt": "2024-01-01T10:15:00Z",
    "audioSettings": {
      "guidedVoiceOver": true,
      "bellRings": true,
      "volume": 75
    },
    "sessionGuidance": {
      "focus": "Maintain physical stillness and observe breath",
      "reminders": ["Keep spine straight", "Let thoughts pass without engaging"],
      "completion": "Rate your session quality and add any insights"
    },
    "configurationOptions": {
      "durationAdjustable": true,        // false for mind_recovery exercises
      "minimumDuration": 10,             // Stage-specific minimum
      "maximumDuration": null,           // No maximum limit
      "postureOptions": ["sitting", "lying", "walking", "custom"],
      "audioConfigurable": true
    }
  }
}
```

**Error Responses**:
- **400**: Invalid session parameters
- **403**: Stage not unlocked or requirements not met
- **409**: Active session already in progress

**Triggers**:
- User clicks "Start Session" from stage detail page
- Exercise selection from Mind Recovery page
- Session scheduling/reminder systems

---

### **PUT /api/session/update**  
**Purpose**: Update session progress and handle pause/resume functionality  
**Method**: PUT  
**Authentication**: Authenticated user required  
**Database Table**: sessions

**Frontend Integration**:
- Pause/resume button functionality
- Session progress saving
- Interruption handling
- Real-time session state management

**Request Body**:
```typescript
{
  sessionId: string;
  status?: 'in_progress' | 'paused' | 'resumed';
  elapsedTime?: number;        // Minutes elapsed
  pauseReason?: string;        // Optional pause reason
  notes?: string;              // Session notes/observations
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Session updated successfully",
  "data": {
    "sessionId": "cuid_session_id",
    "status": "paused",
    "elapsedTime": 8,
    "remainingTime": 7,
    "pausedAt": "2024-01-01T10:08:00Z",
    "totalPauses": 1
  }
}
```

**Triggers**:
- User clicks pause/resume buttons
- Browser/app interruptions
- Emergency session stops

---

### **POST /api/session/complete**
**Purpose**: Complete meditation session with quality assessment and insights  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Tables**: sessions, user_stage_progress, pahm_sessions (if applicable)

**Frontend Integration**:
- Session completion screen
- Quality rating interface
- Insights/notes input form
- Progress celebration/feedback

**Request Body**:
```typescript
{
  sessionId: string;
  completedDuration: number;       // Actual minutes completed
  qualityRating?: number;          // 1-10 scale (optional)
  insights?: string;               // User reflection notes
  mood?: string;                   // Post-session mood
  challenges?: string[];           // Challenges faced during session
  highlights?: string[];           // Positive moments/breakthroughs
  
  // For PAHM Matrix sessions (Stage 2+)
  pahmData?: {
    totalClicks: number;
    clickTimestamps: Array<{
      position: string;
      timestamp: string;
      clickOrder: number;
    }>;
    patternNotes?: string;
  };
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Session completed successfully! Great work on your practice.",
  "data": {
    "sessionId": "cuid_session_id",
    "completedAt": "2024-01-01T10:15:00Z",
    "actualDuration": 15.5,
    "qualityRating": 8,
    "progressUpdate": {
      "stageProgress": {
        "sessionsCompleted": 13,  // Previous: 12
        "hoursCompleted": 4.45,   // Previous: 4.2
        "subStageCompleted": false,
        "nextSubStage": "T3"
      },
      "achievements": [
        "Completed 13th session in Stage 1",
        "Maintained focus for 15+ minutes"
      ],
      "milestones": []
    },
    "nextSteps": {
      "currentFocus": "Continue T3: Deepening Practice",
      "sessionsRemaining": 16,
      "hoursRemaining": 7.05,
      "recommendation": "Great consistency! Try extending next session to 18-20 minutes."
    }
  }
}
```

**PAHM Matrix Data (Stages 2+)**:
For sessions with PAHM Matrix tracking, the system records:
- Click positions and timestamps
- Attention pattern analysis  
- Distribution across 9 matrix positions
- Session-specific insights and patterns

**Triggers**:
- Timer completion (automatic)
- User manual session end
- Session completion form submission

---

### **GET /api/session/history**
**Purpose**: Retrieve user's meditation session history with filtering and analytics  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: sessions, pahm_sessions

**Frontend Integration**:
- Session history page
- Progress tracking charts
- Pattern analysis dashboards
- Performance trend visualization

**Query Parameters**:
```typescript
?limit=20              // Number of sessions to return (default: 50)
?offset=0              // Pagination offset
?stageId=cuid_stage_1  // Filter by specific stage
?stageNumber=1         // Filter by stage number
?sessionType=timer_only // Filter by session type
?dateFrom=2024-01-01   // Start date filter
?dateTo=2024-01-31     // End date filter
?minDuration=10        // Minimum duration filter (minutes)
?qualityMin=7          // Minimum quality rating filter
?include=pahm          // Include PAHM data for matrix sessions
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "cuid_session_id",
        "stageNumber": 1,
        "stageName": "Seeker",
        "subStage": "T2",
        "sessionType": "timer_only",
        "duration": 15,
        "actualDuration": 15.5,
        "posture": "sitting",
        "qualityRating": 8,
        "insights": "Good focus today, less mind wandering",
        "completedAt": "2024-01-01T10:15:00Z",
        "achievements": ["15+ minute session", "Quality rating 8+"]
      }
      // ... more sessions
    ],
    "analytics": {
      "totalSessions": 45,
      "totalHours": 18.5,
      "averageDuration": 24.7,
      "averageQuality": 7.2,
      "currentStreak": 7,
      "longestStreak": 12,
      "stageDistribution": {
        "1": 29,
        "2": 16
      },
      "sessionTypeDistribution": {
        "timer_only": 29,
        "pahm_matrix": 16
      },
      "monthlyTrends": {
        "sessions": [8, 12, 15, 10],  // Last 4 months
        "hours": [3.2, 4.8, 6.1, 4.4],
        "quality": [6.8, 7.1, 7.5, 7.2]
      }
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalSessions": 45,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

**Triggers**:
- Session history page loading
- Progress dashboard updates
- Analytics report generation

---

### **GET /api/session/progress**
**Purpose**: Get comprehensive session progress and detailed statistics  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: sessions, user_stage_progress, stages

**Frontend Integration**:
- Progress dashboard main widgets
- Detailed statistics pages
- Goal tracking interfaces
- Motivational progress displays

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "overallProgress": {
      "totalSessions": 45,
      "totalHours": 18.75,
      "currentStage": 2,
      "currentStageName": "PAHM Trainee",
      "completedStages": 1,
      "overallCompletionPercentage": 16.3  // Based on total 115+ hours journey
    },
    "currentStageProgress": {
      "stageNumber": 2,
      "stageName": "PAHM Trainee",
      "sessionsCompleted": 16,
      "sessionsRequired": 30,
      "hoursCompleted": 8.25,
      "hoursRequired": 15.0,
      "completionPercentage": 55.0,
      "estimatedCompletionDate": "2024-01-25T00:00:00Z"
    },
    "streakInformation": {
      "currentStreak": 7,
      "longestStreak": 12,
      "streakGoal": 30,
      "lastSessionDate": "2024-01-01T10:15:00Z",
      "nextSessionRecommended": "2024-01-02T09:00:00Z"
    },
    "qualityMetrics": {
      "averageQualityRating": 7.2,
      "qualityTrend": "improving",  // "improving", "stable", "declining"
      "highQualitySessions": 28,    // Rating 7+
      "qualityDistribution": {
        "1-3": 2,
        "4-6": 15,
        "7-8": 20,
        "9-10": 8
      }
    },
    "practicePatterns": {
      "preferredTimes": ["09:00-10:00", "19:00-20:00"],
      "averageSessionLength": 24.7,
      "longestSession": 45,
      "totalPracticeDays": 32,
      "weeklyFrequency": 4.2
    },
    "upcomingMilestones": [
      {
        "type": "stage_completion",
        "description": "Complete Stage 2: PAHM Trainee",
        "progress": 55.0,
        "estimated": "2024-01-25T00:00:00Z"
      },
      {
        "type": "session_count",
        "description": "Reach 50 total sessions",
        "progress": 90.0,
        "estimated": "2024-01-05T00:00:00Z"
      }
    ]
  }
}
```

**Triggers**:
- Dashboard progress widgets loading
- Progress page navigation
- Goal tracking updates
- Motivational milestone checks

---

## 🔲 PAHM MATRIX SYSTEM APIs

### **PAHM Matrix Overview**
Present Attention and Happiness Matrix (PAHM) - 3×3 grid tracking attention patterns across time orientation (Past/Present/Future) and emotional charge (Likes/Neutral/Dislikes). Used in Stages 2-6 and Mind Recovery exercises.

**Matrix Structure**:
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

### **POST /api/pahm/start**
**Purpose**: Initialize PAHM Matrix tracking for meditation session (Stage 2+)  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Table**: pahm_sessions  
**Prerequisites**: Active session with sessionType "pahm_matrix"

**Frontend Integration**:
- PAHM Matrix interface activation
- Session timer + matrix grid display
- Click tracking initialization
- Pattern recording setup

**Request Body**:
```typescript
{
  sessionId: string;              // Active session ID
  stageNumber: number;            // 2-6 for PAHM stages  
  exerciseType?: string;          // For mind recovery: specific exercise type
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "PAHM Matrix session started successfully",
  "data": {
    "pahmSessionId": "cuid_pahm_id",
    "sessionId": "cuid_session_id",
    "stageNumber": 2,
    "matrixPositions": {
      "regret": { "clicks": 0, "label": "Past + Dislikes" },
      "past_neutral": { "clicks": 0, "label": "Past + Neutral" },
      "nostalgia": { "clicks": 0, "label": "Past + Likes" },
      "dislikes": { "clicks": 0, "label": "Present + Dislikes" },
      "present_center": { "clicks": 0, "label": "Present + Neutral" },
      "likes": { "clicks": 0, "label": "Present + Likes" },
      "worry": { "clicks": 0, "label": "Future + Dislikes" },
      "future_neutral": { "clicks": 0, "label": "Future + Neutral" },
      "anticipation": { "clicks": 0, "label": "Future + Likes" }
    },
    "startedAt": "2024-01-01T10:00:00Z",
    "guidance": {
      "instruction": "Track your attention by clicking the matrix position that represents where your mind goes",
      "reminder": "Don't try to control your attention - simply observe and record"
    }
  }
}
```

**Triggers**:
- PAHM Matrix session initialization
- Stage 2+ session start with matrix interface
- Mind recovery exercise start

---

### **POST /api/pahm/click**
**Purpose**: Record individual PAHM Matrix click during active session  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Table**: pahm_sessions (updates click counts and timestamps)  
**Real-time**: High-frequency endpoint for attention tracking

**Frontend Integration**:
- Matrix button click handlers
- Real-time click counting
- Visual feedback for user clicks
- Pattern visualization updates

**Request Body**:
```typescript
{
  sessionId: string;              // Active session ID
  position: string;               // Matrix position (see positions below)
  timestamp: string;              // ISO timestamp of click
  clickOrder: number;             // Sequential click number in session
}
```

**PAHM Matrix Positions**:
```typescript
// 9 possible positions in 3x3 grid
position: 
  | 'regret'           // Past + Dislikes
  | 'past_neutral'     // Past + Neutral  
  | 'nostalgia'        // Past + Likes
  | 'dislikes'         // Present + Dislikes
  | 'present_center'   // Present + Neutral (mindfulness center)
  | 'likes'            // Present + Likes
  | 'worry'            // Future + Dislikes
  | 'future_neutral'   // Future + Neutral
  | 'anticipation';    // Future + Likes
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "clickRecorded": true,
    "position": "present_center",
    "totalClicks": 15,
    "clickOrder": 15,
    "positionCounts": {
      "regret": 2,
      "past_neutral": 1,
      "nostalgia": 3,
      "dislikes": 1,
      "present_center": 4,
      "likes": 2,
      "worry": 1,
      "future_neutral": 0,
      "anticipation": 1
    },
    "patternInsight": {
      "dominantTime": "present",        // Most clicked time orientation
      "dominantCharge": "neutral",      // Most clicked emotional charge
      "balanceScore": 0.75             // Distribution balance (0-1)
    }
  }
}
```

**Performance Considerations**:
- Optimized for high-frequency clicks (multiple per minute)
- Batch updates for click timestamps
- Real-time pattern calculation

**Triggers**:
- User clicks matrix position buttons during session
- Attention awareness moments
- High-frequency during active PAHM practice

---

### **POST /api/pahm/complete**
**Purpose**: Complete PAHM Matrix session with comprehensive pattern analysis  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Table**: pahm_sessions (finalizes session data)

**Frontend Integration**:
- Session completion summary screen
- Pattern visualization dashboard
- Insights and reflection prompts
- Progress celebration interface

**Request Body**:
```typescript
{
  sessionId: string;
  patternNotes?: string;          // User reflection on observed patterns
  insights?: string;              // Session insights and realizations
  challenges?: string[];          // Challenges noticed during matrix tracking
  breakthroughs?: string[];       // Positive moments or realizations
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "PAHM Matrix session completed successfully!",
  "data": {
    "pahmSessionId": "cuid_pahm_id",
    "sessionDuration": 30,
    "totalClicks": 47,
    "clickDistribution": {
      "regret": 5,           // Past + Dislikes
      "past_neutral": 3,     // Past + Neutral
      "nostalgia": 8,        // Past + Likes  
      "dislikes": 4,         // Present + Dislikes
      "present_center": 12,  // Present + Neutral
      "likes": 7,            // Present + Likes
      "worry": 3,            // Future + Dislikes
      "future_neutral": 2,   // Future + Neutral
      "anticipation": 3      // Future + Likes
    },
    "patternAnalysis": {
      "timeOrientation": {
        "past": 16,           // 34.0% (regret + past_neutral + nostalgia)
        "present": 23,        // 48.9% (dislikes + present_center + likes)
        "future": 8           // 17.0% (worry + future_neutral + anticipation)
      },
      "emotionalCharge": {
        "dislikes": 12,       // 25.5% (regret + dislikes + worry)
        "neutral": 17,        // 36.2% (past_neutral + present_center + future_neutral)
        "likes": 18           // 38.3% (nostalgia + likes + anticipation)
      },
      "insights": {
        "dominantPattern": "Present-focused with balanced emotional engagement",
        "mindfulnessIndicator": 25.5,  // Present_center percentage
        "attachmentLevel": "Moderate", // Based on likes/dislikes distribution
        "timeBalance": "Present-focused", // Dominant time orientation
        "progressIndicators": [
          "Strong present-moment awareness (48.9%)",
          "Good mindfulness center engagement (25.5%)",
          "Balanced emotional processing"
        ],
        "areasForGrowth": [
          "Continue developing present-moment stability",
          "Notice patterns of nostalgia (17.0% of clicks)"
        ]
      }
    },
    "comparison": {
      "averageSessionClicks": 42,
      "personalBest": {
        "presentFocus": 51.2,
        "mindfulnessCenter": 28.1
      },
      "progressTrend": "improving"
    }
  }
}
```

**Pattern Analysis Calculations**:
- **Time Orientation**: Distribution across Past/Present/Future
- **Emotional Charge**: Distribution across Dislikes/Neutral/Likes
- **Mindfulness Indicator**: Percentage of present_center clicks
- **Balance Score**: Even distribution across all positions
- **Attachment Level**: Based on likes/dislikes vs neutral ratio

**Triggers**:
- PAHM Matrix session timer completion
- User manual session completion
- Session completion form submission

---

### **GET /api/pahm/session/[sessionId]**
**Purpose**: Retrieve comprehensive PAHM Matrix data for specific session  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Table**: pahm_sessions

**Frontend Integration**:
- Session detail view pages
- Pattern analysis dashboards
- Historical session comparison
- Progress tracking visualizations

**URL Parameters**:
```typescript
sessionId: string;  // Session ID (cuid)
```

**Query Parameters**:
```typescript
?include=analysis    // Include detailed pattern analysis
?include=comparison  // Include comparison with user averages
?include=timestamps  // Include detailed click timestamps
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "pahmSessionId": "cuid_pahm_id",
    "sessionId": "cuid_session_id",
    "stageNumber": 2,
    "stageName": "PAHM Trainee",
    "exerciseType": null,
    "sessionDate": "2024-01-01T10:00:00Z",
    "duration": 30,
    "totalClicks": 47,
    
    "clickDistribution": {
      // Same as completion response
    },
    
    "patternAnalysis": {
      // Same as completion response
    },
    
    "clickTimestamps": [
      {
        "position": "present_center",
        "timestamp": "2024-01-01T10:02:15Z",
        "clickOrder": 1,
        "secondsFromStart": 135
      }
      // ... all 47 clicks with timestamps
    ],
    
    "sessionNotes": {
      "patternNotes": "Noticed strong pull toward nostalgic memories today",
      "insights": "Matrix helped me see how much I drift into past experiences",
      "userRating": 8
    }
  }
}
```

**Triggers**:
- Session history detail view
- Pattern analysis page loading
- Session comparison interfaces
- Progress tracking updates

---

### **GET /api/pahm/analytics**
**Purpose**: Get comprehensive PAHM Matrix analytics and trends across all sessions  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Table**: pahm_sessions

**Frontend Integration**:
- PAHM analytics dashboard
- Long-term pattern visualization
- Progress trend charts
- Spiritual development tracking

**Query Parameters**:
```typescript
?period=30d          // Time period: 7d, 30d, 90d, 1y, all
?stageNumber=2       // Filter by specific stage
?exerciseType=morning // Filter by mind recovery exercise type
?minClicks=20        // Minimum clicks per session filter
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSessions": 24,
      "totalClicks": 1,128,
      "averageClicksPerSession": 47,
      "totalPracticeHours": 12.5,
      "period": "Last 30 days"
    },
    
    "overallPatterns": {
      "timeOrientation": {
        "past": 32.1,      // Average percentage
        "present": 45.8,
        "future": 22.1
      },
      "emotionalCharge": {
        "dislikes": 28.3,
        "neutral": 38.7,
        "likes": 33.0
      },
      "mindfulnessProgress": {
        "currentAverage": 22.8,    // Present_center percentage
        "initialAverage": 15.2,    // First sessions
        "improvement": 7.6,        // Percentage point improvement
        "trend": "improving"
      }
    },
    
    "progressTrends": {
      "weekly": [
        {
          "week": "2024-W01",
          "sessions": 6,
          "presentFocus": 41.2,
          "mindfulness": 19.5
        }
        // ... 4 weeks of data
      ],
      "improvements": [
        "Increased present-moment awareness by 7.6%",
        "Reduced past-dwelling by 4.2%",
        "Better emotional balance (neutral responses up 5.1%)"
      ]
    },
    
    "personalInsights": {
      "strongestPatterns": ["Present-moment awareness", "Balanced emotional engagement"],
      "growthAreas": ["Future planning anxiety", "Nostalgic tendencies"],
      "recommendations": [
        "Continue focusing on present-center development",
        "Notice when mind drifts to past experiences",
        "Practice acceptance of future uncertainty"
      ]
    }
  }
}
```

**Triggers**:
- PAHM analytics page loading
- Progress dashboard PAHM widgets
- Long-term trend analysis
- Spiritual development tracking

---

## � DAILY NOTES & MOOD TRACKING APIs

### **Daily Notes System Overview**
Real-time emotional state tracking with multiple daily entries support: quick emoji-based mood logging and detailed emotional analysis with triggers and insights.

### **POST /api/notes/emoji**
**Purpose**: Submit quick emoji-based mood note (multiple entries per day allowed)  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Table**: daily_notes  
**Validation**: emojiNoteSchema (see src/lib/validations/notes.ts)  
**Rate Limiting**: 50 entries per day per user

**Frontend Integration**:
- Quick mood logging widgets
- Floating action buttons
- Dashboard mood indicators
- Real-time emotional state capture

**Request Body**:
```typescript
{
  type: 'emoji';
  moodRating: number;         // 1-10 scale (1=very negative, 10=very positive)
  timestamp?: string;         // Optional: ISO timestamp (defaults to now)
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Mood logged successfully",
  "data": {
    "id": "cuid_note_id",
    "type": "emoji",
    "moodRating": 7,
    "timestamp": "2024-01-01T18:00:00Z",
    "moodLabel": "Good",      // Generated label: Very Low/Low/Fair/Good/Great/Excellent
    "dailyCount": 3,          // Number of entries today
    "moodTrend": "stable"     // Compared to recent entries: "improving", "stable", "declining"
  }
}
```

**Mood Rating Scale**:
- **1-2**: Very Low (😢 Deep sadness, despair)
- **3-4**: Low (😔 Sad, down, disappointed)  
- **5-6**: Fair (😐 Neutral, okay, balanced)
- **7-8**: Good (😊 Happy, positive, content)
- **9-10**: Excellent (😄 Joy, elation, great)

**Triggers**:
- Quick mood check-ins throughout day
- Post-meditation session logging
- Emotional awareness moments
- Daily mood tracking habits

---

### **POST /api/notes/detailed**
**Purpose**: Submit comprehensive emotional note with single emotion, intensity, context and triggers  
**Method**: POST  
**Authentication**: Authenticated user required  
**Database Table**: daily_notes  
**Validation**: detailedNoteSchema (see src/lib/validations/notes.ts)  
**Rate Limiting**: 20 detailed entries per day per user

**Frontend Integration**:
- Detailed emotion logging form with structured inputs
- **Emotion Dropdown**: "How are you feeling?" with categorized emotion options
- **Intensity Slider**: 1-10 scale with "Mild" to "Intense" labels (shows current value like "5/10")
- **Context Text Area**: "What's happening Today (optional)" for situational description
- **Trigger Dropdown**: "What triggered this? (Optional)" with categorized trigger options
- **Submit Button**: "Log Emotion" to save the detailed note

**Request Body**:
```typescript
{
  type: 'detailed';
  emotion: string;            // Selected emotion from dropdown (required)
  intensity: number;          // 1-10 intensity scale from slider (required)
  context?: string;           // "What's happening Today" - optional description
  trigger?: string;           // "What triggered this" - selected trigger option
  timestamp?: string;         // Optional: ISO timestamp (defaults to now)
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Emotion logged successfully",
  "data": {
    "id": "cuid_note_id",
    "type": "detailed", 
    "emotion": "anxious",
    "intensity": 5,
    "intensityLabel": "Mild",        // Generated: "Mild" (1-3), "Moderate" (4-6), "Intense" (7-10)
    "context": "Work presentation tomorrow and feeling unprepared",
    "trigger": "work_stress",
    "timestamp": "2024-01-01T15:30:00Z",
    "analysis": {
      "emotionCategory": "negative",     // "positive", "negative", "neutral"
      "intensityLevel": "mild",          // "mild", "moderate", "intense"
      "contextKeywords": ["work", "presentation", "unprepared"], // Extracted from context
      "recommendedAction": "breathing_exercise" // Based on emotion + intensity
    }
  }
}
```

**Emotion Options for Dropdown**:
- **Positive Emotions**: happy, peaceful, grateful, excited, loved, confident, content, joyful, calm, hopeful
- **Negative Emotions**: anxious, angry, sad, fearful, frustrated, guilty, ashamed, overwhelmed, stressed, lonely
- **Neutral Emotions**: curious, focused, alert, contemplative, balanced, thoughtful, reflective, present

**Intensity Scale Labels**:
- **1-3**: Mild (light background feeling)
- **4-6**: Moderate (noticeable emotional presence) 
- **7-10**: Intense (strong, prominent emotional state)

**Trigger Options for Dropdown**:
- **Work**: work_stress, work_success, work_conflict, work_deadline, work_meeting
- **Relationships**: family_interaction, friend_connection, romantic_relationship, social_event, conflict_resolution
- **Personal**: meditation_practice, exercise, health_concern, achievement, personal_growth
- **Daily Life**: commute, weather, news, technology, routine_disruption
- **Internal**: thoughts, memories, physical_sensation, spiritual_experience, realization
- **Other**: financial_concern, time_pressure, decision_making, unexpected_event, creative_inspiration

**Triggers**:
- Deep emotional experiences
- Post-session reflections
- Significant life events
- Weekly/daily journaling habits

---

### **GET /api/notes/history**
**Purpose**: Retrieve chronological notes history with filtering and pagination  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Table**: daily_notes

**Frontend Integration**:
- Daily notes history page
- Mood timeline visualization
- Emotional pattern analysis
- Journal entry browsing

**Query Parameters**:
```typescript
?date=2024-01-01     // Filter by specific date (YYYY-MM-DD)
?dateFrom=2024-01-01 // Start date filter
?dateTo=2024-01-31   // End date filter
?type=emoji          // Filter by note type: "emoji" | "detailed"
?limit=50            // Number of entries to return (default: 50)
?offset=0            // Pagination offset
?moodMin=7           // Minimum mood rating filter
?moodMax=10          // Maximum mood rating filter
?context=work        // Filter by context category
?sort=desc           // Sort order: "asc" | "desc" (default: desc - newest first)
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "cuid_note_id",
        "type": "detailed",
        "moodRating": 8,
        "emotions": [
          { "name": "peace", "intensity": 8 },
          { "name": "gratitude", "intensity": 9 }
        ],
        "triggers": "Completed meditation session",
        "notes": "Feeling very centered after practice",
        "context": "personal",
        "timestamp": "2024-01-01T15:30:00Z"
      },
      {
        "id": "cuid_note_id_2",
        "type": "emoji",
        "moodRating": 6,
        "timestamp": "2024-01-01T12:00:00Z"
      }
      // ... more entries
    ],
    "analytics": {
      "totalEntries": 145,
      "averageMood": 6.8,
      "moodTrend": "improving",     // Last 7 days vs previous 7 days
      "entryFrequency": 4.2,        // Entries per day average
      "emotionalPatterns": {
        "mostCommon": ["peace", "anxiety", "gratitude"],
        "risingEmotions": ["contentment", "focus"],
        "decliningEmotions": ["stress", "worry"]
      },
      "triggerPatterns": {
        "positive": ["meditation", "nature", "family"],
        "negative": ["work pressure", "traffic", "news"],
        "neutral": ["routine", "exercise", "reading"]
      }
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalEntries": 145,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

**Triggers**:
- Daily notes history page loading
- Mood timeline visualizations
- Pattern analysis requests
- Journal browsing sessions

---


### **DELETE /api/notes/[noteId]**
**Purpose**: Delete specific daily note entry  
**Method**: DELETE  
**Authentication**: Authenticated user required (can only delete own notes)  
**Database Table**: daily_notes

**Frontend Integration**:
- Note entry delete buttons
- Bulk delete functionality
- Note management interface
- Privacy/cleanup features

**URL Parameters**:
```typescript
noteId: string;  // Note ID (cuid)
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Daily note deleted successfully",
  "data": {
    "deletedNoteId": "cuid_note_id",
    "deletedAt": "2024-01-01T20:00:00Z"
  }
}
```

**Error Responses**:
- **404**: Note not found or doesn't belong to user
- **403**: Insufficient permissions

**Triggers**:
- User deletes individual note entries
- Bulk cleanup operations
- Privacy/data management actions

---

## 📊 PROGRESS TRACKING & ANALYTICS APIs

### **Progress System Overview**
Comprehensive progress tracking across all user activities: session progress, stage advancement, happiness evolution, and overall spiritual development analytics.

### **GET /api/progress/overview**
**Purpose**: Get comprehensive user progress overview across all app dimensions  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: users, sessions, user_stage_progress, happiness_scores, daily_notes

**Frontend Integration**:
- Main dashboard progress widgets
- Overview page primary display
- Progress summary cards
- Motivational progress indicators

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "userInformation": {
      "name": "John Doe",
      "joinedDate": "2024-01-01T00:00:00Z",
      "daysSinceJoining": 30,
      "currentLevel": "PAHM Intermediate"
    },
    
    "currentStatus": {
      "currentStage": 2,
      "currentStageName": "PAHM Trainee", 
      "completedStages": 1,
      "totalStages": 6,
      "overallCompletionPercentage": 16.3  // Based on 115+ total hours journey
    },
    
    "practiceStatistics": {
      "totalSessions": 45,
      "totalHours": 18.75,
      "averageSessionLength": 25.0,
      "currentStreak": 7,
      "longestStreak": 12,
      "lastSessionDate": "2024-01-01T10:15:00Z",
      "practiceDays": 32,
      "restDays": 8
    },
    
    "happinessMetrics": {
      "currentScore": 72.5,
      "previousScore": 68.2,
      "improvement": 4.3,
      "userLevel": "PAHM Expert",  
      "levelProgress": 72.5,      // Progress within current level
      "nextLevel": "Advanced Practitioner",
      "pointsToNextLevel": 7.5,
      "lastCalculated": "2024-01-01T14:00:00Z"
    },
    
    "emotionalWellbeing": {
      "averageMood": 6.8,         // From daily notes
      "moodTrend": "improving",
      "emotionalStability": 0.75,  // 0-1 scale
      "totalMoodEntries": 95,
      "lastMoodEntry": "2024-01-01T18:00:00Z"
    },
    
    "upcomingMilestones": [
      {
        "type": "stage_completion",
        "description": "Complete Stage 2: PAHM Trainee",
        "progress": 55.0,
        "estimated": "2024-01-25T00:00:00Z"
      },
      {
        "type": "session_milestone", 
        "description": "Reach 50 total sessions",
        "progress": 90.0,
        "estimated": "2024-01-05T00:00:00Z"
      },
      {
        "type": "happiness_level",
        "description": "Reach Advanced Practitioner level (80+ score)",
        "progress": 90.6,
        "estimated": "2024-01-20T00:00:00Z"
      }
    ],
    
    "achievements": [
      "Completed Stage 1: Seeker (11.5 hours)",
      "Maintained 7-day practice streak",
      "Achieved PAHM Expert happiness level",
      "Logged 45 meditation sessions"
    ],
    
    "insights": [
      "Your happiness score improved 4.3 points this month",
      "Current 7-day streak is your best in 2 weeks",
      "PAHM Matrix practice showing consistent present-moment focus",
      "Emotional stability has increased 15% since starting"
    ]
  }
}
```

**Triggers**:
- Dashboard page loading
- Progress overview page navigation
- Daily progress updates
- Achievement notifications

---

### **GET /api/progress/stages**
**Purpose**: Get detailed stage progression data with completion analytics  
**Method**: GET  
**Authentication**: Authenticated user required  
**Database Tables**: stages, user_stage_progress, sessions

**Frontend Integration**:
- Stage progression dashboard
- Detailed stage analytics page
- Stage completion visualizations
- Progress planning interface

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "overallProgress": {
      "totalStages": 6,
      "completedStages": 1,
      "currentStage": 2,
      "overallCompletionPercentage": 16.3,
      "estimatedCompletionDate": "2024-06-15T00:00:00Z",
      "totalJourneyHours": 115.5,
      "completedHours": 18.75
    },
    
    "stageDetails": [
      {
        "stageNumber": 1,
        "name": "Seeker",
        "status": "completed",
        "completedAt": "2024-01-15T00:00:00Z",
        "requirements": {
          "minSessions": 29,
          "minHours": 11.5
        },
        "achievement": {
          "sessionsCompleted": 29,
          "hoursCompleted": 11.8,
          "completionPercentage": 100,
          "timeTaken": 15,  // Days to complete
          "averageSessionQuality": 7.3
        },
        "subStageBreakdown": [
          {
            "subStage": "T1",
            "sessionsCompleted": 3,
            "hoursCompleted": 0.6,
            "completedAt": "2024-01-03T00:00:00Z"
          }
          // ... T2-T5 sub-stages
        ]
      },
      {
        "stageNumber": 2,
        "name": "PAHM Trainee",
        "status": "in_progress",
        "startedAt": "2024-01-16T00:00:00Z",
        "requirements": {
          "minSessions": 30,
          "minHours": 15.0
        },
        "currentProgress": {
          "sessionsCompleted": 16,
          "hoursCompleted": 8.25,
          "completionPercentage": 55.0,
          "sessionsRemaining": 14,
          "hoursRemaining": 6.75,
          "estimatedCompletion": "2024-01-28T00:00:00Z"
        },
        "pahmAnalytics": {
          "averagePresentFocus": 45.8,  // Percentage of present-oriented clicks
          "mindfulnessImprovement": 7.6, // Percentage point improvement
          "totalMatrixClicks": 1128,
          "patternStability": "improving"
        }
      }
      // ... Stages 3-6 (locked/not started)
    ],
    
    "progressTrends": {
      "weeklySessionCounts": [4, 6, 5, 7, 6],  // Last 5 weeks
      "weeklyHours": [1.8, 2.4, 2.1, 2.8, 2.5],
      "qualityTrends": [6.8, 7.1, 7.3, 7.5, 7.2],
      "consistencyScore": 0.85  // 0-1 scale based on regular practice
    },
    
    "recommendations": [
      "Continue Stage 2 practice - excellent progress at 55% completion",
      "Consider extending session duration slightly to reach 30+ minutes",
      "PAHM Matrix patterns show strong present-moment development"
    ]
  }
}
```

**Triggers**:
- Stage progression page loading
- Detailed stage analytics requests
- Progress planning interfaces
- Stage completion celebrations

---


## 📊 API RESPONSE STANDARDS & CONVENTIONS

### **Standardized Response Format**
All API endpoints follow consistent response structure for predictable frontend integration.

**Success Response Format**:
```typescript
{
  success: true;
  data?: any;                    // Response payload (optional for some endpoints)
  message?: string;              // Optional success message
  timestamp: string;             // ISO 8601 timestamp
  meta?: {                      // Optional metadata
    pagination?: PaginationMeta;
    analytics?: AnalyticsMeta;
    version?: string;
  };
}
```

**Error Response Format**:
```typescript
{
  success: false;
  error: string;                 // Human-readable error message
  code?: string;                 // Machine-readable error code
  details?: ValidationError[];   // Detailed validation errors (Zod)
  timestamp: string;             // ISO 8601 timestamp
  requestId?: string;            // For error tracking and support
}
```

### **HTTP Status Code Standards**

**Success Codes**:
- **200 OK**: Successful GET, PUT, DELETE operations
- **201 Created**: Successful POST operations (resource creation)
- **202 Accepted**: Async operations initiated
- **204 No Content**: Successful operations with no response body

**Client Error Codes**:
- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Valid auth but insufficient permissions
- **404 Not Found**: Resource doesn't exist or user lacks access
- **409 Conflict**: Resource already exists, business rule violation
- **422 Unprocessable Entity**: Valid format but semantic errors
- **429 Too Many Requests**: Rate limiting exceeded

**Server Error Codes**:
- **500 Internal Server Error**: Unexpected server errors
- **502 Bad Gateway**: Downstream service failures
- **503 Service Unavailable**: Temporary service unavailability

### **Error Code Conventions**
```typescript
// Authentication & Authorization
AUTH_INVALID_CREDENTIALS = 'AUTH_001'
AUTH_TOKEN_EXPIRED = 'AUTH_002'
AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_003'

// Validation Errors
VALIDATION_REQUIRED_FIELD = 'VAL_001'
VALIDATION_INVALID_FORMAT = 'VAL_002'
VALIDATION_OUT_OF_RANGE = 'VAL_003'

// Business Logic Errors
BUSINESS_QUESTIONNAIRE_COMPLETED = 'BUS_001'
BUSINESS_STAGE_NOT_UNLOCKED = 'BUS_002'
BUSINESS_SESSION_ACTIVE = 'BUS_003'

// Resource Errors
RESOURCE_NOT_FOUND = 'RES_001'
RESOURCE_ALREADY_EXISTS = 'RES_002'
RESOURCE_LIMIT_EXCEEDED = 'RES_003'
```

### **Pagination Standard**
```typescript
// Query Parameters
{
  limit?: number;     // Items per page (default: 50, max: 100)
  offset?: number;    // Skip items (default: 0)
  page?: number;      // Page number (alternative to offset)
  sort?: string;      // Sort field
  order?: 'asc' | 'desc'; // Sort direction
}

// Response Meta
{
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nextPage?: number;
    previousPage?: number;
  }
}
```

---

## 🔒 AUTHENTICATION & SECURITY STANDARDS

### **Authentication Methods**

**Session-Based Authentication (Primary)**:
- NextAuth.js session management
- HTTP-only cookies for security
- CSRF protection enabled
- Session expiry: 7 days (configurable)

**API Key Authentication (Future)**:
- For mobile apps and third-party integrations
- Bearer token format: `Authorization: Bearer <token>`
- Token expiry and refresh mechanism

### **Authorization Levels**

**Public Endpoints** (No Authentication):
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/reset-password`
- `POST /api/auth/resend-verification`

**User Endpoints** (Authenticated User):
- All `/api/user/*` endpoints
- All `/api/assessment/*` endpoints
- All `/api/session/*` endpoints
- All `/api/happiness/*` endpoints
- All `/api/notes/*` endpoints
- All `/api/progress/*` endpoints

**Admin Endpoints** (Admin Role Required):
- All `/api/admin/*` endpoints
- Enhanced logging and audit trails
- IP restrictions (configurable)
- Multi-factor authentication (planned)

### **Security Implementation**

**Input Validation**:
- Zod schema validation on all inputs
- SQL injection prevention via Prisma ORM
- XSS protection with input sanitization
- File upload validation and scanning

**Rate Limiting**:
```typescript
// Authentication endpoints
POST /api/auth/register: 5 requests/minute/IP
POST /api/auth/reset-password: 3 requests/hour/email
POST /api/auth/resend-verification: 1 request/5 minutes/email

// User endpoints
General user endpoints: 100 requests/minute/user
POST /api/notes/*: 50 requests/day/user (emoji), 20 requests/day/user (detailed)
POST /api/happiness: 10 requests/hour/user

// Admin endpoints  
Admin endpoints: 1000 requests/minute/admin
```

**Data Protection**:
- Password hashing with bcryptjs (salt rounds: 12)
- Sensitive data encryption at rest
- HTTPS enforcement in production
- Security headers implementation
- Regular security audits and updates

---

## 🚀 FRONTEND INTEGRATION PATTERNS

### **API Client Setup**
```typescript
// lib/api-client.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error, data.code, response.status);
    }
    
    return data;
  }
}
```

### **React Hooks Integration**
```typescript
// hooks/useApi.ts
function useAssessmentSubmission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const submitQuestionnaire = async (data: QuestionnaireData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/api/assessment/questionnaire', data);
      // Handle success (show success message, redirect, etc.)
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { submitQuestionnaire, loading, error };
}
```

### **Error Handling Patterns**
```typescript
// Error handling component
function ApiErrorBoundary({ error, retry }: { error: ApiError; retry: () => void }) {
  switch (error.code) {
    case 'AUTH_001':
      return <LoginPrompt />;
    case 'VALIDATION_REQUIRED_FIELD':
      return <ValidationErrors details={error.details} />;
    case 'BUSINESS_STAGE_NOT_UNLOCKED':
      return <StageLockedMessage />;
    default:
      return <GenericError error={error} onRetry={retry} />;
  }
}
```

### **Real-time Updates**
```typescript
// For session progress and live updates
function useSessionProgress(sessionId: string) {
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/session/${sessionId}/progress`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setProgress(update);
    };
    
    return () => eventSource.close();
  }, [sessionId]);
  
  return progress;
}
```

---

## 🛠️ DEVELOPMENT & TESTING GUIDELINES

### **API Development Workflow**

**1. Design Phase**:
- Define endpoint purpose and business requirements
- Design request/response schemas
- Plan database interactions and relationships
- Consider security and performance implications

**2. Implementation Phase**:
- Create Zod validation schemas
- Implement API route with error handling
- Add authentication/authorization checks
- Write comprehensive TypeScript types

**3. Testing Phase**:
- Unit tests for business logic functions
- Integration tests for API endpoints
- Authentication and authorization testing
- Performance and load testing

**4. Documentation Phase**:
- Update API documentation
- Add inline code comments
- Create frontend integration examples
- Update changelog and migration notes

### **Code Quality Standards**

**TypeScript Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**ESLint Configuration**:
- Next.js recommended rules
- TypeScript strict rules
- Custom API route validation rules
- Performance and security linting

**Testing Requirements**:
```typescript
// Example API route test
describe('/api/assessment/questionnaire', () => {
  describe('POST', () => {
    it('should create questionnaire with valid data', async () => {
      const response = await request(app)
        .post('/api/assessment/questionnaire')
        .set('Authorization', `Bearer ${validToken}`)
        .send(validQuestionnaireData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });
    
    it('should reject duplicate questionnaire submission', async () => {
      // Setup: Create existing questionnaire
      await createQuestionnaire(userId);
      
      const response = await request(app)
        .post('/api/assessment/questionnaire')
        .set('Authorization', `Bearer ${validToken}`)
        .send(validQuestionnaireData)
        .expect(409);
        
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('BUSINESS_QUESTIONNAIRE_COMPLETED');
    });
  });
});
```

### **Performance Optimization**

**Database Query Optimization**:
- Use Prisma select/include for specific fields
- Implement proper indexing strategies
- Use database connection pooling
- Cache frequently accessed data

**API Response Optimization**:
- Paginate large result sets
- Implement response compression
- Use appropriate HTTP caching headers
- Optimize JSON serialization

**Monitoring and Logging**:
- Request/response logging
- Performance metrics collection
- Error tracking and alerting
- Database query performance monitoring

---

## 📈 API VERSIONING & MIGRATION

### **Versioning Strategy**
- URL-based versioning: `/api/v1/endpoint`
- Semantic versioning for breaking changes
- Backward compatibility for minor updates
- Deprecation notices for phased migrations

### **Breaking Change Protocol**
1. Announce deprecation 3 months in advance
2. Maintain parallel API versions during transition
3. Provide migration guides and tools
4. Monitor usage analytics during deprecation period
5. Remove deprecated endpoints after transition period

---

This comprehensive API documentation provides the complete foundation for implementing and integrating with "The Return of Attention" PAHM meditation application, ensuring consistent development practices and robust user experiences across all features.

---

## 🔒 AUTHENTICATION & SECURITY

### **Authentication Requirements**
- All user APIs require valid JWT token
- Admin APIs require admin-level authentication
- Session-based authentication for web interface
- Rate limiting on all authentication endpoints

### **Authorization Levels**
1. **Public**: Landing pages, auth endpoints
2. **User**: Authenticated user access
3. **Admin**: Administrative access only

### **Input Validation**
- All inputs validated using Zod schemas
- SQL injection prevention via Prisma ORM
- XSS protection on all text inputs
- File upload validation and sanitization

---

## 🚀 DEVELOPMENT GUIDELINES

### **API Development Workflow**
1. **Design**: Plan endpoint structure and data flow
2. **Validate**: Create Zod validation schemas
3. **Implement**: Build API route with error handling
4. **Test**: Test all scenarios (success, error, edge cases)
5. **Document**: Update API documentation

### **Testing Requirements**
- Unit tests for all business logic functions
- Integration tests for API endpoints
- Authentication and authorization testing
- Input validation testing
- Error handling verification

### **Performance Considerations**
- Database query optimization
- Pagination for large datasets
- Caching for frequently accessed data
- Rate limiting to prevent abuse
- Efficient session management

---

## 📈 BUSINESS LOGIC INTEGRATION

### **Stage Progression Logic**
- Linear progression enforced (no stage skipping)
- Sub-stage completion requirements validated
- PAHM Matrix introduction after Stage 1 completion

### **Happiness Score Calculation**
- Triggered only when both assessments complete
- 8-component weighted calculation
- Regular recalculation with new data
- Score range: 0-100 with user level assignment

### **Session Management**
- Timer-only sessions for Stage 1
- PAHM Matrix integration for Stage 2+
- Click tracking with timestamp precision
- Session completion validation

This API documentation provides the foundation for implementing all core functionality while maintaining consistency with the PAHM methodology and ensuring proper user progression through the meditation journey.