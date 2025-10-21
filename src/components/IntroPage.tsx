'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function IntroPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  // Check if user is logged in and redirect to home
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        if (session?.user) {
          router.push('/home')
        } else {
          setIsChecking(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  // Show nothing while checking auth status
  if (isChecking) {
    return null
  }

  const handleRegister = () => {
    router.push('/signup')
  }

  const handleLogin = () => {
    router.push('/signin')
  }

  const handlePracticeToday = () => {
    router.push('/signup')
  }

  const handleStartJourney = () => {
    router.push('/signup')
  }

  const handleLearnMore = () => {
    router.push('/about')
  }

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning={true}>
      {/* Navigation Bar - Transparent with backdrop blur */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8" suppressHydrationWarning={true}>
          <div className="flex items-center justify-between h-16" suppressHydrationWarning={true}>
            <div className="flex items-center space-x-3" suppressHydrationWarning={true}>
              {/* Animated PAHM Grid Logo */}
              <div className="relative flex-shrink-0 w-10 h-10 bg-purple-600 rounded-lg sm:w-12 sm:h-12" suppressHydrationWarning={true}>
                <div className="absolute inset-1 sm:inset-1.5 grid grid-cols-3 gap-0.5" suppressHydrationWarning={true}>
                  {/* Row 1 */}
                  <div className="w-full bg-orange-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}} suppressHydrationWarning={true}></div>
                  <div className="w-full rounded-sm aspect-square bg-cyan-300 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s'}} suppressHydrationWarning={true}></div>
                  <div className="w-full bg-purple-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}} suppressHydrationWarning={true}></div>
                  
                  {/* Row 2 */}
                  <div className="w-full bg-yellow-400 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s'}} suppressHydrationWarning={true}></div>
                  <div className="w-full bg-gray-200 rounded-sm aspect-square animate-pulse" style={{animationDelay: '2s', animationDuration: '2s'}} suppressHydrationWarning={true}></div>
                  <div className="w-full bg-blue-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.2s'}} suppressHydrationWarning={true}></div>
                  
                  {/* Row 3 */}
                  <div className="w-full bg-orange-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '2.5s', animationDuration: '2.8s'}} suppressHydrationWarning={true}></div>
                  <div className="w-full bg-pink-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.2s', animationDuration: '3.8s'}} suppressHydrationWarning={true}></div>
                  <div className="w-full bg-purple-200 rounded-md aspect-square animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.3s'}} suppressHydrationWarning={true}></div>
                </div>
              </div>
              
              {/* Text Logo */}
              <div className="text-lg font-semibold text-gray-800 sm:text-xl" suppressHydrationWarning={true}>
                The Return of Attention
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3" suppressHydrationWarning={true}>
              <button 
                onClick={handleLogin}
                className="px-3 py-2 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg sm:px-4 md:px-6 hover:bg-blue-700 sm:text-sm md:text-base">
                Login
              </button>
              <button 
                onClick={handleRegister}
                className="px-3 py-2 text-xs font-medium text-white transition-colors bg-purple-600 rounded-lg sm:px-4 md:px-6 hover:bg-purple-700 sm:text-sm md:text-base">
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div 
          className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover" 
          style={{ backgroundImage: "url('/png_images/ChatGPT Image Sep 25, 2025, 11_50_43 AM.png')" }}
          suppressHydrationWarning={true}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Animated Grid Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative w-48 h-48 bg-purple-600 rounded-lg sm:w-64 sm:h-64">
              {/* Using CSS Grid for perfect alignment */}
              <div className="absolute grid grid-cols-3 gap-2 inset-4 sm:inset-6 sm:gap-3">
                {/* Row 1 */}
                <div className="w-full bg-orange-300 aspect-square rounded-2xl animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                <div className="w-full rounded-lg aspect-square bg-cyan-300 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s'}}></div>
                <div className="w-full bg-purple-300 aspect-square rounded-2xl animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                
                {/* Row 2 */}
                <div className="w-full bg-yellow-400 rounded-lg aspect-square animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}></div>
                <div className="w-full bg-gray-200 rounded-lg aspect-square animate-pulse" style={{animationDelay: '2s', animationDuration: '2s'}}></div>
                <div className="w-full bg-blue-300 rounded-lg aspect-square animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.2s'}}></div>
                
                {/* Row 3 */}
                <div className="w-full bg-orange-300 aspect-square rounded-2xl animate-pulse" style={{animationDelay: '2.5s', animationDuration: '2.8s'}}></div>
                <div className="w-full bg-pink-300 rounded-lg aspect-square animate-pulse" style={{animationDelay: '1.2s', animationDuration: '3.8s'}}></div>
                <div className="w-full bg-purple-200 aspect-square rounded-2xl animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.3s'}}></div>
              </div>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">
            "You are not your thoughts"
          </h1>
          <p className="mb-2 text-base font-semibold text-white sm:text-lg md:text-xl drop-shadow-lg">
            Practices for the Happiness that Stays
          </p>
          <p className="mb-6 text-sm sm:text-base text-white/90 sm:mb-8 drop-shadow-lg">
            A simple, practical guide to happiness that actually stays
          </p>
          <button 
            onClick={handlePracticeToday}
            className="px-6 py-3 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-full shadow-lg sm:px-8 sm:text-base md:text-lg hover:bg-blue-700">
            Practice Today!
          </button>
        </div>
      </section>

      {/* Sound Familiar & What If Section */}
      <section className="px-4 py-12 sm:py-16 bg-gray-50">
        <div className="grid max-w-6xl gap-6 mx-auto sm:gap-8 md:grid-cols-2">
          {/* Sound Familiar */}
          <div className="order-2 md:order-1">
            <h2 className="mb-4 text-xl font-bold text-center sm:text-2xl md:text-3xl sm:mb-6">Sound Familiar?</h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                'Mind wont quiet down',
                'Constant worry and stress',
                'Feeling trapped in thoughts',
                'Nothing feels quite right',
                'Always seeking, never satisfied'
              ].map((text, index) => (
                <div key={index} className="p-3 text-sm font-medium text-center rounded-lg bg-cyan-300 sm:p-4 sm:text-base">
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* What If There's a Way Out */}
          <div className="order-1 md:order-2">
            <h2 className="mb-4 text-xl font-bold text-center sm:text-2xl md:text-3xl sm:mb-6">What If There's a Way Out?</h2>
            <div className="p-6 text-center rounded-lg bg-cyan-300 sm:p-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-20 h-20 overflow-hidden border-2 border-black rounded-full sm:w-24 sm:h-24">
                  <img 
                    src="/png_images/Gemini_Generated_Image_tccj9vtccj9vtccj.png" 
                    alt="Mind" 
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <h3 className="mb-3 text-lg font-bold sm:text-xl sm:mb-4">The Universal Solution</h3>
              <p className="mb-4 text-xs sm:text-sm sm:mb-6">
                Unlike your body, your mind is trainable. Thousands have found lasting peace through this simple practice.
              </p>
              <h4 className="mb-2 text-xl font-bold sm:text-2xl">6 Stages</h4>
              <p className="text-xs sm:text-sm">From chaos to clarity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Journey to Freedom */}
      <section className="relative px-4 py-12 sm:py-16">
        <div 
          className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover opacity-20" 
          style={{ backgroundImage: "url('/png_images/ChatGPT Image Sep 25, 2025, 11_50_43 AM.png')" }}
          suppressHydrationWarning={true}
        />
        <div className="relative max-w-6xl mx-auto">
          <h2 className="mb-8 text-2xl font-bold text-center text-gray-800 sm:text-3xl md:text-4xl sm:mb-12">
            Your Journey to Freedom
          </h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:mb-8">
            {[
              { title: 'Stage 1-2', subtitle: 'Physical stillness & thought observation', image: '/png_images/Gemini_Generated_Image_20x8ln20x8ln20x8.png' },
              { title: 'Stage 3-4', subtitle: 'Recognizing mental patterns', image: '/png_images/Gemini_Generated_Image_3470n23470n23470.png' },
              { title: 'Stage 5-6', subtitle: 'Discovering lasting happiness', image: '/png_images/Gemini_Generated_Image_1699091699091699.png' },
              { title: 'No Beliefs', subtitle: 'Just practical experience', image: '/png_images/Gemini_Generated_Image_b8u6u1b8u6u1b8u6.png' },
              { title: 'No Special Skills', subtitle: 'Anyone can do this', image: '/png_images/Gemini_Generated_Image_gmvto9gmvto9gmvt.png' },
              { title: 'Happiness That Stays', subtitle: 'Not dependent on circumstances', image: '/png_images/Gemini_Generated_Image_oycjw2oycjw2oycj.png' }
            ].map((stage, index) => (
              <div key={index} className="p-4 text-center bg-white rounded-lg shadow-md sm:p-6">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-12 h-12 overflow-hidden bg-gray-100 border border-gray-200 rounded-lg sm:w-16 sm:h-16">
                    <img 
                      src={stage.image} 
                      alt={stage.title} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <h3 className="mb-1 text-sm font-bold sm:text-lg sm:mb-2">{stage.title}</h3>
                <p className="text-xs text-gray-600 sm:text-sm">{stage.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl p-6 mx-auto bg-white rounded-lg shadow-md sm:p-8">
            <h3 className="mb-3 text-xl font-bold text-center sm:text-2xl sm:mb-4">The Simple Truth</h3>
            <p className="mb-3 text-sm text-center text-gray-700 sm:mb-4 sm:text-base">
              Most approaches to happiness involve adding something new. This approach is different. It involves removing the obstacles to the peace that is already your natural state.
            </p>
            <ul className="space-y-1 text-xs text-center text-gray-600 sm:text-sm sm:space-y-2">
              <li>✓ Notice when attention wanders</li>
              <li>✓ Gently return to the present</li>
              <li>✓ Repeat until it becomes natural</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Ready to Begin */}
      <section className="px-4 py-12 sm:py-16 bg-gray-50">
        <div className="flex flex-col items-center max-w-4xl gap-6 mx-auto md:flex-row sm:gap-8">
          <div className="flex-shrink-0 order-2 md:order-1">
            <div className="w-48 h-48 overflow-hidden rounded-full sm:w-64 sm:h-64">
              <img 
                src="/png_images/Gemini_Generated_Image_mwmwf9mwmwf9mwmw.png" 
                alt="Ready to Begin" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="order-1 text-center md:text-left md:order-2">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:text-4xl sm:mb-4">Ready to Begin?</h2>
            <p className="mb-4 text-sm text-gray-600 sm:text-base sm:mb-6">
              Join thousands who have discovered that lasting happiness isn't something to achieve. It's something to recognize.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 md:justify-start">
              <button 
                onClick={handleStartJourney}
                className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-full sm:px-8 sm:py-3 sm:text-base hover:bg-blue-700">
                Start Your Journey!
              </button>
              <button 
                onClick={handleLearnMore}
                className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-full sm:px-8 sm:py-3 sm:text-base hover:bg-blue-700">
                Learn More
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 sm:mt-4">
              No subscription required • Complete guide included • Start immediately
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-white bg-purple-900 sm:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-3 text-sm italic sm:text-lg sm:mb-4">
            "This book offers a practice, not a philosophy. It's about returning—bringing attention back to what is already here."
          </p>
          <p className="mb-1 text-xs sm:text-sm sm:mb-2">- A.C. Amarasinghe</p>
          <p className="mt-4 text-xs font-semibold sm:text-sm sm:mt-8">The Return of Attention</p>
          <p className="mt-1 text-xs sm:mt-2">© All Rights Reserved, 2025</p>
        </div>
      </footer>
    </div>
  )
}