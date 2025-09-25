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
Submit questionnaire responses (6-step process).

**Request Body:**
```json
{
  "step": 1,
  "responses": {
    "personalBackground": {
      "experienceLevel": "beginner",
      "goals": ["stress_reduction", "focus_improvement"],
      "ageRange": "25-34",
      "location": "urban"
    }
  }
}
```

**Business Rules:**
- All 6 steps must be completed sequentially
- Progress can be saved and resumed
- Completion triggers self-assessment availability

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
Submit self-assessment (6 categories with 3-choice attachment scale).

**Request Body:**
```json
{
  "assessmentType": "initial",
  "categories": {
    "foodTaste": "some",
    "scentsAromas": "none",
    "soundsMusic": "strong",
    "visualBeauty": "none",
    "touchTextures": "some",
    "thoughtsMental": "strong"
  }
}
```

**Business Rules:**
- All 6 categories required (3-choice scale per category)
- Scale options: "none" (+12 bonus), "some" (-7 penalty), "strong" (-15 penalty)
- Enables happiness score calculation when complete

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

### **Daily Notes Management**
Base URL: `/api/notes`

#### **POST /api/notes/emoji**
Submit quick emoji-based mood note.

**Request Body:**
```json
{
  "mood": "😊",
  "intensity": 7,
  "timestamp": "2024-01-01T18:00:00Z"
}
```

#### **POST /api/notes/detailed**
Submit detailed emotional note.

**Request Body:**
```json
{
  "noteType": "detailed",
  "mood": "calm",
  "intensity": 8,
  "happening": "Had a stressful meeting but meditation helped",
  "feelings": "Initially anxious, then peaceful",
  "thoughts": "Noticed thoughts slowing down",
  "triggers": "Work deadline pressure",
  "responses": "Used breathing technique from practice"
}
```

#### **GET /api/notes/history**
Get daily notes history with filtering.

#### **GET /api/notes/trends**
Get mood trends and patterns analysis.

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