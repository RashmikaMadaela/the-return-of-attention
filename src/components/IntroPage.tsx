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
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]" suppressHydrationWarning={true}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-sm shadow-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8" suppressHydrationWarning={true}>
          <div className="flex items-center justify-between h-16" suppressHydrationWarning={true}>
            <div className="flex items-center space-x-2 sm:space-x-3" suppressHydrationWarning={true}>
              {/* PAHM Grid Logo - Animated Matrix */}
              <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 grid grid-cols-3 gap-0.5" suppressHydrationWarning={true}>
                {/* Row 1 */}
                <div className="w-full bg-orange-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}} suppressHydrationWarning={true}></div>
                <div className="w-full rounded-sm aspect-square bg-cyan-300 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s'}} suppressHydrationWarning={true}></div>
                <div className="w-full bg-purple-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}} suppressHydrationWarning={true}></div>
                
                {/* Row 2 */}
                <div className="w-full bg-yellow-400 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s'}} suppressHydrationWarning={true}></div>
                <div className="w-full bg-gray-200 rounded-sm aspect-square animate-pulse" style={{animationDelay: '2s', animationDuration: '2s'}} suppressHydrationWarning={true}></div>
                <div className="w-full bg-blue-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.2s'}} suppressHydrationWarning={true}></div>
                
                {/* Row 3 */}
                <div className="w-full bg-orange-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '2.5s', animationDuration: '2.8s'}} suppressHydrationWarning={true}></div>
                <div className="w-full bg-pink-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.2s', animationDuration: '3.8s'}} suppressHydrationWarning={true}></div>
                <div className="w-full bg-purple-200 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.3s'}} suppressHydrationWarning={true}></div>
              </div>
              
              {/* Text Logo */}
              <div className="text-sm font-bold sm:text-lg md:text-xl text-[#03478f]" suppressHydrationWarning={true}>
                The Return of Attention
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3" suppressHydrationWarning={true}>
              <button 
                onClick={handleLogin}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[#6465e0] border-2 border-[#6465e0] hover:bg-[#6465e0] hover:text-white transition-all rounded-lg">
                Login
              </button>
              <button 
                onClick={handleRegister}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] transition-all rounded-lg shadow-md">
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
      <section className="px-4 py-12 sm:py-16">
        <div className="grid max-w-6xl gap-6 mx-auto sm:gap-8 md:grid-cols-2">
          {/* Sound Familiar */}
          <div className="order-2 md:order-1 bg-[#e5f3ff] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-center sm:text-2xl md:text-3xl text-[#03478f]">Sound Familiar?</h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                { icon: '🌀', text: 'Mind won\'t quiet down' },
                { icon: '😰', text: 'Constant worry and stress' },
                { icon: '🔒', text: 'Feeling trapped in thoughts' },
                { icon: '😔', text: 'Nothing feels quite right' },
                { icon: '🔄', text: 'Always seeking, never satisfied' }
              ].map((item, index) => (
                <div key={index} className="p-3 sm:p-4 text-sm sm:text-base font-medium bg-white rounded-lg shadow-sm border-l-4 border-[#6465e0] flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What If There's a Way Out */}
          <div className="order-1 md:order-2 bg-[#e5f3ff] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-center sm:text-2xl md:text-3xl text-[#03478f]">What If There's a Way Out?</h2>
            <div className="p-6 text-center bg-white rounded-xl sm:p-8 shadow-md">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-full bg-gradient-to-br from-[#6465e0] to-[#7c7de8] p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img 
                      src="/png_images/Gemini_Generated_Image_tccj9vtccj9vtccj.png" 
                      alt="Mind" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
              <h3 className="mb-4 text-lg font-bold sm:text-xl text-[#03478f]">The Universal Solution</h3>
              <p className="mb-6 text-sm sm:text-base text-gray-700">
                Unlike your body, your mind is trainable. Thousands have found lasting peace through this simple practice.
              </p>
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#6465e0] to-[#7c7de8]">
                <h4 className="mb-2 text-2xl font-bold sm:text-3xl text-white">6 Stages</h4>
                <p className="text-sm sm:text-base text-white">From chaos to clarity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Journey to Freedom */}
      <section className="px-4 py-12 sm:py-16 bg-[#e5f3ff]">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-8 text-2xl font-bold text-center sm:text-3xl md:text-4xl text-[#03478f] sm:mb-12">
            Your Journey to Freedom
          </h2>
          
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {[
              { title: 'Stage 1-2', subtitle: 'Physical stillness & thought observation', image: '/png_images/Gemini_Generated_Image_20x8ln20x8ln20x8.png', color: 'from-orange-400 to-orange-500' },
              { title: 'Stage 3-4', subtitle: 'Recognizing mental patterns', image: '/png_images/Gemini_Generated_Image_3470n23470n23470.png', color: 'from-teal-400 to-teal-500' },
              { title: 'Stage 5-6', subtitle: 'Discovering lasting happiness', image: '/png_images/Gemini_Generated_Image_1699091699091699.png', color: 'from-purple-400 to-purple-500' },
              { title: 'No Beliefs', subtitle: 'Just practical experience', image: '/png_images/Gemini_Generated_Image_b8u6u1b8u6u1b8u6.png', color: 'from-blue-400 to-blue-500' },
              { title: 'No Special Skills', subtitle: 'Anyone can do this', image: '/png_images/Gemini_Generated_Image_gmvto9gmvto9gmvt.png', color: 'from-green-400 to-green-500' },
              { title: 'Happiness That Stays', subtitle: 'Not dependent on circumstances', image: '/png_images/Gemini_Generated_Image_oycjw2oycjw2oycj.png', color: 'from-pink-400 to-pink-500' }
            ].map((stage, index) => (
              <div key={index} className="p-6 text-center bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br ${stage.color} p-2.5 shadow-md`}>
                    <div className="w-full h-full rounded-lg overflow-hidden">
                      <img 
                        src={stage.image} 
                        alt={stage.title} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>
                <h3 className="mb-2 text-base font-bold sm:text-lg text-[#03478f]">{stage.title}</h3>
                <p className="text-xs text-gray-600 sm:text-sm">{stage.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl p-6 mx-auto bg-white rounded-xl shadow-2xl sm:p-8">
            <h3 className="mb-4 text-xl font-bold text-center sm:text-2xl text-[#03478f]">The Simple Truth</h3>
            <p className="mb-6 text-sm text-center text-gray-700 sm:text-base">
              Most approaches to happiness involve adding something new. This approach is different. It involves removing the obstacles to the peace that is already your natural state.
            </p>
            <div className="space-y-3">
              {[
                'Notice when attention wanders',
                'Gently return to the present',
                'Repeat until it becomes natural'
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 sm:p-4 bg-[#e5f3ff] rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#6465e0] to-[#7c7de8] flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-800 sm:text-base">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Begin */}
      <section className="px-4 py-12 sm:py-16">
        <div className="flex flex-col items-center max-w-4xl gap-6 mx-auto md:flex-row sm:gap-8">
          <div className="flex-shrink-0 order-2 md:order-1">
            <div className="w-48 h-48 overflow-hidden rounded-full sm:w-64 sm:h-64 ring-4 ring-[#6465e0] ring-offset-4">
              <img 
                src="/png_images/Gemini_Generated_Image_mwmwf9mwmwf9mwmw.png" 
                alt="Ready to Begin" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="order-1 text-center md:text-left md:order-2">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl text-[#03478f]">Ready to Begin?</h2>
            <p className="mb-6 text-sm text-gray-700 sm:text-base">
              Join thousands who have discovered that lasting happiness isn't something to achieve. It's something to recognize.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 md:justify-start">
              <button 
                onClick={handleStartJourney}
                className="px-6 py-3 text-sm font-bold text-white transition-all shadow-lg sm:px-8 sm:text-base bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] rounded-full">
                Start Your Journey!
              </button>
              <button 
                onClick={handleLearnMore}
                className="px-6 py-3 text-sm font-bold transition-all shadow-lg sm:px-8 sm:text-base bg-white text-[#6465e0] border-2 border-[#6465e0] hover:bg-[#6465e0] hover:text-white rounded-full">
                Learn More
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-600 sm:text-sm">
              No subscription required • Complete guide included • Start immediately
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 sm:py-12 bg-gradient-to-r from-[#6465e0] to-[#7c7de8]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <p className="mb-4 text-base italic sm:text-lg">
            "This book offers a practice, not a philosophy. It's about returning—bringing attention back to what is already here."
          </p>
          <p className="mb-2 text-sm sm:text-base">- A.C. Amarasinghe</p>
          <div className="my-6 border-t border-white/30"></div>
          <p className="text-sm font-semibold sm:text-base">The Return of Attention</p>
          <p className="mt-2 text-xs sm:text-sm opacity-90">© All Rights Reserved, 2025</p>
        </div>
      </footer>
    </div>
  )
}