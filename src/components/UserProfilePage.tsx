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
import { useToast } from '@/hooks/useToast'

export default function UserProfilePageOptimized() {
  const router = useRouter()
  const { data: profileData, error, isLoading, isValidating, mutate } = useUserProfile()
  const { showSuccess, showError, showInfo, ToastContainer } = useToast()
  
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-blue-300">
        <div className="max-w-md p-8 text-center bg-white shadow-2xl rounded-3xl">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Failed to Load Profile</h2>
          <p className="mb-6 text-gray-600">
            We encountered an error loading your profile. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 font-bold text-white transition-colors bg-blue-600 hover:bg-blue-700 rounded-xl"
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
          showInfo('Your email has been updated successfully. Please log in again with your new email.')
          setTimeout(() => {
            localStorage.clear()
            sessionStorage.clear()
            router.push('/signin')
          }, 2000)
          return
        }

        // Revalidate from server to ensure consistency
        await mutate()
        
        setIsEditing(false)
        setSaveError('')
        showSuccess('Profile updated successfully!')
      } else {
        // Revert optimistic update on error
        await mutate()
        setSaveError(result.error || 'Failed to update profile')
        showError(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      // Revert optimistic update on error
      await mutate()
      setSaveError('Failed to update profile. Please try again.')
      showError('Failed to update profile. Please try again.')
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
      <ToastContainer />
      {/* Background refresh indicator */}
      {isValidating && !isSaving && (
        <div className="fixed z-50 px-4 py-2 text-white bg-blue-500 rounded-lg shadow-lg top-20 right-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navigation currentPage="profile" />
      
      <div className="p-8 pt-24">
        <div className="p-8 mx-auto shadow-2xl max-w-7xl bg-gradient-to-b from-blue-700 to-blue-600 rounded-3xl">
          {/* Error Message */}
          {saveError && (
            <div className="px-4 py-3 mb-6 text-center text-red-700 bg-red-100 border border-red-400 rounded-lg">
              {saveError}
            </div>
          )}

          {/* Header */}
          <div className="flex justify-end gap-4 mb-8">
            {userProfile.role === 'admin' && (
              <button 
                onClick={handleAdmin}
                className="px-6 py-3 font-bold text-black transition-colors bg-yellow-400 hover:bg-yellow-500 rounded-xl"
              >
                ADMIN
              </button>
            )}
            <button 
              onClick={handleBack}
              className="px-6 py-3 font-bold text-blue-600 transition-colors bg-white hover:bg-gray-100 rounded-xl"
            >
              ← Back
            </button>
            <button 
              onClick={handlePrivacy}
              className="px-6 py-3 font-bold text-white transition-colors bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Privacy
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Panel - User Information */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-6 bg-blue-600 shadow-lg rounded-3xl">
                <div className="flex justify-center mb-6">
                  <div className="flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg">
                    <User className="w-20 h-20 text-blue-600" />
                  </div>
                </div>

                <div className="p-6 space-y-6 bg-white rounded-2xl">
                  <div className="pb-3 text-center border-b-4 border-blue-500">
                    <h1 className="text-3xl font-bold text-gray-800">Hello {userProfile.name}</h1>
                  </div>

                  {/* User Details */}
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 pl-4 border-l-4 border-blue-500">
                        <span className="font-semibold text-gray-700">Email :</span>
                        <span className="text-gray-800">{userProfile.email}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 pl-4 border-l-4 border-blue-500">
                        <span className="font-semibold text-gray-700">Age :</span>
                        <span className="text-gray-800">{userProfile.age}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 pl-4 border-l-4 border-blue-500">
                        <span className="font-semibold text-gray-700">Gender :</span>
                        <span className="text-gray-800">{userProfile.gender}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 pl-4 border-l-4 border-blue-500">
                        <span className="font-semibold text-gray-700">Nationality :</span>
                        <span className="text-gray-800">{userProfile.nationality}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 pl-4 border-l-4 border-blue-500">
                        <span className="font-semibold text-gray-700">Current Country :</span>
                        <span className="text-gray-800">{userProfile.currentCountry}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div className="py-2 pl-4 border-l-4 border-blue-500">
                        <span className="block mb-2 font-semibold text-gray-700">Name <span className="text-red-500">*</span>:</span>
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
                      <div className="py-2 pl-4 border-l-4 border-blue-500">
                        <span className="block mb-2 font-semibold text-gray-700">Email <span className="text-red-500">*</span>:</span>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-orange-600">⚠️ Changing your email will require you to log in again</p>
                      </div>

                      {/* Age Field */}
                      <div className="py-2 pl-4 border-l-4 border-blue-500">
                        <span className="block mb-2 font-semibold text-gray-700">Age <span className="text-red-500">*</span>:</span>
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
                      <div className="py-2 pl-4 border-l-4 border-blue-500">
                        <span className="block mb-2 font-semibold text-gray-700">Gender :</span>
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
                      <div className="py-2 pl-4 border-l-4 border-blue-500">
                        <span className="block mb-2 font-semibold text-gray-700">Nationality :</span>
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
                      <div className="py-2 pl-4 border-l-4 border-blue-500">
                        <span className="block mb-2 font-semibold text-gray-700">Current Country :</span>
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

                  <div className="flex items-center justify-between pt-4">
                    <button 
                      onClick={handleLogout}
                      className="px-8 py-3 font-bold text-white transition-colors bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                      Log Out
                    </button>
                    {!isEditing ? (
                      <button 
                        onClick={handleEditToggle}
                        className="font-semibold text-blue-500 underline hover:text-blue-600"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button 
                          onClick={handleEditToggle}
                          disabled={isSaving}
                          className="font-semibold text-gray-500 underline hover:text-gray-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-6 py-2 font-bold text-white transition-colors bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-xl"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
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
              <div className="p-8 bg-white shadow-lg rounded-3xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 text-center bg-gray-50 rounded-2xl">
                    <div className="mb-2 text-6xl font-bold text-blue-600">{userProfile.happiness}</div>
                    <div className="text-lg font-semibold text-gray-700">Happiness</div>
                  </div>

                  <div className="p-6 text-center bg-gray-50 rounded-2xl">
                    <div className="mb-2 text-6xl font-bold text-blue-600">{userProfile.sessions}</div>
                    <div className="text-lg font-semibold text-gray-700">Sessions</div>
                  </div>

                  <div className="p-6 text-center bg-gray-50 rounded-2xl">
                    <div className="mb-2 text-lg font-bold text-center text-blue-600 break-words">{userProfile.userLevel}</div>
                    <div className="text-lg font-semibold text-gray-700">User Level</div>
                  </div>

                  <div className="p-6 text-center bg-gray-50 rounded-2xl">
                    <div className="mb-2 text-6xl font-bold text-blue-600">{userProfile.hours}</div>
                    <div className="text-lg font-semibold text-gray-700">Hours</div>
                  </div>
                </div>
              </div>

              {/* Completion Status */}
              <div className="p-8 bg-white shadow-lg rounded-3xl">
                <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">Completion Status</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
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

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
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
