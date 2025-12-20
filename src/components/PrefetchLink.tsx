/**
 * Optimized Link component with automatic prefetching
 * Wraps Next.js Link with prefetch enabled by default for better navigation performance
 */

import Link from 'next/link'
import { ReactNode } from 'react'

interface PrefetchLinkProps {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
  onClick?: () => void
  title?: string
}

/**
 * PrefetchLink - Use this for frequently accessed routes
 * Automatically prefetches the route when the link enters viewport or is hovered
 * This significantly improves navigation speed by loading pages in the background
 */
export function PrefetchLink({
  href,
  children,
  className = '',
  prefetch = true,
  onClick,
  title,
}: PrefetchLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={onClick}
      className={className}
      title={title}
    >
      {children}
    </Link>
  )
}

/**
 * HoverPrefetchLink - Use for large lists or less frequently accessed routes
 * Only prefetches when user hovers over the link, reducing initial resource usage
 */
export function HoverPrefetchLink({
  href,
  children,
  className = '',
  onClick,
  title,
}: Omit<PrefetchLinkProps, 'prefetch'>) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      className={className}
      title={title}
    >
      {children}
    </Link>
  )
}

export default PrefetchLink
