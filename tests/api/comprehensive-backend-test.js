/**
 * Comprehensive Backend API Testing Script
 * Tests all updated endpoints with centralized validation, error handling, and authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Test authentication first
async function testAuth() {
  console.log('\n=== Testing Authentication ===')
  
  try {
    // Test user registration
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User'
      })
    })
    
    const registerData = await registerResponse.json()
    console.log('✅ Registration:', registerData.success ? 'PASSED' : 'FAILED', registerData)
    
    return registerData
  } catch (error) {
    console.error('❌ Auth test failed:', error)
    return null
  }
}

// Test questionnaire API
async function testQuestionnaire(authToken) {
  console.log('\n=== Testing Questionnaire API ===')
  
  const questionnaireData = {
    // Phase 1: Demographics & Background
    experienceLevel: 'beginner',
    mainGoals: ['stress_reduction', 'better_sleep'],
    ageRange: '25-34',
    location: 'United States',
    occupation: 'Software Engineer',
    educationLevel: 'bachelor',
    meditationBackground: 'none',
    
    // Phase 2: Lifestyle Patterns
    sleepPattern: 'irregular',
    physicalActivity: 'moderate',
    stressTrigers: 'work_pressure',
    dailyRoutine: 'flexible',
    dietPattern: 'balanced',
    screenTime: 'high',
    socialConnections: 'moderate',
    workLifeBalance: 'poor',
    
    // Phase 3: Thinking Patterns
    emotionalAwareness: 'developing',
    stressResponse: 'reactive',
    decisionMaking: 'analytical',
    selfReflection: 'occasional',
    thoughtPatterns: 'mixed',
    mindfulnessInDailyLife: 'rare',
    
    // Phase 4: Mindfulness Specific
    mindfulnessExperience: 'beginner',
    meditationBackgroundDetail: 'tried_apps',
    practiceGoals: ['reduce_stress', 'improve_focus'],
    preferredDuration: 10,
    biggestChallenges: ['finding_time', 'staying_focused'],
    motivation: 'improve_wellbeing'
  }
  
  try {
    // Test POST - submit questionnaire
    const postResponse = await fetch(`${API_BASE_URL}/assessment/questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(questionnaireData)
    })
    
    const postData = await postResponse.json()
    console.log('✅ Questionnaire POST:', postData.success ? 'PASSED' : 'FAILED', postData)
    
    // Test GET - retrieve questionnaire
    const getResponse = await fetch(`${API_BASE_URL}/assessment/questionnaire`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    
    const getData = await getResponse.json()
    console.log('✅ Questionnaire GET:', getData.success ? 'PASSED' : 'FAILED', getData)
    
    return getData
  } catch (error) {
    console.error('❌ Questionnaire test failed:', error)
    return null
  }
}

// Test self-assessment API
async function testSelfAssessment(authToken) {
  console.log('\n=== Testing Self-Assessment API ===')
  
  const assessmentData = {
    foodTaste: 7,
    scentsAromas: 6,
    soundsMusic: 8,
    visualBeauty: 9,
    touchTextures: 5,
    thoughtsImages: 7
  }
  
  try {
    // Test POST - submit self-assessment
    const postResponse = await fetch(`${API_BASE_URL}/assessment/self-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(assessmentData)
    })
    
    const postData = await postResponse.json()
    console.log('✅ Self-Assessment POST:', postData.success ? 'PASSED' : 'FAILED', postData)
    
    // Test GET - retrieve assessments
    const getResponse = await fetch(`${API_BASE_URL}/assessment/self-assessment`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    
    const getData = await getResponse.json()
    console.log('✅ Self-Assessment GET:', getData.success ? 'PASSED' : 'FAILED', getData)
    
    return getData
  } catch (error) {
    console.error('❌ Self-Assessment test failed:', error)
    return null
  }
}

// Test session management
async function testSessionManagement(authToken) {
  console.log('\n=== Testing Session Management ===')
  
  const sessionStartData = {
    stageNumber: 1,
    subStage: 'T1',
    sessionType: 'timer_only',
    duration: 10,
    posture: 'sitting'
  }
  
  try {
    // Test session start
    const startResponse = await fetch(`${API_BASE_URL}/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(sessionStartData)
    })
    
    const startData = await startResponse.json()
    console.log('✅ Session Start:', startData.success ? 'PASSED' : 'FAILED', startData)
    
    if (startData.success && startData.data?.id) {
      // Test session completion
      const completeData = {
        sessionId: startData.data.id,
        qualityRating: 8,
        insights: 'Great practice session!'
      }
      
      const completeResponse = await fetch(`${API_BASE_URL}/session/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(completeData)
      })
      
      const completeResult = await completeResponse.json()
      console.log('✅ Session Complete:', completeResult.success ? 'PASSED' : 'FAILED', completeResult)
    }
    
    return startData
  } catch (error) {
    console.error('❌ Session management test failed:', error)
    return null
  }
}

// Test happiness score calculation
async function testHappinessScore(authToken) {
  console.log('\n=== Testing Happiness Score API ===')
  
  const happinessData = {
    currentStateScore: 75,
    attachmentScore: 60,
    pahmScore: 70,
    practiceScore: 80,
    progressScore: 65,
    consistencyScore: 55,
    reflectionScore: 70,
    dailyLifeScore: 75,
    questionnaireBased: true,
    selfAssessmentBased: true,
    practiceEnhanced: false
  }
  
  try {
    // Test POST - calculate happiness score
    const postResponse = await fetch(`${API_BASE_URL}/happiness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(happinessData)
    })
    
    const postData = await postResponse.json()
    console.log('✅ Happiness Score POST:', postData.success ? 'PASSED' : 'FAILED', postData)
    
    // Test GET - retrieve happiness history
    const getResponse = await fetch(`${API_BASE_URL}/happiness?days=30`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    
    const getData = await getResponse.json()
    console.log('✅ Happiness Score GET:', getData.success ? 'PASSED' : 'FAILED', getData)
    
    return getData
  } catch (error) {
    console.error('❌ Happiness score test failed:', error)
    return null
  }
}

// Test user profile management
async function testUserProfile(authToken) {
  console.log('\n=== Testing User Profile API ===')
  
  try {
    // Test GET - retrieve profile
    const getResponse = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    
    const getData = await getResponse.json()
    console.log('✅ User Profile GET:', getData.success ? 'PASSED' : 'FAILED', getData)
    
    // Test PUT - update profile
    const updateData = {
      name: 'Updated Test User',
      image: null
    }
    
    const putResponse = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updateData)
    })
    
    const putData = await putResponse.json()
    console.log('✅ User Profile PUT:', putData.success ? 'PASSED' : 'FAILED', putData)
    
    return getData
  } catch (error) {
    console.error('❌ User profile test failed:', error)
    return null
  }
}

// Test error handling and validation
async function testErrorHandling() {
  console.log('\n=== Testing Error Handling & Validation ===')
  
  try {
    // Test invalid data validation
    const invalidResponse = await fetch(`${API_BASE_URL}/assessment/questionnaire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invalidField: 'invalid'
      })
    })
    
    const invalidData = await invalidResponse.json()
    console.log('✅ Validation Error:', !invalidData.success && invalidData.errors ? 'PASSED' : 'FAILED', invalidData)
    
    // Test unauthorized access
    const unauthorizedResponse = await fetch(`${API_BASE_URL}/user/profile`)
    const unauthorizedData = await unauthorizedResponse.json()
    console.log('✅ Unauthorized Error:', !unauthorizedData.success ? 'PASSED' : 'FAILED', unauthorizedData)
    
    return true
  } catch (error) {
    console.error('❌ Error handling test failed:', error)
    return false
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Backend API Tests...')
  console.log('=' .repeat(60))
  
  try {
    // 1. Test authentication
    const authResult = await testAuth()
    if (!authResult?.success) {
      console.log('❌ Authentication failed, stopping tests')
      return
    }
    
    // For now, we'll use a mock token since auth system might need NextAuth session
    const mockToken = 'test-token'
    
    // 2. Test all endpoints
    await testErrorHandling()
    await testQuestionnaire(mockToken)
    await testSelfAssessment(mockToken)
    await testSessionManagement(mockToken)
    await testHappinessScore(mockToken)
    await testUserProfile(mockToken)
    
    console.log('\n' + '=' .repeat(60))
    console.log('🎉 All backend API tests completed!')
    console.log('Check individual test results above for detailed status.')
    
  } catch (error) {
    console.error('❌ Test runner failed:', error)
  }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testAuth,
    testQuestionnaire,
    testSelfAssessment,
    testSessionManagement,
    testHappinessScore,
    testUserProfile,
    testErrorHandling
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runAllTests()
}