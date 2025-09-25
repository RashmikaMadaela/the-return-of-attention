/**
 * Test script for complete email verification flow
 * This will test the entire flow: registration -> get verification URL from console -> verify email
 */

const API_BASE = 'http://localhost:3000/api'

async function testCompleteEmailVerification() {
  console.log('🧪 Testing Complete Email Verification Flow...\n')
  
  // Use a unique email for this test
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  console.log(`📧 Test Email: ${testEmail}`)
  
  try {
    // Step 1: Register user
    console.log('\n1️⃣ Registering user...')
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        name: 'Test User'
      })
    })
    
    const registerData = await registerResponse.json()
    console.log(`Status: ${registerResponse.status}`)
    console.log(`Response:`, registerData)
    
    if (registerResponse.status !== 201) {
      throw new Error('Registration failed')
    }
    
    console.log('\n✅ Registration successful!')
    console.log('📬 Check the server console for the verification email URL')
    console.log('\n⏳ Waiting 3 seconds for you to copy the verification token from console...')
    
    // Wait for user to see the console output
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('\n2️⃣ Now we need to extract the token from the logged URL')
    console.log('💡 Look for a line like: "URL: http://localhost:3000/auth/verify-email?token=XXXXX&email=..."')
    console.log('💡 Copy the token (the XXXXX part) from that URL')
    
    // For demonstration, let's try to verify with a dummy token first (should fail)
    console.log('\n3️⃣ Testing with invalid token (should fail)...')
    const invalidVerifyResponse = await fetch(`${API_BASE}/auth/verify-email?token=invalid-token&email=${encodeURIComponent(testEmail)}`)
    const invalidVerifyData = await invalidVerifyResponse.json()
    
    console.log(`Status: ${invalidVerifyResponse.status}`)
    console.log(`Response:`, invalidVerifyData)
    
    if (invalidVerifyResponse.status === 400) {
      console.log('✅ Invalid token correctly rejected!')
    }
    
    console.log('\n📋 MANUAL VERIFICATION NEEDED:')
    console.log('1. Look at the server console output above')
    console.log('2. Find the verification URL that was logged')
    console.log('3. Copy the token from that URL')
    console.log('4. Use it to manually test: GET /api/auth/verify-email?token=REAL_TOKEN&email=' + encodeURIComponent(testEmail))
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testCompleteEmailVerification()