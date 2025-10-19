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
    if (!gender || !nationality || !currentCountry || !Number.isFinite(age) || age < 13) {
      setError('Please fill in all fields and ensure age is 13 or older')
      return
    }

    setLoading(true)
    try {
      // Create or update personal info
      const response = await fetch('/api/user/personal-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, gender, nationality, country: currentCountry })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data?.message || 'Failed to save personal information')
        setLoading(false)
        return
      }

      router.push('/home')
    } catch (err: unknown) {
      // Prefer a safe message and log the actual error for debugging
      console.error('Personal info save error', err)
      setError('Failed to save personal information')
    } finally {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full mb-4 shadow-lg">
            <UserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Personal Information</h1>
          <p className="text-sm sm:text-base text-gray-600">Help us personalize your experience</p>
        </div>

        <div className="space-y-4">
          {/* Age Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
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
              className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg"
            />
          </div>

          {/* Gender Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base text-gray-600 transition-all duration-200 cursor-pointer focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Nationality
            </label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base text-gray-600 transition-all duration-200 cursor-pointer focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Current Country
            </label>
            <select
              value={currentCountry}
              onChange={(e) => setCurrentCountry(e.target.value)}
              className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base text-gray-600 transition-all duration-200 cursor-pointer focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg"
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
          <div className="p-3 mt-5 text-sm text-center text-red-600 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Button Group */}
        <div className="flex gap-3 mt-6 sm:mt-8">
          <button
            onClick={handleBack}
            className="flex-1 p-3 sm:p-4 text-sm sm:text-base font-semibold text-indigo-600 transition-all duration-200 bg-white border-2 border-indigo-500 rounded-xl hover:bg-indigo-50 hover:shadow-lg flex items-center justify-center gap-2"
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
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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