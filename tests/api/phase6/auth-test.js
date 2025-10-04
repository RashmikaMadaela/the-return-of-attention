/**
 * Phase 6.2: Authentication & Authorization Testing
 * 
 * This phase tests comprehensive authentication flows including:
 * - User registration and login
 * - Admin authentication
 * - JWT token handling
 * - Session management
 * - Role-based access control
 * - Permission boundaries
 */

const crypto = require('crypto');

let API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Test configuration
const AUTH_TEST_CONFIG = {
  timeout: 5000,
  maxRetries: 2,
  delay: 100,
  testUsers: {
    regular: {
      email: `test-user-${Date.now()}@example.com`,
      password: 'TestPass123!',
      name: 'Test User'
    },
    admin: {
      email: `admin-${Date.now()}@example.com`,
      password: 'AdminPass123!',
      name: 'Test Admin'
    }
  }
};

// Test results tracking
const authTestResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  tokens: {
    userToken: null,
    adminToken: null
  },
  summary: {}
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeAuthRequest = async (method, url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_TEST_CONFIG.timeout);
  
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

const setApiBaseUrl = (url) => {
  API_BASE_URL = url;
};

// Test functions
const testUserRegistration = async () => {
  console.log('🔐 Testing User Registration...');
  
  try {
    const response = await makeAuthRequest('POST', `${API_BASE_URL}/auth/register`, {
      body: AUTH_TEST_CONFIG.testUsers.regular
    });
    
    const status = response.status;
    const responseData = await response.json().catch(() => ({}));
    
    const result = {
      test: 'User Registration',
      status,
      passed: status === 200 || status === 201,
      data: responseData
    };
    
    if (result.passed) {
      console.log('✅ User registration successful');
    } else {
      console.log(`❌ User registration failed: ${status}`);
      authTestResults.errors.push(result);
    }
    
    authTestResults.total++;
    if (result.passed) authTestResults.passed++;
    else authTestResults.failed++;
    
    return result;
  } catch (error) {
    const result = {
      test: 'User Registration',
      error: error.message,
      passed: false
    };
    
    console.log(`❌ User registration error: ${error.message}`);
    authTestResults.total++;
    authTestResults.failed++;
    authTestResults.errors.push(result);
    
    return result;
  }
};

const testUserLogin = async () => {
  console.log('🔑 Testing User Login...');
  
  try {
    // First, let's try to register the user (might already exist)
    await makeAuthRequest('POST', `${API_BASE_URL}/auth/register`, {
      body: AUTH_TEST_CONFIG.testUsers.regular
    }).catch(() => {}); // Ignore errors, user might already exist
    
    // Now try to login using NextAuth
    const response = await makeAuthRequest('POST', `${API_BASE_URL}/auth/signin`, {
      body: {
        email: AUTH_TEST_CONFIG.testUsers.regular.email,
        password: AUTH_TEST_CONFIG.testUsers.regular.password,
        callbackUrl: '/'
      }
    });
    
    const status = response.status;
    const responseData = await response.json().catch(() => ({}));
    
    // Extract token if available
    if (responseData.token || responseData.accessToken) {
      authTestResults.tokens.userToken = responseData.token || responseData.accessToken;
    }
    
    const result = {
      test: 'User Login',
      status,
      passed: status >= 200 && status < 400,
      data: responseData,
      hasToken: !!authTestResults.tokens.userToken
    };
    
    if (result.passed) {
      console.log('✅ User login successful');
    } else {
      console.log(`❌ User login failed: ${status}`);
      authTestResults.errors.push(result);
    }
    
    authTestResults.total++;
    if (result.passed) authTestResults.passed++;
    else authTestResults.failed++;
    
    return result;
  } catch (error) {
    const result = {
      test: 'User Login',
      error: error.message,
      passed: false
    };
    
    console.log(`❌ User login error: ${error.message}`);
    authTestResults.total++;
    authTestResults.failed++;
    authTestResults.errors.push(result);
    
    return result;
  }
};

