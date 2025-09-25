'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

type UserProfile = {
  id: string
  name: string | null
  email: string
  image: string | null
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

type PersonalInfo = {
  age: number | null
  gender: string | null
  nationality: string | null
  country: string | null
}

type UserPreferences = {
  emailNotifications: boolean
  theme: string
  language: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    image: ''
  })
  const [personalInfoForm, setPersonalInfoForm] = useState({
    age: '',
    gender: '',
    nationality: '',
    country: ''
  })
  const [preferencesForm, setPreferencesForm] = useState({
    emailNotifications: true,
    theme: 'light',
    language: 'en'
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (session) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch profile
      const profileRes = await fetch('/api/user/profile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.data)
        setProfileForm({
          name: profileData.data.name || '',
          image: profileData.data.image || ''
        })
      }

      // Fetch personal info
      const personalRes = await fetch('/api/user/personal-info')
      if (personalRes.ok) {
        const personalData = await personalRes.json()
        setPersonalInfo(personalData.data)
        setPersonalInfoForm({
          age: personalData.data.age?.toString() || '',
          gender: personalData.data.gender || '',
          nationality: personalData.data.nationality || '',
          country: personalData.data.country || ''
        })
      }

      // Fetch preferences
      const prefsRes = await fetch('/api/user/preferences')
      if (prefsRes.ok) {
        const prefsData = await prefsRes.json()
        setPreferences(prefsData.data)
        setPreferencesForm(prefsData.data)
      }
    } catch (err) {
      setError('Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })

      const data = await response.json()
      if (response.ok) {
        setProfile(data.data)
        setSuccess('Profile updated successfully!')
      } else {
        setError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error occurred')
    }
  }

  const updatePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      ...personalInfoForm,
      age: personalInfoForm.age ? parseInt(personalInfoForm.age) : null
    }

    try {
      const method = personalInfo ? 'PUT' : 'POST'
      const response = await fetch('/api/user/personal-info', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (response.ok) {
        setPersonalInfo(data.data)
        setSuccess('Personal info updated successfully!')
      } else {
        setError(data.message || 'Failed to update personal info')
      }
    } catch (err) {
      setError('Network error occurred')
    }
  }

  const updatePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencesForm)
      })

      const data = await response.json()
      if (response.ok) {
        setPreferences(data.data)
        setSuccess('Preferences updated successfully!')
      } else {
        setError(data.message || 'Failed to update preferences')
      }
    } catch (err) {
      setError('Network error occurred')
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm)
      })

      const data = await response.json()
      if (response.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setSuccess('Password changed successfully!')
      } else {
        setError(data.message || 'Failed to change password')
      }
    } catch (err) {
      setError('Network error occurred')
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You need to be signed in to view this page.</p>
          <a href="/signin" className="text-indigo-600 hover:text-indigo-500">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading user data...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Dashboard</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-8">
              {/* Profile Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                      <input
                        type="url"
                        value={profileForm.image}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, image: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Update Profile
                  </button>
                </form>
                
                {profile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(profile, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Personal Info Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                <form onSubmit={updatePersonalInfo} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age</label>
                      <input
                        type="number"
                        min="13"
                        max="120"
                        value={personalInfoForm.age}
                        onChange={(e) => setPersonalInfoForm(prev => ({ ...prev, age: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        value={personalInfoForm.gender}
                        onChange={(e) => setPersonalInfoForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non_binary">Non-binary</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nationality</label>
                      <input
                        type="text"
                        value={personalInfoForm.nationality}
                        onChange={(e) => setPersonalInfoForm(prev => ({ ...prev, nationality: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        value={personalInfoForm.country}
                        onChange={(e) => setPersonalInfoForm(prev => ({ ...prev, country: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    {personalInfo ? 'Update' : 'Create'} Personal Info
                  </button>
                </form>
                
                {personalInfo && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(personalInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Preferences Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
                <form onSubmit={updatePreferences} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferencesForm.emailNotifications}
                          onChange={(e) => setPreferencesForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                          className="mr-2"
                        />
                        Email Notifications
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Theme</label>
                      <select
                        value={preferencesForm.theme}
                        onChange={(e) => setPreferencesForm(prev => ({ ...prev, theme: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <select
                        value={preferencesForm.language}
                        onChange={(e) => setPreferencesForm(prev => ({ ...prev, language: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Update Preferences
                  </button>
                </form>
                
                {preferences && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(preferences, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Password Change Section */}
              <div className="pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={changePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}