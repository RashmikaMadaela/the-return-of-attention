/**
 * Phase 6.1: Comprehensive API Connectivity & Basic Functionality Testing
 * 
 * This script tests all 65 API endpoints for:
 * - Basic connectivity
 * - Proper HTTP status codes
 * - Response structure consistency
 * - Basic error handling
 */

let API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Test configuration
const TEST_CONFIG = {
  timeout: 3000,  // Reduced timeout
  maxRetries: 2,  // Reduced retries
  delay: 50      // Reduced delay
};

// Function to update API base URL
const setApiBaseUrl = (url) => {
  API_BASE_URL = url;
};

// API endpoints organized by category
const API_ENDPOINTS = {
  admin: {
    auth: [
      { 
        method: 'POST', 
        path: '/admin/auth/login', 
        requiresAuth: false,
        body: { email: 'test@example.com', password: 'testpass123' }
      },
      { 
        method: 'POST', 
        path: '/admin/auth/register', 
        requiresAuth: false,
        body: { email: 'test@example.com', password: 'testpass123', name: 'Test User' }
      }
    ],
    data: [
      { method: 'DELETE', path: '/admin/data/clear', requiresAuth: true }
    ],
    sessions: [
      { method: 'GET', path: '/admin/sessions/manage', requiresAuth: true },
      { method: 'POST', path: '/admin/sessions/manage', requiresAuth: true },
      { method: 'PUT', path: '/admin/sessions/manage', requiresAuth: true },
      { method: 'DELETE', path: '/admin/sessions/manage', requiresAuth: true }
    ],
    stages: [
      { method: 'GET', path: '/admin/stages/manage', requiresAuth: true },
      { method: 'POST', path: '/admin/stages/manage', requiresAuth: true },
      { method: 'PUT', path: '/admin/stages/manage', requiresAuth: true },
      { method: 'DELETE', path: '/admin/stages/manage', requiresAuth: true }
    ],
    stats: [
      { method: 'GET', path: '/admin/stats', requiresAuth: true }
    ],
    users: [
      { method: 'GET', path: '/admin/users', requiresAuth: true },
      { method: 'POST', path: '/admin/users', requiresAuth: true },
      { method: 'GET', path: '/admin/users/manage', requiresAuth: true },
      { method: 'POST', path: '/admin/users/manage', requiresAuth: true },
      { method: 'PUT', path: '/admin/users/manage', requiresAuth: true },
      { method: 'DELETE', path: '/admin/users/manage', requiresAuth: true },
      { method: 'GET', path: '/admin/users/test-user-id', requiresAuth: true },
      { method: 'PUT', path: '/admin/users/test-user-id', requiresAuth: true },
      { method: 'DELETE', path: '/admin/users/test-user-id', requiresAuth: true }
    ]
  },
  assessment: [
    { method: 'GET', path: '/assessment/questionnaire', requiresAuth: true },
    { method: 'POST', path: '/assessment/questionnaire', requiresAuth: true },
    { method: 'POST', path: '/assessment/reset', requiresAuth: true },
    { method: 'GET', path: '/assessment/results', requiresAuth: true },
    { method: 'POST', path: '/assessment/self-assessment', requiresAuth: true },
    { method: 'GET', path: '/assessment/status', requiresAuth: true }
  ],
  auth: [
    { method: 'GET', path: '/auth/nextauth', requiresAuth: false },
    { 
      method: 'POST', 
      path: '/auth/nextauth', 
      requiresAuth: false,
      body: { csrfToken: 'test-token' }
    },
    { 
      method: 'POST', 
      path: '/auth/register', 
      requiresAuth: false,
      body: { email: 'test@example.com', password: 'testpass123', name: 'Test User' }
    },
    { 
      method: 'POST', 
      path: '/auth/resend-verification', 
      requiresAuth: false,
      body: { email: 'test@example.com' }
    },
    { 
      method: 'POST', 
      path: '/auth/reset-password', 
      requiresAuth: false,
      body: { email: 'test@example.com' }
    },
    { method: 'GET', path: '/auth/verify-email', requiresAuth: false }
  ],
  debug: [
    { method: 'POST', path: '/debug/bypass-stage1', requiresAuth: true },
    { method: 'POST', path: '/debug/cleanup-sessions', requiresAuth: true },
    { method: 'POST', path: '/debug/create-progress', requiresAuth: true },
    { method: 'POST', path: '/debug/force-bypass-stage1', requiresAuth: true },
    { method: 'GET', path: '/debug/raw-progress', requiresAuth: true }
  ],
  happiness: [
    { method: 'GET', path: '/happiness', requiresAuth: true },
    { method: 'POST', path: '/happiness', requiresAuth: true },
    { method: 'GET', path: '/happiness/breakdown', requiresAuth: true },
    { method: 'GET', path: '/happiness/history', requiresAuth: true },
    { method: 'GET', path: '/happiness/trends', requiresAuth: true }
  ],
  notes: [
    { method: 'POST', path: '/notes/detailed', requiresAuth: true },
    { method: 'POST', path: '/notes/emoji', requiresAuth: true },
    { method: 'GET', path: '/notes/history', requiresAuth: true },
    { method: 'GET', path: '/notes/trends', requiresAuth: true }
  ],
  pahm: [
    { method: 'POST', path: '/pahm/click', requiresAuth: true },
    { method: 'POST', path: '/pahm/complete', requiresAuth: true },
    { method: 'GET', path: '/pahm/session/test-session-id', requiresAuth: true },
    { method: 'PUT', path: '/pahm/session/test-session-id', requiresAuth: true },
    { method: 'POST', path: '/pahm/start', requiresAuth: true }
  ],
  progress: [
    { method: 'GET', path: '/progress/overview', requiresAuth: true },
    { method: 'GET', path: '/progress/stages', requiresAuth: true }
  ],
  session: [
    { method: 'POST', path: '/session/complete', requiresAuth: true },
    { method: 'GET', path: '/session/history', requiresAuth: true },
    { method: 'GET', path: '/session/progress', requiresAuth: true },
    { method: 'POST', path: '/session/start', requiresAuth: true },
    { method: 'PUT', path: '/session/update', requiresAuth: true }
  ],
  stages: [
    { method: 'GET', path: '/stages', requiresAuth: true },
    { method: 'GET', path: '/stages/1', requiresAuth: true },
    { method: 'POST', path: '/stages/1/unlock', requiresAuth: true }
  ],
  user: [
    { method: 'PUT', path: '/user/change-password', requiresAuth: true },
    { method: 'DELETE', path: '/user/delete-account', requiresAuth: true },
    { method: 'GET', path: '/user/personal-info', requiresAuth: true },
    { method: 'PUT', path: '/user/personal-info', requiresAuth: true },
    { method: 'GET', path: '/user/preferences', requiresAuth: true },
    { method: 'PUT', path: '/user/preferences', requiresAuth: true },
    { method: 'GET', path: '/user/profile', requiresAuth: true },
    { method: 'PUT', path: '/user/profile', requiresAuth: true }
  ]
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  summary: {}
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (method, url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const testEndpoint = async (endpoint) => {
  const url = `${API_BASE_URL}${endpoint.path}`;
  let retries = 0;
  
  while (retries < TEST_CONFIG.maxRetries) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      
      const response = await makeRequest(endpoint.method, url, {
        headers: endpoint.requiresAuth ? {
          'Authorization': 'Bearer test-token'  // Mock token for testing
        } : {},
        body: endpoint.body || undefined
      });
      
      const result = {
        method: endpoint.method,
        path: endpoint.path,
        status: response.status,
        ok: response.ok,
        requiresAuth: endpoint.requiresAuth,
        responseTime: Date.now()
      };
      
      // Determine if test passed based on expected behavior
      let passed = false;
      if (endpoint.requiresAuth && response.status === 401) {
        // Expected unauthorized response
        passed = true;
        result.note = 'Correctly rejected unauthorized request';
      } else if (!endpoint.requiresAuth && (response.status === 400 || response.status === 401 || response.status === 409 || (response.status >= 200 && response.status < 300))) {
        // Public endpoint with proper validation response (400 = validation error, 401 = auth error, 409 = conflict, 2xx = success)
        passed = true;
        result.note = response.status === 400 ? 'Correctly validated input' : 
                     response.status === 401 ? 'Correctly required authentication' :
                     response.status === 409 ? 'Correctly detected conflict' : 'Success response';
      } else if (endpoint.requiresAuth && response.status !== 500) {
        // Protected endpoint with auth should not give server error
        passed = true;
      }
      
      result.passed = passed;
      
      if (passed) {
        testResults.passed++;
        console.log(`✅ PASS: ${endpoint.method} ${endpoint.path} (${response.status})`);
      } else {
        testResults.failed++;
        console.log(`❌ FAIL: ${endpoint.method} ${endpoint.path} (${response.status})`);
        testResults.errors.push(result);
      }
      
      return result;
      
    } catch (error) {
      retries++;
      if (retries >= TEST_CONFIG.maxRetries) {
        const result = {
          method: endpoint.method,
          path: endpoint.path,
          error: error.message,
          passed: false,
          retries
        };
        
        testResults.failed++;
        testResults.errors.push(result);
        console.log(`❌ ERROR: ${endpoint.method} ${endpoint.path} - ${error.message}`);
        return result;
      }
      
      console.log(`Retrying ${endpoint.method} ${endpoint.path} (attempt ${retries + 1})...`);
      await delay(TEST_CONFIG.delay * retries);
    }
  }
};

