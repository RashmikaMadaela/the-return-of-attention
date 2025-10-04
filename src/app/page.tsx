export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with PAHM Matrix */}
      <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* 3x3 PAHM Matrix Visual */}
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-3 gap-3 w-80 h-80 max-w-sm">
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                  key={i}
                  className={`rounded-lg border-2 ${
                    i === 4 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  } transition-all duration-200`}
                />
              ))}
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900">
            "You are not your thoughts"
          </h1>
          <h2 className="text-2xl md:text-3xl mb-4 text-gray-700">
            Practices for the Happiness that Stays
          </h2>
          <p className="text-xl mb-12 text-gray-600 max-w-3xl mx-auto">
            A simple, practical guide to happiness that actually stays
          </p>
          
          <a
            href="/register"
            className="inline-block bg-blue-600 text-white text-xl px-12 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Practice Today!
          </a>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Sound Familiar? */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                Sound Familiar?
              </h2>
              <div className="space-y-4">
                {[
                  "Mind won't quiet down",
                  "Constant worry and stress", 
                  "Feeling trapped in thoughts",
                  "Nothing feels quite right",
                  "Always seeking, never satisfied"
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What If There's a Way Out? */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                What If There's a Way Out?
              </h2>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🧘</span>
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-700">
                  <p className="font-semibold text-lg">The Universal Solution</p>
                  <p>Unlike your body, your mind is trainable. Thousands have found lasting peace through this simple practice.</p>
                  
                  <p className="font-semibold">6 Stages</p>
                  <p className="font-semibold">From chaos to clarity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Overview */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-16">Your Journey to Freedom</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Stage 1-2</h3>
              <p className="text-slate-300">Physical stillness & thought observation</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Stage 3-4</h3>
              <p className="text-slate-300">Recognizing mental patterns</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg">5</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Stage 5-6</h3>
              <p className="text-slate-300">Discovering lasting happiness</p>
            </div>
          </div>

          {/* The Simple Truth */}
          <div className="bg-slate-800 p-8 rounded-xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">The Simple Truth</h3>
            <p className="text-slate-300 mb-6">
              Most approaches to happiness involve adding something new. This approach is different. 
              It involves removing the obstacles to the peace that is already your natural state.
            </p>
            <p className="text-slate-300">
              Notice when attention wanders ↩️ Gently return to the present 🔄 Repeat until it becomes natural
            </p>
          </div>
        </div>
      </section>

      {/* Ready to Begin */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-6xl">✨</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Begin?</h2>
          <p className="text-xl mb-12 text-gray-600 max-w-2xl mx-auto">
            Join thousands who have discovered that lasting happiness isn't something to achieve— 
            it's something to recognize.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a
              href="/register"
              className="block sm:inline-block bg-blue-600 text-white text-lg px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Start Your Journey!
            </a>
            <a
              href="#learn-more"
              className="block sm:inline-block bg-white text-blue-600 text-lg px-8 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors font-semibold"
            >
              Learn More
            </a>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            No subscription required • Complete guide included • Start immediately
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl mb-4 italic">
            "This book offers a practice, not a philosophy. It is about returning— bringing attention back to what is already here."
          </blockquote>
          <p className="text-slate-400 mb-2">— A.C. Amarasinghe</p>
          <p className="text-slate-400 mb-4">The Return of Attention</p>
          <p className="text-slate-500 text-sm">© All Rights Reserved. 2025</p>
        </div>
      </footer>
    </main>
  )
}