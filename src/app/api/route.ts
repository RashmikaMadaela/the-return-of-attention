import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'The Return of Attention API is running!',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/*',
      user: '/api/user/*',
      sessions: '/api/sessions/*',
      pahm: '/api/pahm/*',
      assessment: '/api/assessment/*',
      notes: '/api/notes/*',
      admin: '/api/admin/*'
    }
  })
}