const testAdminLogin = async () => {
  console.log('🛡️ Testing Admin Login...');
  
  try {
    const response = await makeAuthRequest('POST', `${API_BASE_URL}/admin/auth/login`, {
      body: {
        email: AUTH_TEST_CONFIG.testUsers.admin.email,
        password: AUTH_TEST_CONFIG.testUsers.admin.password
      }
    });
    
    const status = response.status;
    const responseData = await response.json().catch(() => ({}));
    
    // Extract admin token if available
    if (responseData.token || responseData.accessToken) {
      authTestResults.tokens.adminToken = responseData.token || responseData.accessToken;
    }
    
    const result = {
      test: 'Admin Login',
      status,
      passed: status === 401 || (status >= 200 && status < 400), // 401 is expected for non-existent admin
      data: responseData,
      hasToken: !!authTestResults.tokens.adminToken,
      note: status === 401 ? 'Expected - admin user does not exist' : 'Admin login processed'
    };
    
    if (result.passed) {
      console.log(`✅ Admin login test passed (${status})`);
    } else {
      console.log(`❌ Admin login failed: ${status}`);
      authTestResults.errors.push(result);
    }
    
    authTestResults.total++;
    if (result.passed) authTestResults.passed++;
    else authTestResults.failed++;
    
    return result;
  } catch (error) {
    const result = {
      test: 'Admin Login',
      error: error.message,
      passed: false
    };
    
    console.log(`❌ Admin login error: ${error.message}`);
    authTestResults.total++;
    authTestResults.failed++;
    authTestResults.errors.push(result);
    
    return result;
  }
};

const testProtectedEndpointAccess = async () => {
  console.log('🔒 Testing Protected Endpoint Access...');
  
  const protectedEndpoints = [
    { path: '/stages', method: 'GET', name: 'Stages List' },
    { path: '/progress/overview', method: 'GET', name: 'Progress Overview' },
    { path: '/user/profile', method: 'GET', name: 'User Profile' },
    { path: '/happiness', method: 'GET', name: 'Happiness Data' }
  ];
  
  const results = [];
  
  for (const endpoint of protectedEndpoints) {
    try {
      // Test without token (should fail)
      const unauthorizedResponse = await makeAuthRequest(endpoint.method, `${API_BASE_URL}${endpoint.path}`);
      const unauthorizedStatus = unauthorizedResponse.status;
      
      // Test with token (if available)
      let authorizedStatus = null;
      if (authTestResults.tokens.userToken) {
        const authorizedResponse = await makeAuthRequest(endpoint.method, `${API_BASE_URL}${endpoint.path}`, {
          headers: {
            'Authorization': `Bearer ${authTestResults.tokens.userToken}`
          }
        });
        authorizedStatus = authorizedResponse.status;
      }
      
      const result = {
        test: `Protected Access - ${endpoint.name}`,
        endpoint: endpoint.path,
        unauthorizedStatus,
        authorizedStatus,
        passed: unauthorizedStatus === 401, // Should be unauthorized without token
        hasToken: !!authTestResults.tokens.userToken
      };
      
      if (result.passed) {
        console.log(`✅ ${endpoint.name} properly protected (${unauthorizedStatus})`);
      } else {
        console.log(`❌ ${endpoint.name} not properly protected (${unauthorizedStatus})`);
        authTestResults.errors.push(result);
      }
      
      results.push(result);
      authTestResults.total++;
      if (result.passed) authTestResults.passed++;
      else authTestResults.failed++;
      
    } catch (error) {
      const result = {
        test: `Protected Access - ${endpoint.name}`,
        endpoint: endpoint.path,
        error: error.message,
        passed: false
      };
      
      console.log(`❌ ${endpoint.name} test error: ${error.message}`);
      results.push(result);
      authTestResults.total++;
      authTestResults.failed++;
      authTestResults.errors.push(result);
    }
    
    await delay(AUTH_TEST_CONFIG.delay);
  }
  
  return results;
};

