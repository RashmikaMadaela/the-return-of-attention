'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface Guide {
  id: string
  title: string
  description: string
  buttonColor: string
  action: () => void
}

export default function LearnPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState('main') // 'main' or 'posture'

  const guides: Guide[] = [
    {
      id: 'stage1',
      title: 'Stage 1 Guide',
      description: 'About Stage 1 practice sessions',
      buttonColor: 'bg-pink-600 hover:bg-pink-700',
      action: () => router.push('/learn/stage1-guide')
    },
    {
      id: 'pahm',
      title: 'PAHM Matrix',
      description: 'What is PAHM Matrix? Explained',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      action: () => router.push('/learn/pahm-guide')
    },
    {
      id: 'posture',
      title: 'Posture Guide',
      description: 'How to Sit in Correct Posture',
      buttonColor: 'bg-orange-400 hover:bg-orange-500',
      action: () => setCurrentPage('posture')
    }
  ]

  if (currentPage === 'posture') {
    return <PostureGuidePage onBack={() => setCurrentPage('main')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Navigation */}
      <Navigation currentPage="learn" />
      
      <div className="p-8 pt-24">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center text-white mb-8 sm:mb-12 lg:mb-16 px-4">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold drop-shadow-lg text-white">Learn About Return Of Attention</h1>
          </div>
        </div>

        {/* Guide Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col h-72 sm:h-80 hover:scale-105 transition-transform duration-300"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">{guide.title}</h2>
              <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 flex-grow text-center sm:text-left">{guide.description}</p>
              
              <button
                onClick={guide.action}
                className={`w-full ${guide.buttonColor} text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl text-base sm:text-lg lg:text-xl transition-all hover:shadow-lg active:scale-95 mt-auto min-h-[44px]`}
              >
                Start
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


interface PostureGuidePageProps {
  onBack: () => void
}

const PostureGuidePage: React.FC<PostureGuidePageProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'sitting', label: 'Sitting Positions' },
    { id: 'other', label: 'Other Positions' },
    { id: 'spine', label: 'Spine Alignment' },
    { id: 'hand', label: 'Hand Position' },
    { id: 'eye', label: 'Eye Position' },
    { id: 'breathing', label: 'Breathing' },
    { id: 'issues', label: 'Common Issues' }
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
      setSidebarOpen(false) // Close sidebar on mobile after selection
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-700 to-purple-800">
      {/* Navigation */}
      <Navigation currentPage="learn" />
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-purple-900/80 text-white p-3 rounded-lg shadow-lg backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className="flex pt-16">
        {/* Sidebar - Mobile responsive with overlay */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-64 bg-purple-900/95 lg:bg-purple-900/50 backdrop-blur-sm lg:backdrop-blur-none transition-transform duration-300 ease-in-out overflow-y-auto`}
        style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
          <div className="p-4 lg:p-6">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all text-base ${
                    activeSection === item.id
                      ? 'bg-pink-600 text-white' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={onBack}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg mt-8 min-h-[44px]"
            >
              Back to Learn
            </button>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
            style={{ top: '64px' }}
          />
        )}

        {/* Main Content - Responsive layout */}
        <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-12 overflow-y-auto">
          <div className="max-w-4xl">
            <section id="overview" className="mb-16 scroll-mt-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">Foundation of Practice</h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
                Proper posture is essential for effective meditation practice. It creates the physical foundation that allows your mind to settle and your attention to stabilize. This guide covers all aspects of meditation posture, including the often-overlooked but crucial element of eye position.
              </p>

              {/* Meditation Position Images */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="bg-white/10 rounded-xl overflow-hidden">
                  <img 
                    src="/png_images/freepik__the-style-is-candid-image-photography-with-natural__86906.png" 
                    alt="Sitting Position 1" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="bg-white/10 rounded-xl overflow-hidden">
                  <img 
                    src="/png_images/freepik__the-style-is-candid-image-photography-with-natural__86907.png" 
                    alt="Sitting Position 2" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="bg-white/10 rounded-xl overflow-hidden">
                  <img 
                    src="/png_images/freepik__the-style-is-candid-image-photography-with-natural__86908.png" 
                    alt="Sitting Position 3" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            </section>

            {/* Sitting Position */}
            <section id="sitting" className="mb-16 scroll-mt-8">
              <h2 className="text-3xl font-bold text-white mb-4">Sitting Position</h2>
              <p className="text-white/90 mb-4">
                Find a comfortable, seated position that allows your spine to be straight but not rigid. You may sit on a cushion on the floor, a meditation bench, or a chair.
              </p>
              
              <h3 className="text-xl font-bold text-white mb-3">Available Sitting Postures:</h3>
              <ul className="text-white/90 space-y-2 mb-6">
                <li><strong>Chair Sitting</strong> - Sitting upright on a chair with feet flat on the floor</li>
                <li><strong>Cushion Sitting</strong> - Sitting cross-legged on a meditation cushion</li>
                <li><strong>Seiza Position</strong> - Kneeling with weight resting on cushion or bench</li>
                <li><strong>Burmese Position</strong> - Sitting with both legs bent and resting on the floor</li>
                <li><strong>Half Lotus</strong> - One foot resting on the opposite thigh</li>
                <li><strong>Full Lotus</strong> - Both feet resting on opposite thighs (advanced)</li>
              </ul>

              <div className="bg-purple-900/50 border-l-4 border-pink-500 p-4 rounded">
                <h4 className="text-white font-bold mb-2">Chair Sitting:</h4>
                <p className="text-white/90">
                  Sit toward the front edge of the chair with both feet flat on the floor. Your knees should be at or below hip level. Avoid leaning against the backrest.
                </p>
              </div>
            </section>

            {/* Other Meditation Positions */}
            <section id="other" className="mb-16 scroll-mt-8">
              <h2 className="text-3xl font-bold text-white mb-4">Other Meditation Positions</h2>
              <p className="text-white/90 mb-4">
                While sitting is the most common meditation posture, these alternatives can be helpful depending on your physical needs and practice goals.
              </p>
              
              <h3 className="text-xl font-bold text-white mb-3">Available Alternative Postures:</h3>
              <ul className="text-white/90 space-y-2 mb-6">
                <li><strong>Lying Down</strong> - For body scan or relaxation practices (risk of falling asleep)</li>
                <li><strong>Standing</strong> - Standing with feet shoulder-width apart. This energetic posture promotes alertness and can be particularly helpful when feeling drowsy.</li>
              </ul>
              
              <p className="text-white/80 text-sm italic">
                Regardless of which position you choose, the key principles remain the same: maintain a straight spine, find a position that balances comfort with alertness, and keep the body relaxed yet not collapsed.
              </p>
            </section>

            {/* Spine Alignment */}
            <section id="spine" className="mb-16 scroll-mt-8">
              <h2 className="text-3xl font-bold text-white mb-4">Spine Alignment</h2>
              <p className="text-white/90 mb-4">
                The spine should be straight but not rigid - imagine a string gently pulling upward from the crown of your head. This creates a natural S-curve that supports proper energy flow and breathing.
              </p>
              
              <h3 className="text-xl font-bold text-white mb-3">Key Points:</h3>
              <ul className="text-white/90 space-y-2">
                <li>• Sit with your hips slightly higher than your knees (use a cushion if needed)</li>
                <li>• Allow your lower back to maintain its natural curve</li>
                <li>• Relax your shoulders down and slightly back</li>
                <li>• Keep your chin slightly tucked to align your neck with your spine</li>
                <li>• Imagine your head balanced effortlessly on top of your spine</li>
              </ul>
            </section>

            {/* Hand Position */}
            <section id="hand" className="mb-16 scroll-mt-8">
              <h2 className="text-3xl font-bold text-white mb-4">Hand Position</h2>
              <p className="text-white/90 mb-4">
                Your hands should rest in a comfortable position that promotes stability and relaxation.
              </p>
              
              <h3 className="text-xl font-bold text-white mb-3">Recommended Positions:</h3>
              <ul className="text-white/90 space-y-2 mb-4">
                <li><strong>Resting on Thighs</strong> - Place hands palms down on your thighs</li>
                <li><strong>Cosmic Mudra</strong> - Left hand resting in right hand, palms up, thumbs lightly touching to form an oval</li>
                <li><strong>Palms Up</strong> - Hands resting on thighs with palms facing upward in a receptive gesture</li>
              </ul>
              
              <p className="text-white/80 text-sm">
                Choose the position that feels most natural and allows your shoulders and arms to remain relaxed.
              </p>
            </section>

            {/* Eye Position */}
            <section id="eye" className="mb-16 scroll-mt-8">
              <h2 className="text-3xl font-bold text-white mb-4">Eye Position</h2>
              <p className="text-white/90 mb-4">
                Eye position is a crucial but often overlooked aspect of meditation posture. The position of your eyes directly influences your mental state during meditation.
              </p>
              
              <h3 className="text-xl font-bold text-white mb-3">Available Eye Positions:</h3>
              <ul className="text-white/90 space-y-2 mb-6">
                <li><strong>Softly Downcast</strong> - Eyes partially open with gaze resting about 3-5 feet in front of you on the floor. This is the traditional Zen approach and helps balance alertness with calmness.</li>
                <li><strong>Closed</strong> - Eyelids closed gently (not squeezed shut)</li>
                <li><strong>Slightly Upward</strong> - Eyes closed with attention directed slightly upward toward the eyes (between the eyebrows). This can help deepen concentration and create a sense of inner focus.</li>
                <li><strong>Straight Ahead</strong> - Eyes closed with attention directed straight ahead. This neutral position works well for many practitioners.</li>
              </ul>

              <div className="bg-blue-900/50 border-l-4 border-blue-400 p-6 rounded mb-6">
                <p className="text-white/90 mb-4">
                  According to the Foundation of Practice section in the Return of Attention, eye position significantly affects your mental state during meditation:
                </p>
                <ul className="text-white/90 space-y-2">
                  <li>• Downcast eye position tends to promote relaxation but may increase drowsiness</li>
                  <li>• The ideal position balances alertness and relaxation</li>
                  <li>• Upward eye position increases alertness and energy but may create tension</li>
                  <li>• Experiment to find which position works best for your practice</li>
                  <li>• Keep your gaze soft and unfocused regardless of direction</li>
                  <li>• Avoid staring or tensing the eyes</li>
                </ul>
              </div>
            </section>

            {/* Breathing */}
            <section id="breathing" className="mb-16 scroll-mt-8">
              <h2 className="text-3xl font-bold text-white mb-4">Breathing</h2>
              <p className="text-white/90 mb-4">
                While not strictly posture, breathing is intimately connected to how you hold your body.
              </p>
              
              <h3 className="text-xl font-bold text-white mb-3">Guidelines:</h3>
              <ul className="text-white/90 space-y-2">
                <li>• Breathe naturally through your nose</li>
                <li>• Allow the breath to flow into your lower abdomen</li>
                <li>• Keep your chest and shoulders relaxed</li>
                <li>• Don't force or control the breath - simply observe it</li>
                <li>• Notice how your posture affects your breathing pattern</li>
              </ul>
            </section>

            {/* Common Issues */}
            <section id="issues" className="mb-16 scroll-mt-8">
              <h2 className="text-3xl font-bold text-white mb-4">Common Issues & Solutions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Discomfort & Pain:</h3>
                  <ul className="text-white/90 space-y-2">
                    <li><strong>Knee Pain</strong> - Use additional cushions under knees or switch to chair sitting</li>
                    <li><strong>Back Pain</strong> - Ensure proper lumbar support by a higher cushion or different sitting position</li>
                    <li><strong>Numbness in Legs</strong> - Change positions more frequently, gradually build up sitting time</li>
                    <li><strong>Neck Tension</strong> - Check chin position; ensure it's slightly tucked, not jutting forward</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Mental States:</h3>
                  <ul className="text-white/90 space-y-2">
                    <li><strong>Drowsiness</strong> - Try a more upward posture; strengthen spine; allow more light in the room</li>
                    <li><strong>Agitation</strong> - Try a more downward posture; soften the gaze; deepen breathing</li>
                    <li><strong>Distraction</strong> - Reestablish proper posture & often helps bring attention back</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}