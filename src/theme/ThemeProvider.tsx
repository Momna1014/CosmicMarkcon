// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, AppTheme } from './index';

/**
 * Theme Context for automatic device theme detection
 */
const ThemeContext = createContext<AppTheme | null>(null);

/**
 * Theme Provider component that automatically detects and applies device theme
 * Automatically switches between light and dark theme based on device settings
 * 
 * @example
 * ```tsx
 * import { ThemeProvider } from '@/theme/ThemeProvider';
 * 
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <NavigationContainer>
 *         <YourApp />
 *       </NavigationContainer>
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  
  // Automatically select theme based on device settings
  // Falls back to light theme if device preference is not available
  const theme = deviceColorScheme === 'dark' ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access current theme in components
 * Returns the active theme (light or dark) based on device settings
 * 
 * @throws {Error} If used outside of ThemeProvider
 * 
 * @example
 * ```tsx
 * import { useTheme } from '@/theme/ThemeProvider';
 * 
 * function MyComponent() {
 *   const theme = useTheme();
 *   
 *   return (
 *     <View style={{ backgroundColor: theme.colors.background }}>
 *       <Text style={{ color: theme.colors.text }}>
 *         Hello World
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export const useTheme = (): AppTheme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Hook to get current device color scheme preference
 * Re-exports useColorScheme from react-native for convenience
 * Returns 'light', 'dark', or null
 * 
 * @example
 * ```tsx
 * import { useDeviceTheme } from '@/theme/ThemeProvider';
 * 
 * function MyComponent() {
 *   const deviceTheme = useDeviceTheme(); // 'light' | 'dark' | null
 *   
 *   return (
 *     <Text>
 *       Current device theme: {deviceTheme || 'default'}
 *     </Text>
 *   );
 * }
 * ```
 */
export const useDeviceTheme = useColorScheme;
