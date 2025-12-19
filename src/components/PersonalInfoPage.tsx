'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircle, Calendar, Users, Globe, MapPin, ArrowRight, ArrowLeft } from 'lucide-react'
import { NATIONALITIES } from '@/lib/constants/nationalities'

export default function PersonalInfoPage() {
  const router = useRouter()
  const [age, setAge] = useState<number>(18)
  const [gender, setGender] = useState('')
  const [nationality, setNationality] = useState('')
  const [currentCountry, setCurrentCountry] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFinishUp = async () => {
    setError('')
    
    // Comprehensive validation matching backend schema
    // Backend expects: age (13-120), gender (enum), nationality (min 1), country (min 1)
    
    if (!gender) {
      setError('Please select your gender')
      return
    }
    
    // Validate gender enum matches backend
    if (!['male', 'female', 'other', 'prefer-not-to-say'].includes(gender)) {
      setError('Please select a valid gender option')
      return
    }
    
    if (!nationality) {
      setError('Please select your nationality')
      return
    }
    
    if (nationality.length < 2) {
      setError('Nationality must be at least 2 characters')
      return
    }
    
    if (nationality.length > 100) {
      setError('Nationality cannot exceed 100 characters')
      return
    }
    
    if (!currentCountry) {
      setError('Please select your current country')
      return
    }
    
    if (currentCountry.length < 2) {
      setError('Country must be at least 2 characters')
      return
    }
    
    if (currentCountry.length > 100) {
      setError('Country cannot exceed 100 characters')
      return
    }
    
    if (!Number.isFinite(age)) {
      setError('Please enter a valid age')
      return
    }
    
    // Backend validation: min 13, max 120
    if (age < 13) {
      setError('Must be at least 13 years old')
      return
    }
    
    if (age > 120) {
      setError('Age cannot exceed 120')
      return
    }

    setLoading(true)
    try {
      // Create or update personal info (using POST as per implementation)
      const response = await fetch('/api/user/personal-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, gender, nationality, country: currentCountry })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific backend error responses
        let errorMessage = 'Failed to save your information. Please try again.'
        
        if (response.status === 401) {
          // UNAUTHORIZED - session expired
          errorMessage = 'Your session has expired. Please sign in again.'
          setTimeout(() => router.push('/signin'), 2000)
        } else if (response.status === 400) {
          // VALIDATION_ERROR - backend validation failed
          if (data.errors && Array.isArray(data.errors)) {
            // Show first validation error
            const firstError = data.errors[0]
            if (firstError?.message) {
              errorMessage = firstError.message
            }
          } else if (data.message) {
            errorMessage = data.message
          } else {
            errorMessage = 'Validation failed. Please check your information.'
          }
        } else if (response.status === 404) {
          // USER_NOT_FOUND
          errorMessage = 'User not found. Please sign in again.'
          setTimeout(() => router.push('/signin'), 2000)
        } else if (response.status === 409) {
          // PROFILE_EXISTS - profile already exists, use PUT instead
          // Try updating with PUT
          try {
            const updateResponse = await fetch('/api/user/personal-info', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ age, gender, nationality, country: currentCountry })
            })
            
            if (updateResponse.ok) {
              router.push('/home')
              return
            }
            
            const updateData = await updateResponse.json()
            errorMessage = updateData.message || 'Failed to update personal information.'
          } catch (updateErr) {
            errorMessage = 'Failed to update personal information.'
          }
        } else if (response.status === 429) {
          // RATE_LIMIT_EXCEEDED
          errorMessage = data.message || 'Too many requests. Please try again later.'
        } else if (response.status === 500) {
          // INTERNAL_ERROR
          errorMessage = 'Server error. Please try again later.'
        } else if (data.message) {
          errorMessage = data.message
        }
        
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Success - redirect to home
      router.push('/home')
    } catch (err: unknown) {
      console.error('Personal info save error', err)
      
      // Provide specific error messages based on error type
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.')
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/signup')
  }

  // List of countries for the dropdown
  const COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador",
    "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland",
    "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
    "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
    "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
    "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
    "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
    "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
    "Zambia", "Zimbabwe", "Other"
  ];

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 sm:p-6">
      <div className="w-full max-w-md p-6 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl sm:p-10">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-lg sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-pink-500">
            <UserCircle className="w-8 h-8 text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">Personal Information</h1>
          <p className="text-sm text-gray-600 sm:text-base">Help us personalize your experience</p>
        </div>

        <div className="space-y-4">
          {/* Age Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <Calendar className="inline w-4 h-4 mr-1" />
              Age
            </label>
            <input
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              min={13}
              max={120}
              step={1}
              className="w-full p-3 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg"
            />
          </div>

          {/* Gender Dropdown */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <Users className="inline w-4 h-4 mr-1" />
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 text-sm text-gray-600 transition-all duration-200 border-2 border-gray-200 cursor-pointer sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg"
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Nationality Dropdown */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <Globe className="inline w-4 h-4 mr-1" />
              Nationality
            </label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full p-3 text-sm text-gray-600 transition-all duration-200 border-2 border-gray-200 cursor-pointer sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg"
            >
              <option value="">Select your nationality</option>
              {NATIONALITIES.map((nat) => (
                <option key={nat} value={nat}>
                  {nat}
                </option>
              ))}
            </select>
          </div>

          {/* Current Country Dropdown */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <MapPin className="inline w-4 h-4 mr-1" />
              Current Country
            </label>
            <select
              value={currentCountry}
              onChange={(e) => setCurrentCountry(e.target.value)}
              className="w-full p-3 text-sm text-gray-600 transition-all duration-200 border-2 border-gray-200 cursor-pointer sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg"
            >
              <option value="">Select your current country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 p-3 mt-5 text-sm text-center text-red-600 border border-red-200 rounded-xl bg-red-50">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Button Group */}
        <div className="flex gap-3 mt-6 sm:mt-8">
          <button
            onClick={handleBack}
            className="flex items-center justify-center flex-1 gap-2 p-3 text-sm font-semibold text-indigo-600 transition-all duration-200 bg-white border-2 border-indigo-500 sm:p-4 sm:text-base rounded-xl hover:bg-indigo-50 hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            BACK
          </button>
          <button
            onClick={handleFinishUp}
            disabled={loading}
            className="flex-1 p-3 sm:p-4 text-sm sm:text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                SAVING...
              </>
            ) : (
              <>
                FINISH UP
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}