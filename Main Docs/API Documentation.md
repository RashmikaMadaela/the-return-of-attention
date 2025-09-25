# The Return of Attention - API Documentation

## 📋 Overview
This document provides a comprehensive overview of all API endpoints for "The Return of Attention" meditation application. It serves as a guideline for backend development and frontend integration based on the PAHM (Present Attention and Happiness Matrix) methodology.

**Application**: The Return of Attention - PAHM Meditation App  
**API Design**: RESTful with Next.js App Router API Routes  
**Authentication**: NextAuth.js with JWT strategy  
**Database**: PostgreSQL with Prisma ORM  
**Architecture**: Backend-first development approach

---

## 🔐 AUTHENTICATION APIs

### **Auth Management**
Base URL: `/api/auth`

#### **POST /api/auth/register**
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "userId": "user_id_here"
}
```

#### **POST /api/auth/verify-email**
Verify user email address.

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

#### **POST /api/auth/forgot-password**
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### **POST /api/auth/reset-password**
Reset user password with token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

---

## 👤 USER MANAGEMENT APIs

### **User Profile**
Base URL: `/api/user`

#### **GET /api/user/profile**
Get current user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profile": {
      "age": 28,
      "gender": "male",
      "nationality": "US",
      "currentCountry": "US"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### **PUT /api/user/profile**
Update user profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

#### **PUT /api/user/personal-info**
Update personal information (age, gender, nationality, country).

**Request Body:**
```json
{
  "age": 28,
  "gender": "male",
  "nationality": "US",
  "currentCountry": "US"
}
```

#### **PUT /api/user/preferences**
Update user preferences and settings.

#### **PUT /api/user/change-password**
Change user password.

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newPassword123"
}
```

#### **DELETE /api/user/delete-account**
Delete user account (requires confirmation).

---

## 📋 ASSESSMENT APIs

### **Questionnaire Management**
Base URL: `/api/assessment`

#### **POST /api/assessment/questionnaire**
Submit one-time comprehensive questionnaire (collected only after account creation).

**Request Body:**
```json
{
  // Phase 1: Demographics & Background
  "experienceLevel": 7,
  "mainGoals": ["Stress Reduction", "Better Sleep", "Emotional Balance"],
  "ageRange": "25-34 years",
  "location": "Urban area",
  "occupation": "Software Developer", 
  "educationLevel": "Bachelor's degree",
  "meditationBackground": "Some guided meditation experience",
  
  // Phase 2: Lifestyle Patterns
  "sleepPattern": 6,
  "physicalActivity": "Moderate (regular exercise)",
  "stressTrigers": ["Work Pressure", "Finances", "Social Media"],
  "dailyRoutine": "Structured but flexible",
  "dietPattern": "Balanced with occasional treats",
  "screenTime": "6-8 hours daily",
  "socialConnections": "Good friends and family relationships",
  "workLifeBalance": "Sometimes struggle but generally good",
  
  // Phase 3: Thinking Patterns
  "emotionalAwareness": 7,
  "stressResponse": "Usually manage well",
  "decisionMaking": "Balanced approach",
  "selfReflection": "Weekly reflection time",
  "thoughtPatterns": "Generally positive with some worry",
  "mindfulnessInDailyLife": "Try to be mindful but forget",
  
  // Phase 4: Mindfulness Specific
  "mindfulnessExperience": 5,
  "meditationBackgroundDetail": "Guided meditations, apps",
  "practiceGoals": "Better sleep",
  "preferredDuration": "20 minutes",
  "biggestChallenges": "Finding time and staying consistent",
  "motivation": "Stress reduction and emotional balance"
}
```

**Business Rules:**
- **One-time Collection**: Questionnaire submitted only once after account creation
- **No Type Field**: Unlike self-assessment, questionnaire has no type variants
- **Total Questions**: 27 questions across 4 phases
- **Completion**: All questions required for full assessment
- **Multi-select**: `mainGoals` and `stressTrigers` allow multiple selections
- **Sliders**: `experienceLevel` (1-10), `sleepPattern` (1-10), `emotionalAwareness` (3-9), `mindfulnessExperience` (1-8)
- **Progression**: Completion triggers initial self-assessment availability

#### **GET /api/assessment/questionnaire/status**
Get questionnaire completion status.

**Response:**
```json
{
  "success": true,
  "data": {
    "isCompleted": false,
    "currentStep": 3,
    "completedSteps": [1, 2, 3],
    "totalSteps": 6
  }
}
```

#### **POST /api/assessment/self-assessment**
Submit self-assessment with 3 different types at specific progression milestones.

**Request Body:**
```json
{
  "type": "initial",  // Required: "initial", "mid", or "final"
  "foodTaste": "some",
  "scentsAromas": "none", 
  "soundsMusic": "strong",
  "visualBeauty": "none",
  "touchTextures": "some",
  "thoughtsImages": "strong"
}
```

