'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLoginResponse {
  success: boolean;
  message?: string;
  data?: {
    adminId: string;
    userId: string;
    role: string;
    permissions: string[];
    user: {
      email: string;
      name: string;
    };
  };
  error?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminData, setAdminData] = useState<AdminLoginResponse['data'] | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin',
    registrationKey: 'admin-registration-2024',
  });

  // Check if already logged in
  useEffect(() => {
    const storedAdminData = localStorage.getItem('adminData');
    if (storedAdminData) {
      try {
        setAdminData(JSON.parse(storedAdminData));
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        localStorage.removeItem('adminData');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: AdminLoginResponse = await response.json();

      if (data.success && data.data) {
        setSuccess('Login successful! Welcome to the admin panel.');
        setAdminData(data.data);
        localStorage.setItem('adminData', JSON.stringify(data.data));
        
        // Redirect to admin testing interface after a short delay
        setTimeout(() => {
          router.push('/admin-apis-testing');
        }, 2000);
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Admin account created successfully! You can now login.');
        setShowRegisterForm(false);
        setFormData({ email: registerData.email, password: registerData.password });
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminData(null);
    localStorage.removeItem('adminData');
    setSuccess('Logged out successfully.');
  };

  // If already logged in, show admin dashboard
  if (adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg">
            <div className="px-6 py-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🛡️ Admin Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                  Welcome back, {adminData.user.name}!
                </p>
              </div>

              {/* Admin Info Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Admin Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {adminData.user.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {adminData.user.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {adminData.role}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin ID</label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border font-mono">
                      {adminData.adminId}
                    </p>
                  </div>
                </div>
                
                {/* Permissions */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {adminData.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {permission}
                      </span>
                    ))}
                    {adminData.permissions.length === 0 && (
                      <span className="text-sm text-gray-500">No specific permissions set</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => router.push('/admin-apis-testing')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  🛠️ Open API Testing Suite
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  🚪 Logout
                </button>
              </div>

              {/* Quick Stats Preview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Admin Tools Available</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">9</div>
                    <div className="text-sm text-gray-600">Admin APIs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm text-gray-600">Authentication</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">🛡️</div>
                    <div className="text-sm text-gray-600">Role-Based Access</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">📋</div>
                    <div className="text-sm text-gray-600">Audit Logging</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-xl rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🛡️ Admin Login
              </h1>
              <p className="text-sm text-gray-600">
                Access the admin panel for The Return of Attention
              </p>
            </div>

            {/* Toggle between Login and Register */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
                <button
                  onClick={() => setShowRegisterForm(false)}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-all ${
                    !showRegisterForm
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-all ${
                    showRegisterForm
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            {!showRegisterForm ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your admin password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Admin Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a secure password"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-role" className="block text-sm font-medium text-gray-700">
                      Admin Role
                    </label>
                    <select
                      id="reg-role"
                      value={registerData.role}
                      onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reg-key" className="block text-sm font-medium text-gray-700">
                      Registration Key
                    </label>
                    <input
                      id="reg-key"
                      type="text"
                      required
                      value={registerData.registrationKey}
                      onChange={(e) => setRegisterData({ ...registerData, registrationKey: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin-registration-2024"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Contact system administrator for the registration key
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Creating Account...' : 'Create Admin Account'}
                </button>
              </form>
            )}

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Demo Credentials</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Email:</strong> admin@example.com</p>
                  <p><strong>Default Registration Key:</strong> admin-registration-2024</p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Create an admin account first if you haven't already, then use those credentials to login.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}