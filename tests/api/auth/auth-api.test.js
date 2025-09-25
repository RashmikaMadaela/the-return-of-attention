/**
 * Authentication API Tests
 * Comprehensive test suite for all authentication endpoints
 */

const API_BASE = 'http://localhost:3000/api'

async function testRegistration() {
  console.log('\n=== Testing User Registration ===')
  
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    name: 'Test User'
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    })

    const data = await response.json()
    console.log('Registration Response:', data)
    console.log('Status:', response.status)

    return { success: data.success, status: response.status, user: testUser }
  } catch (error) {
    console.error('Registration Error:', error)
    return { success: false, error: error.message }
  }
}

async function testEmailVerification(email, token = 'dummy-token-for-testing') {
  console.log('\n=== Testing Email Verification ===')
  
  try {
    const response = await fetch(`${API_BASE}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
    const data = await response.json()
    
    console.log('Verification Response:', data)
    console.log('Status:', response.status)

    return { success: data.success, status: response.status }
  } catch (error) {
    console.error('Verification Error:', error)
    return { success: false, error: error.message }
  }
}

async function testPasswordReset(email) {
  console.log('\n=== Testing Password Reset Request ===')
  
  try {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    const data = await response.json()
    console.log('Reset Request Response:', data)
    console.log('Status:', response.status)

    return { success: data.success, status: response.status }
  } catch (error) {
    console.error('Reset Request Error:', error)
    return { success: false, error: error.message }
  }
}

async function testPasswordResetComplete(token, newPassword = 'NewPassword123!') {
  console.log('\n=== Testing Password Reset Complete ===')
  
  try {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        newPassword,
        confirmPassword: newPassword
      })
    })

    let data
    try {
      data = await response.json()
    } catch (parseError) {
      // Handle empty response or invalid JSON
      data = { message: 'No response body or invalid JSON' }
    }
    
    console.log('Reset Complete Response:', data)
    console.log('Status:', response.status)

    return { success: data.success, status: response.status }
  } catch (error) {
    console.error('Reset Complete Error:', error)
    return { success: false, error: error.message }
  }
}

async function testNextAuthEndpoints() {
  console.log('\n=== Testing NextAuth Endpoints ===')
  
  try {
    // Test providers endpoint
    const providersResponse = await fetch(`${API_BASE}/auth/providers`)
    const providers = await providersResponse.json()
    console.log('Providers:', Object.keys(providers))
    
    // Test session endpoint
    const sessionResponse = await fetch(`${API_BASE}/auth/session`)
    const session = await sessionResponse.json()
    console.log('Session:', session)
    
    return { 
      success: true, 
      providers: Object.keys(providers),
      session: session
    }
  } catch (error) {
    console.error('NextAuth Endpoints Error:', error)
    return { success: false, error: error.message }
  }
}

async function runAllTests() {
  console.log('🧪 Starting Comprehensive Authentication API Tests...')
  console.log('Make sure the development server is running on localhost:3000\n')
  
  const results = {}

  // Test NextAuth endpoints first
  results.nextAuth = await testNextAuthEndpoints()
  await new Promise(resolve => setTimeout(resolve, 500))

  // Test registration
  results.registration = await testRegistration()
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Test email verification (will fail with dummy token, but endpoint should respond)
  if (results.registration.success) {
    results.verification = await testEmailVerification(results.registration.user.email)
  } else {
    results.verification = await testEmailVerification('test@example.com')
  }
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Test password reset request
  const email = results.registration.success ? results.registration.user.email : 'test@example.com'
  results.passwordReset = await testPasswordReset(email)
  await new Promise(resolve => setTimeout(resolve, 500))

  // Test password reset complete (will fail with dummy token)
  results.passwordResetComplete = await testPasswordResetComplete('dummy-token')

  console.log('\n📊 Test Results Summary:')
  console.log('NextAuth Endpoints:', results.nextAuth.success ? '✅ Working' : '❌ Failed')
  console.log('Registration API:', results.registration.success ? '✅ Working' : '❌ Failed')
  console.log('Email Verification API:', results.verification.status === 400 ? '✅ Working (rejected dummy token)' : '❌ Unexpected response')
  console.log('Password Reset Request:', results.passwordReset.success ? '✅ Working' : '❌ Failed')
  console.log('Password Reset Complete:', results.passwordResetComplete.status === 400 ? '✅ Working (rejected dummy token)' : '❌ Unexpected response')
  
  console.log('\n💡 Note: Some tests use dummy tokens and are expected to be rejected (this confirms validation is working)')
  
  return results
}

// Export functions for individual testing
module.exports = {
  testRegistration,
  testEmailVerification,
  testPasswordReset,
  testPasswordResetComplete,
  testNextAuthEndpoints,
  runAllTests
}

// Only run if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}