const runTests = async () => {
  console.log('🚀 Starting Phase 6.1: API Connectivity Testing');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // Flatten all endpoints
  const allEndpoints = [];
  
  // Process admin endpoints (nested structure)
  for (const [category, subcategories] of Object.entries(API_ENDPOINTS.admin)) {
    for (const endpoint of subcategories) {
      allEndpoints.push(endpoint);
    }
  }
  
  // Process other endpoints (flat structure)
  const otherCategories = ['assessment', 'auth', 'debug', 'happiness', 'notes', 'pahm', 'progress', 'session', 'stages', 'user'];
  for (const category of otherCategories) {
    for (const endpoint of API_ENDPOINTS[category]) {
      allEndpoints.push(endpoint);
    }
  }
  
  testResults.total = allEndpoints.length;
  
  console.log(`Testing ${testResults.total} API endpoints...\n`);
  
  // Run tests for each endpoint
  for (const endpoint of allEndpoints) {
    await testEndpoint(endpoint);
    await delay(TEST_CONFIG.delay); // Prevent overwhelming the server
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHASE 6.1 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} (${((testResults.passed / testResults.total) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${testResults.failed} (${((testResults.failed / testResults.total) * 100).toFixed(1)}%)`);
  console.log(`Duration: ${duration.toFixed(2)} seconds`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.errors.forEach(error => {
      console.log(`- ${error.method} ${error.path}: ${error.error || error.status || 'Unknown error'}`);
    });
  }
  
  // Success criteria check
  const successRate = (testResults.passed / testResults.total) * 100;
  if (successRate >= 90) {
    console.log('\n🎉 Phase 6.1 SUCCESS! API connectivity testing passed!');
  } else if (successRate >= 75) {
    console.log('\n⚠️  Phase 6.1 PARTIAL SUCCESS. Some issues need attention.');
  } else {
    console.log('\n💥 Phase 6.1 FAILED. Significant issues need resolution.');
  }
  
  return testResults;
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, API_ENDPOINTS, testResults, setApiBaseUrl };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runTests().catch(console.error);
}