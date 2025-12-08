'use client'

import React, { useState } from 'react'
import { X, Palette, RotateCcw } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function AppearanceSettings() {
  const { theme, updateTheme, resetTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const colorSections = [
    {
      key: 'bgGradientTop' as const,
      label: 'Background Gradient (Top)',
      description: 'Top color of page background gradient',
      value: theme.bgGradientTop,
    },
    {
      key: 'bgGradientBottom' as const,
      label: 'Background Gradient (Bottom)',
      description: 'Bottom color of page background gradient',
      value: theme.bgGradientBottom,
    },
    {
      key: 'topicColor' as const,
      label: 'Topic/Heading Color',
      description: 'Color for headings and titles',
      value: theme.topicColor,
    },
    {
      key: 'buttonColor' as const,
      label: 'Button Color',
      description: 'Primary button background color',
      value: theme.buttonColor,
    },
    {
      key: 'containerColor' as const,
      label: 'Container Color',
      description: 'Background color for cards and containers',
      value: theme.containerColor,
    },
    {
      key: 'textColor1' as const,
      label: 'Text Color 1 (Primary)',
      description: 'Primary text color (usually dark)',
      value: theme.textColor1,
    },
    {
      key: 'textColor2' as const,
      label: 'Text Color 2 (Secondary)',
      description: 'Secondary text color (usually light)',
      value: theme.textColor2,
    },
  ]

  const handleColorChange = (key: keyof typeof theme, value: string) => {
    updateTheme({ [key]: value })
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all colors to default?')) {
      resetTheme()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700"
      >
        <Palette className="w-4 h-4" />
        Appearance
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Appearance Settings</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white transition-colors rounded-lg hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Customize Theme Colors</h3>
                <p className="text-sm text-gray-600">
                  Personalize the appearance of your application
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
            </div>

            {/* Color Sections */}
            <div className="space-y-4">
              {colorSections.map((section) => (
                <div
                  key={section.key}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-900 mb-1">
                        {section.label}
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        {section.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={section.value}
                          onChange={(e) => handleColorChange(section.key, e.target.value)}
                          className="w-16 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={section.value}
                          onChange={(e) => handleColorChange(section.key, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div
                      className="w-20 h-20 border-2 border-gray-300 rounded-lg shadow-inner"
                      style={{ backgroundColor: section.value }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Section */}
            <div className="p-6 rounded-xl border-2 border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
              <div
                className="p-6 rounded-xl"
                style={{
                  background: `linear-gradient(to bottom, ${theme.bgGradientTop}, ${theme.bgGradientBottom})`,
                }}
              >
                <div
                  className="p-6 rounded-xl shadow-lg"
                  style={{ backgroundColor: theme.containerColor }}
                >
                  <h4
                    className="text-2xl font-bold mb-3"
                    style={{ color: theme.topicColor }}
                  >
                    Sample Heading
                  </h4>
                  <p className="mb-4" style={{ color: theme.textColor1 }}>
                    This is sample text using Text Color 1 (Primary)
                  </p>
                  <button
                    className="px-6 py-3 rounded-lg font-semibold shadow-md"
                    style={{
                      backgroundColor: theme.buttonColor,
                      color: theme.textColor2,
                    }}
                  >
                    Sample Button
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 p-6 bg-gray-50 border-t">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
