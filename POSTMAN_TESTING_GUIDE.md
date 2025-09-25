# Authentication APIs - Postman Testing Guide

## 🚀 Server Information
- **Base URL**: `http://localhost:3000/api`
- **Server Status**: Running on port 3000

## 📋 Complete API Testing Collection

### 1. 🔐 User Registration API

**Endpoint**: `POST http://localhost:3000/api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123!",
  "confirmPassword": "TestPassword123!",
  "name": "Test User"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "data": {
    "id": "cmfza...",
    "email": "testuser@example.com", 
    "name": "Test User",
    "emailVerified": null,
    "isActive": false
  }
}
```

**What to Check**:
- ✅ Status: 201 Created
- ✅ User created with isActive: false
- ✅ Check server console for verification email log
- ✅ Copy the verification token from console log

---

### 2. 📧 Email Verification API

**Endpoint**: `GET http://localhost:3000/api/auth/verify-email`

**Query Parameters**:
```
token: [TOKEN_FROM_CONSOLE_LOG]
email: testuser@example.com
```

**Full URL Example**:
```
http://localhost:3000/api/auth/verify-email?token=be153bc4cc1c2644...&email=testuser@example.com
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully",
  "redirect": "/auth/signin?verified=true"
}
```

**What to Check**:
- ✅ Status: 200 OK
- ✅ Success message returned
- ✅ User account should now be active

---

### 3. 🔄 Password Reset Request API

**Endpoint**: `POST http://localhost:3000/api/auth/reset-password`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "testuser@example.com"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "If an account with this email exists, you will receive a password reset link."
}
```

**What to Check**:
- ✅ Status: 200 OK
- ✅ Generic success message (security feature)
- ✅ Check server console for reset email log
- ✅ Copy the reset token from console log

---

### 4. 🔒 Password Reset Completion API

**Endpoint**: `PUT http://localhost:3000/api/auth/reset-password`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "token": "[RESET_TOKEN_FROM_CONSOLE]",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**What to Check**:
- ✅ Status: 200 OK
- ✅ Password updated successfully
- ✅ Old password should no longer work

---

### 5. 🔑 NextAuth Session API (GET)

**Endpoint**: `GET http://localhost:3000/api/auth/session`

**Expected Response** (200 OK):
```json
{
  "user": null
}
```
*Note: Will be null unless you're authenticated via NextAuth*

---

### 6. 🚪 NextAuth Providers API

**Endpoint**: `GET http://localhost:3000/api/auth/providers`

**Expected Response** (200 OK):
```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "http://localhost:3000/api/auth/signin/google",
    "callbackUrl": "http://localhost:3000/api/auth/callback/google"
  },
  "credentials": {
    "id": "credentials",
    "name": "credentials",
    "type": "credentials"
  }
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Complete Registration Flow
1. **Register** → Check isActive: false
2. **Get verification token** from server console
3. **Verify email** → Check success response
4. **Verify user is now active** in database

### Test Case 2: Password Reset Flow
1. **Request reset** for existing email
2. **Get reset token** from server console  
3. **Reset password** with token
4. **Verify** old password no longer works

### Test Case 3: Error Handling
1. **Register with invalid email** → Check 400 error
2. **Register with weak password** → Check validation error
3. **Verify with invalid token** → Check 400 error
4. **Reset with invalid token** → Check 400 error

### Test Case 4: Duplicate Registration
1. **Register user once** → Success
2. **Register same email again** → Check 409 conflict

---

## 🔍 What to Look For

### Success Indicators:
- ✅ Correct HTTP status codes (201, 200, 400, 409)
- ✅ Proper JSON response structure
- ✅ Email verification URLs logged to console
- ✅ Database state changes (user activation, password updates)
- ✅ Security messages (no email disclosure in reset)

### Server Console Logs:
- 📧 Email verification URLs with tokens
- 🔄 Password reset URLs with tokens
- ⚠️ Any error messages or warnings

---

## 🛡️ Security Features to Verify

1. **Password Hashing**: Passwords stored as hashes, not plain text
2. **Token Security**: Tokens are random, expire after 24 hours
3. **Email Privacy**: Reset API doesn't reveal if email exists
4. **Input Validation**: All inputs validated with Zod schemas
5. **One-Time Tokens**: Verification tokens consumed after use

---

## 📱 Postman Collection Import

You can create a Postman collection with these endpoints. Here's the collection structure:

```
🔐 The Return of Attention - Auth APIs
├── 📝 User Registration
├── 📧 Email Verification  
├── 🔄 Password Reset Request
├── 🔒 Password Reset Complete
├── 🔑 Get Session
└── 🚪 Get Providers
```

Ready to test! Start with User Registration and work through each endpoint. Let me know what results you get! 🚀