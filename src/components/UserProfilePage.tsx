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
      
      <div className="p-3 pt-20 sm:p-6 sm:pt-24 md:p-8">
        <div className="p-4 mx-auto shadow-2xl sm:p-6 md:p-8 max-w-7xl bg-gradient-to-b from-blue-700 to-blue-600 rounded-2xl sm:rounded-3xl">
          {/* Error Message */}
          {saveError && (
            <div className="px-3 py-2 mb-4 text-sm text-center text-red-700 bg-red-100 border border-red-400 rounded-lg sm:px-4 sm:py-3 sm:mb-6 sm:text-base">
              {saveError}
            </div>
          )}

          {/* Header */}
          <div className="flex justify-end gap-2 mb-4 sm:gap-3 md:gap-4 sm:mb-6 md:mb-8">
            {userProfile.role === 'admin' && (
              <button 
                onClick={handleAdmin}
                className="px-3 py-2 text-xs font-bold text-black transition-colors bg-yellow-400 sm:px-4 sm:py-2 md:px-6 md:py-3 hover:bg-yellow-500 rounded-lg sm:rounded-xl sm:text-sm md:text-base"
              >
                ADMIN
              </button>
            )}
            <button 
              onClick={handleBack}
              className="px-3 py-2 text-xs font-bold text-blue-600 transition-colors bg-white sm:px-4 sm:py-2 md:px-6 md:py-3 hover:bg-gray-100 rounded-lg sm:rounded-xl sm:text-sm md:text-base"
            >
              ← Back
            </button>
            <button 
              onClick={handlePrivacy}
              className="px-3 py-2 text-xs font-bold text-white transition-colors bg-blue-600 sm:px-4 sm:py-2 md:px-6 md:py-3 hover:bg-blue-700 rounded-lg sm:rounded-xl sm:text-sm md:text-base"
            >
              Privacy
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
            {/* Left Panel - User Information */}
            <div className="space-y-4 sm:space-y-6">
              {/* Profile Card */}
              <div className="p-4 bg-blue-600 shadow-lg sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="flex items-center justify-center bg-white rounded-full shadow-lg w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
                    <User className="w-12 h-12 text-blue-600 sm:w-16 sm:h-16 md:w-20 md:h-20" />
                  </div>
                </div>

                <div className="p-4 space-y-4 bg-white sm:p-5 md:p-6 sm:space-y-5 md:space-y-6 rounded-xl sm:rounded-2xl">
                  <div className="pb-2 text-center border-b-2 sm:pb-3 sm:border-b-4 border-blue-500">
                    <h1 className="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">Hello {userProfile.name}</h1>
                  </div>

                  {/* User Details */}
                  {!isEditing ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="text-sm font-semibold text-gray-700 sm:text-base">Email :</span>
                        <span className="text-sm text-gray-800 sm:text-base">{userProfile.email}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="text-sm font-semibold text-gray-700 sm:text-base">Age :</span>
                        <span className="text-sm text-gray-800 sm:text-base">{userProfile.age}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="text-sm font-semibold text-gray-700 sm:text-base">Gender :</span>
                        <span className="text-sm text-gray-800 sm:text-base">{userProfile.gender}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="text-sm font-semibold text-gray-700 sm:text-base">Nationality :</span>
                        <span className="text-sm text-gray-800 sm:text-base">{userProfile.nationality}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="text-sm font-semibold text-gray-700 sm:text-base">Current Country :</span>
                        <span className="text-sm text-gray-800 sm:text-base">{userProfile.currentCountry}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Name Field */}
                      <div className="py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="block mb-1 text-sm font-semibold text-gray-700 sm:mb-2 sm:text-base">Name <span className="text-red-500">*</span>:</span>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="block mb-1 text-sm font-semibold text-gray-700 sm:mb-2 sm:text-base">Email <span className="text-red-500">*</span>:</span>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-orange-600 sm:text-sm">⚠️ Changing your email will require you to log in again</p>
                      </div>

                      {/* Age Field */}
                      <div className="py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="block mb-1 text-sm font-semibold text-gray-700 sm:mb-2 sm:text-base">Age <span className="text-red-500">*</span>:</span>
                        <input
                          type="number"
                          value={editForm.age}
                          onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                          placeholder="Enter your age (13-120)"
                          min="13"
                          max="120"
                          required
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Gender Field */}
                      <div className="py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="block mb-1 text-sm font-semibold text-gray-700 sm:mb-2 sm:text-base">Gender :</span>
                        <select
                          value={editForm.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      {/* Nationality Field */}
                      <div className="py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="block mb-1 text-sm font-semibold text-gray-700 sm:mb-2 sm:text-base">Nationality :</span>
                        <select
                          value={editForm.nationality}
                          onChange={(e) => handleInputChange('nationality', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <div className="py-2 pl-3 border-l-2 sm:pl-4 sm:border-l-4 border-blue-500">
                        <span className="block mb-1 text-sm font-semibold text-gray-700 sm:mb-2 sm:text-base">Current Country :</span>
                        <select
                          value={editForm.currentCountry}
                          onChange={(e) => handleInputChange('currentCountry', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div className="flex items-center justify-between pt-3 sm:pt-4">
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 text-xs font-bold text-white transition-colors bg-blue-600 sm:px-6 sm:py-2 md:px-8 md:py-3 hover:bg-blue-700 rounded-lg sm:rounded-xl sm:text-sm md:text-base"
                    >
                      Log Out
                    </button>
                    {!isEditing ? (
                      <button 
                        onClick={handleEditToggle}
                        className="text-sm font-semibold text-blue-500 underline sm:text-base hover:text-blue-600"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2 sm:gap-3">
                        <button 
                          onClick={handleEditToggle}
                          disabled={isSaving}
                          className="text-sm font-semibold text-gray-500 underline sm:text-base hover:text-gray-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition-colors bg-green-600 sm:px-5 sm:py-2 md:px-6 hover:bg-green-700 disabled:bg-gray-400 rounded-lg sm:rounded-xl sm:text-sm md:text-base"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white rounded-full sm:w-4 sm:h-4 animate-spin border-t-transparent"></div>
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
            <div className="space-y-4 sm:space-y-6">
              {/* Stats Grid */}
              <div className="p-4 bg-white shadow-lg sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="p-3 text-center bg-gray-50 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
                    <div className="mb-1 text-3xl font-bold text-blue-600 sm:text-4xl md:text-5xl lg:text-6xl sm:mb-2">{userProfile.happiness}</div>
                    <div className="text-xs font-semibold text-gray-700 sm:text-sm md:text-base lg:text-lg">Happiness</div>
                  </div>

                  <div className="p-3 text-center bg-gray-50 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
                    <div className="mb-1 text-3xl font-bold text-blue-600 sm:text-4xl md:text-5xl lg:text-6xl sm:mb-2">{userProfile.sessions}</div>
                    <div className="text-xs font-semibold text-gray-700 sm:text-sm md:text-base lg:text-lg">Sessions</div>
                  </div>

                  <div className="p-3 text-center bg-gray-50 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
                    <div className="mb-1 text-sm font-bold text-center text-blue-600 break-words sm:text-base md:text-lg sm:mb-2">{userProfile.userLevel}</div>
                    <div className="text-xs font-semibold text-gray-700 sm:text-sm md:text-base lg:text-lg">User Level</div>
                  </div>

                  <div className="p-3 text-center bg-gray-50 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
                    <div className="mb-1 text-3xl font-bold text-blue-600 sm:text-4xl md:text-5xl lg:text-6xl sm:mb-2">{userProfile.hours}</div>
                    <div className="text-xs font-semibold text-gray-700 sm:text-sm md:text-base lg:text-lg">Hours</div>
                  </div>
                </div>
              </div>

              {/* Completion Status */}
              <div className="p-4 bg-white shadow-lg sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
                <h2 className="mb-4 text-xl font-bold text-center text-gray-800 sm:mb-5 md:mb-6 sm:text-2xl md:text-3xl">Completion Status</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
                    <span className="text-sm font-semibold text-gray-700 sm:text-base md:text-lg">Questionnaire</span>
                    <button 
                      className={`font-bold px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base ${
                        assessmentStatus.questionnaire 
                          ? 'bg-red-500 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {assessmentStatus.questionnaire ? 'Completed' : 'Complete'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
                    <span className="text-sm font-semibold text-gray-700 sm:text-base md:text-lg">Self Assessment</span>
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
                      className={`font-bold px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity text-xs sm:text-sm md:text-base ${
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
