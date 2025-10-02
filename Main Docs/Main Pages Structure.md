# The Return of Attention - Main Pages Structure

## Overview
This document outlines all the main pages that need to be created for "The Return of Attention" meditation web application based on the project documentation and user flow analysis. Updated based on review notes and feedback.

---

## 🔐 AUTHENTICATION & ONBOARDING PAGES

### 1. **Landing/Welcome Page**
- App introduction and value proposition
- "Get Started","Learn More" and "Sign In" buttons
- Feature highlights and testimonials
- Privacy policy and terms of service links

### 2. **Sign Up Page**
- Manual registration form (email, password, first name, last name)
- Google OAuth sign-up option
- Form validation and error handling
- Link to existing user sign-in

### 3. **Sign In Page**
- Manual login form (email, password)
- Google OAuth sign-in option
- "Forgot Password" link
- "Remember me" option
- Link to registration for new users

### 4. **Email Verification Page**
- Email verification notice
- Resend verification email option
- Instructions for checking spam folder
- Support contact information

### 5. **Forgot Password Page**
- Email input for password reset
- Success confirmation message
- Instructions for checking email
- Back to sign-in link

### 6. **Password Reset Page**
- New password input form
- Password strength requirements
- Confirm password field
- Success confirmation and redirect to sign-in

### 7. **Personal Information Page**
- Age input
- Gender selection
- Nationality dropdown
- Current country selection
- Account creation timestamp display

---

## 📋 ASSESSMENT PAGES

### 8. **Initial Questionnaire Page (Multi-step)**
**Step 1: Personal Background**
- Experience level selection
- Goals definition
- Age range confirmation
- Location details

**Step 2: Lifestyle Section**
- Occupation and education level
- Meditation background
- Sleep pattern assessment
- Physical activity level

**Step 3: Daily Life Patterns**
- Stress triggers identification
- Daily routine description
- Diet pattern assessment
- Screen time evaluation

**Step 4: Social & Work**
- Social connections assessment
- Work-life balance evaluation

**Step 5: Mental & Emotional**
- Emotional awareness self-rating
- Stress response patterns
- Decision making style
- Self-reflection habits

**Step 6: Mindfulness & Meditation**
- Thought patterns analysis
- Mindfulness in daily life
- Previous mindfulness experience
- Meditation background details
- Practice goals setting
- Preferred session duration
- Biggest challenges identification
- Motivation assessment

**NOTE: there should be a page to say that succesfully completed Questioner**

### 9. **Questionnaire Completion Success Page**
- Success message and congratulations
- Summary of completion
- Next steps information
- "Continue to Self-Assessment" button

### 10. **Self-Assessment Page**
- **Food Taste Assessment** (3-choice: none/some/strong)
- **Scents & Aromas Assessment** (3-choice: none/some/strong)
- **Sounds & Music Assessment** (3-choice: none/some/strong)
- **Visual & Beauty Assessment** (3-choice: none/some/strong)
- **Touch & Textures Assessment** (3-choice: none/some/strong)
- **Thoughts & Mental Images Assessment** (3-choice: none/some/strong)
- Progress indicator
- Save and continue functionality
- *Note: Assessment type (initial/mid/final) is determined by the system*
- *Scoring: "none" (+12), "some" (-7), "strong" (-15) per category*

### 9. **Self Assesment Completion Success Page**
- Success message and congratulations
- Summary of completion
- Happiness Score
- Start Practicing Button

---

## 🏠 MAIN APPLICATION PAGES

### 11. **Main Dashboard**
- Welcome message with user name
- Current happiness score display
- **Assessment status overview component** (from removed Assessment Status Check Page)
  - Progress overview of required assessments
  - Questionnaire completion status
  - Self-assessment completion status
  - Stage completion status
  - "Continue" buttons for incomplete assessments
- **Stages overview component** (integrated from Stages Overview Page)
  - All meditation stages displayed as cards
  - Lock/unlock status indicators
  - Stage descriptions and benefits
  - Progress bars for each stage
  - Prerequisites information
  - "Start" buttons for available stages
- Recent Learning Resources
- Streak counter

### 12. **Progress Overview Page**
- Detailed happiness score
- Session completion statistics
- Stage progression timeline
- Streak and consistency metrics
- Self Assessment comparison 
- Personal achievements and milestones
- Monthly/weekly summaries

### 13. **Mind Recovery Page**
- *Available only when user completed stage 1*
- All Exercises displayed as cards
- Auto-recommend exercise according to the time
- Exercise descriptions and benefits
- "Start" buttons for available exercises

### 14. **Individual Stage Page**
- Stage title and description
- Learning objectives
- Available sessions and Reading resources list
- Session duration and difficulty
- Prerequisites check
- Progress tracking within stage
- "Continue" or "Start" buttons

---

## 🧘‍♀️ MEDITATION SESSION PAGES

### 15. **Session Preparation Page**
- Session title and description
- Estimated duration
- Session type explanation
- Environment setup tips
- "Configure Session" button

### 16. **Session Configuration Menu Page**
- **Posture Selection**: Visual guides with instructions
  - Sitting position (recommended)
  - Lying position (alternative)
  - Walking position (advanced)
  - Custom position (user-defined)
