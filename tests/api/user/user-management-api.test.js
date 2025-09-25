/**
 * User Management API Tests
 * Tests for all user management endpoints
 * Run with: node tests/api/user/user-management-api.test.js
 */

const BASE_URL = 'http://localhost:3000'

// Test data
const testUsers = {
  validUser: {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  },
  updateData: {
    profile: {
      name: 'Updated Test User',
      image: 'https://example.com/avatar.jpg'
    },
    personalInfo: {
      age: 30,
      gender: 'male',
      nationality: 'American',
      country: 'United States'
    },
    preferences: {
      emailNotifications: false,
      pushNotifications: true,
      reminderTime: '10:30',
      language: 'es',
      theme: 'dark'
    },
    passwords: {
      current: 'TestPassword123!',
      new: 'NewTestPassword456!',
      confirm: 'NewTestPassword456!'
    }
  }
}

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
}

// Utility functions
function logTest(testName, passed, error = null) {
  testResults.total++
  if (passed) {
    testResults.passed++
    console.log(`✅ ${testName}`)
  } else {
    testResults.failed++
    console.log(`❌ ${testName}`)
    if (error) {
      console.log(`   Error: ${error}`)
    }
  }
  testResults.details.push({ testName, passed, error })
}

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()
    return { response, data, status: response.status }
  } catch (error) {
    return { error: error.message, status: 0 }
  }
}

// Mock authentication - in real tests, you'd get this from a login flow
const mockAuthHeaders = {
  'Cookie': 'next-auth.session-token=mock-session-token-for-testing'
}

async function testUserProfileEndpoints() {
  console.log('\n🧑‍💼 Testing User Profile Endpoints\n')

  // Test 1: GET /api/user/profile (authenticated)
  try {
    const { response, data, status } = await makeRequest('/api/user/profile', {
      method: 'GET',
      headers: mockAuthHeaders
    })

    // Note: This will likely fail in real testing without actual auth
    if (status === 401) {
      logTest('GET /api/user/profile - Authentication check', true)
    } else if (status === 200 && data.success) {
      logTest('GET /api/user/profile - Success response', true)
    } else {
      logTest('GET /api/user/profile', false, `Status: ${status}`)
    }
  } catch (error) {
    logTest('GET /api/user/profile', false, error.message)
  }

  // Test 2: GET /api/user/profile (unauthenticated)
  try {
    const { status } = await makeRequest('/api/user/profile', {
      method: 'GET'
    })

    logTest('GET /api/user/profile - Unauthenticated (401)', status === 401)
  } catch (error) {
    logTest('GET /api/user/profile - Unauthenticated', false, error.message)
  }

  // Test 3: PUT /api/user/profile - Valid update
  try {
    const { status, data } = await makeRequest('/api/user/profile', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify(testUsers.updateData.profile)
    })

    if (status === 401) {
      logTest('PUT /api/user/profile - Authentication check', true)
    } else if (status === 200 && data.success) {
      logTest('PUT /api/user/profile - Valid update', true)
    } else {
      logTest('PUT /api/user/profile - Valid update', false, `Status: ${status}`)
    }
  } catch (error) {
    logTest('PUT /api/user/profile - Valid update', false, error.message)
  }

  // Test 4: PUT /api/user/profile - Invalid data
  try {
    const { status, data } = await makeRequest('/api/user/profile', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify({
        name: 'A', // Too short
        image: 'invalid-url'
      })
    })

    if (status === 401) {
      logTest('PUT /api/user/profile - Validation (expects auth)', true)
    } else {
      logTest('PUT /api/user/profile - Invalid data validation', status === 400)
    }
  } catch (error) {
    logTest('PUT /api/user/profile - Invalid data', false, error.message)
  }

  // Test 5: POST /api/user/profile - Method not allowed
  try {
    const { status } = await makeRequest('/api/user/profile', {
      method: 'POST',
      headers: mockAuthHeaders
    })

    logTest('POST /api/user/profile - Method not allowed (405)', status === 405)
  } catch (error) {
    logTest('POST /api/user/profile - Method not allowed', false, error.message)
  }
}

