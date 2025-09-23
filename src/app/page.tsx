export default function Home() {
  return (
    <main className="min-h-screen meditation-gradient flex items-center justify-center p-4">
      <div className="meditation-card max-w-2xl w-full text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          The Return of Attention
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          A PAHM methodology meditation application
        </p>
        <p className="text-lg opacity-80 mb-8">
          Develop sustained attention and mindfulness through the Present Attention 
          and Happiness Matrix (PAHM) system by A.C. Amarasighe.
        </p>
        <div className="space-y-4">
          <div className="glass-effect rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">✅ Project Setup Complete</h3>
            <p className="text-sm opacity-80">
              Next.js with TypeScript, Tailwind CSS, and ESLint configured
            </p>
          </div>
          <div className="glass-effect rounded-lg p-4 opacity-60">
            <h3 className="text-lg font-semibold mb-2">🔄 Next: Database Setup</h3>
            <p className="text-sm opacity-80">
              Prisma and Supabase configuration
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}