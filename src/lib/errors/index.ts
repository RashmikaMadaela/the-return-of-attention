/**
 * CENTRALIZED ERROR HANDLING SYSTEM
 * Provides consistent error handling and logging across all API endpoints
 */

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

// ============================================================================
// ERROR TYPES AND CODES
// ============================================================================

export enum ErrorCode {
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource Errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  
  // Business Logic Errors
  STAGE_LOCKED = 'STAGE_LOCKED',
  SESSION_IN_PROGRESS = 'SESSION_IN_PROGRESS',
  ASSESSMENT_ALREADY_COMPLETED = 'ASSESSMENT_ALREADY_COMPLETED',
  INSUFFICIENT_PROGRESS = 'INSUFFICIENT_PROGRESS',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: any
  statusCode: number
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class ApplicationError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: any

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.name = 'ApplicationError'
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(code: ErrorCode, message: string) {
    super(code, message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions') {
    super(ErrorCode.UNAUTHORIZED, message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string = 'Resource') {
    super(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(ErrorCode.DUPLICATE_RESOURCE, message, 409)
    this.name = 'ConflictError'
  }
}

export class BusinessLogicError extends ApplicationError {
  constructor(code: ErrorCode, message: string) {
    super(code, message, 422)
    this.name = 'BusinessLogicError'
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Handle and format errors consistently across all API endpoints
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle custom application errors
  if (error instanceof ApplicationError) {
    return NextResponse.json({
      success: false,
      message: error.message,
      code: error.code,
      ...(error.details && { details: error.details })
    }, { status: error.statusCode })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }))

    return NextResponse.json({
      success: false,
      message: 'Validation failed',
      code: ErrorCode.VALIDATION_ERROR,
      details: validationErrors
    }, { status: 400 })
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  // Handle generic JavaScript errors
  if (error instanceof Error) {
    return NextResponse.json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: ErrorCode.INTERNAL_ERROR
    }, { status: 500 })
  }

  // Handle unknown errors
  return NextResponse.json({
    success: false,
    message: 'An unexpected error occurred',
    code: ErrorCode.INTERNAL_ERROR
  }, { status: 500 })
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined
      const fieldName = field?.[0] || 'field'
      return NextResponse.json({
        success: false,
        message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists`,
        code: ErrorCode.DUPLICATE_RESOURCE
      }, { status: 409 })

    case 'P2025':
      // Record not found
      return NextResponse.json({
        success: false,
        message: 'Resource not found',
        code: ErrorCode.RESOURCE_NOT_FOUND
      }, { status: 404 })

    case 'P2003':
      // Foreign key constraint violation
      return NextResponse.json({
        success: false,
        message: 'Invalid reference to related resource',
        code: ErrorCode.VALIDATION_ERROR
      }, { status: 400 })

    case 'P2021':
      // Table not found
      return NextResponse.json({
        success: false,
        message: 'Database configuration error',
        code: ErrorCode.DATABASE_ERROR
      }, { status: 500 })

    default:
      console.error('Unhandled Prisma error:', error)
      return NextResponse.json({
        success: false,
        message: 'Database operation failed',
        code: ErrorCode.DATABASE_ERROR
      }, { status: 500 })
  }
}

// ============================================================================
// SUCCESS RESPONSE UTILITIES
// ============================================================================

/**
 * Create consistent success responses
 */
export function createSuccessResponse(
  data?: any,
  message?: string,
  statusCode: number = 200
): NextResponse {
  const response: any = {
    success: true
  }

  if (message) {
    response.message = message
  }

  if (data !== undefined) {
    response.data = data
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create paginated response
 */
export function createPaginatedResponse(
  data: any[],
  total: number,
  page: number,
  limit: number,
  message?: string
): NextResponse {
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return NextResponse.json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  })
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

export function logError(error: unknown, context: string, additionalData?: any): void {
  const timestamp = new Date().toISOString()
  const errorDetails = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    ...(additionalData && { additionalData })
  }

  console.error(`[${timestamp}] ${context}:`, errorDetails)
}

export function logInfo(message: string, data?: any): void {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`, data || '')
}

// ============================================================================
// RATE LIMITING UTILITIES
// ============================================================================

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitStore = new Map<string, { requests: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - config.windowMs
  
  // Clean up old entries
  Array.from(rateLimitStore.entries()).forEach(([key, data]) => {
    if (data.resetTime < now) {
      rateLimitStore.delete(key)
    }
  })

  const current = rateLimitStore.get(identifier)
  
  if (!current || current.resetTime < now) {
    // First request or window expired
    const resetTime = now + config.windowMs
    rateLimitStore.set(identifier, { requests: 1, resetTime })
    return { allowed: true, remaining: config.maxRequests - 1, resetTime }
  }

  if (current.requests >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }

  current.requests++
  return { 
    allowed: true, 
    remaining: config.maxRequests - current.requests, 
    resetTime: current.resetTime 
  }
}

// ============================================================================
// COMMON ERROR FACTORIES
// ============================================================================

export const CommonErrors = {
  unauthorized: () => new AuthenticationError(ErrorCode.UNAUTHORIZED, 'Authentication required'),
  invalidCredentials: () => new AuthenticationError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password'),
  emailNotVerified: () => new AuthenticationError(ErrorCode.EMAIL_NOT_VERIFIED, 'Please verify your email address first'),
  accountInactive: () => new AuthenticationError(ErrorCode.ACCOUNT_INACTIVE, 'Account is inactive'),
  invalidToken: () => new AuthenticationError(ErrorCode.INVALID_TOKEN, 'Invalid or expired token'),
  userNotFound: () => new NotFoundError('User'),
  sessionNotFound: () => new NotFoundError('Session'),
  stageNotFound: () => new NotFoundError('Stage'),
  assessmentNotFound: () => new NotFoundError('Assessment'),
  userExists: (email: string) => new ConflictError(`User with email ${email} already exists`),
  stageLocked: (stageNumber: number) => new BusinessLogicError(ErrorCode.STAGE_LOCKED, `Stage ${stageNumber} is locked. Complete previous stages first.`),
  sessionInProgress: () => new BusinessLogicError(ErrorCode.SESSION_IN_PROGRESS, 'A session is already in progress'),
  assessmentCompleted: (type: string) => new BusinessLogicError(ErrorCode.ASSESSMENT_ALREADY_COMPLETED, `${type} assessment has already been completed`),
  insufficientProgress: (requirement: string) => new BusinessLogicError(ErrorCode.INSUFFICIENT_PROGRESS, `Insufficient progress: ${requirement}`),
  rateLimitExceeded: (resetTime: number) => new ApplicationError(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    `Rate limit exceeded. Try again at ${new Date(resetTime).toISOString()}`,
    429,
    { resetTime }
  )
}