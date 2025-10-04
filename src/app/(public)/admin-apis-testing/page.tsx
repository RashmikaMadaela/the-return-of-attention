'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TestForm {
  email: string;
  password: string;
  name: string;
  role: string;
  userId: string;
  stageNumber: string;
  action: string;
  reason: string;
  targetType: string;
  confirmationCode: string;
  registrationKey: string;
}

export default function AdminApiTestingPage() {
  const router = useRouter();
  const [results, setResults] = useState<string>('');
  const [authToken, setAuthToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [testForm, setTestForm] = useState<TestForm>({
    email: 'admin@example.com',
    password: 'SecureAdminPass123!',
    name: 'Test Admin',
    role: 'admin',
    userId: '',
    stageNumber: '2',
    action: 'unlock',
    reason: 'Testing admin functionality',
    targetType: 'practice_sessions',
    confirmationCode: 'CLEAR-DATA-2024',
    registrationKey: 'admin-registration-2024',
  });

  // Check for admin authentication
  useEffect(() => {
    const storedAdminData = localStorage.getItem('adminData');
    if (storedAdminData) {
      try {
        const parsed = JSON.parse(storedAdminData);
        setAdminData(parsed);
        appendToResults(`✅ Admin authenticated: ${parsed.user.name} (${parsed.user.email})`);
        appendToResults(`🔑 Admin ID: ${parsed.adminId}`);
        appendToResults(`👤 Role: ${parsed.role}`);
        appendToResults(`🛡️ Permissions: ${parsed.permissions.join(', ') || 'Standard admin access'}`);
        appendToResults(`📋 Ready to test admin APIs\n`);
      } catch (error) {
        console.error('Error parsing admin data:', error);
        redirectToLogin();
      }
    } else {
      redirectToLogin();
    }
  }, []);

  const redirectToLogin = () => {
    appendToResults(`❌ Admin authentication required. Redirecting to login...`);
    setTimeout(() => {
      router.push('/admin-login');
    }, 2000);
  };

  const appendToResults = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => prev + `\n[${timestamp}] ${message}`);
  };

  const apiCall = async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      const timestamp = new Date().toLocaleTimeString();
      setResults(prev => prev + `\n\n[${timestamp}] === ${options.method || 'GET'} ${url} ===\n` +
        `Status: ${response.status} ${response.statusText}\n` +
        `Response: ${JSON.stringify(data, null, 2)}`);
      
      return data;
    } catch (error) {
      const timestamp = new Date().toLocaleTimeString();
      const errorMessage = `[${timestamp}] Error calling ${url}: ${error}`;
      setResults(prev => prev + `\n\n${errorMessage}`);
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Authentication Tests
  const testAdminRegister = async () => {
    const response = await apiCall('/api/admin/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testForm.email,
        password: testForm.password,
        name: testForm.name,
        role: testForm.role,
        registrationKey: testForm.registrationKey,
      }),
    });
    
    if (response?.success) {
      setResults(prev => prev + '\n✅ Admin registration successful');
    }
  };

  const testAdminLogin = async () => {
    const response = await apiCall('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testForm.email,
        password: testForm.password,
      }),
    });

    // Note: Our current implementation uses NextAuth, so token might be in cookies
    if (response?.success) {
      setResults(prev => prev + '\n✅ Admin login successful (using session-based auth)');
      // For testing purposes, we'll simulate having auth
      setAuthToken('session-based-auth');
    }
  };

  // User Management Tests
  const testUsersList = async () => {
    const response = await apiCall('/api/admin/users?page=1&limit=5&search=&status=all');
    
    // Store first user ID for other tests
    if (response?.success && response?.data?.users?.[0]?.id) {
      setSelectedUserId(response.data.users[0].id);
      setTestForm(prev => ({ ...prev, userId: response.data.users[0].id }));
      setResults(prev => prev + `\n📝 Auto-selected user ID: ${response.data.users[0].id}`);
    }
  };

  const testUserDetails = async () => {
    const userId = testForm.userId || selectedUserId;
    if (!userId) {
      setResults(prev => prev + '\n❌ No user ID provided. Run "List Users" first or enter a user ID.');
      return;
    }
    
    await apiCall(`/api/admin/users/${userId}`);
  };

  const testUserManagement = async () => {
    const userId = testForm.userId || selectedUserId;
    if (!userId) {
      setResults(prev => prev + '\n❌ No user ID provided. Run "List Users" first or enter a user ID.');
      return;
    }

    await apiCall('/api/admin/users/manage', {
      method: 'POST',
      body: JSON.stringify({
        action: testForm.action,
        userId: userId,
        reason: testForm.reason,
      }),
    });
  };

  // System Tests
  const testAdminStats = async () => {
    await apiCall('/api/admin/stats');
  };

  // Session Management Tests
  const testSessionManagement = async () => {
    const userId = testForm.userId || selectedUserId;
    if (!userId) {
      setResults(prev => prev + '\n❌ No user ID provided. Run "List Users" first or enter a user ID.');
      return;
    }
    
    await apiCall('/api/admin/sessions/manage', {
      method: 'POST',
      body: JSON.stringify({
        action: 'unlock_stage',
        userId: userId,
        targetStage: parseInt(testForm.stageNumber),
        reason: testForm.reason
      }),
    });
  };

  // Stage Management Tests
  const testStageManagement = async () => {
    const userId = testForm.userId || selectedUserId;
    if (!userId) {
      setResults(prev => prev + '\n❌ No user ID provided. Run "List Users" first or enter a user ID.');
      return;
    }

    await apiCall('/api/admin/stages/manage', {
      method: 'POST',
      body: JSON.stringify({
        action: testForm.action,
        userId: userId,
        stageNumber: parseInt(testForm.stageNumber),
        reason: testForm.reason,
        skipDays: testForm.action === 'time_skip' ? 7 : undefined,
      }),
    });
  };

  // Data Management Tests
  const testDataClear = async () => {
    const userId = testForm.targetType === 'all' ? undefined : (testForm.userId || selectedUserId);
    
    await apiCall('/api/admin/data/clear', {
      method: 'POST',
      body: JSON.stringify({
        action: userId ? 'clear_user_data' : 'clear_all_data',
        targetType: testForm.targetType,
        userId: userId,
        reason: testForm.reason,
        confirmationCode: testForm.confirmationCode,
      }),
    });
  };

  // Run all core tests
  const runAllTests = async () => {
    setResults('🚀 Running comprehensive admin API test suite...\n');
    
    // Test in sequence with delays
    await new Promise(resolve => setTimeout(resolve, 500));
    await testAdminLogin();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testUsersList();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAdminStats();
    
    if (selectedUserId) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await testUserDetails();
    }
    
    setResults(prev => prev + '\n\n🎉 Test suite completed!');
  };

  const clearResults = () => {
    setResults('');
  };

  // Show loading or redirect message if not authenticated
  if (!adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-md mx-auto text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please log in as an administrator to access the API testing suite.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 font-mono">
              Checking authentication status...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🛠️ Admin API Testing Suite
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Comprehensive testing interface for Phase 5 Admin Backend APIs
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ 9 Admin APIs
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🔐 Role-Based Security
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  📊 Dashboard Ready
                </span>
              </div>
            </div>

            {/* Admin Info Bar */}
            {adminData && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        👤 {adminData.user.name}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📧 {adminData.user.email}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🛡️ {adminData.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push('/admin-login')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                    >
                      🏠 Admin Dashboard
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('adminData');
                        router.push('/admin-login');
                      }}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-md transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Test Configuration Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Authentication Config */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔑 Authentication Config</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                    <input
                      type="email"
                      value={testForm.email}
                      onChange={(e) => setTestForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={testForm.password}
                      onChange={(e) => setTestForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Key</label>
                    <input
                      type="text"
                      value={testForm.registrationKey}
                      onChange={(e) => setTestForm(prev => ({ ...prev, registrationKey: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Auth Status: {authToken ? '🟢 Authenticated' : '🔴 Not authenticated'}
                  </div>
                </div>
              </div>

              {/* Test Parameters */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Test Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID (auto-filled from user list)</label>
                    <input
                      type="text"
                      value={testForm.userId}
                      onChange={(e) => setTestForm(prev => ({ ...prev, userId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Will be auto-filled after listing users"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                      <select
                        value={testForm.action}
                        onChange={(e) => setTestForm(prev => ({ ...prev, action: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="unlock">Unlock</option>
                        <option value="reset">Reset</option>
                        <option value="time_skip">Time Skip</option>
                        <option value="disable">Disable</option>
                        <option value="reactivate">Reactivate</option>
                        <option value="reset_progress">Reset Progress</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stage Number</label>
                      <select
                        value={testForm.stageNumber}
                        onChange={(e) => setTestForm(prev => ({ ...prev, stageNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {[1,2,3,4,5,6].map(n => (
                          <option key={n} value={n}>Stage {n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      type="text"
                      value={testForm.reason}
                      onChange={(e) => setTestForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Testing admin functionality"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Test Buttons */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🚀 Quick Tests</h3>
                <button
                  onClick={runAllTests}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium"
                >
                  Run All Core Tests
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <button
                  onClick={testAdminRegister}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  🔐 Register Admin
                </button>
                
                <button
                  onClick={testAdminLogin}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  🔑 Admin Login
                </button>
                
                <button
                  onClick={testUsersList}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  👥 List Users
                </button>
                
                <button
                  onClick={testUserDetails}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  👤 User Details
                </button>
                
                <button
                  onClick={testUserManagement}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  ⚡ Manage User
                </button>
                
                <button
                  onClick={testAdminStats}
                  disabled={loading}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  📊 Admin Stats
                </button>
                
                <button
                  onClick={testSessionManagement}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  🎮 Session Mgmt
                </button>
                
                <button
                  onClick={testStageManagement}
                  disabled={loading}
                  className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  🎯 Stage Control
                </button>
                
                <button
                  onClick={testDataClear}
                  disabled={loading}
                  className="bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  🗑️ Clear Data
                </button>
                
                <button
                  onClick={clearResults}
                  disabled={loading}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  🧹 Clear Results
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center px-6 py-3 text-sm font-medium text-blue-900 bg-blue-100 rounded-full shadow-sm">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing Admin API... Please wait
                </div>
              </div>
            )}

            {/* Results Display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  📋 API Test Results
                </h3>
                <div className="text-sm text-gray-500">
                  {results ? `${results.split('\n===').length - 1} API calls made` : 'No tests run yet'}
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg shadow-lg">
                <div className="px-4 py-3 bg-gray-800 rounded-t-lg border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-400 text-sm font-mono">admin-api-terminal</span>
                  </div>
                </div>
                <pre className="text-green-400 p-6 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                  {results || '🚀 Welcome to the Admin API Testing Suite!\n\n• Click "Run All Core Tests" for a quick overview\n• Use individual test buttons for specific functionality\n• Configure test parameters above before running tests\n• All 9 admin APIs are available for testing\n\nReady to test your admin backend APIs! 🛠️'}
                </pre>
              </div>
            </div>

            {/* Advanced Testing Section */}
            <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Advanced Testing & Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Clear Target</label>
                  <select
                    value={testForm.targetType}
                    onChange={(e) => setTestForm(prev => ({ ...prev, targetType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="practice_sessions">Practice Sessions</option>
                    <option value="mind_recovery_sessions">Mind Recovery Sessions</option>
                    <option value="emotional_notes">Emotional Notes</option>
                    <option value="user_progress">User Progress</option>
                    <option value="questionnaires">Questionnaires</option>
                    <option value="self_assessments">Self Assessments</option>
                    <option value="onboarding_progress">Onboarding Progress</option>
                    <option value="all">⚠️ ALL DATA (DANGEROUS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Code</label>
                  <input
                    type="text"
                    value={testForm.confirmationCode}
                    onChange={(e) => setTestForm(prev => ({ ...prev, confirmationCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="CLEAR-DATA-2024"
                  />
                </div>
              </div>
              <p className="text-sm text-orange-700 mb-3">
                ⚠️ Data clearing operations are destructive and cannot be undone. Use with caution in production environments.
              </p>
            </div>

            {/* API Documentation */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📚 Complete Admin API Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">🔐</span>
                    <h4 className="font-semibold text-gray-900">Authentication</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Admin Registration with security keys</li>
                    <li>• Session-based authentication</li>
                    <li>• Role-based access control</li>
                    <li>• Multi-role support (admin, super_admin, moderator)</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">👥</span>
                    <h4 className="font-semibold text-gray-900">User Management</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Paginated user listing with search</li>
                    <li>• Detailed user profile views</li>
                    <li>• Account management (disable/enable)</li>
                    <li>• Progress reset and deletion</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">📊</span>
                    <h4 className="font-semibold text-gray-900">System Statistics</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Dashboard metrics and KPIs</li>
                    <li>• User engagement analytics</li>
                    <li>• Progress distribution data</li>
                    <li>• System health monitoring</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border border-orange-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">🎮</span>
                    <h4 className="font-semibold text-gray-900">Session Management</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Advanced session controls</li>
                    <li>• Progress manipulation tools</li>
                    <li>• Stage unlocking capabilities</li>
                    <li>• Session simulation features</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-lg border border-pink-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">🎯</span>
                    <h4 className="font-semibold text-gray-900">Stage Control</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Individual stage management</li>
                    <li>• Progress reset capabilities</li>
                    <li>• Time manipulation for testing</li>
                    <li>• All 6 stages supported</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-lg border border-red-200">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">🗑️</span>
                    <h4 className="font-semibold text-gray-900">Data Management</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Selective data clearing</li>
                    <li>• Confirmation code protection</li>
                    <li>• Audit trail logging</li>
                    <li>• Bulk operations support</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🔗 API Endpoints Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                  <div>POST /api/admin/auth/register</div>
                  <div>POST /api/admin/auth/login</div>
                  <div>GET /api/admin/users</div>
                  <div>GET /api/admin/users/[userId]</div>
                  <div>POST /api/admin/users/manage</div>
                  <div>GET /api/admin/stats</div>
                  <div>POST /api/admin/sessions/manage</div>
                  <div>POST /api/admin/stages/manage</div>
                  <div>POST /api/admin/data/clear</div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  All endpoints include comprehensive error handling, validation, and audit logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}