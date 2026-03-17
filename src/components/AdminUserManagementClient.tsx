'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import { useToast } from '@/hooks/useToast'
import ConfirmDialog from './ui/ConfirmDialog'
import type { AdminUsersData } from '@/lib/data/admin-users-data'

interface AdminUserManagementClientProps {
  initialData: AdminUsersData
}

export default function AdminUserManagementClient({ initialData }: AdminUserManagementClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showError, ToastContainer } = useToast()
  const [isPending, startTransition] = useTransition()
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    userId: string
    userName: string
    action: string
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    action: '',
    title: '',
    message: '',
    variant: 'warning'
  })
  
  const [searchTerm, setSearchTerm] = useState(initialData.filters.searchTerm || '')
  const [sortBy, setSortBy] = useState(initialData.filters.sortBy || 'Creation Date')
  const [filterBy, setFilterBy] = useState(
    initialData.filters.status === 'active' ? 'Active Users' :
    initialData.filters.status === 'inactive' ? 'Inactive Users' :
    'All Users'
  )
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 when filters change
    if (newParams.search !== undefined || newParams.status !== undefined || newParams.sortBy !== undefined) {
      params.set('page', '1')
    }
    
    startTransition(() => {
      router.push(`/admin/user-management?${params.toString()}`)
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    // Debounce search
    const timer = setTimeout(() => {
      updateFilters({ search: value })
    }, 500)
    return () => clearTimeout(timer)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    let sortParam = 'joinedDate'
    if (value === 'Last Login') sortParam = 'lastActivity'
    else if (value === 'Name') sortParam = 'name'
    updateFilters({ sortBy: sortParam })
  }

  const handleFilterChange = (value: string) => {
    setFilterBy(value)
    let statusParam = ''
    if (value === 'Active Users') statusParam = 'active'
    else if (value === 'Inactive Users') statusParam = 'inactive'
    updateFilters({ status: statusParam })
  }

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() })
  }

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

  const openConfirmDialog = (userId: string, userName: string, action: string) => {
    let title = ''
    let message = ''
    let variant: 'danger' | 'warning' | 'info' = 'warning'

    switch(action) {
      case 'reset':
        title = 'Reset User Progress?'
        message = `Are you sure you want to reset progress for ${userName}? This will delete all their progress data and reset them to beginner stage.`
        variant = 'warning'
        break
      case 'disable':
        title = 'Disable Account?'
        message = `Are you sure you want to disable account for ${userName}? They will not be able to log in.`
        variant = 'warning'
        break
      case 'enable':
        title = 'Enable Account?'
        message = `Are you sure you want to enable account for ${userName}? They will be able to log in again.`
        variant = 'info'
        break
      case 'delete':
        title = '⚠️ PERMANENT ACTION ⚠️'
        message = `Are you sure you want to DELETE ${userName}?\n\nThis will:\n- Permanently delete the user account\n- Delete all their progress data\n- Delete all their sessions and notes\n- This action CANNOT be undone!`
        variant = 'danger'
        break
    }

    setConfirmDialog({
      isOpen: true,
      userId,
      userName,
      action,
      title,
      message,
      variant
    })
  }

  const executeUserAction = async (userId: string, userName: string, action: string) => {
    setActionLoading(`${userId}-${action}`)
    
    try {
      const actionMap: Record<string, string> = {
        'reset': 'reset_progress',
        'disable': 'disable',
        'enable': 'reactivate',
        'delete': 'delete'
      }

      const response = await fetch('/api/admin/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionMap[action],
          userId,
          reason: `Admin ${action} via user management interface`
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} user`)
      }
      
      showSuccessMessage(`${action.charAt(0).toUpperCase() + action.slice(1)} successful for ${userName}`)
      
      // Refresh the page data
      router.refresh()
      
    } catch (err) {
      showError(`Error: ${err instanceof Error ? err.message : 'Operation failed'}`)
      console.error(`Error performing ${action}:`, err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUserAction = (userId: string, userName: string, action: string) => {
    openConfirmDialog(userId, userName, action)
  }

  const handleConfirm = () => {
    const { userId, userName, action } = confirmDialog
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    executeUserAction(userId, userName, action)
  }

  const handleCancel = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false })
    setActionLoading(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] pb-10">
      <ToastContainer />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      
      {/* Main Navigation */}
      <Navigation currentPage="admin" />

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#1f6fb6] text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in">
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
              className="px-8 py-3 bg-transparent text-[#6465e0] border-2 border-[#6465e0] rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-[#6465e0] hover:text-white hover:-translate-y-1 hover:shadow-lg"
            >
              User Progress
            </button>
            <button 
              onClick={() => handleAdminNavigation('user-management')}
              className="px-8 py-3 bg-[#6465e0] text-white border-2 border-[#6465e0] rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-[#5658d1] hover:border-[#5658d1] hover:-translate-y-1 hover:shadow-lg"
            >
              User Management
            </button>
            <button 
              onClick={() => handleAdminNavigation('stage-testing')}
              className="px-8 py-3 bg-transparent text-[#6465e0] border-2 border-[#6465e0] rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-[#6465e0] hover:text-white hover:-translate-y-1 hover:shadow-lg"
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
                  onClick={() => handleAdminNavigation('user-progress')}
                  className="w-full px-4 py-3 text-left text-[#6465e0] border-2 border-[#6465e0] rounded-lg font-semibold hover:bg-[#eef4ff]"
                >
                  User Progress
                </button>
                <button 
                  onClick={() => handleAdminNavigation('user-management')}
                  className="w-full px-4 py-3 text-left bg-[#6465e0] text-white rounded-lg font-semibold"
                >
                  User Management
                </button>
                <button 
                  onClick={() => handleAdminNavigation('stage-testing')}
                  className="w-full px-4 py-3 text-left text-[#6465e0] border-2 border-[#6465e0] rounded-lg font-semibold hover:bg-[#eef4ff]"
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-[#03478f] text-xl sm:text-2xl lg:text-3xl font-bold mb-3">
            <span className="text-3xl sm:text-4xl">👥</span>
            <span>User Management</span>
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">
            Complete enterprise user management: {initialData.pagination.totalUsers} total users
          </div>
        </div>

        {/* Controls Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-gray-700 font-bold mb-2 text-sm">Search Users</div>
            <input 
              type="text" 
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isPending}
              className="w-full p-2.5 sm:p-3 border-2 border-[#d6e8f8] bg-[#f7fbff] rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-[#6465e0] focus:shadow-lg focus:shadow-[#6465e0]/10 disabled:opacity-50"
            />
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-gray-700 font-bold mb-2 text-sm">Sort By</div>
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              disabled={isPending}
              className="w-full p-2.5 sm:p-3 border-2 border-[#d6e8f8] bg-[#f7fbff] rounded-lg text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#6465e0] disabled:opacity-50"
            >
              <option>Creation Date</option>
              <option>Last Login</option>
              <option>Name</option>
            </select>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:col-span-2 lg:col-span-1">
            <div className="text-gray-700 font-bold mb-2 text-sm">Filter</div>
            <select 
              value={filterBy}
              onChange={(e) => handleFilterChange(e.target.value)}
              disabled={isPending}
              className="w-full p-2.5 sm:p-3 border-2 border-[#d6e8f8] bg-[#f7fbff] rounded-lg text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#6465e0] disabled:opacity-50"
            >
              <option>All Users</option>
              <option>Active Users</option>
              <option>Inactive Users</option>
            </select>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl">
          <div className="text-gray-800 text-lg sm:text-xl lg:text-2xl font-bold mb-6 sm:mb-8 pb-3 sm:pb-4 border-b-2 border-gray-100">
            User Accounts ({initialData.pagination.totalUsers})
          </div>

          {/* Loading Overlay */}
          {isPending && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#6465e0] mb-3"></div>
                <p className="text-gray-600 text-base">Loading users...</p>
              </div>
            </div>
          )}

          {/* Users List */}
          {!isPending && initialData.users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          )}

          {/* Users Grid */}
          {!isPending && initialData.users.length > 0 && initialData.users.map((user) => (
            <div key={user.id} className="bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 mb-4 sm:mb-5 border-2 border-gray-100 transition-all duration-300 hover:border-[#b9d4ee] hover:shadow-lg">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h3 className="text-gray-800 font-bold text-base sm:text-lg">{user.name || 'No Name'}</h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-1">{user.email}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Last Active: {new Date(user.lastActivity).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                  <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-[#6465e0] font-bold text-lg">{user.progressSummary.currentStage}</div>
                    <div className="text-gray-500 text-xs">Stage</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-[#6465e0] font-bold text-lg">{user.progressSummary.totalSessions}</div>
                    <div className="text-gray-500 text-xs">Sessions</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-[#6465e0] font-bold text-lg">{user.progressSummary.totalHours}h</div>
                    <div className="text-gray-500 text-xs">Hours</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-[#6465e0] font-bold text-lg">{user.progressSummary.happinessScore}</div>
                    <div className="text-gray-500 text-xs">Happy</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleUserAction(user.id, user.name || user.email, 'reset')}
                  disabled={actionLoading === `${user.id}-reset`}
                  className="px-4 py-2 bg-[#9eaac0] text-white rounded-lg text-xs font-semibold transition-all hover:bg-[#8f9bb1] disabled:opacity-50"
                >
                  {actionLoading === `${user.id}-reset` ? 'Resetting...' : 'Reset Progress'}
                </button>
                {user.isActive ? (
                  <button 
                    onClick={() => handleUserAction(user.id, user.name || user.email, 'disable')}
                    disabled={actionLoading === `${user.id}-disable`}
                    className="px-4 py-2 bg-[#6a95cb] text-white rounded-lg text-xs font-semibold transition-all hover:bg-[#587fb2] disabled:opacity-50"
                  >
                    {actionLoading === `${user.id}-disable` ? 'Disabling...' : 'Disable'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUserAction(user.id, user.name || user.email, 'enable')}
                    disabled={actionLoading === `${user.id}-enable`}
                    className="px-4 py-2 bg-[#1f6fb6] text-white rounded-lg text-xs font-semibold transition-all hover:bg-[#175d98] disabled:opacity-50"
                  >
                    {actionLoading === `${user.id}-enable` ? 'Enabling...' : 'Enable'}
                  </button>
                )}
                <button 
                  onClick={() => handleUserAction(user.id, user.name || user.email, 'delete')}
                  disabled={actionLoading === `${user.id}-delete`}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {actionLoading === `${user.id}-delete` ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {!isPending && initialData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t-2 border-gray-100">
              <button
                onClick={() => handlePageChange(initialData.pagination.currentPage - 1)}
                disabled={initialData.pagination.currentPage === 1 || isPending}
                className="px-4 py-2 bg-[#6465e0] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5658d1] transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-600 font-medium">
                Page {initialData.pagination.currentPage} of {initialData.pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(initialData.pagination.currentPage + 1)}
                disabled={!initialData.pagination.hasMore || isPending}
                className="px-4 py-2 bg-[#6465e0] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5658d1] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
