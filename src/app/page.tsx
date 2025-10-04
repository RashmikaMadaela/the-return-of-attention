import Link from 'next/link'
import { Metadata } from 'next'

// Landing page following UI Frontend Documentation structure and Development Guidelines
export const metadata: Metadata = {
  title: 'The Return of Attention - Practices for the Happiness that Stays',
  description: 'A simple, practical guide to happiness that actually stays. Discover the PAHM methodology and transform your relationship with thoughts.',
}

// Problem categories as defined in the UI documentation
const problemCategories = [
  { id: 1, text: "Mind won't quiet down", emoji: "🌪️" },
  { id: 2, text: "Constant worry and stress", emoji: "😰" }, 
  { id: 3, text: "Feeling trapped in thoughts", emoji: "🔄" },
  { id: 4, text: "Nothing feels quite right", emoji: "😕" },
  { id: 5, text: "Always seeking, never satisfied", emoji: "🔍" }
] as const;

// Stage overview data following the 6-stage progressive journey system
const stageOverview = [
  { 
    id: "1-2", 
    title: "Stage 1-2", 
    description: "Physical stillness & thought observation",
    stages: ["Physical Stillness", "Understanding Thought Patterns"]
  },
  { 
    id: "3-4", 
    title: "Stage 3-4", 
    description: "Recognizing mental patterns",
    stages: ["Dot Tracking Practice", "Tool-Free Practice"]
  },
  { 
    id: "5-6", 
    title: "Stage 5-6", 
    description: "Discovering lasting happiness",
    stages: ["Sustained Presence", "Integration & Teaching"]
  }
] as const;

