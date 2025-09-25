/**
 * Postman Testing Helper
 * Generates test data and provides utilities for Postman API testing
 */

const API_BASE = 'http://localhost:3000/api'

async function generateTestUser() {
  const timestamp = Date.now()
  return {
    email: `postman-test-${timestamp}@example.com`,
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    name: 'Postman Test User'
  }
}

async function testRegistrationForPostman() {
  console.log('🧪 Testing Registration Endpoint for Postman Demo...\n')
  
  const testUser = await generateTestUser()
  console.log(`📧 Test Email: ${testUser.email}`)
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })
    
    const data = await response.json()
    
    console.log(`\n✅ Status: ${response.status}`)
    console.log('📋 Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 201) {
      console.log('\n🎉 Registration API is working perfectly!')
      console.log('📬 Check the server console for the verification email URL')
      console.log('\n🚀 Ready for Postman testing!')
      console.log('📖 Use the POSTMAN_TESTING_GUIDE.md for complete testing instructions')
      
      return {
        success: true,
        user: testUser,
        response: data
      }
    } else {
      console.log('\n⚠️ Unexpected response - check the error')
      return {
        success: false,
        user: testUser,
        response: data,
        status: response.status
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

async function displayPostmanExamples() {
  console.log('📋 Postman Testing Examples\n')
  
  const testUser = await generateTestUser()
  
  console.log('🔐 1. User Registration:')
  console.log(`POST ${API_BASE}/auth/register`)
  console.log('Body (JSON):')
  console.log(JSON.stringify(testUser, null, 2))
  
  console.log('\n📧 2. Email Verification:')
  console.log(`GET ${API_BASE}/auth/verify-email?token=YOUR_TOKEN&email=${encodeURIComponent(testUser.email)}`)
  
  console.log('\n🔄 3. Password Reset Request:')
  console.log(`POST ${API_BASE}/auth/reset-password`)
  console.log('Body (JSON):')
  console.log(JSON.stringify({ email: testUser.email }, null, 2))
  
  console.log('\n🔒 4. Password Reset Complete:')
  console.log(`PUT ${API_BASE}/auth/reset-password`)
  console.log('Body (JSON):')
  console.log(JSON.stringify({
    token: 'YOUR_RESET_TOKEN',
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!'
  }, null, 2))
  
  console.log('\n🔑 5. NextAuth Session:')
  console.log(`GET ${API_BASE}/auth/session`)
  
  console.log('\n🚪 6. NextAuth Providers:')
  console.log(`GET ${API_BASE}/auth/providers`)
}

// Export functions
module.exports = {
  generateTestUser,
  testRegistrationForPostman,
  displayPostmanExamples,
  API_BASE
}

// Only run if this file is executed directly
if (require.main === module) {
  displayPostmanExamples()
    .then(() => testRegistrationForPostman())
    .catch(console.error)
}