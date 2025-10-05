import type { Metadata } from 'next'
import { Inter, Lexend, Arimo } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Return of Attention - Practices for the Happiness that Stays",
  description: "A simple, practical guide to happiness that actually stays. Progressive Attention & Happiness Meditation (PAHM) methodology.",
  keywords: ['meditation', 'mindfulness', 'PAHM', 'attention', 'happiness', 'mental training', 'awareness', 'presence'],
  authors: [{ name: 'A.C. Amarasinghe' }],
  openGraph: {
    title: 'The Return of Attention - Practices for the Happiness that Stays',
    description: 'A simple, practical guide to happiness that actually stays.',
    type: 'website',
    siteName: 'The Return of Attention',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Return of Attention - Practices for the Happiness that Stays',
    description: 'A simple, practical guide to happiness that actually stays.',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${lexend.variable} ${arimo.variable} font-inter antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}