/**
 * Helper hook for accessing theme colors in components
 * Provides convenient access to theme colors with fallbacks
 */
import { useTheme } from '@/contexts/ThemeContext'

export function useThemeColors() {
  const { theme } = useTheme()

  return {
    // Background gradients
    bgGradient: `linear-gradient(to bottom, ${theme.bgGradientTop}, ${theme.bgGradientBottom})`,
    bgGradientTop: theme.bgGradientTop,
    bgGradientBottom: theme.bgGradientBottom,
    
    // Colors
    topicColor: theme.topicColor,
    buttonColor: theme.buttonColor,
    containerColor: theme.containerColor,
    textColor1: theme.textColor1,
    textColor2: theme.textColor2,
    
    // Tailwind-compatible style objects
    styles: {
      bgGradient: {
        background: `linear-gradient(to bottom, ${theme.bgGradientTop}, ${theme.bgGradientBottom})`
      },
      container: {
        backgroundColor: theme.containerColor
      },
      button: {
        backgroundColor: theme.buttonColor,
        color: theme.textColor2
      },
      heading: {
        color: theme.topicColor
      },
      textPrimary: {
        color: theme.textColor1
      },
      textSecondary: {
        color: theme.textColor2
      }
    }
  }
}
