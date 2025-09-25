# Git Branching Strategy

## 🌳 Branch Structure

```
main (production-ready)
│
└── backend-dev (integration branch)
    │
    ├── feature/authentication-apis ✅ (merged)
    ├── feature/user-management-apis 🔄 (current)
    ├── feature/assessment-apis (planned)
    └── feature/session-apis (planned)
```

## 📋 Branch Descriptions

### **main**
- **Purpose**: Production-ready, most stable code
- **Protected**: Only receives tested, reviewed code
- **Deployment**: Production deployments come from here
- **Merges from**: `backend-dev` (after thorough testing)

### **backend-dev** 
- **Purpose**: Backend integration and testing branch
- **Function**: Staging area for backend features before production
- **Merges from**: Feature branches after completion
- **Merges to**: `main` (after full backend phase completion)

### **feature/*** branches
- **Purpose**: Individual feature development
- **Created from**: `backend-dev`
- **Merged to**: `backend-dev`
- **Naming**: `feature/[feature-name]-apis`

## 🔄 Workflow Process

### **For New Features:**
1. **Create feature branch** from `backend-dev`
   ```bash
   git checkout backend-dev
   git pull origin backend-dev
   git checkout -b feature/new-feature-apis
   ```

2. **Develop and test** the feature
3. **Push feature branch** to remote
4. **Create Pull Request** to merge into `backend-dev`
5. **Review and merge** to `backend-dev`

### **For Backend Phase Completion:**
1. **Test backend-dev** thoroughly
2. **Create Pull Request** from `backend-dev` to `main`
3. **Review and merge** to `main`
4. **Deploy** from `main`

## 🎯 Current Status

### **✅ Completed Features:**
- **feature/authentication-apis** → Merged to `backend-dev`
  - User registration with email verification
  - Password reset functionality
  - NextAuth integration
  - Complete test suite

### **🔄 In Progress:**
- **feature/user-management-apis** ← Current branch
  - User profile management
  - Personal information APIs
  - User preferences
  - Password change functionality

### **📋 Planned Features:**
- **feature/assessment-apis**
  - Questionnaire submission (27 fields)
  - Self-assessment system
  - Assessment history

- **feature/session-apis**
  - Meditation session management
  - PAHM matrix tracking
  - Progress tracking

## 🛡️ Branch Protection Rules (Recommended)

### **main branch:**
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to admins only

### **backend-dev branch:**
- Require pull request reviews
- Require status checks to pass
- Allow force pushes (for development flexibility)

## 🚀 Commands Quick Reference

```bash
# Switch to backend-dev and update
git checkout backend-dev
git pull origin backend-dev

# Create new feature branch
git checkout -b feature/new-feature-apis
git push -u origin feature/new-feature-apis

# Merge feature to backend-dev
git checkout backend-dev
git merge feature/feature-name-apis
git push origin backend-dev

# Clean up old feature branch
git branch -d feature/feature-name-apis
git push origin --delete feature/feature-name-apis
```

## 📊 Benefits of This Strategy

1. **🔒 Stability**: Main branch always production-ready
2. **🧪 Integration**: Backend-dev allows testing feature combinations
3. **🔄 Flexibility**: Easy to roll back individual features
4. **👥 Collaboration**: Clear branch purposes for team development
5. **🚀 Deployment**: Controlled, tested releases
6. **🐛 Hotfixes**: Can create emergency branches from main if needed

---

**Last Updated**: September 25, 2025  
**Current Branch**: `feature/user-management-apis`  
**Next Target**: User Management APIs (GET/PUT profile, preferences, password change)