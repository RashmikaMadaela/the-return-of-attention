/**
 * Quick test for the 6 previously failing POST endpoints
 * This tests the specific endpoints that were failing with 500 errors
 */

const failedEndpoints = [
  {
    method: 'POST',
    path: '/admin/auth/login',
    body: { email: 'test@example.com', password: 'testpass123' }
  },
  {
    method: 'POST', 
    path: '/admin/auth/register',
    body: { email: 'test@example.com', password: 'testpass123', name: 'Test User' }
  },
  {
    method: 'POST',
    path: '/auth/nextauth',
    body: { csrfToken: 'test-token' }
  },
  {
    method: 'POST',
    path: '/auth/register', 
    body: { email: 'test@example.com', password: 'testpass123', name: 'Test User' }
  },
  {
    method: 'POST',
    path: '/auth/resend-verification',
    body: { email: 'test@example.com' }
  },
  {
    method: 'POST',
    path: '/auth/reset-password',
    body: { email: 'test@example.com' }
  }
];

async function testFailedEndpoints() {
  const port = process.env.PORT || '3000';
  const baseUrl = `http://localhost:${port}/api`;
  
  console.log('🧪 Testing previously failed POST endpoints...');
  console.log(`Using base URL: ${baseUrl}`);
  console.log('');
  
  for (const endpoint of failedEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(endpoint.body)
      });
      
      const status = response.status;
      const statusText = response.statusText;
      
      if (status === 500) {
        console.log(`❌ ${endpoint.method} ${endpoint.path}: ${status} ${statusText} (STILL FAILING)`);
      } else {
        console.log(`✅ ${endpoint.method} ${endpoint.path}: ${status} ${statusText} (FIXED)`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.path}: ERROR - ${error.message}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  testFailedEndpoints().catch(console.error);
}

module.exports = { testFailedEndpoints };