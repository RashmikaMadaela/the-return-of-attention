import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { getServerSession } from 'next-auth/next'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { z } from 'zod'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isActive: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isActive: boolean
    emailVerified?: Date | null
    rememberMe?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    isActive?: boolean
    rememberMe?: boolean
  }
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    // Maximum session age (30 days) - actual expiry controlled by JWT exp claim
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // Credentials Provider for email/password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'text' }
      },
      async authorize(credentials) {
        try {
          // Check if credentials exist
          if (!credentials) {
            return null
          }

          // Validate input
          const validatedFields = loginSchema.safeParse(credentials)
          if (!validatedFields.success) {
            return null
          }

          const { email, password } = validatedFields.data

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              profile: true
            }
          })

          if (!user || !user.password) {
            return null
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(password, user.password)
          if (!passwordMatch) {
            return null
          }

          // Check if email is verified (temporarily disabled for testing)
          // TODO: Re-enable email verification once email flow is implemented
          // if (!user.emailVerified) {
          //   throw new Error('Please verify your email before signing in')
          // }

          // Return user object with rememberMe flag
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
            rememberMe: credentials.rememberMe === 'true'
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id
        token.isActive = (user as any).isActive
        token.rememberMe = (user as any).rememberMe || false
        
        // Set token expiry based on rememberMe
        const now = Math.floor(Date.now() / 1000)
        if (token.rememberMe) {
          // Remember me: 30 days
          token.exp = now + 30 * 24 * 60 * 60
        } else {
          // Regular session: 1 hour
          token.exp = now + 60 * 60
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, create user profile if needed
      if (account?.provider === 'google' && profile) {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email! }
          })

          if (!existingUser) {
            // Create new user with email verification
            await prisma.user.create({
              data: {
                email: profile.email!,
                name: profile.name,
                image: (profile as any).picture,
                emailVerified: new Date(), // OAuth emails are pre-verified
                isActive: true
              }
            })
          }
        } catch (error) {
          console.error('Sign in callback error:', error)
          return false
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

// Utility functions for password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Export the auth configuration
export { authOptions as default }