'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface User {
  id: string
  name: string | null
  email: string
  isActive: boolean
  emailVerified: Date | null
  createdAt: Date
  lastActivity: Date
  progressSummary: {
    currentStage: number
    totalSessions: number
    totalHours: number
    happinessScore: number
    userLevel: string
  }
}

export default function AdminUserManagementPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Creation Date')
  const [filterBy, setFilterBy] = useState('All Users')
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false)
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      // Add search parameter
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      // Add sort parameter
      let sortParam = 'joinedDate'
      if (sortBy === 'Last Login') sortParam = 'lastActivity'
      else if (sortBy === 'Name') sortParam = 'name'
      else if (sortBy === 'Creation Date') sortParam = 'joinedDate'
      params.append('sort', sortParam)
      params.append('order', 'desc')
      
      // Add filter parameter
      if (filterBy === 'Active Users') {
        params.append('status', 'active')
      } else if (filterBy === 'Inactive Users') {
        params.append('status', 'inactive')
      } else if (filterBy === 'New Users') {
        // Filter users created in the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        params.append('joinedAfter', sevenDaysAgo.toISOString())
      }
      
      const response = await fetch(`/api/admin/users?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data.users)
      } else {
        throw new Error(data.error || 'Failed to load users')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, sortBy, filterBy])

  // Fetch users on component mount and when search/sort/filter changes
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers()
    }, searchTerm ? 500 : 0)
    
    return () => clearTimeout(timer)
  }, [fetchUsers, searchTerm])

  const handleAdminNavigation = (page: string) => {
    setMobileAdminMenuOpen(false)
    switch(page) {
      case 'user-progress':
        router.push('/admin/user-progress')
        break
      case 'user-management':
        // Already on this page
        break
      case 'stage-testing':
        router.push('/admin/stage-testing')
        break
    }
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const handleUserAction = async (userId: string, userName: string, action: string) => {
    setActionLoading(`${userId}-${action}`)
    
    try {
      switch(action) {
        case 'reset':
          if (!confirm(`Are you sure you want to reset progress for ${userName}? This will delete all their progress data and reset them to beginner stage.`)) {
            setActionLoading(null)
            return
          }
          
          const resetResponse = await fetch('/api/admin/users/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'reset_progress',
              userId,
              reason: 'Admin reset via user management interface'
            })
          })
          
          if (!resetResponse.ok) {
            throw new Error('Failed to reset user progress')
          }
          
          showSuccessMessage(`Progress reset successfully for ${userName}`)
          fetchUsers()
          break
          
        case 'disable':
          if (!confirm(`Are you sure you want to disable account for ${userName}? They will not be able to log in.`)) {
            setActionLoading(null)
            return
          }
          
          const disableResponse = await fetch('/api/admin/users/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'disable',
              userId,
              reason: 'Admin disabled via user management interface'
            })
          })
          
          if (!disableResponse.ok) {
            throw new Error('Failed to disable user')
          }
          
          showSuccessMessage(`Account disabled successfully for ${userName}`)
          fetchUsers()
          break

        case 'enable':
          if (!confirm(`Are you sure you want to enable account for ${userName}? They will be able to log in again.`)) {
            setActionLoading(null)
            return
          }
          
          const enableResponse = await fetch('/api/admin/users/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'reactivate',
              userId,
              reason: 'Admin enabled via user management interface'
            })
          })
          
          if (!enableResponse.ok) {
            throw new Error('Failed to enable user')
          }
          
          showSuccessMessage(`Account enabled successfully for ${userName}`)
          fetchUsers()
          break
          
        case 'revoke':
          // Revoke is similar to disable for now
          if (!confirm(`Are you sure you want to revoke access for ${userName}? This will disable their account.`)) {
            setActionLoading(null)
            return
          }
          
          const revokeResponse = await fetch('/api/admin/users/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'disable',
              userId,
              reason: 'Admin revoked access via user management interface'
            })
          })
          
          if (!revokeResponse.ok) {
            throw new Error('Failed to revoke user access')
          }
          
          showSuccessMessage(`Access revoked successfully for ${userName}`)
          fetchUsers()
          break

        case 'undo_revoke':
          if (!confirm(`Are you sure you want to undo revocation for ${userName}? This will re-enable their account.`)) {
            setActionLoading(null)
            return
          }
          
          const undoRevokeResponse = await fetch('/api/admin/users/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'reactivate',
              userId,
              reason: 'Admin undid revocation via user management interface'
            })
          })
          
          if (!undoRevokeResponse.ok) {
            throw new Error('Failed to undo revocation')
          }
          
          showSuccessMessage(`Revocation undone successfully for ${userName}`)
          fetchUsers()
          break
          
        case 'delete':
          if (!confirm(`⚠️ PERMANENT ACTION ⚠️\n\nAre you sure you want to DELETE ${userName}?\n\nThis will:\n- Permanently delete the user account\n- Delete all their progress data\n- Delete all their sessions and notes\n- This action CANNOT be undone!`)) {
            setActionLoading(null)
            return
          }
          
          const deleteResponse = await fetch('/api/admin/users/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              userId,
              reason: 'Admin deleted via user management interface'
            })
          })
          
          if (!deleteResponse.ok) {
            throw new Error('Failed to delete user')
          }
          
          showSuccessMessage(`User ${userName} deleted permanently`)
          fetchUsers()
          break
          
        default:
          throw new Error('Invalid action')
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Operation failed'}`)
      console.error(`Error performing ${action}:`, err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 pb-10">
      {/* Main Navigation */}
      <Navigation currentPage="admin" />

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Admin Secondary Navigation */}
      <div className="pt-20">
        {/* Desktop Admin Navigation */}
        <div className="hidden lg:block bg-white/95 py-5 shadow-lg mb-10">
          <div className="max-w-7xl mx-auto px-10 flex gap-8 justify-center">
            <button 
              onClick={() => handleAdminNavigation('user-progress')}
              className="px-8 py-3 bg-transparent text-blue-600 border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
            >
              User Progress
            </button>
            <button 
              onClick={() => handleAdminNavigation('user-management')}
              className="px-8 py-3 bg-blue-600 text-white border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg"
            >
              User Management
            </button>
            <button 
              onClick={() => handleAdminNavigation('stage-testing')}
              className="px-8 py-3 bg-transparent text-blue-600 border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
            >
              Stage Testing
            </button>
          </div>
        </div>

        {/* Mobile Admin Navigation */}
        <div className="lg:hidden bg-white/95 shadow-lg mb-6">
          <div className="px-4 py-3">
            <button 
              onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold"
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
                  onClick={() => handleAdminNavigation('user-progress')}
                  className="w-full px-4 py-3 text-left text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50"
                >
                  User Progress
                </button>
                <button 
                  onClick={() => handleAdminNavigation('user-management')}
                  className="w-full px-4 py-3 text-left bg-blue-600 text-white rounded-lg font-semibold"
                >
                  User Management
                </button>
                <button 
                  onClick={() => handleAdminNavigation('stage-testing')}
                  className="w-full px-4 py-3 text-left text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50"
                >
                  Stage Testing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Page Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-blue-600 text-xl sm:text-2xl lg:text-3xl font-bold mb-3">
            <span className="text-2xl sm:text-3xl">👥</span>
            <span className="leading-tight">Comprehensive User Management System</span>
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">
            Complete enterprise user management: Delete, Password Reset, Access Control, Bulk Operations
          </div>
        </div>

        {/* Controls Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center gap-3 text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🔍</span>
              Search Users
            </div>
            <input 
              type="text" 
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10"
            />
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center gap-3 text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">📊</span>
              Sort By
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10"
            >
              <option>Creation Date</option>
              <option>Last Login</option>
              <option>Name</option>
              <option>Email</option>
            </select>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🔎</span>
              Filter By
            </div>
            <select 
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg text-sm bg-white cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-600 focus:shadow-lg focus:shadow-blue-600/10"
            >
              <option>All Users</option>
              <option>Active Users</option>
              <option>Inactive Users</option>
              <option>New Users</option>
            </select>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl">
          <div className="text-gray-800 text-lg sm:text-xl lg:text-2xl font-bold mb-6 sm:mb-8 pb-3 sm:pb-4 border-b-2 border-gray-100">
            User Accounts ({users.length})
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchUsers}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && users.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-xl">No users found</p>
            </div>
          )}

          {/* Users List */}
          {!loading && !error && users.length > 0 && users.map((user) => {
            const userName = user.name || user.email
            const userIdShort = user.id.substring(0, 8) + '...'
            const createdDate = new Date(user.createdAt).toLocaleDateString()
            const lastSignIn = new Date(user.lastActivity).toLocaleDateString()
            const isDisabled = !user.isActive
            
            return (
              <div 
                key={user.id}
                className={`bg-gray-50 rounded-xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 transition-all duration-300 border-2 ${
                  isDisabled 
                    ? 'border-red-300 bg-red-50 opacity-75' 
                    : 'border-transparent hover:border-blue-600 hover:bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="text-base sm:text-lg font-bold text-gray-800 truncate">
                        {userName}
                      </div>
                      {isDisabled && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          DISABLED
                        </span>
                      )}
                      {!user.emailVerified && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                          UNVERIFIED
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{user.email}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                  <span className="truncate">📅 Created: {createdDate}</span>
                  <span className="truncate">🕐 Last Sign In: {lastSignIn}</span>
                  <span className="truncate">🆔 ID: {userIdShort}</span>
                  <span className="truncate">⭐ Stage: {user.progressSummary.currentStage} ({user.progressSummary.totalSessions} sessions)</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <span className="flex items-center gap-1">
                    📊 Level: <strong>{user.progressSummary.userLevel}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    😊 Happiness: <strong>{user.progressSummary.happinessScore}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    ⏱️ Total Hours: <strong>{user.progressSummary.totalHours.toFixed(1)}h</strong>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap gap-2 sm:gap-3 sm:justify-end">
                  <button 
                    onClick={() => handleUserAction(user.id, userName, 'reset')}
                    disabled={actionLoading === `${user.id}-reset`}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {actionLoading === `${user.id}-reset` ? '⏳ Resetting...' : 'Reset'}
                  </button>
                  
                  {/* Show Disable button only if user is active */}
                  {!isDisabled && (
                    <button 
                      onClick={() => handleUserAction(user.id, userName, 'disable')}
                      disabled={actionLoading === `${user.id}-disable`}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actionLoading === `${user.id}-disable` ? '⏳ Disabling...' : 'Disable'}
                    </button>
                  )}
                  
                  {/* Show Enable button only if user is disabled */}
                  {isDisabled && (
                    <button 
                      onClick={() => handleUserAction(user.id, userName, 'enable')}
                      disabled={actionLoading === `${user.id}-enable`}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-green-500 text-white hover:bg-green-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actionLoading === `${user.id}-enable` ? '⏳ Enabling...' : '✓ Enable'}
                    </button>
                  )}
                  
                  {/* Show Revoke button only if user is active */}
                  {!isDisabled && (
                    <button 
                      onClick={() => handleUserAction(user.id, userName, 'revoke')}
                      disabled={actionLoading === `${user.id}-revoke`}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-red-600 text-white hover:bg-red-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actionLoading === `${user.id}-revoke` ? '⏳ Revoking...' : 'Revoke'}
                    </button>
                  )}
                  
                  {/* Show Undo Revoke button only if user is disabled */}
                  {isDisabled && (
                    <button 
                      onClick={() => handleUserAction(user.id, userName, 'undo_revoke')}
                      disabled={actionLoading === `${user.id}-undo_revoke`}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-yellow-500 text-white hover:bg-yellow-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actionLoading === `${user.id}-undo_revoke` ? '⏳ Reverting...' : '↩ Undo Revoke'}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleUserAction(user.id, userName, 'delete')}
                    disabled={actionLoading === `${user.id}-delete`}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-red-500 text-white hover:bg-red-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {actionLoading === `${user.id}-delete` ? '⏳ Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}