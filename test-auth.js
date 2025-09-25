// Test script for authentication APIs
// Run with: node test-auth.js

const API_BASE = 'http://localhost:3000/api'

async function testRegistration() {
  console.log('\n=== Testing User Registration ===')
  
  const testUser = {
    email: 'test@example.com',
    password: 'TestPass123',
    confirmPassword: 'TestPass123',
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

    return data.success
  } catch (error) {
    console.error('Registration Error:', error)
    return false
  }
}

async function testEmailVerification() {
  console.log('\n=== Testing Email Verification ===')
  
  // This would normally come from the email
  const testData = {
    email: 'test@example.com',
    token: 'dummy-token-for-testing'
  }

  try {
    const response = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    const data = await response.json()
    console.log('Verification Response:', data)
    console.log('Status:', response.status)

    return data.success
  } catch (error) {
    console.error('Verification Error:', error)
    return false
  }
}

async function testPasswordReset() {
  console.log('\n=== Testing Password Reset Request ===')
  
  try {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com' })
    })

    const data = await response.json()
    console.log('Reset Request Response:', data)
    console.log('Status:', response.status)

    return data.success
  } catch (error) {
    console.error('Reset Request Error:', error)
    return false
  }
}

async function runTests() {
  console.log('🧪 Starting Authentication API Tests...')
  console.log('Make sure the development server is running on localhost:3000')
  
  const results = {
    registration: false,
    verification: false,
    passwordReset: false
  }

  // Test registration
  results.registration = await testRegistration()
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Test email verification (will fail with dummy token, but we can check the endpoint)
  results.verification = await testEmailVerification()
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Test password reset request
  results.passwordReset = await testPasswordReset()

  console.log('\n📊 Test Results Summary:')
  console.log('Registration API:', results.registration ? '✅ Working' : '❌ Failed')
  console.log('Email Verification API:', results.verification ? '✅ Working' : '❌ Failed (expected with dummy token)')
  console.log('Password Reset API:', results.passwordReset ? '✅ Working' : '❌ Failed')
  
  console.log('\n💡 Note: Some tests may "fail" due to dummy data, but the endpoints should respond properly')
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testRegistration, testEmailVerification, testPasswordReset }