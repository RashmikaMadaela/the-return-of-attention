'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function IntroPage() {
  const router = useRouter()

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
    sessionStorage.setItem('previousPage', '/')
    router.push('/learn/pahm-guide')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar - Transparent with backdrop blur */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-lg sm:text-xl font-semibold text-gray-800">
              The Return of Attention
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={handleLogin}
                className="px-3 sm:px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs sm:text-sm md:text-base">
                Login
              </button>
              <button 
                onClick={handleRegister}
                className="px-3 sm:px-4 md:px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-xs sm:text-sm md:text-base">
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 px-4">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: "url('/png_images/ChatGPT Image Sep 25, 2025, 11_50_43 AM.png')" }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Animated Grid Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 bg-purple-600 rounded-lg">
              {/* Using CSS Grid for perfect alignment */}
              <div className="absolute inset-4 sm:inset-6 grid grid-cols-3 gap-2 sm:gap-3">
                {/* Row 1 */}
                <div className="w-full aspect-square bg-orange-300 rounded-2xl animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                <div className="w-full aspect-square bg-cyan-300 rounded-lg animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s'}}></div>
                <div className="w-full aspect-square bg-purple-300 rounded-2xl animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                
                {/* Row 2 */}
                <div className="w-full aspect-square bg-yellow-400 rounded-lg animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}></div>
                <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse" style={{animationDelay: '2s', animationDuration: '2s'}}></div>
                <div className="w-full aspect-square bg-blue-300 rounded-lg animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.2s'}}></div>
                
                {/* Row 3 */}
                <div className="w-full aspect-square bg-orange-300 rounded-2xl animate-pulse" style={{animationDelay: '2.5s', animationDuration: '2.8s'}}></div>
                <div className="w-full aspect-square bg-pink-300 rounded-lg animate-pulse" style={{animationDelay: '1.2s', animationDuration: '3.8s'}}></div>
                <div className="w-full aspect-square bg-purple-200 rounded-2xl animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.3s'}}></div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            "You are not your thoughts"
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white font-semibold mb-2 drop-shadow-lg">
            Practices for the Happiness that Stays
          </p>
          <p className="text-sm sm:text-base text-white/90 mb-6 sm:mb-8 drop-shadow-lg">
            A simple, practical guide to happiness that actually stays
          </p>
          <button 
            onClick={handlePracticeToday}
            className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-blue-700 transition-colors shadow-lg">
            Practice Today!
          </button>
        </div>
      </section>

      {/* Sound Familiar & What If Section */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto grid gap-6 sm:gap-8 md:grid-cols-2">
          {/* Sound Familiar */}
          <div className="order-2 md:order-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6">Sound Familiar?</h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                'Mind wont quiet down',
                'Constant worry and stress',
                'Feeling trapped in thoughts',
                'Nothing feels quite right',
                'Always seeking, never satisfied'
              ].map((text, index) => (
                <div key={index} className="bg-cyan-300 p-3 sm:p-4 rounded-lg text-center font-medium text-sm sm:text-base">
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* What If There's a Way Out */}
          <div className="order-1 md:order-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6">What If There's a Way Out?</h2>
            <div className="bg-cyan-300 p-6 sm:p-8 rounded-lg text-center">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-black">
                  <img 
                    src="/png_images/Gemini_Generated_Image_tccj9vtccj9vtccj.png" 
                    alt="Mind" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">The Universal Solution</h3>
              <p className="text-xs sm:text-sm mb-4 sm:mb-6">
                Unlike your body, your mind is trainable. Thousands have found lasting peace through this simple practice.
              </p>
              <h4 className="text-xl sm:text-2xl font-bold mb-2">6 Stages</h4>
              <p className="text-xs sm:text-sm">From chaos to clarity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Journey to Freedom */}
      <section className="py-12 sm:py-16 px-4 relative">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-20" 
          style={{ backgroundImage: "url('/png_images/ChatGPT Image Sep 25, 2025, 11_50_43 AM.png')" }}
        />
        <div className="relative max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Your Journey to Freedom
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[
              { title: 'Stage 1-2', subtitle: 'Physical stillness & thought observation', image: '/png_images/Gemini_Generated_Image_20x8ln20x8ln20x8.png' },
              { title: 'Stage 3-4', subtitle: 'Recognizing mental patterns', image: '/png_images/Gemini_Generated_Image_3470n23470n23470.png' },
              { title: 'Stage 5-6', subtitle: 'Discovering lasting happiness', image: '/png_images/Gemini_Generated_Image_1699091699091699.png' },
              { title: 'No Beliefs', subtitle: 'Just practical experience', image: '/png_images/Gemini_Generated_Image_b8u6u1b8u6u1b8u6.png' },
              { title: 'No Special Skills', subtitle: 'Anyone can do this', image: '/png_images/Gemini_Generated_Image_gmvto9gmvto9gmvt.png' },
              { title: 'Happiness That Stays', subtitle: 'Not dependent on circumstances', image: '/png_images/Gemini_Generated_Image_oycjw2oycjw2oycj.png' }
            ].map((stage, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <img 
                      src={stage.image} 
                      alt={stage.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">{stage.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{stage.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-3 sm:mb-4">The Simple Truth</h3>
            <p className="text-center mb-3 sm:mb-4 text-gray-700 text-sm sm:text-base">
              Most approaches to happiness involve adding something new. This approach is different. It involves removing the obstacles to the peace that is already your natural state.
            </p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2 text-center">
              <li>✓ Notice when attention wanders</li>
              <li>✓ Gently return to the present</li>
              <li>✓ Repeat until it becomes natural</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Ready to Begin */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="flex-shrink-0 order-2 md:order-1">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden">
              <img 
                src="/png_images/Gemini_Generated_Image_mwmwf9mwmwf9mwmw.png" 
                alt="Ready to Begin" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-center md:text-left order-1 md:order-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Begin?</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Join thousands who have discovered that lasting happiness isn't something to achieve—it's something to recognize.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <button 
                onClick={handleStartJourney}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors">
                Start Your Journey!
              </button>
              <button 
                onClick={handleLearnMore}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors">
                Learn More
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 sm:mt-4">
              No subscription required • Complete guide included • Start immediately
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm sm:text-lg mb-3 sm:mb-4 italic">
            "This book offers a practice, not a philosophy. It's about returning—bringing attention back to what is already here."
          </p>
          <p className="text-xs sm:text-sm mb-1 sm:mb-2">- A.C. Amarasinghe</p>
          <p className="text-xs sm:text-sm font-semibold mt-4 sm:mt-8">The Return of Attention</p>
          <p className="text-xs mt-1 sm:mt-2">© All Rights Reserved, 2025</p>
        </div>
      </footer>
    </div>
  )
}