# The Return of Attention - Development Guidelines

## 📋 Overview
This document provides comprehensive guidelines, best practices, and step-by-step instructions to ensure proper development of "The Return of Attention" meditation app. Follow this guide alongside the Project Todo List for optimal results.

**Development Approach**: Backend-First Strategy  
**Timeline**: 15 weeks  
**Quality Standards**: Production-ready, scalable, maintainable code

---

## 🎯 CORE DEVELOPMENT PRINCIPLES

### **1. Backend-First Philosophy**
- **Week 1-7**: Build complete backend with all APIs
- **Week 8-14**: Build frontend consuming tested APIs
- **Week 15**: Deploy and polish
- **Benefit**: Stable foundation, faster frontend development, fewer bugs

### **2. Quality Standards**
- **Code Quality**: TypeScript strict mode, ESLint, Prettier
- **Testing**: Test every API endpoint before frontend
- **Security**: Validate all inputs, secure authentication
- **Performance**: Optimize database queries, implement caching
- **User Experience**: Mobile-first, accessibility compliance

### **3. Documentation Requirements**
- Document all API endpoints with examples
- Comment complex business logic
- Maintain updated README
- Keep environment setup instructions current

---

## 🏗️ PHASE-BY-PHASE GUIDELINES

## **PHASE 1: PROJECT SETUP & DATABASE FOUNDATION (Week 1)**

### **Setup Checklist**
```bash
# 1. Create Next.js project
npx create-next-app@latest the-return-of-attention --typescript --tailwind --eslint --app

# 2. Navigate to project
cd the-return-of-attention

# 3. Install core dependencies
npm install prisma @prisma/client next-auth @next-auth/prisma-adapter
npm install zod bcryptjs jsonwebtoken
npm install @supabase/supabase-js zustand

# 4. Install dev dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken prisma
```

### **Environment Setup (.env.local)**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/meditation_app"
DIRECT_URL="postgresql://username:password@localhost:5432/meditation_app"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### **Project Structure**
```
src/
├── app/
│   ├── api/           # API routes
│   ├── (auth)/        # Auth pages
│   ├── dashboard/     # Main app pages
│   └── admin/         # Admin pages
├── components/        # Reusable UI components
├── lib/              # Utilities and configurations
├── types/            # TypeScript type definitions
├── hooks/            # Custom React hooks
└── store/            # Zustand store
```

### **Database Schema Validation**
- ✅ User model with all required fields
- ✅ UserProfile for personal information
- ✅ Questionnaire and QuestionnaireAnswer models
- ✅ SelfAssessment and Assessment models
- ✅ Stage and Session models
- ✅ PAHMSession and PAHMClick models
- ✅ DailyNote and AdminUser models

### **Critical Success Criteria**
- [ ] Database connects successfully
- [ ] Prisma Studio works
- [ ] Initial migration runs without errors
- [ ] Basic folder structure established

---

## **PHASE 2: CORE BACKEND APIS (Week 2-3)**

### **API Development Standards**

#### **1. API Route Structure**
```typescript
// Example: src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Business logic here
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### **2. Input Validation Requirements**
```typescript
// Create validation schemas for comprehensive questionnaire
const questionnaireSchema = z.object({
  // Personal & Background
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  mainGoals: z.array(z.string()).optional(),
  ageRange: z.string().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  educationLevel: z.string().optional(),
  
  // Meditation Background
  meditationBackground: z.string().optional(),
  sleepPattern: z.number().min(1).max(10).optional(),
  physicalActivity: z.number().min(1).max(10).optional(),
  stressTrigers: z.array(z.string()).optional(),
  dailyRoutine: z.string().optional(),
  dietPattern: z.number().min(1).max(10).optional(),
  screenTime: z.number().min(1).max(10).optional(),
  
  // Social & Lifestyle
  socialConnections: z.number().min(1).max(10).optional(),
  workLifeBalance: z.number().min(1).max(10).optional(),
  
  // Mental & Emotional (all slider 1-10)
  emotionalAwareness: z.number().min(1).max(10).optional(),
  stressResponse: z.number().min(1).max(10).optional(),
  decisionMaking: z.number().min(1).max(10).optional(),
  selfReflection: z.number().min(1).max(10).optional(),
  thoughtPatterns: z.number().min(1).max(10).optional(),
  mindfulnessInDailyLife: z.number().min(1).max(10).optional(),
  
  // Practice Details
  mindfulnessExperience: z.string().optional(),
  meditationBackgroundDetail: z.string().optional(),
  practiceGoals: z.array(z.string()).optional(),
  preferredDuration: z.number().min(1).max(10).optional(),
  biggestChallenges: z.array(z.string()).optional(),
  motivation: z.number().min(1).max(10).optional(),
});
```

#### **3. Error Handling Standards**
```typescript
// Standard error response format
const errorResponse = {
  success: false,
  error: 'Error message',
  details?: 'Additional details',
  code?: 'ERROR_CODE'
};

