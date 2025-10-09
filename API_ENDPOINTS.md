# API Endpoints

## Admin
GET /api/admin/auth/login - Admin user authentication and login
POST /api/admin/auth/register - Register new admin user accounts
POST /api/admin/data/clear - Clear all user data and reset system
GET /api/admin/sessions/manage - Retrieve all user sessions for management
POST /api/admin/sessions/manage - Create or modify user sessions
GET /api/admin/stages/manage - Retrieve stage configurations for management
POST /api/admin/stages/manage - Update stage settings and requirements
GET /api/admin/stats - Get system-wide statistics and analytics
GET /api/admin/users - Retrieve list of all users in the system
POST /api/admin/users - Create new user accounts via admin
GET /api/admin/users/[userId] - Get specific user details by ID
PUT /api/admin/users/[userId] - Update specific user information
DELETE /api/admin/users/[userId] - Delete specific user account
GET /api/admin/users/manage - Get user management interface data
POST /api/admin/users/manage - Perform bulk user management operations

## Assessment
GET /api/assessment/questionnaire - Retrieve questionnaire questions and structure
POST /api/assessment/questionnaire - Submit questionnaire responses
POST /api/assessment/reset - Reset user's assessment progress
GET /api/assessment/results - Get user's assessment results and analysis
POST /api/assessment/self-assessment - Submit self-assessment responses
GET /api/assessment/status - Check current assessment completion status

## Authentication
GET /api/auth/[...nextauth] - NextAuth.js authentication handler (GET)
POST /api/auth/[...nextauth] - NextAuth.js authentication handler (POST)
POST /api/auth/register - Register new user account
POST /api/auth/resend-verification - Resend email verification link
POST /api/auth/reset-password - Reset user password via email
GET /api/auth/verify-email - Verify user email address

## Happiness
GET /api/happiness - Retrieve user's current happiness metrics
POST /api/happiness - Submit new happiness rating or data
GET /api/happiness/breakdown - Get detailed happiness score breakdown
GET /api/happiness/history - Retrieve historical happiness data
GET /api/happiness/trends - Get happiness trends and analytics

## Health
GET /api/health - Basic health check endpoint
GET /api/health/info - Get detailed system health information
GET /api/health/metrics - Retrieve system performance metrics
GET /api/health/ping - Simple ping endpoint for uptime monitoring

## Notes
GET /api/notes/detailed - Retrieve detailed daily notes and reflections
POST /api/notes/detailed - Submit detailed daily notes
GET /api/notes/emoji - Get emoji-based mood tracking data
POST /api/notes/emoji - Submit emoji mood entries
GET /api/notes/history - Retrieve historical notes and entries
GET /api/notes/trends - Get notes and mood trends over time

## PAHM
POST /api/pahm/click - Record PAHM matrix button clicks during practice
POST /api/pahm/complete - Mark PAHM session as completed
GET /api/pahm/session/[id] - Get specific PAHM session details
POST /api/pahm/session/[id] - Create new PAHM session with ID
PUT /api/pahm/session/[id] - Update existing PAHM session
DELETE /api/pahm/session/[id] - Delete specific PAHM session
POST /api/pahm/start - Start new PAHM practice session

## Progress
GET /api/progress/overview - Get user's overall progress summary
GET /api/progress/stages - Retrieve progress across all stages

## Session
POST /api/session/complete - Mark meditation session as completed
GET /api/session/history - Get user's session history and statistics
GET /api/session/progress - Retrieve current session progress
POST /api/session/start - Start new meditation session
PUT /api/session/update - Update ongoing session data

## Stages
GET /api/stages - Get all available stages and their requirements
POST /api/stages - Create new stage (admin function)
GET /api/stages/[id] - Get specific stage details and progress
PUT /api/stages/[id] - Update stage information
DELETE /api/stages/[id] - Delete specific stage
POST /api/stages/[id]/unlock - Unlock next stage for user

## User
POST /api/user/change-password - Change user's account password
DELETE /api/user/delete-account - Permanently delete user account
GET /api/user/personal-info - Retrieve user's personal information
PUT /api/user/personal-info - Update user's personal information
GET /api/user/preferences - Get user's app preferences and settings
PUT /api/user/preferences - Update user's preferences and settings
GET /api/user/profile - Retrieve user's profile information
PUT /api/user/profile - Update user's profile data