- **Duration Slider**: Adjust session length (meditation sessions only)
  - Stage 1: 10+ minutes minimum (adjustable)
  - Stages 2-6: 30+ minutes minimum (adjustable)
  - Mind Recovery: Fixed durations (NO slider - fixed duration only):
    - Morning Recharge: 5 minutes
    - Mid-Day Reset: 3 minutes
    - Emotional Reset: 5 minutes
    - Work-Home Transition: 5 minutes
    - Bedtime Wind Down: 8 minutes
- **Audio Options**: Customize session audio
  - Enable/disable guided voice-over
  - Enable/disable bell rings (session start/end/intervals)
  - Volume control slider (0-100%)
- **Session Confirmation**: Review settings and start session
- "Begin Session" button

### 17. **Session Interface Pages**

**A. Stage 1 - Physical Stillness Session**
- Audio player controls
- Session timer
- Emergency stop option

**D. Stage 2 Onwards and Mind Recovery - PAHM Matrix Sessions**
- Interactive button matrix grid
- Click tracking interface
- Session timer
- Emergency stop option

### 18. **Session Completion Page**
- Session summary (duration, type, completion, PAHM Matrix summary for PAHM matrix sessions)
- Immediate feedback form
- "How do you feel?" rating with emojis
- "Insights" input
- Save and continue option

---

## 📝 TRACKING & REFLECTION PAGES

### 19. **Daily Notes Page**
- Quick emoji mood selection
- Detailed notes option with:
  - "What's happening?" text area
  - Emotion category selection
  - Intensity level slider (1-10)
  - "What triggered this?" field
- Historical notes view
- Mood trend visualization


---

## 👤 USER PROFILE & ACCOUNT PAGES

### 20. **User Profile & Account Settings Page**
- Personal information display and editing
- Profile picture upload
- Account preferences
- **Account Settings Integration:**
  - Password change
  - Email preferences
  - Notification settings
  - Language selection
  - Time zone settings
  - Account deletion option
- Privacy settings
- Data export options

---

## 🔧 ADMIN PAGES

### 21. **Admin Login Page**
- Admin-specific authentication
- Enhanced security measures
- Admin role verification
- Separate login interface from users

### 22. **Admin Dashboard**
- System overview widgets
- User statistics summary
- Recent activity feed
- System health indicators
- Quick action buttons
- Alert notifications

### 23. **User Management Page**
- User list with search and filters
- Individual user statistics view
- User profile editing interface
- Admin privilege management
- User deletion with confirmation
- Bulk user operations

### 24. **System Monitoring Page**
- Database usage statistics
- System performance metrics
- Error logs and monitoring
- Database health indicators
- API response time tracking
- Alert threshold configuration

### 25. **Session Management Page**
- Session unlock tools
- Admin test mode interface
- Session analytics dashboard
- Session flow validation tools
- Speed timer configuration for testing
- Session completion overrides

### 26. **Analytics & Reports Page**
- User engagement analytics
- Session completion statistics
- Happiness score trends (aggregated)
- App usage patterns

---

## 🎯 UTILITY & SUPPORT PAGES

### 27. **Help & Support Page**
- FAQ section
- Contact support form
- Tutorial videos
- User guides
- Troubleshooting tips
- Community forum links

### 28. **Privacy Policy Page**
- Data collection practices
- Data usage explanation
- User rights and controls
- Contact information for privacy concerns
- GDPR compliance information

### 29. **Terms of Service Page**
- App usage terms
- User responsibilities
- Service limitations
- Account termination policies
- Legal disclaimers

### 30. **About Page**
- App mission and vision
- Team information
- App development story
- Contact information
- Social media links

### 31. **Loading/Splash Screen**
- App branding
- Loading animations
- Progress indicators
- Inspirational quotes

### 32. **Error Pages**
- 404 Not Found page
- 500 Server Error page
- Network connection error page
- Session expired page
- Maintenance mode page

---

## 📱 RESPONSIVE DESIGN CONSIDERATIONS

All pages should be designed with:
- **Mobile-first approach** for optimal meditation experience
- **Touch-friendly interfaces** for session interactions
- **Accessibility features** for inclusive design
- **Offline capability** for core meditation features
- **Progressive web app** features for app-like experience

## 🔄 NAVIGATION STRUCTURE

### Main Navigation (Authenticated Users):
- Dashboard
- Mind Recovery *(available only when user completed stage 1 and stage 2 PAHM matrix intro learn)*
- Progress
- Daily Notes
- Profile & Settings

### Admin Navigation:
- Admin Dashboard
- Users
- Sessions
- System
- Analytics

## 📊 TOTAL PAGE COUNT

**Total Pages: 32** (reduced from 38 by consolidating and removing redundant pages)

### Page Categories:
- **Authentication & Onboarding:** 7 pages
- **Assessment:** 3 pages (including questionnaire completion)
- **Main Application:** 4 pages (with integrated components)
- **Meditation Sessions:** 4 pages
- **Tracking & Reflection:** 1 page
- **User Profile & Account:** 1 page (consolidated)
- **Admin:** 6 pages
- **Utility & Support:** 6 pages

This streamlined page structure ensures a complete user experience from onboarding through advanced meditation practice, with robust admin capabilities for system management, while eliminating redundancy and improving user flow.