// Success response format
const successResponse = {
  success: true,
  data: { /* response data */ },
  message?: 'Optional success message'
};
```

### **API Testing Checklist**
For each API endpoint:
- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Test with missing fields
- [ ] Test with malformed JSON
- [ ] Test authentication/authorization
- [ ] Test database constraints
- [ ] Document response formats

### **Required API Endpoints - Week 2-3**
```
Authentication APIs:
- POST /api/auth/register
- POST /api/auth/verify-email
- POST /api/auth/reset-password

User Management APIs:
- GET /api/user/profile
- PUT /api/user/profile
- PUT /api/user/personal-info
- PUT /api/user/change-password

Assessment APIs:
- POST /api/assessment/questionnaire
- GET /api/assessment/questionnaire/status
- POST /api/assessment/self-assessment
- GET /api/assessment/history
```

---

## **PHASE 3: MEDITATION & SESSION APIS (Week 4)**

### **Session Management Guidelines**

#### **1. Session State Management**
```typescript
// Session states
enum SessionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

// Track session progress
interface SessionProgress {
  sessionId: string;
  userId: string;
  stageId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  status: SessionStatus;
  posture?: string;
  completion: number; // 0-100%
}
```

#### **2. PAHM Matrix Implementation**
```typescript
// PAHM click tracking
interface PAHMClick {
  id: string;
  sessionId: string;
  position: number; // 1-9 for 3x3 grid
  timestamp: Date;
  clickOrder: number;
}

// PAHM session validation
const validatePAHMSession = (clicks: PAHMClick[]) => {
  // Ensure all 9 positions clicked
  const positions = new Set(clicks.map(c => c.position));
  return positions.size === 9;
};
```

### **Session API Requirements**
```
Session APIs:
- POST /api/session/start
- PUT /api/session/update
- POST /api/session/complete
- GET /api/session/history

PAHM APIs:
- POST /api/pahm/start
- POST /api/pahm/click
- POST /api/pahm/complete

Stage APIs:
- GET /api/stages
- GET /api/stages/:id
- GET /api/stages/:id/unlock
```

### **Stage Unlock Logic**
```typescript
// Define stage prerequisites
const stagePrerequisites = {
  stage2: ['stage1_complete'],
  stage3: ['stage2_complete', 'pahm_intro_complete'],
  mindRecovery: ['stage1_complete', 'stage2_complete', 'pahm_intro_complete']
};

// Unlock validation function
const canUnlockStage = async (userId: string, stageId: string) => {
  const prerequisites = stagePrerequisites[stageId] || [];
  // Check if user has completed all prerequisites
  // Return boolean
};
```

---

## **PHASE 4: TRACKING & NOTES APIS (Week 5)**

### **Happiness Score Algorithm Guidelines**

#### **1. Score Components**
```typescript
interface HappinessComponents {
  questionnaire: number;    // 30% weight
  selfAssessment: number;   // 25% weight
  sessionCompletion: number; // 25% weight
  dailyNotes: number;       // 20% weight
}

