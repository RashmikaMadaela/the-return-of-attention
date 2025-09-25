/**
 * Complete Email Verification Flow Test
 * Tests the full end-to-end email verification using real database tokens
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const API_BASE = 'http://localhost:3000/api'

async function testCompleteVerificationFlow() {
  console.log('🧪 Complete Email Verification Flow Test\n')
  
  const testEmail = `complete-test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    // Step 1: Register user
    console.log('1️⃣ Registering user...')
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        name: 'Complete Test User'
      })
    })
    
    const registerData = await registerResponse.json()
    console.log(`✅ Registration: ${registerResponse.status}`)
    console.log(`User ID: ${registerData.data?.id}`)
    console.log(`Is Active: ${registerData.data?.isActive}`)
    
    if (registerResponse.status !== 201) {
      throw new Error('User registration failed')
    }
    
    // Step 2: Get verification token from database
    console.log('\n2️⃣ Getting verification token from database...')
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: testEmail,
        type: 'email_verification'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!verificationToken) {
      throw new Error('No verification token found in database')
    }
    
    console.log(`✅ Token found: ${verificationToken.token.substring(0, 16)}...`)
    console.log(`Token expires: ${verificationToken.expires}`)
    
    // Step 3: Verify email using the real token
    console.log('\n3️⃣ Verifying email with real token...')
    const verifyResponse = await fetch(`${API_BASE}/auth/verify-email?token=${verificationToken.token}&email=${encodeURIComponent(testEmail)}`)
    const verifyData = await verifyResponse.json()
    
    console.log(`✅ Verification: ${verifyResponse.status}`)
    console.log('Response:', verifyData)
    
    // Step 4: Check user status after verification
    console.log('\n4️⃣ Checking user status after verification...')
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isActive: true
      }
    })
    
    console.log('✅ User after verification:', user)
    
    // Step 5: Verify token was consumed
    console.log('\n5️⃣ Checking if verification token was consumed...')
    const consumedToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: testEmail,
        type: 'email_verification',
        token: verificationToken.token
      }
    })
    
    console.log(`Token still exists: ${consumedToken ? 'Yes' : 'No (consumed ✅)'}`)
    
    // Step 6: Test password reset flow with same user
    console.log('\n6️⃣ Testing password reset flow...')
    const resetResponse = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    })
    
    const resetData = await resetResponse.json()
    console.log(`✅ Reset Request: ${resetResponse.status}`)
    console.log('Response:', resetData)
    
    // Summary
    console.log('\n📊 COMPLETE TEST SUMMARY:')
    console.log(`✅ User Registration: ${registerResponse.status === 201 ? 'Success' : 'Failed'}`)
    console.log(`✅ Verification Token Generated: Success`)  
    console.log(`✅ Email Verification: ${verifyResponse.status === 200 ? 'Success' : 'Failed'}`)
    console.log(`✅ User Activated: ${user?.isActive ? 'Yes' : 'No'}`)
    console.log(`✅ Token Consumed: ${!consumedToken ? 'Yes' : 'No'}`)
    console.log(`✅ Password Reset Flow: ${resetResponse.status === 200 ? 'Success' : 'Failed'}`)
    
    return {
      registration: registerResponse.status === 201,
      verification: verifyResponse.status === 200,
      userActivated: user?.isActive,
      tokenConsumed: !consumedToken,
      passwordReset: resetResponse.status === 200
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Export for use in other test files
export { testCompleteVerificationFlow }

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testCompleteVerificationFlow()
}