# User Management APIs Testing Guide

This guide provides comprehensive testing instructions for all User Management API endpoints.

## Prerequisites

1. Ensure the development server is running: `npm run dev`
2. Have a valid user account with authentication tokens
3. Use tools like Postman, Thunder Client, or curl for testing
4. Replace `{BASE_URL}` with your actual base URL (e.g., `http://localhost:3000`)

## Authentication Setup

All User Management APIs require authentication. Include the session cookie or Authorization header:

### Option 1: Session Cookie
```
Cookie: next-auth.session-token=your-session-token
```

### Option 2: NextAuth Headers
```
next-auth.session-token: your-session-token
```

---

## 1. GET /api/user/profile

### Description
Retrieve current user's complete profile information including personal data, assessment status, and statistics.

### Request
```http
GET {BASE_URL}/api/user/profile
Content-Type: application/json
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "image": "https://example.com/avatar.jpg",
      "emailVerified": "2024-01-01T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "profileCompletion": 85
    },
    "personalInfo": {
      "age": 30,
      "gender": "male",
      "nationality": "American",
      "country": "United States",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "assessmentStatus": {
      "questionnaireCompleted": true,
      "questionnaireCompletedAt": "2024-01-01T00:00:00.000Z",
      "selfAssessments": [],
      "totalSelfAssessments": 0
    },
    "statistics": {
      "totalSessions": 15,
      "totalNotes": 8,
      "totalHappinessScores": 3
    }
  }
}
```

### Test Cases
- ✅ Valid authenticated user
- ❌ Unauthenticated user (401)
- ❌ Inactive user account (403)
- ❌ Rate limit exceeded (429)

---

## 2. PUT /api/user/profile

### Description
Update current user's basic profile information (name and image).

