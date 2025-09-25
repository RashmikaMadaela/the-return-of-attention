export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            The Return of Attention
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600">
            A PAHM methodology meditation application
          </p>
          <p className="text-lg mb-8 text-gray-500">
            API Testing Interface - Development Mode
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Authentication APIs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Authentication APIs</h2>
            <p className="text-gray-600 mb-6">Test user registration, sign in, and password reset functionality.</p>
            
            <div className="space-y-3">
              <a
                href="/register"
                className="block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                📝 Test Registration API
              </a>
              
              <a
                href="/signin"
                className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                🔐 Test Sign In API
              </a>
              
              <a
                href="/reset-password"
                className="block w-full bg-orange-600 text-white text-center py-3 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                🔄 Test Password Reset API
              </a>
              
              <a
                href="/resend-verification"
                className="block w-full bg-yellow-600 text-white text-center py-3 px-4 rounded-md hover:bg-yellow-700 transition-colors"
              >
                📧 Resend Email Verification
              </a>
              
              <a
                href="/email-verification-test"
                className="block w-full bg-purple-600 text-white text-center py-3 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                🧪 Email Verification Workflow Test
              </a>
            </div>
          </div>

          {/* User Management APIs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">User Management APIs</h2>
            <p className="text-gray-600 mb-6">Test profile management, personal info, preferences, and password changes.</p>
            
            <div className="space-y-3">
              <a
                href="/dashboard"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                👤 User Dashboard (Requires Auth)
              </a>
              
              <div className="text-sm text-gray-500 mt-4">
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Profile information management</li>
                  <li>Personal details (age, gender, etc.)</li>
                  <li>User preferences settings</li>
                  <li>Password change functionality</li>
                  <li>Real-time API response display</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Testing Interface */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">API Testing Interface</h2>
            <p className="text-gray-600 mb-6">Advanced testing interface for all API endpoints with request/response inspection.</p>
            
            <div className="space-y-3">
              <a
                href="/api-testing"
                className="block w-full bg-purple-600 text-white text-center py-3 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                🧪 Advanced API Tester
              </a>
              
              <div className="text-sm text-gray-500 mt-4">
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Test all endpoints in one interface</li>
                  <li>Pre-filled sample payloads</li>
                  <li>JSON request/response viewer</li>
                  <li>HTTP status code display</li>
                  <li>Error debugging information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">API Implementation Status</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">✅ Completed APIs</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• POST /api/auth/register - User registration</li>
                <li>• POST /api/auth/reset-password - Password reset</li>
                <li>• GET /api/user/profile - Get user profile</li>
                <li>• PUT /api/user/profile - Update user profile</li>
                <li>• GET /api/user/personal-info - Get personal info</li>
                <li>• POST /api/user/personal-info - Create personal info</li>
                <li>• PUT /api/user/personal-info - Update personal info</li>
                <li>• GET /api/user/preferences - Get user preferences</li>
                <li>• PUT /api/user/preferences - Update preferences</li>
                <li>• PUT /api/user/change-password - Change password</li>
                <li>• DELETE /api/user/delete-account - Delete account</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">🔧 Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Session-based authentication</li>
                <li>• Input validation with Zod schemas</li>
                <li>• Rate limiting protection</li>
                <li>• Comprehensive error handling</li>
                <li>• Database transactions</li>
                <li>• Password hashing with bcrypt</li>
                <li>• Real-time form validation</li>
                <li>• Responsive UI components</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-yellow-800">🧪 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Start by creating a new account using the Registration API</li>
            <li>Sign in with your credentials using the Sign In API</li>
            <li>Access the User Dashboard to test all user management features</li>
            <li>Try updating your profile, personal info, and preferences</li>
            <li>Test the password change functionality</li>
            <li>Check the network tab in browser dev tools to see API responses</li>
          </ol>
        </div>
      </div>
    </main>
  )
}