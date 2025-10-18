'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface StatCard {
  id: number
  icon: string
  number: number
  label: string
  subtitle: string
  gradient: string
  dataKey: string
}

export default function AdminUserProgressPage() {
  const router = useRouter()
  
  const [stats, setStats] = useState<StatCard[]>([
    {
      id: 1,
      icon: '🔥',
      number: 0,
      label: 'Practice Sessions',
      subtitle: 'ALL users in database',
      gradient: 'from-blue-500 to-blue-700',
      dataKey: 'practiceSessions'
    },
    {
      id: 2,
      icon: '🌱',
      number: 0,
      label: 'Mind Recovery Sessions',
      subtitle: 'ALL users in database',
      gradient: 'from-purple-500 to-purple-700',
      dataKey: 'mindRecoverySessions'
    },
    {
      id: 3,
      icon: '📝',
      number: 0,
      label: 'Daily Emotional Notes',
      subtitle: 'ALL users in database',
      gradient: 'from-orange-500 to-orange-700',
      dataKey: 'dailyNotes'
    },
    {
      id: 4,
      icon: '',
      number: 0,
      label: 'Users',
      subtitle: 'ALL users in database',
      gradient: 'from-pink-500 to-pink-700',
      dataKey: 'totalUsers'
    }
  ])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch statistics from API
  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      
      const data = await response.json()
      
      if (data.success) {
        const dashboardCounts = data.data.dashboardCounts
        
        // Update stats with real data
        setStats(prevStats => prevStats.map(stat => {
          let newNumber = 0
          
          switch(stat.dataKey) {
            case 'practiceSessions':
              newNumber = dashboardCounts.practiceSessions
              break
            case 'mindRecoverySessions':
              newNumber = dashboardCounts.mindRecoverySessions
              break
            case 'dailyNotes':
              newNumber = dashboardCounts.dailyNotes
              break
            case 'totalUsers':
              newNumber = dashboardCounts.totalUsers
              break
            default:
              newNumber = stat.number
          }
          
          return { ...stat, number: newNumber }
        }))
      } else {
        throw new Error(data.error || 'Failed to load statistics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats()
  }, [])

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

  const handleClearStat = async (statId: number, dataKey: string) => {
    const statLabel = stats.find(s => s.id === statId)?.label
    
    if (!confirm(`⚠️ WARNING: This will permanently delete all ${statLabel} data!\n\nThis action CANNOT be undone. Are you sure?`)) {
      return
    }

    // For now, show info message since the clear API requires more complex authentication
    alert(`The Clear Data feature requires additional authentication.\n\nTo clear ${statLabel}:\n1. Navigate to Admin Settings\n2. Use the Data Management section\n3. Follow the secure deletion process\n\nThis helps prevent accidental data loss.`)
    
    /* 
    // Full implementation would be:
    const response = await fetch('/api/admin/data/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'clear_all_data',
        targetType: dataKey,
        reason: `Admin cleared ${statLabel} via dashboard`,
        confirmationCode: 'ADMIN_CONFIRM'
      })
    })
    */
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
      <div className="max-w-7xl mx-auto px-10 pb-10">
        <h1 className="text-white text-4xl font-bold mb-10 text-center drop-shadow-lg">
          User Progress Dashboard
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
              <p className="text-white text-xl">Loading statistics...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 border-2 border-red-400 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <div className="text-red-600 text-3xl mb-3">⚠️ Error</div>
            <p className="text-red-700 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchStats}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && !error && (
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
                onClick={() => handleClearStat(stat.id, stat.dataKey)}
                className="mt-5 px-8 py-3 bg-red-500 text-white border-none rounded-lg cursor-pointer text-sm font-semibold block mx-auto transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-lg"
              >
                Clear
              </button>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}