# Testing Directory Structure

## 📁 Directory Organization

```
tests/
├── api/                          # API endpoint tests
│   ├── connectivity.test.js      # Server connectivity testing
│   ├── run-tests.js              # Main test runner for API tests
│   └── auth/                     # Authentication API tests
│       ├── auth-api.test.js      # Core authentication endpoint tests
│       ├── email-verification-flow.test.mjs  # End-to-end email verification
│       └── postman-helper.test.js  # Postman testing utilities
└── README.md                     # This file
```

## 🧪 Test Files Description

### **Core API Tests**

#### `connectivity.test.js`
- **Purpose**: Quick connectivity check for server and basic endpoints
- **Usage**: `node tests/api/connectivity.test.js`
- **Tests**: NextAuth providers, session endpoints
- **Output**: Server status and available providers

#### `run-tests.js`
- **Purpose**: Main test runner that executes all API tests in sequence
- **Usage**: `node tests/api/run-tests.js`
- **Features**: 
  - Comprehensive test suite execution
  - Detailed result summary
  - Error handling and reporting

### **Authentication Tests**

#### `auth/auth-api.test.js`
- **Purpose**: Comprehensive testing of all authentication endpoints
- **Usage**: `node tests/api/auth/auth-api.test.js`
- **Tests**:
  - User registration with validation
  - Email verification (with dummy tokens)
  - Password reset request
  - Password reset completion
  - NextAuth integration
- **Features**: Individual test functions exported for reuse

#### `auth/email-verification-flow.test.mjs`
- **Purpose**: End-to-end email verification testing using real database tokens
- **Usage**: `node tests/api/auth/email-verification-flow.test.mjs`
- **Tests**:
  - Complete registration → verification → activation flow
  - Database token generation and consumption
  - User status changes
  - Password reset integration
- **Requirements**: Database access (uses Prisma)

#### `auth/postman-helper.test.js`
- **Purpose**: Utilities and examples for Postman testing
- **Usage**: `node tests/api/auth/postman-helper.test.js`
- **Features**:
  - Test data generation
  - Postman request examples
  - Quick registration testing for Postman setup

## 🚀 How to Run Tests

### **Quick Start**
```bash
# Run all API tests
node tests/api/run-tests.js

# Test connectivity only
node tests/api/connectivity.test.js

# Test all authentication endpoints
node tests/api/auth/auth-api.test.js

# Complete end-to-end verification flow
node tests/api/auth/email-verification-flow.test.mjs

# Generate Postman examples
node tests/api/auth/postman-helper.test.js
```

### **Prerequisites**
1. **Development server running**: `npm run dev`
2. **Database accessible**: Ensure Prisma connection works
3. **Environment variables**: `.env.local` properly configured

## 📊 Test Types

### **Unit Tests**
- Individual endpoint testing
- Input validation testing
- Error handling verification

### **Integration Tests**
- End-to-end flows
- Database integration
- Email service integration

### **Manual Testing Support**
- Postman collection helpers
- Test data generation
- Documentation and examples

## 🔍 Test Results Interpretation

### **Success Indicators**
- ✅ HTTP 201 for successful registration
- ✅ HTTP 200 for successful operations
- ✅ HTTP 400 for validation errors (expected)
- ✅ Proper JSON response structure
- ✅ Database state changes

### **Expected "Failures"**
- 🟡 Email verification with dummy tokens → 400 (confirms validation)
- 🟡 Password reset with invalid tokens → 400 (confirms security)
- 🟡 Registration with invalid data → 400 (confirms input validation)

## 🛡️ Security Testing

Tests verify:
- Password hashing (no plain text storage)
- Token validation and expiration
- Input sanitization and validation
- Email privacy in reset requests
- One-time token consumption

## 📝 Adding New Tests

### **For New Endpoints**
1. Create test file in appropriate directory
2. Follow existing naming convention: `*.test.js` or `*.test.mjs`
3. Export test functions for reuse
4. Add to main test runner if needed

### **Test File Template**
```javascript
/**
 * [Test Description]
 */

const API_BASE = 'http://localhost:3000/api'

async function testNewEndpoint() {
  console.log('Testing new endpoint...')
  // Test implementation
}

module.exports = { testNewEndpoint }

if (require.main === module) {
  testNewEndpoint().catch(console.error)
}
```

## 🔗 Related Files

- `POSTMAN_TESTING_GUIDE.md` - Comprehensive Postman testing guide
- `src/app/api/auth/` - Authentication API implementations
- `src/lib/auth.ts` - Authentication utilities
- `src/lib/email.ts` - Email service integration

## 💡 Best Practices

1. **Always test connectivity first** before running complex tests
2. **Use unique test data** (timestamps, random IDs) to avoid conflicts
3. **Test both success and failure scenarios**
4. **Verify database state changes** for integration tests
5. **Clean up test data** when possible
6. **Document expected behaviors** including "expected failures"

---

**Last Updated**: September 25, 2025  
**Test Coverage**: Authentication APIs (100% endpoints covered)  
**Next**: User Management API tests (to be added)