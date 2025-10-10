'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface User {
  id: string
  name: string
  email: string
  createdDate: string
  lastSignIn: string
  userId: string
}

export default function AdminUserManagementPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Creation Date')
  const [filterBy, setFilterBy] = useState('All Users')
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false)
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'turnofattention',
      email: 'work@gmail.com',
      createdDate: '9/1/2025',
      lastSignIn: '9/2/2025',
      userId: 'z9sPtK41...'
    },
    {
      id: '4',
      name: 'Test 4',
      email: 'test4@gamil.com',
      createdDate: '8/29/2025',
      lastSignIn: '8/29/2025',
      userId: '1WhHnGQM...'
    },
    {
      id: '5',
      name: 'Test3',
      email: 'test3@gmail.com',
      createdDate: '8/29/2025',
      lastSignIn: '8/29/2025',
      userId: 'klPLcnlx...'
    }
  ])

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

  const handleUserAction = (userId: string, action: string) => {
    console.log(`${action} action for user ${userId}`)
    
    switch(action) {
      case 'reset':
        alert(`Reset password for user ${userId}`)
        break
      case 'disable':
        alert(`Disable account for user ${userId}`)
        break
      case 'revoke':
        alert(`Revoke access for user ${userId}`)
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this user?')) {
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
        }
        break
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 pb-10">
      {/* Main Navigation */}
      <Navigation currentPage="admin" />

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
            User Accounts ({filteredUsers.length})
          </div>

          {filteredUsers.map((user) => (
            <div 
              key={user.id}
              className="bg-gray-50 rounded-xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 transition-all duration-300 border-2 border-transparent hover:border-blue-600 hover:bg-white hover:shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-base sm:text-lg font-bold text-gray-800 truncate">{user.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{user.email}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:gap-6 lg:gap-8 text-xs text-gray-500 mb-4 space-y-1 sm:space-y-0">
                <span className="truncate">Created: {user.createdDate}</span>
                <span className="truncate">Last Sign In: {user.lastSignIn}</span>
                <span className="truncate">ID: {user.userId}</span>
              </div>
              
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap gap-2 sm:gap-3 sm:justify-end">
                <button 
                  onClick={() => handleUserAction(user.id, 'reset')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Reset
                </button>
                <button 
                  onClick={() => handleUserAction(user.id, 'disable')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30"
                >
                  Disable
                </button>
                <button 
                  onClick={() => handleUserAction(user.id, 'revoke')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-red-600 text-white hover:bg-red-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-600/30"
                >
                  Revoke
                </button>
                <button 
                  onClick={() => handleUserAction(user.id, 'delete')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-red-500 text-white hover:bg-red-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}