const calculateHappinessScore = (components: HappinessComponents): number => {
  return (
    components.questionnaire * 0.30 +
    components.selfAssessment * 0.25 +
    components.sessionCompletion * 0.25 +
    components.dailyNotes * 0.20
  );
};
```

#### **2. Daily Notes Validation**
```typescript
const dailyNoteSchema = z.object({
  type: z.enum(['emoji', 'detailed']),
  mood: z.number().min(1).max(10),
  emotions: z.array(z.string()),
  intensity: z.number().min(1).max(10),
  notes: z.string().optional(),
  triggers: z.string().optional(),
});
```

### **Tracking APIs Requirements**
```
Daily Notes APIs:
- POST /api/notes/emoji
- POST /api/notes/detailed
- GET /api/notes/history
- GET /api/notes/trends

Happiness APIs:
- POST /api/happiness/calculate
- GET /api/happiness/history
- GET /api/happiness/breakdown
```

---

## **PHASE 5: ADMIN BACKEND APIS (Week 6)**

### **Admin Security Guidelines**

#### **1. Admin Authentication**
```typescript
// Admin role verification
const isAdmin = async (userId: string): Promise<boolean> => {
  const adminUser = await prisma.adminUser.findUnique({
    where: { userId },
  });
  return !!adminUser;
};

// Admin middleware
export const adminMiddleware = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !await isAdmin(session.user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
};
```

#### **2. Admin API Standards**
```typescript
// Always check admin permissions
export async function GET(request: NextRequest) {
  const authCheck = await adminMiddleware(request);
  if (authCheck) return authCheck;
  
  // Admin logic here
}
```

### **Admin APIs Requirements**
```
Admin User Management:
- GET /api/admin/users
- GET /api/admin/users/:id
- PUT /api/admin/users/:id
- DELETE /api/admin/users/:id

Admin System:
- GET /api/admin/stats
- GET /api/admin/analytics/users
- GET /api/admin/analytics/sessions
- GET /api/admin/system/monitor
```

---

## **PHASE 6: BACKEND TESTING & OPTIMIZATION (Week 7)**

### **Testing Guidelines**

#### **1. API Testing Checklist**
For each endpoint test:
- [ ] Happy path with valid data
- [ ] Error cases with invalid data
- [ ] Authentication/authorization
- [ ] Rate limiting
- [ ] Database constraints
- [ ] Performance under load

#### **2. Testing Tools Setup**
```bash
# Install testing dependencies
npm install -D jest @testing-library/jest-environment-jsdom
npm install -D supertest @types/supertest
```

#### **3. Example API Test**
```typescript
// __tests__/api/auth/register.test.ts
import { testApiRoute } from '@/lib/test-utils';