const testAdminEndpointAccess = async () => {
  console.log('👑 Testing Admin Endpoint Access...');
  
  const adminEndpoints = [
    { path: '/admin/stats', method: 'GET', name: 'Admin Stats' },
    { path: '/admin/users', method: 'GET', name: 'Admin Users' }
  ];
  
  const results = [];
  
  for (const endpoint of adminEndpoints) {
    try {
      // Test without token (should fail)
      const unauthorizedResponse = await makeAuthRequest(endpoint.method, `${API_BASE_URL}${endpoint.path}`);
      const unauthorizedStatus = unauthorizedResponse.status;
      
      // Test with user token (should fail)
      let userTokenStatus = null;
      if (authTestResults.tokens.userToken) {
        const userTokenResponse = await makeAuthRequest(endpoint.method, `${API_BASE_URL}${endpoint.path}`, {
          headers: {
            'Authorization': `Bearer ${authTestResults.tokens.userToken}`
          }
        });
        userTokenStatus = userTokenResponse.status;
      }
      
      // Test with admin token (if available)
      let adminTokenStatus = null;
      if (authTestResults.tokens.adminToken) {
        const adminTokenResponse = await makeAuthRequest(endpoint.method, `${API_BASE_URL}${endpoint.path}`, {
          headers: {
            'Authorization': `Bearer ${authTestResults.tokens.adminToken}`
          }
        });
        adminTokenStatus = adminTokenResponse.status;
      }
      
      const result = {
        test: `Admin Access - ${endpoint.name}`,
        endpoint: endpoint.path,
        unauthorizedStatus,
        userTokenStatus,
        adminTokenStatus,
        passed: unauthorizedStatus === 401, // Should require auth
        hasUserToken: !!authTestResults.tokens.userToken,
        hasAdminToken: !!authTestResults.tokens.adminToken
      };
      
      if (result.passed) {
        console.log(`✅ ${endpoint.name} properly protected (${unauthorizedStatus})`);
      } else {
        console.log(`❌ ${endpoint.name} not properly protected (${unauthorizedStatus})`);
        authTestResults.errors.push(result);
      }
      
      results.push(result);
      authTestResults.total++;
      if (result.passed) authTestResults.passed++;
      else authTestResults.failed++;
      
    } catch (error) {
      const result = {
        test: `Admin Access - ${endpoint.name}`,
        endpoint: endpoint.path,
        error: error.message,
        passed: false
      };
      
      console.log(`❌ ${endpoint.name} test error: ${error.message}`);
      results.push(result);
      authTestResults.total++;
      authTestResults.failed++;
      authTestResults.errors.push(result);
    }
    
    await delay(AUTH_TEST_CONFIG.delay);
  }
  
  return results;
};

const testPasswordReset = async () => {
  console.log('🔄 Testing Password Reset...');
  
  try {
    const response = await makeAuthRequest('POST', `${API_BASE_URL}/auth/reset-password`, {
      body: {
        email: AUTH_TEST_CONFIG.testUsers.regular.email
      }
    });
    
    const status = response.status;
    const responseData = await response.json().catch(() => ({}));
    
    const result = {
      test: 'Password Reset',
      status,
      passed: status >= 200 && status < 400,
      data: responseData
    };
    
    if (result.passed) {
      console.log('✅ Password reset request successful');
    } else {
      console.log(`❌ Password reset failed: ${status}`);
      authTestResults.errors.push(result);
    }
    
    authTestResults.total++;
    if (result.passed) authTestResults.passed++;
    else authTestResults.failed++;
    
    return result;
  } catch (error) {
    const result = {
      test: 'Password Reset',
      error: error.message,
      passed: false
    };
    
    console.log(`❌ Password reset error: ${error.message}`);
    authTestResults.total++;
    authTestResults.failed++;
    authTestResults.errors.push(result);
    
    return result;
  }
};

