/**
 * API Connectivity Test
 * Quick test to verify server is running and endpoints are accessible
 */

const API_BASE = 'http://localhost:3000/api'

async function testAPIConnectivity() {
  console.log('🔌 Testing API Connectivity...\n')
  
  const results = {
    server: false,
    providers: false,
    session: false
  }
  
  try {
    // Test NextAuth providers endpoint
    console.log('Testing NextAuth providers endpoint...')
    const providersResponse = await fetch(`${API_BASE}/auth/providers`)
    results.providers = providersResponse.ok
    console.log(`✅ Providers endpoint: ${providersResponse.status}`)
    
    if (providersResponse.ok) {
      const providers = await providersResponse.json()
      console.log('Available providers:', Object.keys(providers))
    }
    
    // Test session endpoint
    console.log('\nTesting session endpoint...')
    const sessionResponse = await fetch(`${API_BASE}/auth/session`)
    results.session = sessionResponse.ok
    console.log(`✅ Session endpoint: ${sessionResponse.status}`)
    
    results.server = results.providers && results.session
    
    if (results.server) {
      console.log('\n🎉 Server is ready for testing!')
      console.log(`📋 Base URL: ${API_BASE}`)
    } else {
      console.log('\n⚠️ Some endpoints may not be responding correctly')
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.log('Make sure the development server is running:')
    console.log('  npm run dev')
    results.error = error.message
  }
  
  return results
}

// Export for use in other test files
module.exports = { testAPIConnectivity, API_BASE }

// Only run if this file is executed directly
if (require.main === module) {
  testAPIConnectivity().catch(console.error)
}