describe('/api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await testApiRoute('/api/auth/register', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

### **Optimization Checklist**
- [ ] Database indexes on frequently queried columns
- [ ] Query optimization for complex operations
- [ ] Caching strategies for static data
- [ ] Rate limiting implementation
- [ ] Error logging setup
- [ ] Performance monitoring

---

## **PHASE 7-11: FRONTEND DEVELOPMENT (Week 8-13)**

### **Frontend Development Standards**

#### **1. Component Structure**
```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          },
          className
        )}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);
```

#### **2. API Integration Pattern**
```typescript
// hooks/useAuth.ts
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  return { session, status, loading, register };
};
```

#### **3. Form Handling Standards**
```typescript
// Use react-hook-form with zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterData) => {
    // API call here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
};
```

### **Frontend Phase Guidelines**

#### **Phase 7 (Week 8): Foundation**
- Set up design system components
- Create authentication pages
- Test API integration patterns

#### **Phase 8 (Week 9-10): User Pages**
- Build user profile and settings
- Create assessment interfaces
- Implement form validation

#### **Phase 9 (Week 11): Main App**
- Build dashboard and progress pages
- Create meditation session interfaces
- Implement stage progression logic

#### **Phase 10 (Week 12): Tracking**
- Build daily notes interface
- Create mood tracking components
- Implement data visualization

#### **Phase 11 (Week 13): Admin**
- Build admin dashboard
- Create user management interface
- Implement admin analytics

---

## **PHASE 12-13: DEPLOYMENT & PRODUCTION (Week 14-15)**

### **Pre-Deployment Checklist**

#### **1. Code Quality**
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Code formatted with Prettier
- [ ] All tests passing
- [ ] No console.log statements in production

#### **2. Security**
- [ ] Environment variables secured
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled

#### **3. Performance**
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Unused dependencies removed
- [ ] Bundle size analyzed
- [ ] Core Web Vitals passing

### **Vercel Deployment Steps**
```bash
# 1. Connect GitHub repository to Vercel
# 2. Configure environment variables in Vercel dashboard
# 3. Set up custom domain (optional)
# 4. Configure build settings

# Build command: npm run build
# Output directory: .next
# Install command: npm install
```

### **Environment Variables for Production**
```env
# Copy all from .env.local but update URLs
DATABASE_URL="production-database-url"
NEXTAUTH_URL="https://your-domain.com"
# ... all other variables
```

---

## 🚨 CRITICAL SUCCESS FACTORS

### **1. Never Skip These Steps**
- ✅ Test every API endpoint before frontend
- ✅ Validate all user inputs
- ✅ Implement proper error handling
- ✅ Test authentication flows thoroughly
- ✅ Verify database constraints
- ✅ Test mobile responsiveness

### **2. Quality Gates**
Each phase must meet these criteria before moving to next:
- All planned features working
- No critical bugs
- Code reviewed and tested
- Documentation updated

### **3. Risk Mitigation**
- **Backend Issues**: Thorough API testing prevents frontend delays
- **Database Problems**: Schema validation prevents migration issues
- **Security Gaps**: Input validation and auth testing prevents vulnerabilities
- **Performance Issues**: Early optimization prevents user experience problems

---

## 📊 PROGRESS TRACKING

### **Weekly Checkpoints**
- **Week 1**: Database schema complete and tested
- **Week 3**: All core APIs functional
- **Week 4**: Session management working
- **Week 5**: Tracking system operational
- **Week 6**: Admin APIs complete
- **Week 7**: Backend fully tested and optimized
- **Week 8**: Frontend foundation established
- **Week 11**: Core user interface complete
- **Week 13**: Admin interface complete
- **Week 15**: Production deployment successful

### **Quality Metrics**
- Code coverage > 80%
- No TypeScript errors
- All API endpoints documented
- Mobile responsiveness 100%
- Performance score > 90

---

## 🔧 TROUBLESHOOTING GUIDE

### **Common Issues & Solutions**

#### **Database Connection Issues**
```bash
# Check connection
npx prisma db pull

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate
```

#### **NextAuth Configuration**
```typescript
// Ensure proper session configuration
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // providers here
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
};
```

#### **API Route Debugging**
```typescript
// Add detailed logging
console.log('Request:', { method: request.method, url: request.url });
console.log('Body:', await request.json());
```

### **Getting Help**
1. Check this guideline document
2. Review the tech stack guide
3. Consult the project todo list
4. Check Next.js and Prisma documentation

---

## 📚 QUICK REFERENCE

### **Essential Commands**
```bash
# Development
npm run dev              # Start development server
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Run migrations

# Database
npx prisma db push      # Push schema changes
npx prisma generate     # Regenerate client
npx prisma db seed      # Seed database

# Production
npm run build           # Build for production
npm start               # Start production server

# Testing
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
```

### **File Locations**
- Database schema: `prisma/schema.prisma`
- API routes: `src/app/api/`
- Components: `src/components/`
- Types: `src/types/`
- Utilities: `src/lib/`

### **Key URLs**
- Development: `http://localhost:3000`
- Prisma Studio: `http://localhost:5555`
- API docs: `http://localhost:3000/api/docs` (if implemented)

---

**Remember**: Follow this guide step-by-step, test thoroughly, and maintain high code quality throughout the development process. Success comes from consistent execution of these guidelines!