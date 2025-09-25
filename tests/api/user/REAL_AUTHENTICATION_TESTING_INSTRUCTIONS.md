# User Management APIs - Real Authentication Testing Instructions

## 🔧 Server Setup & Troubleshooting

### Current Issue: PostCSS/Tailwind CSS Build Error
The development server is encountering a PostCSS configuration issue. Here's how to resolve it:

## 🚀 Step-by-Step Testing Instructions

### 1. Restart the Development Server
```bash
# Stop the current server (Ctrl+C)
# Clear the build cache
rm -rf .next   # or Remove-Item -Recurse -Force .next on Windows

# Start the server again
npm run dev
```

### 2. Verify API Endpoints Work
Once the server is running properly, test basic connectivity:

```bash
# Test registration endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testapi@example.com","password":"TestAPI123!","confirmPassword":"TestAPI123!","name":"API Test User"}'

# Expected response: 201 Created with success message
```

### 3. Sign In and Get Authentication Token

#### Option A: Browser Sign-In (Recommended)
1. Open browser: `http://localhost:3000/api/auth/signin`
2. Sign in with credentials:
   - Email: `testapi@example.com`
   - Password: `TestAPI123!`
3. Open Developer Tools (F12)
4. Go to Application/Storage → Cookies
5. Copy the `next-auth.session-token` value

#### Option B: Direct API Sign-In (Alternative)
```bash
# This is more complex due to CSRF tokens - browser method is easier
```

### 4. Test User Management APIs with Real Token

Replace `YOUR_SESSION_TOKEN` with the actual token from step 3:

```bash
# Test 1: Get User Profile
curl -X GET http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Expected: 200 OK with complete profile data

# Test 2: Update Profile
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"name":"Updated Test User","image":"https://example.com/avatar.jpg"}'

# Expected: 200 OK with updated profile

# Test 3: Get Personal Info
curl -X GET http://localhost:3000/api/user/personal-info \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Expected: 404 Not Found (for new user) or 200 OK (if exists)

# Test 4: Create Personal Info
curl -X POST http://localhost:3000/api/user/personal-info \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"age":30,"gender":"prefer_not_to_say","nationality":"Test Nation","country":"Test Country"}'

# Expected: 201 Created with personal info

# Test 5: Get Preferences
curl -X GET http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Expected: 200 OK with default preferences

# Test 6: Update Preferences
curl -X PUT http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"emailNotifications":false,"theme":"dark","language":"es"}'

# Expected: 200 OK with validation success

# Test 7: Change Password
curl -X PUT http://localhost:3000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"currentPassword":"TestAPI123!","newPassword":"NewTestAPI456!","confirmPassword":"NewTestAPI456!"}'

# Expected: 200 OK with password changed message
```

### 5. Automated Testing with Real Token

Use our automated test script:

```bash
# Run with real session token
node tests/api/user/real-auth-test.js "YOUR_SESSION_TOKEN"
```

### 6. Expected Test Results

With a valid session token, you should see:

```
✅ GET /api/user/profile - Profile retrieved successfully
✅ PUT /api/user/profile - Profile updated successfully  
✅ GET /api/user/personal-info - Personal info retrieved/not found
✅ POST /api/user/personal-info - Personal info created
✅ GET /api/user/preferences - Preferences retrieved (placeholder)
✅ PUT /api/user/preferences - Development validation
```

## 🛡️ Security Features to Verify

### Rate Limiting
Try making multiple rapid requests to see rate limiting in action:

```bash
# This should trigger rate limiting after ~30 requests
for i in {1..35}; do
  curl -X GET http://localhost:3000/api/user/profile \
    -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
done
```

### Authentication Validation
Test without authentication token:

```bash
# Should return 401 Unauthorized
curl -X GET http://localhost:3000/api/user/profile
```

### Input Validation
Test with invalid data:

```bash
# Should return 400 Bad Request with validation errors
curl -X PUT http://localhost:3000/api/user/personal-info \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"age":10,"gender":"invalid"}'  # Age too low, invalid gender
```

## 🔍 Troubleshooting

### If APIs Return 500 Internal Server Error:
1. Check the server console for error messages
2. Verify database connection is working
3. Ensure all environment variables are set correctly
4. Check that Prisma client is generated: `npm run db:generate`

### If APIs Return 401 Unauthorized:
1. Verify the session token is correct and not expired
2. Make sure the user exists and is active
3. Check that the token format in the Cookie header is correct

### If Database Errors Occur:
1. Verify database is running and accessible
2. Run migrations: `npm run db:migrate`
3. Check database schema is up to date

## 📊 Expected API Performance

- **Profile GET**: < 100ms response time
- **Profile UPDATE**: < 200ms response time  
- **Personal Info CRUD**: < 150ms response time
- **Password Change**: < 300ms response time (due to hashing)
- **Account Deletion**: < 500ms response time (due to cascading deletes)

## ✅ Success Criteria

After testing, you should have:

1. ✅ Successfully registered and authenticated a test user
2. ✅ Retrieved complete user profile with statistics
3. ✅ Updated user profile information
4. ✅ Created and retrieved personal information
5. ✅ Tested preferences validation
6. ✅ Verified rate limiting works
7. ✅ Confirmed authentication is required for all endpoints
8. ✅ Validated input validation catches bad data

## 🎯 Next Steps After Successful Testing

1. **Document any issues found** and create fixes
2. **Optimize performance** if any endpoints are slow
3. **Enhance error messages** based on testing feedback
4. **Add integration tests** with the validated authentication flow
5. **Proceed to Assessment APIs** implementation

---

**Need Help?** If you encounter any issues during testing, the APIs are designed with comprehensive error handling and logging to help identify problems quickly.