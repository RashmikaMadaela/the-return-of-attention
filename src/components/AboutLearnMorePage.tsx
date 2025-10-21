'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, BookOpen, Target, Heart, Brain, Zap, Users } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

export default function AboutLearnMorePage() {
  const router = useRouter()
  const [openFAQ, setOpenFAQ] = useState<number | null>(1) // Open second FAQ by default

  const faqs: FAQItem[] = [
    {
      question: "Do I need any previous meditation experience?",
      answer: "Not at all. This method is designed to be completely accessible to beginners. We start with the simplest observations—just sitting still and noticing your breath. If you can sit down and pay attention for a few minutes, you can do this. In fact, having no previous experience can be an advantage because you won't have preconceptions about what meditation 'should' feel like."
    },
    {
      question: "How long does each practice session take?",
      answer: "You start with just 5-10 minutes per day and gradually build up. By Stage 6, you might practice for 20-30 minutes, but the understanding integrates into daily life, so formal practice time becomes less important. Quality matters more than quantity—even short sessions done consistently will bring results."
    },
    {
      question: "What if I can't stop my thoughts?",
      answer: "Perfect—that's exactly where everyone starts! The method isn't about stopping thoughts; it's about changing your relationship with them. You'll learn to observe thoughts without getting caught up in them. Most people find that thoughts naturally quiet down as understanding deepens, but this happens as a side effect, not as the main goal. The key is learning to notice: 'Oh, I'm thinking,' without judgment."
    },
    {
      question: "Is this religious or does it conflict with my beliefs?",
      answer: "No, this is a practice-based method, not a religion or belief system. It requires no faith in anything except your own direct experience. People of all religions (or no religion) practice this successfully. You're not asked to accept any doctrines or abandon your existing beliefs—you're simply invited to observe your own mind and see what happens."
    },
    {
      question: "How is this different from other meditation apps?",
      answer: "Most apps focus on relaxation techniques or guided meditations. This platform is built around A.C. Amarasinghe's progressive 6-stage method—a complete system for understanding how your mind works and finding lasting happiness. It includes comprehensive practice tracking, mind recovery exercises, PAHM (Pure Awareness Healing Methods), and structured guidance that evolves with you. It's not just about feeling better temporarily; it's about fundamental transformation in how you experience life."
    },
    {
      question: "What if I miss days of practice?",
      answer: "Life happens—that's completely normal. This isn't about perfect consistency; it's about overall direction. The platform tracks your progress, and you can always pick up where you left off. Missing a few days doesn't erase your understanding. What matters is returning to the practice when you can. Many practitioners find that even after breaks, the insights they've gained remain accessible."
    },
    {
      question: "How do I know if it's working?",
      answer: "The platform includes built-in progress tracking and happiness metrics, but you'll also notice changes in daily life: you might find yourself less reactive to stressful situations, more present in conversations, or simply feeling lighter without knowing why. The shifts are often subtle at first—you might not notice them yourself, but others might comment that you seem different. Trust the process and keep observing."
    },
    {
      question: "What makes the author qualified to teach this?",
      answer: "A.C. Amarasinghe has spent decades deeply exploring the nature of mind and happiness, both through personal practice and study of wisdom traditions. More importantly, he's distilled these insights into a practical, secular method that thousands have successfully applied. The real qualification isn't in credentials—it's in whether the method works. Try it yourself and see."
    },
    {
      question: "Is there ongoing support or community?",
      answer: "Yes! The platform provides continuous guidance through each stage, with detailed instructions, daily notes tracking, reflection tools, and progress analytics. You're never left wondering what to do next. The method itself becomes your guide, and the understanding you develop is the ultimate support."
    },
    {
      question: "What if this doesn't work for me?",
      answer: "If you give this method honest practice for a few weeks and see no results whatsoever, that itself is interesting information. Usually, when people feel it's 'not working,' it's because they're expecting dramatic experiences or immediate relief. The changes are often quieter than expected. That said, this approach has worked for thousands of people from all walks of life. The universality of human mind mechanics means if it works for one person, it can work for anyone who practices consistently."
    },
    {
      question: "How much does this cost?",
      answer: "The platform is completely free to use. No subscription required, no hidden fees. A.C. Amarasinghe believes this understanding should be accessible to everyone, regardless of financial situation. All features—practice tracking, mind recovery, PAHM methods, and the complete 6-stage progression—are available at no cost."
    },
    {
      question: "Can children or teenagers use this method?",
      answer: "The platform requires users to be at least 13 years old. Teenagers can absolutely benefit from this practice, though parental guidance is recommended for younger users. The method's simplicity makes it accessible to young people, and developing these skills early can be particularly valuable during the formative years."
    }
  ]

  const handleBack = () => {
    router.push('/')
  }

  const handleGetStarted = () => {
    router.push('/signup')
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image - Same as IntroPage Hero */}
      <div 
        className="fixed inset-0 w-full h-full bg-center bg-no-repeat bg-cover -z-10" 
        style={{ backgroundImage: "url('/png_images/ChatGPT Image Sep 25, 2025, 11_50_43 AM.png')" }}
        suppressHydrationWarning={true}
      />
      
      {/* Navigation Bar - Same as IntroPage */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Animated PAHM Grid Logo */}
              <div className="relative flex-shrink-0 w-10 h-10 bg-purple-600 rounded-lg sm:w-12 sm:h-12">
                <div className="absolute inset-1 sm:inset-1.5 grid grid-cols-3 gap-0.5">
                  {/* Row 1 */}
                  <div className="w-full bg-orange-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                  <div className="w-full rounded-sm aspect-square bg-cyan-300 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s'}}></div>
                  <div className="w-full bg-purple-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                  
                  {/* Row 2 */}
                  <div className="w-full bg-yellow-400 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}></div>
                  <div className="w-full bg-gray-200 rounded-sm aspect-square animate-pulse" style={{animationDelay: '2s', animationDuration: '2s'}}></div>
                  <div className="w-full bg-blue-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.2s'}}></div>
                  
                  {/* Row 3 */}
                  <div className="w-full bg-orange-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '2.5s', animationDuration: '2.8s'}}></div>
                  <div className="w-full bg-pink-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.2s', animationDuration: '3.8s'}}></div>
                  <div className="w-full bg-purple-200 rounded-md aspect-square animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.3s'}}></div>
                </div>
              </div>
              
              {/* Text Logo - Hidden on very small screens */}
              <div className="block text-base font-semibold text-black sm:text-lg md:text-xl">
                The Return of Attention
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg sm:px-4 md:px-6 hover:bg-blue-700 sm:text-sm md:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl px-4 pt-20 pb-8 mx-auto sm:px-6 lg:px-8 sm:pt-24 sm:pb-12">
        {/* Header Section */}
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-3 text-2xl font-bold text-white drop-shadow-lg sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
            The Return of Attention Method
          </h1>
          <p className="max-w-3xl mx-auto text-sm leading-relaxed text-white drop-shadow-lg sm:text-base md:text-lg lg:text-xl">
            A complete 6-stage journey from mental chaos to lasting happiness
          </p>
        </div>

        {/* Why This Method Works Section */}
        <section className="p-4 mb-8 shadow-lg bg-gray-50 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl sm:mb-12">
          <h2 className="mb-4 text-xl font-bold text-center text-gray-800 sm:mb-6 sm:text-2xl md:text-3xl">
            Why This Method Works
          </h2>
          
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {[
              {
                icon: <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Progressive System",
                description: "Six carefully structured stages that build on each other, taking you from basic attention training to deep understanding."
              },
              {
                icon: <Brain className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Based on Direct Experience",
                description: "No beliefs required—everything is discovered through your own observation and practice."
              },
              {
                icon: <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Lasting Results",
                description: "Unlike temporary relaxation techniques, this addresses the root causes of unhappiness for permanent change."
              },
              {
                icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Practical & Simple",
                description: "Start with just 5-10 minutes a day. No special equipment, beliefs, or lifestyle changes required."
              },
              {
                icon: <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Complete Platform",
                description: "Includes practice tracking, mind recovery exercises, PAHM methods, progress analytics, and daily guidance."
              },
              {
                icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Proven Method",
                description: "Developed by A.C. Amarasinghe and successfully practiced by thousands worldwide."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-4 transition-all duration-300 bg-white border border-gray-200 shadow-md sm:p-5 md:p-6 rounded-xl sm:rounded-2xl hover:shadow-xl hover:scale-105"
              >
                <div className="flex justify-center mb-3 text-purple-600 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-center text-gray-800 sm:mb-3 sm:text-lg md:text-xl">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-center text-gray-600 sm:text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The 6 Stages Section */}
        <section className="p-4 mb-8 shadow-lg bg-gray-50 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl sm:mb-12">
          <h2 className="mb-4 text-xl font-bold text-center text-gray-800 sm:mb-6 sm:text-2xl md:text-3xl">
            The 6 Stages to Lasting Happiness
          </h2>
          
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {[
              {
                stage: "Stage 1-2",
                title: "Foundation & Observation",
                description: "Learn to sit still and observe your breath. Begin noticing how your mind works without trying to change anything. Discover the difference between being lost in thoughts and observing them."
              },
              {
                stage: "Stage 3-4",
                title: "Pattern Recognition",
                description: "Start recognizing mental patterns—how thoughts trigger emotions, how the mind seeks and avoids. Develop the ability to watch your thinking without getting caught up in it."
              },
              {
                stage: "Stage 5-6",
                title: "Understanding & Freedom",
                description: "Experience the fundamental shift: realizing you are not your thoughts. Discover the happiness that doesn't depend on circumstances. Live with clarity, peace, and freedom from mental suffering."
              }
            ].map((stage, index) => (
              <div
                key={index}
                className="p-4 transition-all duration-300 bg-white border border-gray-200 shadow-md sm:p-5 md:p-6 rounded-xl sm:rounded-2xl hover:shadow-xl"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-base font-bold text-white rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 sm:w-16 sm:h-16 md:w-20 md:h-20 sm:text-lg md:text-xl">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-xs font-semibold text-blue-600 sm:text-sm md:text-base">
                      {stage.stage}
                    </div>
                    <h3 className="mb-2 text-base font-bold text-gray-800 sm:text-lg md:text-xl lg:text-2xl">
                      {stage.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-gray-600 sm:text-sm md:text-base">
                      {stage.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="mb-2 text-xl font-bold text-white drop-shadow-lg sm:mb-3 sm:text-2xl md:text-3xl">
              Questions & Answers
            </h2>
            <p className="max-w-3xl mx-auto text-sm text-white drop-shadow-lg sm:text-base md:text-lg">
              Common questions about The Return of Attention Method
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden bg-white border border-gray-200 shadow-md rounded-xl sm:rounded-2xl"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex items-center justify-between w-full p-4 text-left transition-all sm:p-5 md:p-6 hover:bg-gray-50"
                >
                  <h3 className="pr-3 text-sm font-semibold text-gray-800 sm:pr-4 sm:text-base md:text-lg">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 text-gray-600 transition-transform sm:w-6 sm:h-6 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openFAQ === index && (
                  <div className="px-4 pb-4 border-t border-gray-200 sm:px-5 sm:pb-5 md:px-6 md:pb-6">
                    <div className="pt-3 sm:pt-4 md:pt-5">
                      <p className="text-xs leading-relaxed text-gray-700 sm:text-sm md:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="p-4 space-y-4 text-center shadow-lg bg-gray-50 sm:p-6 md:p-8 sm:space-y-6 rounded-2xl sm:rounded-3xl">
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">
            Still Have Questions?
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-gray-700 sm:text-base md:text-lg">
            The best way to understand this method is to experience it yourself. Start your journey today and discover what thousands have already found.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-3 mx-auto sm:flex-row sm:gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full px-6 py-3 text-sm font-bold text-white transition-all transform rounded-full shadow-lg sm:w-auto sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 sm:text-base md:text-lg"
            >
              Start Your Journey
            </button>
            <button
              onClick={handleBack}
              className="w-full px-6 py-3 text-sm font-semibold text-gray-800 transition-all bg-white border-2 border-gray-300 rounded-full shadow-md sm:w-auto sm:px-8 sm:py-4 hover:bg-gray-50 hover:shadow-lg sm:text-base md:text-lg"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-600 sm:mt-6 sm:text-sm">
            <p>No subscription required • Complete guidance included • Start today</p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="px-4 py-6 text-white bg-purple-900 sm:py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-2 text-xs italic sm:text-sm md:text-base">
            "This book offers a practice, not a philosophy. It's about returning—bringing attention back to what is already here."
          </p>
          <p className="mb-1 text-xs sm:text-sm">- A.C. Amarasinghe</p>
          <p className="mt-3 text-xs font-semibold sm:mt-4 sm:text-sm">The Return of Attention</p>
          <p className="mt-1 text-xs">© All Rights Reserved, 2025</p>
        </div>
      </footer>
    </div>
  )
}
