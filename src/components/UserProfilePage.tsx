/**
 * OPTIMIZED UserProfilePage Implementation
 * 
 * Key improvements:
 * - Uses SWR for automatic caching and instant loads
 * - Loading skeletons instead of empty values
 * - Optimistic UI updates on save
 * - Background revalidation
 * - Better error handling
 */
'use client'

import React, { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ProfilePageSkeleton } from './LoadingSkeletons'

export default function UserProfilePageOptimized() {
  const router = useRouter()
  const { data: profileData, error, isLoading, isValidating, mutate } = useUserProfile()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    age: 0,
    gender: '',
    nationality: '',
    currentCountry: ''
  })

  // Handle authentication error
  useEffect(() => {
    if (error?.message === 'UNAUTHORIZED') {
      router.push('/signin')
    }
  }, [error, router])

  // Initialize edit form when data loads
  useEffect(() => {
    if (profileData) {
      setEditForm({
        name: profileData.name,
        email: profileData.email,
        age: profileData.profile?.age || 0,
        gender: profileData.profile?.gender || '',
        nationality: profileData.profile?.nationality || '',
        currentCountry: profileData.profile?.country || ''
      })
    }
  }, [profileData])

  // Show full skeleton on first load
  if (isLoading) {
    return <ProfilePageSkeleton />
  }

  // Handle errors
  if (error && error.message !== 'UNAUTHORIZED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-300">
        <div className="text-center bg-white rounded-3xl p-8 shadow-2xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Profile</h2>
          <p className="text-gray-600 mb-6">
            We encountered an error loading your profile. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Extract data with safe defaults (now instant from cache on revisit!)
  const userProfile = {
    name: profileData?.name || '',
    email: profileData?.email || '',
    role: profileData?.role || 'user',
    age: profileData?.profile?.age || 0,
    gender: profileData?.profile?.gender || '',
    nationality: profileData?.profile?.nationality || '',
    currentCountry: profileData?.profile?.country || '',
    happiness: profileData?.happiness || 0,
    sessions: profileData?.sessions || 0,
    userLevel: profileData?.userLevel || 'Seeker',
    hours: profileData?.hours || 0
  }

  const assessmentStatus = {
    questionnaire: profileData?.questionnaireCompleted || false,
    selfAssessment: profileData?.selfAssessmentCompleted || false
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to current profile data if canceling
      setEditForm({
        name: userProfile.name,
        email: userProfile.email,
        age: userProfile.age,
        gender: userProfile.gender,
        nationality: userProfile.nationality,
        currentCountry: userProfile.currentCountry
      })
      setSaveError('')
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const validationErrors: string[] = []

    if (!editForm.name || editForm.name.trim().length < 2) {
      validationErrors.push('Name must be at least 2 characters long')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!editForm.email || !emailRegex.test(editForm.email)) {
      validationErrors.push('Please enter a valid email address')
    }

    if (editForm.age < 13 || editForm.age > 120) {
      validationErrors.push('Age must be between 13 and 120 years')
    }

    return validationErrors
  }

  const handleSave = async () => {
    try {
      // Frontend validation
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        setSaveError(validationErrors.join('. '))
        return
      }

      setIsSaving(true)
      setSaveError('')

      // Optimistic update - update UI immediately
      const optimisticData = {
        ...profileData,
        name: editForm.name,
        email: editForm.email,
        profile: {
          ...profileData?.profile,
          age: editForm.age,
          gender: editForm.gender,
          nationality: editForm.nationality,
          country: editForm.currentCountry
        }
      }
      
      // Update cache immediately (optimistic UI)
      await mutate(optimisticData as any, { revalidate: false })
      
      // Update user profile in database
      const response = await fetch('/api/user/profile-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      const result = await response.json()

      if (result.success) {
        // If email was changed, user needs to log in again
        if (result.emailChanged) {
          alert('Your email has been updated successfully. Please log in again with your new email.')
          localStorage.clear()
          sessionStorage.clear()
          router.push('/signin')
          return
        }

        // Revalidate from server to ensure consistency
        await mutate()
        
        setIsEditing(false)
        setSaveError('')
        
        // Show success message
        const successDiv = document.createElement('div')
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
        successDiv.textContent = '✓ Profile updated successfully!'
        document.body.appendChild(successDiv)
        setTimeout(() => {
          if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv)
          }
        }, 3000)
      } else {
        // Revert optimistic update on error
        await mutate()
        setSaveError(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      // Revert optimistic update on error
      await mutate()
      setSaveError('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    router.push('/')
  }

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/home')
    }
  }

  const handleAdmin = () => {
    router.push('/admin/user-progress')
  }

  const handlePrivacy = () => {
    sessionStorage.setItem('previousPage', '/user-profile')
    router.push('/privacy')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-300">
      {/* Background refresh indicator */}
      {isValidating && !isSaving && (
        <div className="fixed top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navigation currentPage="profile" />
      
      <div className="p-8 pt-24">
        <div className="max-w-7xl mx-auto bg-gradient-to-b from-blue-700 to-blue-600 rounded-3xl shadow-2xl p-8">
          {/* Error Message */}
          {saveError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
              {saveError}
            </div>
          )}

          {/* Header */}
          <div className="flex justify-end gap-4 mb-8">
            {userProfile.role === 'admin' && (
              <button 
                onClick={handleAdmin}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl transition-colors"
              >
                ADMIN
              </button>
            )}
            <button 
              onClick={handleBack}
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              ← Back
            </button>
            <button 
              onClick={handlePrivacy}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Privacy
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - User Information */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-blue-600 rounded-3xl p-6 shadow-lg">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-20 h-20 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 space-y-6">
                  <div className="text-center border-b-4 border-blue-500 pb-3">
                    <h1 className="text-3xl font-bold text-gray-800">Hello {userProfile.name}</h1>
                  </div>

                  {/* User Details */}
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700">Email :</span>
                        <span className="text-gray-800">{userProfile.email}</span>
                      </div>

                      <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700">Age :</span>
                        <span className="text-gray-800">{userProfile.age}</span>
                      </div>

                      <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700">Gender :</span>
                        <span className="text-gray-800">{userProfile.gender}</span>
                      </div>

                      <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700">Nationality :</span>
                        <span className="text-gray-800">{userProfile.nationality}</span>
                      </div>

                      <div className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700">Current Country :</span>
                        <span className="text-gray-800">{userProfile.currentCountry}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700 block mb-2">Name <span className="text-red-500">*</span>:</span>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700 block mb-2">Email <span className="text-red-500">*</span>:</span>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-sm text-orange-600 mt-1">⚠️ Changing your email will require you to log in again</p>
                      </div>

                      {/* Age Field */}
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700 block mb-2">Age <span className="text-red-500">*</span>:</span>
                        <input
                          type="number"
                          value={editForm.age}
                          onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                          placeholder="Enter your age (13-120)"
                          min="13"
                          max="120"
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Gender Field */}
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700 block mb-2">Gender :</span>
                        <select
                          value={editForm.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      {/* Nationality Field */}
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700 block mb-2">Nationality :</span>
                        <select
                          value={editForm.nationality}
                          onChange={(e) => handleInputChange('nationality', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Your Country</option>
                          <option value="Afghanistan">Afghanistan</option>
                          <option value="Albania">Albania</option>
                          <option value="Algeria">Algeria</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="India">India</option>
                          <option value="China">China</option>
                          <option value="Japan">Japan</option>
                          {/* Add all other countries... */}
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Current Country Field */}
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <span className="font-semibold text-gray-700 block mb-2">Current Country :</span>
                        <select
                          value={editForm.currentCountry}
                          onChange={(e) => handleInputChange('currentCountry', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Your Country</option>
                          <option value="Afghanistan">Afghanistan</option>
                          <option value="Albania">Albania</option>
                          <option value="Algeria">Algeria</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="India">India</option>
                          <option value="China">China</option>
                          <option value="Japan">Japan</option>
                          {/* Add all other countries... */}
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={handleLogout}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                    >
                      Log Out
                    </button>
                    {!isEditing ? (
                      <button 
                        onClick={handleEditToggle}
                        className="text-blue-500 hover:text-blue-600 font-semibold underline"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button 
                          onClick={handleEditToggle}
                          disabled={isSaving}
                          className="text-gray-500 hover:text-gray-600 font-semibold underline disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold px-6 py-2 rounded-xl transition-colors flex items-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Stats and Status */}
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-2">{userProfile.happiness}</div>
                    <div className="text-lg font-semibold text-gray-700">Happiness</div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-2">{userProfile.sessions}</div>
                    <div className="text-lg font-semibold text-gray-700">Sessions</div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <div className="text-lg font-bold text-blue-600 mb-2 text-center break-words">{userProfile.userLevel}</div>
                    <div className="text-lg font-semibold text-gray-700">User Level</div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-2">{userProfile.hours}</div>
                    <div className="text-lg font-semibold text-gray-700">Hours</div>
                  </div>
                </div>
              </div>

              {/* Completion Status */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Completion Status</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6">
                    <span className="text-lg font-semibold text-gray-700">Questionnaire</span>
                    <button 
                      className={`font-bold px-6 py-2 rounded-xl ${
                        assessmentStatus.questionnaire 
                          ? 'bg-red-500 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {assessmentStatus.questionnaire ? 'Completed' : 'Complete'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6">
                    <span className="text-lg font-semibold text-gray-700">Self Assessment</span>
                    <button 
                      onClick={() => {
                        if (assessmentStatus.selfAssessment) {
                          sessionStorage.setItem('previousPage', '/user-profile')
                          router.push('/self-assessment/stats')
                        } else {
                          sessionStorage.setItem('previousPage', '/user-profile')
                          router.push('/self-assessment')
                        }
                      }}
                      className={`font-bold px-6 py-2 rounded-xl hover:opacity-90 transition-opacity ${
                        assessmentStatus.selfAssessment 
                          ? 'bg-red-500 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {assessmentStatus.selfAssessment ? 'Completed' : 'Complete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
