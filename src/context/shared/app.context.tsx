/**
 * App Context
 * Provides global application state management
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// App state interface
export interface AppState {
  isLoading: boolean;
  theme: 'light' | 'dark';
  language: 'zh-TW' | 'en';
}

// App context value interface
export interface AppContextValue {
  // State
  isLoading: boolean;
  theme: 'light' | 'dark';
  language: 'zh-TW' | 'en';
  
  // Actions
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh-TW' | 'en') => void;
}

// Initial state
const initialState: AppState = {
  isLoading: false,
  theme: 'light',
  language: 'zh-TW',
};

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// App provider props
export interface AppProviderProps {
  children: ReactNode;
}

// App provider component
export function AppProvider({ children }: AppProviderProps) {
  const [isLoading, setLoading] = useState(initialState.isLoading);
  const [theme, setTheme] = useState(initialState.theme);
  const [language, setLanguage] = useState(initialState.language);

  const contextValue: AppContextValue = {
    // State
    isLoading,
    theme,
    language,
    
    // Actions
    setLoading,
    setTheme,
    setLanguage,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use app context
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Export the context for advanced usage
export { AppContext };