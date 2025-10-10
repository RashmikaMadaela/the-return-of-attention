'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

export default function AdminUserProgressPage() {
  const router = useRouter()
  
  const [stats, setStats] = useState([
    {
      id: 1,
      icon: '🔥',
      number: 67,
      label: 'Practice Sessions',
      subtitle: 'ALL users in database',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 2,
      icon: '🌱',
      number: 5,
      label: 'Mind Recovery Sessions',
      subtitle: 'ALL users in database',
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      id: 3,
      icon: '📝',
      number: 132,
      label: 'Daily Emotional Notes',
      subtitle: 'ALL users in database',
      gradient: 'from-orange-500 to-orange-700'
    },
    {
      id: 4,
      icon: '📊',
      number: 5,
      label: 'User Progress',
      subtitle: 'ALL users in database',
      gradient: 'from-green-500 to-green-700'
    },
    {
      id: 5,
      icon: '👥',
      number: 11,
      label: 'Users',
      subtitle: 'ALL users in database',
      gradient: 'from-pink-500 to-pink-700'
    },
    {
      id: 6,
      icon: '📋',
      number: 7,
      label: 'Questionnaires',
      subtitle: 'FIXED: Unique users count',
      gradient: 'from-cyan-500 to-cyan-700'
    },
    {
      id: 7,
      icon: '🔍',
      number: 7,
      label: 'Self Assessments',
      subtitle: 'FIXED: Unique users count',
      gradient: 'from-lime-500 to-lime-700'
    },
    {
      id: 8,
      icon: '📈',
      number: 15,
      label: 'Onboarding Progress',
      subtitle: 'ALL users in database',
      gradient: 'from-indigo-500 to-indigo-700'
    }
  ])

  const handleNavigation = (page: string) => {
    switch(page) {
      case 'user-progress':
        // Already on this page
        break
      case 'user-management':
        router.push('/admin/user-management')
        break
      case 'stage-testing':
        router.push('/admin/stage-testing')
        break
    }
  }

  const handleClearStat = (statId: number) => {
    // Database operation would go here
    setStats(prevStats => 
      prevStats.map(stat => 
        stat.id === statId ? { ...stat, number: 0 } : stat
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Navigation */}
      <Navigation currentPage="admin" />

      {/* Secondary Navigation */}
      <div className="bg-white/95 py-5 shadow-lg mb-10 pt-24">
        <div className="max-w-7xl mx-auto px-10 flex gap-8 justify-center">
          <button 
            onClick={() => handleNavigation('user-progress')}
            className="px-8 py-3 bg-blue-600 text-white border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg"
          >
            User Progress
          </button>
          <button 
            onClick={() => handleNavigation('user-management')}
            className="px-8 py-3 bg-transparent text-blue-600 border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            User Management
          </button>
          <button 
            onClick={() => handleNavigation('stage-testing')}
            className="px-8 py-3 bg-transparent text-blue-600 border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            Stage Testing
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-10">
        <h1 className="text-white text-4xl font-bold mb-10 text-center drop-shadow-lg">
          User Progress Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={stat.id} 
              className="bg-white rounded-3xl p-10 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl relative overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.gradient}`}></div>
              
              <div className={`w-20 h-20 mx-auto mb-5 flex items-center justify-center text-5xl bg-gradient-to-br ${stat.gradient} rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              
              <div className="text-7xl font-bold text-blue-600 text-center mb-3">
                {stat.number}
              </div>
              
              <div className="text-xl text-gray-600 text-center font-semibold mb-2">
                {stat.label}
              </div>
              
              <div className="text-sm text-gray-500 text-center flex items-center justify-center gap-2 mb-5">
                <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                {stat.subtitle}
              </div>
              
              <button 
                onClick={() => handleClearStat(stat.id)}
                className="mt-5 px-8 py-3 bg-red-500 text-white border-none rounded-lg cursor-pointer text-sm font-semibold block mx-auto transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-lg"
              >
                Clear
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}