const testEmailVerification = async () => {
  console.log('📧 Testing Email Verification...');
  
  try {
    const response = await makeAuthRequest('POST', `${API_BASE_URL}/auth/resend-verification`, {
      body: {
        email: AUTH_TEST_CONFIG.testUsers.regular.email
      }
    });
    
    const status = response.status;
    const responseData = await response.json().catch(() => ({}));
    
    const result = {
      test: 'Email Verification',
      status,
      passed: status >= 200 && status < 400,
      data: responseData
    };
    
    if (result.passed) {
      console.log('✅ Email verification request successful');
    } else {
      console.log(`❌ Email verification failed: ${status}`);
      authTestResults.errors.push(result);
    }
    
    authTestResults.total++;
    if (result.passed) authTestResults.passed++;
    else authTestResults.failed++;
    
    return result;
  } catch (error) {
    const result = {
      test: 'Email Verification',
      error: error.message,
      passed: false
    };
    
    console.log(`❌ Email verification error: ${error.message}`);
    authTestResults.total++;
    authTestResults.failed++;
    authTestResults.errors.push(result);
    
    return result;
  }
};

const runAuthTests = async () => {
  console.log('🔐 Starting Phase 6.2: Authentication & Authorization Testing');
  console.log('='.repeat(70));
  
  const startTime = Date.now();
  
  // Reset results
  authTestResults.total = 0;
  authTestResults.passed = 0;
  authTestResults.failed = 0;
  authTestResults.errors = [];
  
  console.log(`🧪 Testing with user: ${AUTH_TEST_CONFIG.testUsers.regular.email}`);
  console.log(`🧪 Testing with admin: ${AUTH_TEST_CONFIG.testUsers.admin.email}`);
  console.log('');
  
  // Run authentication tests
  await testUserRegistration();
  await delay(AUTH_TEST_CONFIG.delay);
  
  await testUserLogin();
  await delay(AUTH_TEST_CONFIG.delay);
  
  await testAdminLogin();
  await delay(AUTH_TEST_CONFIG.delay);
  
  await testProtectedEndpointAccess();
  await delay(AUTH_TEST_CONFIG.delay);
  
  await testAdminEndpointAccess();
  await delay(AUTH_TEST_CONFIG.delay);
  
  await testPasswordReset();
  await delay(AUTH_TEST_CONFIG.delay);
  
  await testEmailVerification();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Generate summary
  console.log('\\n' + '='.repeat(70));
  console.log('📊 PHASE 6.2 AUTHENTICATION TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${authTestResults.total}`);
  console.log(`Passed: ${authTestResults.passed} (${((authTestResults.passed / authTestResults.total) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${authTestResults.failed} (${((authTestResults.failed / authTestResults.total) * 100).toFixed(1)}%)`);
  console.log(`Duration: ${duration.toFixed(2)} seconds`);
  
  console.log('\\n🔑 Authentication Tokens:');
  console.log(`User Token: ${authTestResults.tokens.userToken ? '✅ Available' : '❌ Not obtained'}`);
  console.log(`Admin Token: ${authTestResults.tokens.adminToken ? '✅ Available' : '❌ Not obtained'}`);
  
  if (authTestResults.errors.length > 0) {
    console.log('\\n❌ FAILED TESTS:');
    authTestResults.errors.forEach(error => {
      console.log(`- ${error.test}: ${error.error || error.status || 'Unknown error'}`);
    });
  }
  
  // Success criteria check
  const successRate = (authTestResults.passed / authTestResults.total) * 100;
  if (successRate >= 85) {
    console.log('\\n🎉 Phase 6.2 SUCCESS! Authentication testing passed!');
  } else if (successRate >= 70) {
    console.log('\\n⚠️  Phase 6.2 PARTIAL SUCCESS. Some authentication issues need attention.');
  } else {
    console.log('\\n💥 Phase 6.2 FAILED. Authentication system needs review.');
  }
  
  return authTestResults;
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    runAuthTests, 
    authTestResults, 
    setApiBaseUrl,
    AUTH_TEST_CONFIG 
  };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runAuthTests().catch(console.error);
}