// Core features as documented in the project overview
const coreFeatures = [
  { title: "No Beliefs", description: "Just practical experience" },
  { title: "No Special Skills", description: "Anyone can do this" },
  { title: "Happiness That Stays", description: "Not dependent on circumstances" }
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Exact Figma Match */}
      <section className="relative flex flex-col min-h-screen" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)' }}>
        
        {/* Navigation - Following navigation system from UI documentation */}
        <nav className="relative z-10 flex items-center justify-between p-6" role="navigation" aria-label="Main navigation">
          <Link href="/" className="text-lg font-medium text-white hover:text-white/90 transition-colors">
            The Return of Attention
          </Link>
          <div className="flex gap-3">
            <Link 
              href="/signin" 
              className="px-6 py-2 text-sm font-medium text-white transition-colors bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-600"
              aria-label="Sign in to your account"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 text-sm font-medium text-white transition-colors bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-red-500"
              aria-label="Create new account"
            >
              Register
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex items-center justify-center flex-1 px-6 pb-20">
          <div className="max-w-2xl text-center">
            
            {/* PAHM Matrix - 3x3 grid visualization as documented */}
            <div className="flex justify-center mb-12" role="img" aria-label="PAHM Matrix - 3x3 attention pattern grid">
              <div className="grid grid-cols-3 gap-2 p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
                {/* PAHM Matrix positions representing attention states across time and emotion */}
                <div className="w-16 h-16 bg-orange-400 rounded-lg transition-transform hover:scale-105" aria-label="Past positive attention state"></div>
                <div className="w-16 h-16 bg-green-400 rounded-lg transition-transform hover:scale-105" aria-label="Present positive attention state"></div>
                <div className="w-16 h-16 bg-purple-400 rounded-lg transition-transform hover:scale-105" aria-label="Future positive attention state"></div>
                <div className="w-16 h-16 bg-yellow-400 rounded-lg transition-transform hover:scale-105" aria-label="Past neutral attention state"></div>
                <div className="w-16 h-16 bg-blue-200 rounded-lg transition-transform hover:scale-105 ring-2 ring-white/30" aria-label="Present neutral attention state - center position"></div>
                <div className="w-16 h-16 bg-purple-300 rounded-lg transition-transform hover:scale-105" aria-label="Future neutral attention state"></div>
                <div className="w-16 h-16 bg-orange-300 rounded-lg transition-transform hover:scale-105" aria-label="Past negative attention state"></div>
                <div className="w-16 h-16 bg-pink-300 rounded-lg transition-transform hover:scale-105" aria-label="Present negative attention state"></div>
                <div className="w-16 h-16 bg-purple-300 rounded-lg transition-transform hover:scale-105" aria-label="Future negative attention state"></div>
              </div>
            </div>
            
            {/* Hero Text Content - Core messaging from documentation */}
            <header className="space-y-6">
              <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl leading-tight">
                "You are not your thoughts"
              </h1>
              <h2 className="mb-6 text-lg md:text-xl text-white/90 font-medium">
                Practices for the Happiness that Stays
              </h2>
              <p className="max-w-lg mx-auto mb-8 text-white/80 text-lg leading-relaxed">
                A simple, practical guide to happiness that actually stays. 
                Discover the PAHM methodology and transform your relationship with thoughts.
              </p>
            </header>
            
            {/* Primary CTA Button - Following button component standards */}
            <div className="space-y-4">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full shadow-xl hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-lg min-h-[56px]"
                aria-describedby="cta-description"
              >
                🚀 Practice Today!
              </Link>
              <p id="cta-description" className="text-sm text-white/70 sr-only">
                Start your journey to lasting happiness with our 6-stage meditation program
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section - Enhanced with accessibility and data structures */}
      <section className="py-16 bg-gray-50" aria-labelledby="problem-solution-heading">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Sound Familiar? - Problem Recognition */}
            <div className="space-y-6">
              <h2 id="problem-solution-heading" className="mb-6 text-2xl font-bold text-center text-gray-900">
                Sound Familiar?
              </h2>
              <div className="space-y-3" role="list" aria-label="Common mental struggles">
                {problemCategories.map((problem, index) => (
                  <div 
                    key={problem.id} 
                    role="listitem"
                    className="p-4 rounded-lg bg-cyan-100 hover:bg-cyan-200 transition-colors duration-200 focus-within:ring-2 focus-within:ring-cyan-500"
                    tabIndex={0}
                  >
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <span className="text-cyan-600" aria-hidden="true">{problem.emoji}</span>
                      {problem.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* What If There's a Way Out? - Solution Presentation */}
            <div className="p-8 rounded-lg bg-cyan-200 hover:bg-cyan-300 transition-colors duration-300">
              <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
                What If There's a Way Out?
              </h2>
              
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-yellow-300 rounded-full hover:bg-yellow-400 transition-colors duration-200">
                  <span className="text-2xl" role="img" aria-label="Lightning bolt representing breakthrough">⚡</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">The Universal Solution</h3>
                <p className="mb-6 text-gray-700 leading-relaxed">
                  Unlike your body, your mind is trainable. Thousands have found lasting peace through this simple practice.
                </p>
              </div>
              
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="mb-2 text-3xl font-bold text-gray-900" aria-label="Six stages total">6 Stages</div>
                <p className="text-gray-600 font-medium">From chaos to clarity</p>
                <p className="text-sm text-gray-500 mt-2">
                  Progressive system designed for lasting transformation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Overview */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' }}>
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-6 text-3xl font-bold text-white">Your Journey to Freedom</h2>
          </div>
          
          {/* Stage Overview Cards - Enhanced with structured data */}
          <div className="grid gap-6 mb-12 md:grid-cols-3" role="list" aria-label="Stage progression overview">
            {stageOverview.map((stageGroup, index) => (
              <article 
                key={stageGroup.id}
                role="listitem"
                className="p-6 text-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                tabIndex={0}
                aria-describedby={`stage-group-${stageGroup.id}-desc`}
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full font-bold">
                  <span className="text-lg" aria-label={`Stage group ${index + 1}`}>
                    {index + 1}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {stageGroup.title}
                </h3>
                <p 
                  id={`stage-group-${stageGroup.id}-desc`}
                  className="mb-4 text-sm text-gray-600 leading-relaxed"
                >
                  {stageGroup.description}
                </p>
              </article>
            ))}
          </div>

          {/* Core Features - Enhanced with accessibility */}
          <div className="grid gap-6 mb-12 md:grid-cols-3" role="list" aria-label="Core program features">
            {coreFeatures.map((feature, index) => (
              <article 
                key={index}
                role="listitem"
                className="p-6 text-center bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                tabIndex={0}
              >
                <div className="mb-3 text-3xl" role="img" aria-label={`Feature ${index + 1} icon`}>
                  {index === 0 ? '🎯' : index === 1 ? '👥' : '💎'}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          {/* The Simple Truth */}
          <div className="max-w-4xl p-8 mx-auto text-center bg-white rounded-lg">
            <h3 className="mb-4 text-2xl font-bold">The Simple Truth</h3>
            <p className="mb-6 text-gray-700">
              Most approaches to happiness involve adding something new. This approach is different. It involves removing the obstacles to the peace that is already your natural state.
            </p>
            <div className="text-sm text-gray-600">
              <span className="inline-block mx-2">👁️ Notice when attention wanders</span>
              <span className="inline-block mx-2">↩️ Gently return to the present</span>  
              <span className="inline-block mx-2">🔄 Repeat until it becomes natural</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Begin - Enhanced with accessibility and interactive features */}
      <section className="py-16 bg-gray-50" aria-labelledby="ready-to-begin-heading">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            
            {/* Left side - Interactive Meditation Circle */}
            <div className="flex justify-center">
              <div className="relative group">
                {/* Outer circle - animated on hover */}
                <div className="flex items-center justify-center bg-blue-100 rounded-full w-80 h-80 group-hover:bg-blue-200 transition-colors duration-500 shadow-lg">
                  {/* Inner circle - breathing animation */}
                  <div className="flex items-center justify-center bg-blue-200 rounded-full w-60 h-60 group-hover:scale-105 transition-transform duration-700">
                    {/* Meditation figure - interactive */}
                    <div className="flex items-center justify-center w-32 h-32 bg-purple-400 rounded-full group-hover:bg-purple-500 transition-colors duration-300 shadow-xl">
                      <div 
                        className="text-4xl text-white group-hover:scale-110 transition-transform duration-300" 
                        role="img" 
                        aria-label="Person meditating in peaceful state"
                      >
                        🧘‍♀️
                      </div>
                    </div>
                  </div>
                </div>
                {/* Subtle pulse effect */}
                <div className="absolute inset-0 bg-blue-300 rounded-full opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
              </div>
            </div>

            {/* Right side - Enhanced Content */}
            <div className="text-center lg:text-left space-y-6">
              <header>
                <h2 id="ready-to-begin-heading" className="mb-6 text-3xl font-bold text-gray-900">
                  Ready to Begin?
                </h2>
                <p className="mb-8 text-lg text-gray-700 leading-relaxed">
                  Join thousands who have discovered that lasting happiness isn't something to achieve—it's something to recognize.
                </p>
              </header>
              
              {/* Enhanced CTA Section */}
              <div className="mb-8 space-y-4">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 min-h-[56px] w-full lg:w-auto"
                  aria-describedby="start-cta-description"
                >
                  🚀 Start Your Journey!
                </Link>
                <p id="start-cta-description" className="text-sm text-gray-600 sr-only">
                  Begin your 6-stage meditation program for lasting happiness
                </p>
                
                <Link 
                  href="/questionnaire" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-gray-700 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/50 min-h-[56px] w-full lg:w-auto lg:ml-4"
                  aria-describedby="learn-more-description"
                >
                  📖 Learn More
                </Link>
                <p id="learn-more-description" className="text-sm text-gray-600 sr-only">
                  Explore our comprehensive questionnaire and methodology
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="text-sm text-gray-500 space-y-2">
                <p className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="text-green-600">✓</span> No subscription required
                  <span className="text-green-600 ml-4">✓</span> Complete guide included
                  <span className="text-green-600 ml-4">✓</span> Start immediately
                </p>
                <p className="text-xs text-gray-400">
                  Evidence-based approach used by thousands worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced with semantic markup and accessibility */}
      <footer 
        className="py-12 text-center text-white" 
        style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
        role="contentinfo"
        aria-label="Site footer with author quote and copyright"
      >
        <div className="max-w-4xl px-6 mx-auto space-y-6">
          {/* Inspirational Quote */}
          <blockquote className="mb-6 text-lg italic leading-relaxed max-w-3xl mx-auto">
            <p className="mb-4">
              "This book offers a practice, not a philosophy. It is about returning—bringing attention back to what is already here."
            </p>
            <footer className="not-italic">
              <cite className="text-white/90 font-medium">
                — A.C. Amarasinghe
              </cite>
              <div className="text-white/70 text-base mt-1">
                The Return of Attention
              </div>
            </footer>
          </blockquote>
          
          {/* Copyright and Legal */}
          <div className="border-t border-white/20 pt-6 space-y-2">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} The Return of Attention. All Rights Reserved.
            </p>
            <p className="text-xs text-white/50">
              Practices for the Happiness that Stays
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}