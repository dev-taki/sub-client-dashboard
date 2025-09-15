import { theme } from './theme';

/**
 * Custom hook for accessing theme values
 * This provides type-safe access to theme properties
 */
export const useTheme = () => {
  return theme;
};

/**
 * Utility function to get CSS custom property value
 * Useful for dynamic styling in components
 */
export const getThemeValue = (property: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(property);
  }
  return '';
};

/**
 * Utility function to set CSS custom property value
 * Useful for dynamic theme switching
 */
export const setThemeValue = (property: string, value: string): void => {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(property, value);
  }
};

/**
 * Common theme utility functions
 */
export const themeUtils = {
  // Get primary color variants
  getPrimaryColor: () => getThemeValue('--color-primary'),
  getPrimaryHover: () => getThemeValue('--color-primary-hover'),
  getPrimaryLight: () => getThemeValue('--color-primary-light'),
  getPrimaryDark: () => getThemeValue('--color-primary-dark'),
  
  // Get text and background colors
  getTextColor: () => getThemeValue('--color-text'),
  getBackgroundColor: () => getThemeValue('--color-background'),
  
  // Get semantic colors
  getSuccessColor: () => getThemeValue('--color-success'),
  getWarningColor: () => getThemeValue('--color-warning'),
  getErrorColor: () => getThemeValue('--color-error'),
  getInfoColor: () => getThemeValue('--color-info'),
  
  // Get gray scale colors
  getGrayColor: (shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900) => 
    getThemeValue(`--color-gray-${shade}`),
};
