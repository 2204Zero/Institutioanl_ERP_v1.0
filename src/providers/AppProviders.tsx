import React from 'react';
import { ERPProvider } from '../context/ERPContext';
import { StoreProvider } from '../store/StoreContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreProvider>
      <ERPProvider>{children}</ERPProvider>
    </StoreProvider>
  );
};
