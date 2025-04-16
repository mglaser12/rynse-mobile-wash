
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

const ThemeProviderContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: 'light',
  setTheme: () => null
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light', 
  storageKey = 'theme' 
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeProviderContext.Provider value={{ theme: theme || defaultTheme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useCustomTheme = () => useContext(ThemeProviderContext);
