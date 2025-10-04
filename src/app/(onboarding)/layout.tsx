import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personal Information | The Return of Attention',
  description: 'Complete your profile to personalize your mindfulness journey',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="onboarding-layout">
      {children}
    </div>
  )
}