### Request
```http
PUT {BASE_URL}/api/user/profile
Content-Type: application/json

{
  "name": "John Updated Doe",
  "image": "https://example.com/new-avatar.jpg"
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Updated Doe",
      "image": "https://example.com/new-avatar.jpg",
      "emailVerified": "2024-01-01T00:00:00.000Z",
      "isActive": true,
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Test Cases
- ✅ Valid profile update (name only)
- ✅ Valid profile update (image only)
- ✅ Valid profile update (both fields)
- ✅ Partial update (empty object)
- ❌ Invalid name (too short: 400)
- ❌ Invalid image URL (400)
- ❌ Unauthenticated user (401)
- ❌ Rate limit exceeded (429)

---

## 3. GET /api/user/personal-info

### Description
Retrieve current user's personal information.

### Request
```http
GET {BASE_URL}/api/user/personal-info
Content-Type: application/json
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Personal information retrieved successfully",
  "data": {
    "personalInfo": {
      "age": 30,
      "gender": "male",
      "nationality": "American",
      "country": "United States",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "name": "John Doe",
        "email": "user@example.com",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

### Test Cases
- ✅ Valid authenticated user with personal info
- ❌ User without personal info (404)
- ❌ Unauthenticated user (401)

---

## 4. PUT /api/user/personal-info

### Description
Update current user's personal information.

### Request
```http
PUT {BASE_URL}/api/user/personal-info
Content-Type: application/json

{
  "age": 31,
  "gender": "male",
  "nationality": "Canadian",
  "country": "Canada"
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Personal information updated successfully",
  "data": {
    "personalInfo": {
      "age": 31,
      "gender": "male",
      "nationality": "Canadian",
      "country": "Canada",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Test Cases
- ✅ Valid full personal info update
- ✅ Partial update (single field)
- ✅ Create new personal info (upsert)
- ❌ Invalid age (under 13: 400)
- ❌ Invalid age (over 120: 400)
- ❌ Invalid gender value (400)
- ❌ Unauthenticated user (401)

---

## 5. POST /api/user/personal-info

### Description
Create initial personal information for user.

### Request
```http
POST {BASE_URL}/api/user/personal-info
Content-Type: application/json

{
  "age": 25,
  "gender": "female",
  "nationality": "British",
  "country": "United Kingdom"
}
```

### Expected Response (201 Created)
```json
{
  "success": true,
  "message": "Personal information created successfully",
  "data": {
    "personalInfo": {
      "age": 25,
      "gender": "female",
      "nationality": "British",
      "country": "United Kingdom",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Test Cases
- ✅ Valid personal info creation
- ❌ Personal info already exists (409)
- ❌ Invalid data validation (400)
- ❌ Unauthenticated user (401)

---

## 6. GET /api/user/preferences

### Description
Retrieve current user's preferences (placeholder implementation).

### Request
```http
GET {BASE_URL}/api/user/preferences
Content-Type: application/json
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "User preferences retrieved successfully",
  "data": {
    "preferences": {
      "emailNotifications": true,
      "pushNotifications": true,
      "reminderTime": "09:00",
      "timeZone": "UTC",
      "language": "en",
      "theme": "system"
    },
    "note": "Preferences system is in development. Default preferences returned."
  }
}
```

### Test Cases
- ✅ Valid authenticated user
- ❌ Unauthenticated user (401)

---

## 7. PUT /api/user/preferences

### Description
Update current user's preferences (validation only - not persisted yet).

### Request
```http
PUT {BASE_URL}/api/user/preferences
Content-Type: application/json

{
  "emailNotifications": false,
  "pushNotifications": true,
  "reminderTime": "10:30",
  "language": "es",
  "theme": "dark"
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "User preferences validated successfully",
  "data": {
    "preferences": {
      "emailNotifications": false,
      "pushNotifications": true,
      "reminderTime": "10:30",
      "language": "es",
      "theme": "dark"
    },
    "note": "Preferences system is in development. Validation successful but data not persisted yet."
  }
}
```

### Test Cases
- ✅ Valid preferences update
- ❌ Invalid time format (400)
- ❌ Invalid theme value (400)
- ❌ Unauthenticated user (401)

---

## 8. PUT /api/user/change-password

### Description
Change current user's password.

### Request
```http
PUT {BASE_URL}/api/user/change-password
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "message": "Password changed successfully",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Test Cases
- ✅ Valid password change
- ❌ Incorrect current password (400)
- ❌ New password same as current (400)
- ❌ Password confirmation mismatch (400)
- ❌ Weak new password (400)
- ❌ OAuth-only account (400)
- ❌ Unauthenticated user (401)
- ❌ Rate limit exceeded (429)

---

## 9. DELETE /api/user/delete-account

### Description
Delete current user's account and all associated data.

### Request
```http
DELETE {BASE_URL}/api/user/delete-account
Content-Type: application/json

{
  "password": "UserPassword123!",
  "confirmation": "DELETE",
  "reason": "No longer need the service"
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Account and all associated data have been permanently deleted",
  "data": {
    "message": "Account deleted successfully",
    "deletedAt": "2024-01-01T12:00:00.000Z",
    "dataRemoved": {
      "sessions": 15,
      "notes": 8,
      "assessments": 3
    }
  }
}
```

### Test Cases
- ✅ Valid account deletion
- ❌ Incorrect password (400)
- ❌ Invalid confirmation text (400)
- ❌ Unauthenticated user (401)
- ❌ Rate limit exceeded (429)

---

## Error Response Format

All APIs follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "errors": [
      {
        "field": "fieldName",
        "message": "Field-specific error message"
      }
    ]
  }
}
```

## Common Error Codes

- `UNAUTHORIZED` (401): User not authenticated
- `FORBIDDEN` (403): User account inactive
- `VALIDATION_ERROR` (400): Request validation failed
- `USER_NOT_FOUND` (404): User doesn't exist
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `METHOD_NOT_ALLOWED` (405): HTTP method not supported
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

Each endpoint has different rate limits:
- Profile GET: 30 requests/minute
- Profile UPDATE: 10 requests/minute
- Personal Info: 10-30 requests/minute
- Password Change: 3 requests/5 minutes
- Account Deletion: 2 requests/hour

## Testing Checklist

For comprehensive testing, verify:

1. **Authentication**: All endpoints require auth
2. **Validation**: Invalid data returns proper errors
3. **Rate Limiting**: Exceeding limits returns 429
4. **Data Persistence**: Updates are properly saved
5. **Error Handling**: Graceful error responses
6. **Security**: Sensitive data is properly protected
7. **Transaction Integrity**: Account deletion removes all data

## Next Steps

After testing these APIs:
1. Test integration with frontend components
2. Verify email notifications work properly
3. Test OAuth user scenarios
4. Implement preferences database table
5. Add audit logging for sensitive operations