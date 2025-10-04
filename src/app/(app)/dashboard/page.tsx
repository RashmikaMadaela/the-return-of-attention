'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  HeartIcon, 
  BookOpenIcon, 
  AcademicCapIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  currentStage: number
  happinessScore: number
  sessionStreak: number
  completedAssessments: number
  totalNotes: number
  weeklyProgress: number
}

interface RecentActivity {
  id: string
  type: 'assessment' | 'note' | 'session' | 'achievement'
  title: string
  description: string
  timestamp: Date
  status?: 'completed' | 'in_progress' | 'pending'
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    currentStage: 1,
    happinessScore: 0,
    sessionStreak: 0,
    completedAssessments: 0,
    totalNotes: 0,
    weeklyProgress: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch dashboard stats
      const [progressRes, happinessRes, notesRes] = await Promise.all([
        fetch('/api/progress/current'),
        fetch('/api/happiness/latest'),
        fetch('/api/notes/summary')
      ])

      // Mock data for now - replace with actual API responses
      setStats({
        currentStage: 2,
        happinessScore: 7.2,
        sessionStreak: 5,
        completedAssessments: 12,
        totalNotes: 28,
        weeklyProgress: 75
      })

      setRecentActivity([
        {
          id: '1',
          type: 'assessment',
          title: 'Daily Self-Assessment',
          description: 'Completed today\'s happiness tracking',
          timestamp: new Date(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'note',
          title: 'Recovery Note',
          description: 'Added reflection on mindfulness practice',
          timestamp: new Date(Date.now() - 3600000),
          status: 'completed'
        },
        {
          id: '3',
          type: 'session',
          title: 'Mind Recovery Session',
          description: 'Completed 20-minute guided meditation',
          timestamp: new Date(Date.now() - 7200000),
          status: 'completed'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <ExclamationTriangleIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your dashboard.</p>
          <a 
            href="/signin" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Sign In
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    )
  }

  const stageNames = [
    'Awareness', 'Understanding', 'Acceptance', 'Healing', 'Growth', 'Mastery'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name || 'Explorer'}
          </h1>
          <p className="text-gray-600 mt-2">
            Continue your journey of healing and self-discovery
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Stage */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Current Stage</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.currentStage}. {stageNames[stats.currentStage - 1]}
                </p>
              </div>
            </div>
          </div>

          {/* Happiness Score */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-pink-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Happiness Score</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.happinessScore}/10</p>
              </div>
            </div>
          </div>

          {/* Session Streak */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Session Streak</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.sessionStreak} days</p>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Weekly Progress</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.weeklyProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Recovery Journey</h2>
              
              {/* Stage Progress */}
              <div className="space-y-4">
                {stageNames.map((stage, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      index + 1 <= stats.currentStage 
                        ? 'bg-indigo-600 text-white' 
                        : index + 1 === stats.currentStage + 1
                        ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {index + 1 < stats.currentStage ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className={`font-medium ${
                        index + 1 <= stats.currentStage ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {stage}
                      </h3>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index + 1 < stats.currentStage 
                              ? 'bg-green-500 w-full' 
                              : index + 1 === stats.currentStage
                              ? 'bg-indigo-600 w-3/4'
                              : 'bg-gray-200 w-0'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href="/self-assessment" 
                    className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <HeartIcon className="h-6 w-6 text-indigo-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Daily Assessment</h4>
                      <p className="text-sm text-gray-600">Track your happiness</p>
                    </div>
                  </a>
                  <a 
                    href="/mind-recovery" 
                    className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <BookOpenIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Mind Recovery</h4>
                      <p className="text-sm text-gray-600">Start a session</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Activity */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <a 
                  href="/activity" 
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  View All Activity
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Journey Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assessments Completed</span>
                  <span className="text-sm font-medium text-gray-900">{stats.completedAssessments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Notes Written</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalNotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days Active</span>
                  <span className="text-sm font-medium text-gray-900">{stats.sessionStreak}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}