import React from 'react';
import { ERPProvider } from '../context/ERPContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ERPProvider>{children}</ERPProvider>;
};
