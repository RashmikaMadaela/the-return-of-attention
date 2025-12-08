'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface ThemeColors {
  bgGradientTop: string      // #b9d4ee
  bgGradientBottom: string   // #fffafa
  topicColor: string         // #03478f
  buttonColor: string        // #6465e0
  containerColor: string     // #e5f3ff
  textColor1: string         // black
  textColor2: string         // white
}

const defaultTheme: ThemeColors = {
  bgGradientTop: '#b9d4ee',
  bgGradientBottom: '#fffafa',
  topicColor: '#03478f',
  buttonColor: '#6465e0',
  containerColor: '#e5f3ff',
  textColor1: '#000000',
  textColor2: '#ffffff',
}

interface ThemeContextType {
  theme: ThemeColors
  updateTheme: (newTheme: Partial<ThemeColors>) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme')
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme))
      } catch (e) {
        console.error('Failed to load theme:', e)
      }
    }
  }, [])

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appTheme', JSON.stringify(theme))
    // Update CSS variables for dynamic styling
    document.documentElement.style.setProperty('--bg-gradient-top', theme.bgGradientTop)
    document.documentElement.style.setProperty('--bg-gradient-bottom', theme.bgGradientBottom)
    document.documentElement.style.setProperty('--topic-color', theme.topicColor)
    document.documentElement.style.setProperty('--button-color', theme.buttonColor)
    document.documentElement.style.setProperty('--container-color', theme.containerColor)
    document.documentElement.style.setProperty('--text-color-1', theme.textColor1)
    document.documentElement.style.setProperty('--text-color-2', theme.textColor2)
  }, [theme])

  const updateTheme = (newTheme: Partial<ThemeColors>) => {
    setTheme(prev => ({ ...prev, ...newTheme }))
  }

  const resetTheme = () => {
    setTheme(defaultTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
