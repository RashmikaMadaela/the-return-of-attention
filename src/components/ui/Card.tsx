import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient'
}

export default function Card({ children, className, variant = 'default' }: CardProps) {
  const baseClasses = 'rounded-2xl p-6'
  
  const variantClasses = {
    default: 'bg-white/5 backdrop-blur-sm border border-white/10',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20',
    gradient: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10'
  }
  
  return (
    <div className={clsx(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  )
}