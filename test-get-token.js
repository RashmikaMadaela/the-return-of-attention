/**
 * Simple test to get verification token from registration
 */

const API_BASE = 'http://localhost:3000/api'

async function testAndExtractToken() {
  const testEmail = `verify-test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  console.log(`\n📧 Testing with: ${testEmail}`)
  
  try {
    console.log('\n🔄 Registering user (this should log the verification URL to server console)...')
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        name: 'Verification Test User'
      })
    })
    
    const data = await response.json()
    console.log(`\n✅ Registration Status: ${response.status}`)
    console.log('Response:', data)
    
    if (response.status === 201) {
      console.log('\n🎯 SUCCESS! User registered and verification email was triggered.')
      console.log('\n📋 Next Steps:')
      console.log('1. Check your Next.js development server console (the terminal where you ran `npm run dev`)')
      console.log('2. Look for output like: "=== EMAIL VERIFICATION ===" followed by a verification URL')
      console.log('3. Copy the token from that URL (everything after "token=" and before "&email")')
      console.log('4. Test the verification by visiting: http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN&email=' + encodeURIComponent(testEmail))
      console.log('\n💡 The server should show the verification email details in its console output.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testAndExtractToken()