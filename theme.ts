/**
 * Theme Configuration - Modern Pastel + Bitcoin Orange Energy
 * 
 * Color System:
 * - Primary: Bitcoin Orange (#F7931A)
 * - Secondary: Off-white (#FAFAFA)
 * - Background Muted: Soft pastel (#FFEDE2)
 * 
 * Typography:
 * - Headings: Outfit/Poppins (bold, uppercase, tracking-tight)
 * - Body: Inter/DM Sans (medium weight, line-height 1.6-1.8)
 */

export const theme = {
  colors: {
    primary: '#F7931A', // Bitcoin Orange
    primaryLight: '#FF9F40', // Coral
    secondary: '#FAFAFA', // Off-white
    background: {
      light: '#FFFFFF',
      muted: '#FFEDE2', // Soft pastel
    },
    text: {
      primary: '#1E1E1E',
      secondary: '#555555',
    },
    footer: {
      background: '#1E1E1E',
    },
  },
  typography: {
    heading: {
      fontFamily: 'Poppins, Outfit, sans-serif',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      textTransform: 'uppercase' as const,
    },
    body: {
      fontFamily: 'Inter, DM Sans, sans-serif',
      fontWeight: '400',
      lineHeight: 1.6,
    },
  },
  spacing: {
    section: 'py-12 px-6',
    card: 'p-4 md:p-6',
  },
  borderRadius: {
    button: 'rounded-full',
    card: 'rounded-xl',
    input: 'rounded-md',
  },
  shadows: {
    card: 'shadow-md',
    cardHover: 'shadow-lg',
  },
} as const;