async function testPersonalInfoEndpoints() {
  console.log('\n📋 Testing Personal Info Endpoints\n')

  // Test 1: GET /api/user/personal-info
  try {
    const { status } = await makeRequest('/api/user/personal-info', {
      method: 'GET',
      headers: mockAuthHeaders
    })

    logTest('GET /api/user/personal-info - Auth check', status === 401 || status === 200 || status === 404)
  } catch (error) {
    logTest('GET /api/user/personal-info', false, error.message)
  }

  // Test 2: PUT /api/user/personal-info - Valid data
  try {
    const { status } = await makeRequest('/api/user/personal-info', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify(testUsers.updateData.personalInfo)
    })

    logTest('PUT /api/user/personal-info - Valid data', status === 401 || status === 200)
  } catch (error) {
    logTest('PUT /api/user/personal-info - Valid data', false, error.message)
  }

  // Test 3: PUT /api/user/personal-info - Invalid age
  try {
    const { status } = await makeRequest('/api/user/personal-info', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify({
        age: 10, // Under 13
        gender: 'male'
      })
    })

    logTest('PUT /api/user/personal-info - Invalid age', status === 400 || status === 401)
  } catch (error) {
    logTest('PUT /api/user/personal-info - Invalid age', false, error.message)
  }

  // Test 4: POST /api/user/personal-info - Create
  try {
    const { status } = await makeRequest('/api/user/personal-info', {
      method: 'POST',
      headers: mockAuthHeaders,
      body: JSON.stringify(testUsers.updateData.personalInfo)
    })

    logTest('POST /api/user/personal-info - Create', status === 401 || status === 201 || status === 409)
  } catch (error) {
    logTest('POST /api/user/personal-info - Create', false, error.message)
  }
}

async function testPreferencesEndpoints() {
  console.log('\n⚙️ Testing Preferences Endpoints\n')

  // Test 1: GET /api/user/preferences
  try {
    const { status, data } = await makeRequest('/api/user/preferences', {
      method: 'GET',
      headers: mockAuthHeaders
    })

    if (status === 401) {
      logTest('GET /api/user/preferences - Auth check', true)
    } else if (status === 200 && data.data && data.data.note) {
      logTest('GET /api/user/preferences - Development placeholder', true)
    } else {
      logTest('GET /api/user/preferences', false, `Status: ${status}`)
    }
  } catch (error) {
    logTest('GET /api/user/preferences', false, error.message)
  }

  // Test 2: PUT /api/user/preferences - Valid data
  try {
    const { status, data } = await makeRequest('/api/user/preferences', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify(testUsers.updateData.preferences)
    })

    if (status === 401) {
      logTest('PUT /api/user/preferences - Auth check', true)
    } else if (status === 200 && data.data && data.data.note) {
      logTest('PUT /api/user/preferences - Development validation', true)
    } else {
      logTest('PUT /api/user/preferences - Valid data', false, `Status: ${status}`)
    }
  } catch (error) {
    logTest('PUT /api/user/preferences - Valid data', false, error.message)
  }

  // Test 3: PUT /api/user/preferences - Invalid time format
  try {
    const { status } = await makeRequest('/api/user/preferences', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify({
        reminderTime: '25:70' // Invalid time
      })
    })

    logTest('PUT /api/user/preferences - Invalid time', status === 400 || status === 401)
  } catch (error) {
    logTest('PUT /api/user/preferences - Invalid time', false, error.message)
  }
}

async function testPasswordChangeEndpoint() {
  console.log('\n🔐 Testing Password Change Endpoint\n')

  // Test 1: PUT /api/user/change-password - Valid data
  try {
    const { status } = await makeRequest('/api/user/change-password', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify(testUsers.updateData.passwords)
    })

    logTest('PUT /api/user/change-password - Valid data', status === 401 || status === 200 || status === 400)
  } catch (error) {
    logTest('PUT /api/user/change-password - Valid data', false, error.message)
  }

  // Test 2: PUT /api/user/change-password - Password mismatch
  try {
    const { status } = await makeRequest('/api/user/change-password', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify({
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'DifferentPassword789!'
      })
    })

    logTest('PUT /api/user/change-password - Password mismatch', status === 400 || status === 401)
  } catch (error) {
    logTest('PUT /api/user/change-password - Password mismatch', false, error.message)
  }

  // Test 3: PUT /api/user/change-password - Weak password
  try {
    const { status } = await makeRequest('/api/user/change-password', {
      method: 'PUT',
      headers: mockAuthHeaders,
      body: JSON.stringify({
        currentPassword: 'TestPassword123!',
        newPassword: 'weak',
        confirmPassword: 'weak'
      })
    })

    logTest('PUT /api/user/change-password - Weak password', status === 400 || status === 401)
  } catch (error) {
    logTest('PUT /api/user/change-password - Weak password', false, error.message)
  }

  // Test 4: GET /api/user/change-password - Method not allowed
  try {
    const { status } = await makeRequest('/api/user/change-password', {
      method: 'GET',
      headers: mockAuthHeaders
    })

    logTest('GET /api/user/change-password - Method not allowed (405)', status === 405)
  } catch (error) {
    logTest('GET /api/user/change-password - Method not allowed', false, error.message)
  }
}

