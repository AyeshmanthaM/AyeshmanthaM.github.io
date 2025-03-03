// Theme color configuration
// This file centralizes all theme colors for easy management

export type ThemeColors = {
  primary: string;
  primaryHover: string;
  primaryDark: string;
  primaryDarkHover: string;
  secondary: string;
  secondaryHover: string;
  secondaryDark: string;
  secondaryDarkHover: string;
  accent: {
    blue: string;
    purple: string;
    green: string;
    amber: string;
    teal: string;
    red: string;
  };
  accentDark: {
    blue: string;
    purple: string;
    green: string;
    amber: string;
    teal: string;
    red: string;
  };
  background: {
    light: string;
    dark: string;
  };
  card: {
    light: string;
    dark: string;
  };
  text: {
    light: string;
    darkLight: string;
    dark: string;
    darkDim: string;
  };
  categoryColors: {
    [key: string]: {
      bg: string;
      text: string;
      darkBg: string;
      darkText: string;
    };
  };
};

export const colors: ThemeColors = {
  primary: 'bg-blue-600',
  primaryHover: 'hover:bg-blue-700',
  primaryDark: 'dark:bg-blue-600',
  primaryDarkHover: 'dark:hover:bg-blue-700',
  
  secondary: 'bg-gray-200',
  secondaryHover: 'hover:bg-gray-300',
  secondaryDark: 'dark:bg-gray-700',
  secondaryDarkHover: 'dark:hover:bg-gray-600',
  
  accent: {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    teal: 'text-teal-600',
    red: 'text-red-600',
  },
  
  accentDark: {
    blue: 'dark:text-blue-400',
    purple: 'dark:text-purple-400',
    green: 'dark:text-green-400',
    amber: 'dark:text-amber-400',
    teal: 'dark:text-teal-400',
    red: 'dark:text-red-400',
  },
  
  background: {
    light: 'bg-gray-50',
    dark: 'dark:bg-gray-900',
  },
  
  card: {
    light: 'bg-white',
    dark: 'dark:bg-gray-800',
  },
  
  text: {
    light: 'text-gray-900',
    darkLight: 'text-gray-600',
    dark: 'dark:text-gray-100',
    darkDim: 'dark:text-gray-400',
  },
  
  categoryColors: {
    embedded: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      darkBg: 'dark:bg-blue-900/30',
      darkText: 'dark:text-blue-300',
    },
    mechatronics: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      darkBg: 'dark:bg-purple-900/30',
      darkText: 'dark:text-purple-300',
    },
    interactive: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      darkBg: 'dark:bg-green-900/30',
      darkText: 'dark:text-green-300',
    },
    automation: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      darkBg: 'dark:bg-amber-900/30',
      darkText: 'dark:text-amber-300',
    },
    iot: {
      bg: 'bg-teal-100',
      text: 'text-teal-800',
      darkBg: 'dark:bg-teal-900/30',
      darkText: 'dark:text-teal-300',
    },
  },
};

// Helper function to get category color classes
export const getCategoryColorClasses = (category: string): string => {
  const categoryKey = category.toLowerCase();
  const colorSet = colors.categoryColors[categoryKey] || colors.categoryColors.iot;
  
  return `${colorSet.bg} ${colorSet.text} ${colorSet.darkBg} ${colorSet.darkText}`;
};

// Helper function to get primary button classes
export const getPrimaryButtonClasses = (): string => {
  return `${colors.primary} ${colors.primaryHover} text-white ${colors.primaryDark} ${colors.primaryDarkHover}`;
};

// Helper function to get secondary button classes
export const getSecondaryButtonClasses = (): string => {
  return `${colors.secondary} ${colors.secondaryHover} text-gray-800 dark:text-gray-200 ${colors.secondaryDark} ${colors.secondaryDarkHover}`;
};

// Helper function to get card classes
export const getCardClasses = (): string => {
  return `${colors.card.light} ${colors.card.dark} rounded-xl shadow-lg`;
};