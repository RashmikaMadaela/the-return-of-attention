import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Return of Attention - Meditation & Mindfulness App',
  description: 'A comprehensive meditation and mindfulness web application built on the PAHM methodology. Develop sustained attention through progressive stages: Physical Stillness, Thought Patterns, Dot Tracking, Tool-Free Practice, Sustained Presence, and Integration & Teaching.',
  keywords: ['meditation', 'mindfulness', 'PAHM', 'attention', 'happiness', 'mental training', 'awareness', 'presence'],
  authors: [{ name: 'A.C. Amarasinghe' }],
  openGraph: {
    title: 'The Return of Attention - Meditation App',
    description: 'Practices for the Happiness that Stays - A simple, practical guide to lasting happiness.',
    type: 'website',
    siteName: 'The Return of Attention',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Return of Attention - Meditation App',
    description: 'Practices for the Happiness that Stays - A simple, practical guide to lasting happiness.',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}