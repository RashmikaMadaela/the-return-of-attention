/**
 * Test Runner - Authentication APIs
 * Runs all authentication tests in sequence
 */

const { testAPIConnectivity } = require('./connectivity.test.js')
const { runAllTests } = require('./auth/auth-api.test.js')

async function runAuthenticationTests() {
  console.log('🚀 Authentication API Test Suite\n')
  console.log('=' .repeat(50))
  
  // Step 1: Check connectivity
  console.log('STEP 1: Testing API Connectivity')
  console.log('-'.repeat(30))
  const connectivity = await testAPIConnectivity()
  
  if (!connectivity.server) {
    console.log('❌ Server connectivity failed. Please ensure:')
    console.log('   - Development server is running (npm run dev)')
    console.log('   - Server is accessible on http://localhost:3000')
    return
  }
  
  console.log('\n' + '=' .repeat(50))
  
  // Step 2: Run all authentication API tests
  console.log('STEP 2: Running Authentication API Tests')
  console.log('-'.repeat(40))
  const results = await runAllTests()
  
  console.log('\n' + '=' .repeat(50))
  
  // Step 3: Summary
  console.log('FINAL TEST SUMMARY')
  console.log('-'.repeat(20))
  
  const allPassed = connectivity.server && 
                   results.nextAuth?.success && 
                   results.registration?.success &&
                   results.passwordReset?.success
  
  console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS NEED ATTENTION'}`)
  console.log(`Server Connectivity: ${connectivity.server ? '✅' : '❌'}`)
  console.log(`NextAuth Integration: ${results.nextAuth?.success ? '✅' : '❌'}`)
  console.log(`User Registration: ${results.registration?.success ? '✅' : '❌'}`)
  console.log(`Email Verification: ${results.verification?.status === 400 ? '✅' : '⚠️'} (Expected to reject dummy tokens)`)
  console.log(`Password Reset: ${results.passwordReset?.success ? '✅' : '❌'}`)
  
  console.log('\n📝 Note: Email verification and password reset completion tests use dummy tokens')
  console.log('   and are expected to be rejected. This confirms validation is working correctly.')
  
  console.log('\n🔗 For manual testing:')
  console.log('   - Use Postman with POSTMAN_TESTING_GUIDE.md')
  console.log('   - Run email-verification-flow.test.mjs for complete end-to-end testing')
  
  return {
    connectivity,
    results,
    allPassed
  }
}

// Export for use in other files
module.exports = { runAuthenticationTests }

// Only run if this file is executed directly
if (require.main === module) {
  runAuthenticationTests().catch(console.error)
}