**Assessment Types & Triggers:**
- **"initial"**: Submitted after account creation (mandatory before accessing stages)
- **"mid"**: Submitted after completing first 3 stages (stages 1-3)
- **"final"**: Submitted after completing all 6 stages (track spiritual progress)

**Category Questions & Scoring:**
- **foodTaste**: "How would you describe your relationship with food and flavors?"
- **scentsAromas**: "How do you feel about different scents and fragrances?"
- **soundsMusic**: "What's your relationship with sounds, music, and audio?"
- **visualBeauty**: "How do you respond to visual beauty, colors, and sights?"
- **touchTextures**: "How do you feel about different textures and physical sensations?"
- **thoughtsImages**: "What's your relationship with thoughts, ideas, and mental imagery?"

**3-Choice Scale Options:**
- **"none"** (+12 points): "I don't have particular preferences for this"
- **"some"** (-7 points): "I have some preferences, but I'm flexible"  
- **"strong"** (-15 points): "I have strong preferences and specific likes/dislikes"

**Business Rules:**
- **Multiple Assessments**: User can have up to 3 self-assessments (one per type)
- **Progressive Unlocking**: Mid assessment unlocks after stage 3, final after stage 6
- **Score Tracking**: Each assessment tracks spiritual progress over time
- **Mandatory Initial**: Initial self-assessment required before accessing meditation stages
- **Score Range**: -90 to +72 points per assessment (higher = less attachment)

#### **GET /api/assessment/history**
Get assessment history and timeline.

#### **GET /api/assessment/type**
Check if assessment type determination is needed.

---

## 🎯 STAGES & PROGRESSION APIs

### **Stage Management**
Base URL: `/api/stages`

#### **GET /api/stages**
Get all available stages with user progress.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "stage_1",
      "name": "Seeker",
      "description": "Foundation stage - Physical stillness mastery",
      "type": "timer_only",
      "subStages": [
        {
          "id": "T1",
          "duration": 10,
          "minSessions": 3,
          "isUnlocked": true,
          "isCompleted": true,
          "sessionsCompleted": 3
        }
      ],
      "isUnlocked": true,
      "isCompleted": false,
      "totalSessions": 29,
      "completedSessions": 15
    }
  ]
}
```

#### **GET /api/stages/[stageId]**
Get detailed information for a specific stage.

#### **GET /api/stages/[stageId]/unlock**
Check if user can unlock a specific stage.

**Response:**
```json
{
  "success": true,
  "canUnlock": true,
  "requirements": [
    "Complete all T1-T5 sub-stages",
    "Demonstrate 30-minute stillness capability",
    "Complete PAHM Matrix learning module"
  ],
  "unmetRequirements": []
}
```

---

## 🧘‍♀️ SESSION MANAGEMENT APIs

### **Meditation Sessions**
Base URL: `/api/session`

#### **POST /api/session/start**
Start a new meditation session.

**Request Body:**
```json
{
  "stageId": "stage_1",
  "subStageId": "T2",
  "duration": 15,
  "sessionType": "timer_only",
  "posture": "sitting"
}
```

**Duration Notes:**
- `duration`: Actual session duration in minutes (user can extend minimum duration via slider)
- Mind recovery exercises are fixed at 5 minutes (non-adjustable)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_id_here",
    "startTime": "2024-01-01T10:00:00Z",
    "duration": 15,
    "sessionType": "timer_only"
  }
}
```

#### **PUT /api/session/update**
Update session progress (for pause/resume functionality).

#### **POST /api/session/complete**
Complete a meditation session.

**Request Body:**
```json
{
  "sessionId": "session_id_here",
  "completedDuration": 15,
  "qualityRating": 8,
  "notes": "Good focus today",
  "reflection": {
    "mood": "calm",
    "insights": "Noticed less mind wandering"
  }
}
```

#### **GET /api/session/history**
Get user's session history with filtering.

**Query Parameters:**
- `limit`: Number of sessions to return
- `stageId`: Filter by stage
- `dateFrom`: Start date filter
- `dateTo`: End date filter

#### **GET /api/session/progress**
Get detailed session progress and statistics.

---

## 🔲 PAHM MATRIX APIs

### **PAHM Matrix Sessions**
Base URL: `/api/pahm`

#### **POST /api/pahm/start**
Start a PAHM Matrix session (Stage 2+).

**Request Body:**
```json
{
  "sessionId": "session_id_here",
  "stageId": "stage_2"
}
```

#### **POST /api/pahm/click**
Record PAHM Matrix click during session.

**Request Body:**
```json
{
  "sessionId": "session_id_here",
  "position": "present_center",
  "timestamp": "2024-01-01T10:05:30Z",
  "clickOrder": 1
}
```

**PAHM Matrix Positions:**
- `regret` (Past + Dislikes)
- `past_neutral` (Past + Neutral)
- `nostalgia` (Past + Likes)
- `dislikes` (Present + Dislikes)
- `present_center` (Present + Neutral)
- `likes` (Present + Likes)
- `worry` (Future + Dislikes)
- `future_neutral` (Future + Neutral)
- `anticipation` (Future + Likes)

