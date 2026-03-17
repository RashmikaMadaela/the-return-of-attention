import crypto from 'crypto'
import { Resend } from 'resend'

// Initialize Resend (will fallback to console logging if no API key)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Generate a secure random token for email verification
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Generate a secure reset token
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Send verification email with Resend or fallback to console
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`
  
  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourapp.com',
        to: email,
        subject: emailTemplates.verification.subject,
        html: emailTemplates.verification.html(verificationUrl),
      })
      console.log(`✅ Verification email sent to: ${email}`)
    } catch (error) {
      console.error('❌ Failed to send verification email:', error)
      // Fallback to console logging
      logEmailToConsole('EMAIL VERIFICATION', email, verificationUrl)
    }
  } else {
    // Development mode - log to console
    logEmailToConsole('EMAIL VERIFICATION', email, verificationUrl)
  }
}

// Helper function for console logging
function logEmailToConsole(type: string, email: string, url: string) {
  console.log(`=== ${type} ===`)
  console.log(`To: ${email}`)
  console.log(`URL: ${url}`)
  console.log('===============================')
}

// Send password reset email with Resend or fallback to console
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourapp.com',
        to: email,
        subject: emailTemplates.passwordReset.subject,
        html: emailTemplates.passwordReset.html(resetUrl),
      })
      console.log(`✅ Password reset email sent to: ${email}`)
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error)
      // Fallback to console logging
      logEmailToConsole('PASSWORD RESET', email, resetUrl)
    }
  } else {
    // Development mode - log to console
    logEmailToConsole('PASSWORD RESET', email, resetUrl)
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Email templates (to be expanded later)
export const emailTemplates = {
  verification: {
    subject: 'Verify your email - The Return of Attention',
    html: (verificationUrl: string, name?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to The Return of Attention${name ? `, ${name}` : ''}!</h2>
        <p>Thank you for creating an account. Please verify your email address to get started with your meditation journey.</p>
        <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <hr>
        <p style="color: #666; font-size: 14px;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `
  },
  passwordReset: {
    subject: 'Reset your password - The Return of Attention',
    html: (resetUrl: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for The Return of Attention.</p>
        <a href="${resetUrl}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <hr>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `
  }
}