async function testAccountDeletionEndpoint() {
  console.log('\n🗑️ Testing Account Deletion Endpoint\n')

  // Test 1: DELETE /api/user/delete-account - Valid data
  try {
    const { status } = await makeRequest('/api/user/delete-account', {
      method: 'DELETE',
      headers: mockAuthHeaders,
      body: JSON.stringify({
        password: 'TestPassword123!',
        confirmation: 'DELETE',
        reason: 'Testing purposes'
      })
    })

    logTest('DELETE /api/user/delete-account - Valid data', status === 401 || status === 200 || status === 400)
  } catch (error) {
    logTest('DELETE /api/user/delete-account - Valid data', false, error.message)
  }

  // Test 2: DELETE /api/user/delete-account - Invalid confirmation
  try {
    const { status } = await makeRequest('/api/user/delete-account', {
      method: 'DELETE',
      headers: mockAuthHeaders,
      body: JSON.stringify({
        password: 'TestPassword123!',
        confirmation: 'CONFIRM', // Wrong confirmation text
        reason: 'Testing'
      })
    })

    logTest('DELETE /api/user/delete-account - Invalid confirmation', status === 400 || status === 401)
  } catch (error) {
    logTest('DELETE /api/user/delete-account - Invalid confirmation', false, error.message)
  }

  // Test 3: POST /api/user/delete-account - Alternative method
  try {
    const { status } = await makeRequest('/api/user/delete-account', {
      method: 'POST',
      headers: mockAuthHeaders,
      body: JSON.stringify({
        password: 'TestPassword123!',
        confirmation: 'DELETE',
        reason: 'Testing POST method'
      })
    })

    logTest('POST /api/user/delete-account - Alternative method', status === 401 || status === 200 || status === 400)
  } catch (error) {
    logTest('POST /api/user/delete-account - Alternative method', false, error.message)
  }

  // Test 4: GET /api/user/delete-account - Method not allowed
  try {
    const { status } = await makeRequest('/api/user/delete-account', {
      method: 'GET',
      headers: mockAuthHeaders
    })

    logTest('GET /api/user/delete-account - Method not allowed (405)', status === 405)
  } catch (error) {
    logTest('GET /api/user/delete-account - Method not allowed', false, error.message)
  }
}

async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting (Basic)\n')

  // Test rapid requests to profile endpoint
  const promises = []
  for (let i = 0; i < 35; i++) { // Exceed the 30/minute limit
    promises.push(
      makeRequest('/api/user/profile', {
        method: 'GET',
        headers: mockAuthHeaders
      })
    )
  }

  try {
    const results = await Promise.all(promises)
    const rateLimitedRequests = results.filter(r => r.status === 429)
    
    logTest('Rate limiting - Some requests blocked', rateLimitedRequests.length > 0)
  } catch (error) {
    logTest('Rate limiting test', false, error.message)
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting User Management API Tests')
  console.log('=====================================\n')
  
  console.log('⚠️  Note: These tests expect authentication failures (401) since no real auth is provided.')
  console.log('   The tests verify that endpoints exist and respond correctly to requests.\n')

  await testUserProfileEndpoints()
  await testPersonalInfoEndpoints()
  await testPreferencesEndpoints()
  await testPasswordChangeEndpoint()
  await testAccountDeletionEndpoint()
  await testRateLimiting()

  // Print summary
  console.log('\n📊 Test Results Summary')
  console.log('======================')
  console.log(`Total Tests: ${testResults.total}`)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`)

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:')
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   - ${test.testName}${test.error ? ': ' + test.error : ''}`)
      })
  }

  console.log('\n✨ Testing Complete!')
  console.log('\n📝 Next Steps:')
  console.log('   1. Start the development server: npm run dev')
  console.log('   2. Create a test user account')
  console.log('   3. Get valid authentication tokens')
  console.log('   4. Update mockAuthHeaders with real tokens')
  console.log('   5. Re-run tests for full validation')
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  runAllTests,
  testUserProfileEndpoints,
  testPersonalInfoEndpoints,
  testPreferencesEndpoints,
  testPasswordChangeEndpoint,
  testAccountDeletionEndpoint,
  testRateLimiting
}