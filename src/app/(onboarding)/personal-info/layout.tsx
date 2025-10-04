import { ReactNode } from 'react'

interface PersonalInfoLayoutProps {
  children: ReactNode
}

export default function PersonalInfoLayout({ children }: PersonalInfoLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}