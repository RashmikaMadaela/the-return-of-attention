import React from 'react'

// Branded skeleton used as a Suspense fallback across the app.
// Small, neutral skeleton that fits in cards/sections.
export default function Loading() {
  return (
    <div className="w-full flex items-center justify-center py-8" aria-busy="true" aria-label="Loading">
      <div className="w-full max-w-4xl animate-pulse">
        <div className="h-6 bg-slate-200 rounded-md dark:bg-slate-700 w-1/3 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-36 bg-slate-200 rounded-lg dark:bg-slate-700" />
          <div className="h-36 bg-slate-200 rounded-lg dark:bg-slate-700" />
          <div className="h-36 bg-slate-200 rounded-lg dark:bg-slate-700" />
        </div>
        <div className="mt-4 h-4 bg-slate-200 rounded-md dark:bg-slate-700 w-2/3" />
      </div>
    </div>
  )
}
