import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { ERPProvider } from '../context/ERPContext';
import { StoreProvider } from '../store/StoreContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <StoreProvider>
        <ERPProvider>{children}</ERPProvider>
      </StoreProvider>
    </ThemeProvider>
  );
};
