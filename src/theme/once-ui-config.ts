// Once UI Design System Configuration
export const onceUIConfig = {
  // Color tokens - supporting both light and dark themes
  colors: {
    // Primary colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    
    // Neutral colors for backgrounds and text
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
      1000: '#000000'
    },
    
    // Semantic colors
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    }
  },
  
  // Typography scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Roboto Mono', 'Menlo', 'Monaco', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }]
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Spacing scale
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem'
  },
  
  // Border radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  
  // Shadow system
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },
  
  // Animation tokens
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

// Theme-specific configurations
export const lightTheme = {
  colors: {
    background: {
      primary: onceUIConfig.colors.neutral[0],
      secondary: onceUIConfig.colors.neutral[50],
      tertiary: onceUIConfig.colors.neutral[100],
      elevated: onceUIConfig.colors.neutral[0],
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: onceUIConfig.colors.neutral[900],
      secondary: onceUIConfig.colors.neutral[600],
      tertiary: onceUIConfig.colors.neutral[500],
      inverse: onceUIConfig.colors.neutral[0]
    },
    border: {
      primary: onceUIConfig.colors.neutral[200],
      secondary: onceUIConfig.colors.neutral[300],
      focus: onceUIConfig.colors.primary[500]
    }
  }
};

export const darkTheme = {
  colors: {
    background: {
      primary: onceUIConfig.colors.neutral[950],
      secondary: onceUIConfig.colors.neutral[900],
      tertiary: onceUIConfig.colors.neutral[800],
      elevated: onceUIConfig.colors.neutral[900],
      overlay: 'rgba(0, 0, 0, 0.7)'
    },
    text: {
      primary: onceUIConfig.colors.neutral[100],
      secondary: onceUIConfig.colors.neutral[400],
      tertiary: onceUIConfig.colors.neutral[500],
      inverse: onceUIConfig.colors.neutral[900]
    },
    border: {
      primary: onceUIConfig.colors.neutral[700],
      secondary: onceUIConfig.colors.neutral[600],
      focus: onceUIConfig.colors.primary[400]
    }
  }
};

export default onceUIConfig;
