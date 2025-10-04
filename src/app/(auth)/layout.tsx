import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication | The Return of Attention',
  description: 'Sign in or create an account to begin your mindfulness journey',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}