#### **POST /api/pahm/complete**
Complete PAHM Matrix session with summary.

#### **GET /api/pahm/session/[sessionId]**
Get PAHM Matrix data for a specific session.

---

## 📊 PROGRESS TRACKING APIs

### **Progress & Analytics**
Base URL: `/api/progress`

#### **GET /api/progress/overview**
Get comprehensive user progress overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentStage": "stage_1",
    "completedStages": 0,
    "totalSessions": 45,
    "totalHours": 8.5,
    "currentStreak": 7,
    "longestStreak": 12,
    "happinessScore": 72,
    "userLevel": "Developing Seeker"
  }
}
```

#### **GET /api/progress/stages**
Get detailed stage progression data.

---

## 📝 DAILY NOTES & MOOD APIs

### **Real-time Emotional Tracking**
Base URL: `/api/notes`

#### **POST /api/notes/emoji**
Submit quick emoji-based mood note (multiple entries per day).

**Request Body:**
```json
{
  "type": "emoji",
  "moodRating": 7,
  "timestamp": "2024-01-01T18:00:00Z"
}
```

**Business Rules:**
- Multiple entries per day allowed
- Instant emotion recording
- Auto-timestamped for chronological order

#### **POST /api/notes/detailed**
Submit detailed emotional note (multiple entries per day).

**Request Body:**
```json
{
  "type": "detailed",
  "moodRating": 8,
  "emotions": [
    {"name": "anxiety", "intensity": 6},
    {"name": "peace", "intensity": 8}
  ],
  "triggers": "Work deadline pressure, then completed meditation",
  "notes": "Initially anxious about meeting, but PAHM practice helped me find calm"
}
```

**Business Rules:**
- Multiple detailed entries per day supported
- Real-time emotional state capture
- Complex emotion tracking with intensities

#### **GET /api/notes/history**
Get chronological notes history with filtering and pagination.

**Query Parameters:**
- `date`: Filter by specific date
- `dateRange`: Filter by date range
- `type`: Filter by note type (emoji/detailed)
- `limit`: Number of entries to return
- `offset`: Pagination offset

#### **GET /api/notes/trends**
Get mood trends and emotional patterns analysis.

#### **DELETE /api/notes/:id**
Delete specific note entry.

---

## 😊 HAPPINESS SCORE APIs

### **Happiness Calculation**
Base URL: `/api/happiness`

#### **POST /api/happiness/calculate**
Calculate/recalculate happiness score.

**Business Rules:**
- Requires completed questionnaire (all 6 steps)
- Requires completed self-assessment (all 6 categories)
- Practice sessions enhance but don't enable calculation

**Response:**
```json
{
  "success": true,
  "data": {
    "happinessScore": 72,
    "userLevel": "Developing Seeker",
    "components": {
      "currentState": 65,
      "attachmentBased": 58,
      "pahmDevelopment": 45,
      "lifestyle": 70,
      "emotional": 75,
      "social": 80,
      "mindfulness": 85,
      "progress": 60
    },
    "calculatedAt": "2024-01-01T12:00:00Z"
  }
}
```

#### **GET /api/happiness/history**
Get happiness score history and progression.

#### **GET /api/happiness/breakdown**
Get detailed breakdown of happiness score components.

#### **GET /api/happiness/trends**
Get happiness trends analysis over time.

---

## 🔧 ADMIN APIs

### **Admin Management**
Base URL: `/api/admin`
**Authentication**: Admin-level access required

#### **POST /api/admin/auth/login**
Admin-specific login with enhanced security.

#### **GET /api/admin/users**
Get list of all users with pagination and filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Users per page
- `search`: Search by name/email
- `status`: Filter by user status

#### **GET /api/admin/users/[userId]**
Get detailed information for a specific user.

#### **PUT /api/admin/users/[userId]**
Update user information (admin privileges).

#### **DELETE /api/admin/users/[userId]**
Delete user account (admin action).

#### **POST /api/admin/users/bulk**
Bulk operations on multiple users.

#### **GET /api/admin/stats**
Get system-wide statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 890,
    "totalSessions": 15670,
    "averageHappinessScore": 68.5,
    "completionRates": {
      "questionnaire": 0.85,
      "selfAssessment": 0.78,
      "stage1": 0.65
    }
  }
}
```

#### **GET /api/admin/analytics/users**
Get user engagement analytics.

#### **GET /api/admin/analytics/sessions**
Get session completion and usage analytics.

#### **GET /api/admin/analytics/happiness**
Get happiness score analytics (aggregated, anonymized).

#### **GET /api/admin/system/monitor**
Get system monitoring data.

#### **POST /api/admin/sessions/manage**
Session management tools for testing and debugging.

---

## 📊 API RESPONSE STANDARDS

### **Success Response Format**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### **Error Response Format**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* optional error details */ },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### **Common HTTP Status Codes**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error

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