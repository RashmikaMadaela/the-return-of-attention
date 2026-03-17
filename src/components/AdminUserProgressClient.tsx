'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useToast } from '@/hooks/useToast'
import ConfirmDialog from './ui/ConfirmDialog'
import type { AdminStatsData } from '@/lib/data/admin-stats-data'

interface AdminUserProgressClientProps {
  initialData: AdminStatsData
}

export default function AdminUserProgressClient({ initialData }: AdminUserProgressClientProps) {
  const router = useRouter()
  const { showInfo, ToastContainer } = useToast()
  
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false)
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    statLabel: string
    dataKey: string
  }>({
    isOpen: false,
    statLabel: '',
    dataKey: ''
  })

  const stats = [
    {
      id: 1,
      icon: '🔥',
      number: initialData.dashboardCounts.practiceSessions,
      label: 'Practice Sessions',
      subtitle: 'ALL users in database',
      gradient: 'from-[#6465e0] to-[#7c7de8]',
      dataKey: 'practiceSessions'
    },
    {
      id: 2,
      icon: '🌱',
      number: initialData.dashboardCounts.mindRecoverySessions,
      label: 'Mind Recovery Sessions',
      subtitle: 'ALL users in database',
      gradient: 'from-[#1f6fb6] to-[#2d82cc]',
      dataKey: 'mindRecoverySessions'
    },
    {
      id: 3,
      icon: '📝',
      number: initialData.dashboardCounts.dailyNotes,
      label: 'Daily Emotional Notes',
      subtitle: 'ALL users in database',
      gradient: 'from-[#4f7db8] to-[#6a95cb]',
      dataKey: 'dailyNotes'
    },
    {
      id: 4,
      icon: '👥',
      number: initialData.dashboardCounts.totalUsers,
      label: 'Users',
      subtitle: 'ALL users in database',
      gradient: 'from-[#5870d8] to-[#7c7de8]',
      dataKey: 'totalUsers'
    }
  ]

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

  const handleClearStat = (dataKey: string, statLabel: string) => {
    setConfirmDialog({
      isOpen: true,
      dataKey,
      statLabel
    })
  }

  const handleConfirmClear = () => {
    // Close dialog
    const { statLabel } = confirmDialog
    setConfirmDialog({
      isOpen: false,
      statLabel: '',
      dataKey: ''
    })

    // Show info message since the clear API requires more complex authentication
    showInfo(`The Clear Data feature requires additional authentication.\n\nTo clear ${statLabel}:\n1. Navigate to Admin Settings\n2. Use the Data Management section\n3. Follow the secure deletion process\n\nThis helps prevent accidental data loss.`, 'Additional Authentication Required')
  }

  const handleCancelClear = () => {
    setConfirmDialog({
      isOpen: false,
      statLabel: '',
      dataKey: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      <ToastContainer />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="⚠️ WARNING"
        message={`This will permanently delete all ${confirmDialog.statLabel} data!\n\nThis action CANNOT be undone. Are you sure?`}
        confirmText="OK"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
      
      {/* Navigation */}
      <Navigation currentPage="admin" />

      {/* Desktop Secondary Navigation */}
      <div className="hidden lg:block bg-white/95 py-5 shadow-lg mb-10 pt-24">
        <div className="max-w-7xl mx-auto px-10 flex gap-8 justify-center">
          <button 
            onClick={() => handleNavigation('user-progress')}
            className="px-8 py-3 bg-[#6465e0] text-white border-2 border-[#6465e0] rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-[#5658d1] hover:border-[#5658d1] hover:-translate-y-1 hover:shadow-lg"
          >
            User Progress
          </button>
          <button 
            onClick={() => handleNavigation('user-management')}
            className="px-8 py-3 bg-transparent text-[#6465e0] border-2 border-[#6465e0] rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-[#6465e0] hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            User Management
          </button>
          <button 
            onClick={() => handleNavigation('stage-testing')}
            className="px-8 py-3 bg-transparent text-[#6465e0] border-2 border-[#6465e0] rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-[#6465e0] hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            Stage Testing
          </button>
        </div>
      </div>

      {/* Mobile Admin Navigation */}
      <div className="lg:hidden bg-white/95 shadow-lg mb-6 pt-20">
        <div className="px-4 py-3">
          <button 
            onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#6465e0] text-white rounded-lg font-semibold"
          >
            <span>Admin Menu</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileAdminMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          
          {mobileAdminMenuOpen && (
            <div className="mt-2 space-y-2">
              <button 
                onClick={() => handleNavigation('user-progress')}
                  className="w-full px-4 py-3 text-left bg-[#6465e0] text-white rounded-lg font-semibold"
              >
                User Progress
              </button>
              <button 
                onClick={() => handleNavigation('user-management')}
                  className="w-full px-4 py-3 text-left text-[#6465e0] border-2 border-[#6465e0] rounded-lg font-semibold hover:bg-[#eef4ff]"
              >
                User Management
              </button>
              <button 
                onClick={() => handleNavigation('stage-testing')}
                  className="w-full px-4 py-3 text-left text-[#6465e0] border-2 border-[#6465e0] rounded-lg font-semibold hover:bg-[#eef4ff]"
              >
                Stage Testing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-10">
        <h1 className="text-[#03478f] text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-10 text-center px-4">
          User Progress Dashboard
        </h1>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-gray-600 mb-2">Active Users (30d)</div>
            <div className="text-3xl font-bold text-[#6465e0]">{initialData.systemMetrics.activeUsers}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-gray-600 mb-2">New This Month</div>
            <div className="text-3xl font-bold text-[#1f6fb6]">{initialData.systemMetrics.newUsersThisMonth}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-gray-600 mb-2">Total Practice Hours</div>
            <div className="text-3xl font-bold text-[#7c7de8]">{initialData.systemMetrics.totalPracticeHours}h</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              className="bg-white rounded-3xl p-10 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl relative overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.gradient}`}></div>
              
              <div className={`w-20 h-20 mx-auto mb-5 flex items-center justify-center text-5xl bg-gradient-to-br ${stat.gradient} rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              
              <div className="text-7xl font-bold text-[#03478f] text-center mb-3">
                {stat.number}
              </div>
              
              <div className="text-xl text-gray-600 text-center font-semibold mb-2">
                {stat.label}
              </div>
              
              <div className="text-sm text-gray-500 text-center flex items-center justify-center gap-2 mb-5">
                <div className="w-4 h-4 bg-[#7c7de8] rounded-sm"></div>
                {stat.subtitle}
              </div>
              
              <button 
                onClick={() => handleClearStat(stat.dataKey, stat.label)}
                className="mt-5 px-8 py-3 bg-red-500 text-white border-none rounded-lg cursor-pointer text-sm font-semibold block mx-auto transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-lg"
              >
                Clear
              </button>
            </div>
          ))}
        </div>

        {/* Engagement Metrics */}
        <div className="mt-8 bg-white rounded-3xl p-8 shadow-2xl max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b-2 border-gray-100">
            User Engagement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#6465e0] mb-2">{initialData.engagementMetrics.dailyActiveUsers}</div>
              <div className="text-sm text-gray-600">Daily Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#6465e0] mb-2">{initialData.engagementMetrics.weeklyActiveUsers}</div>
              <div className="text-sm text-gray-600">Weekly Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#6465e0] mb-2">{initialData.engagementMetrics.monthlyActiveUsers}</div>
              <div className="text-sm text-gray-600">Monthly Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
