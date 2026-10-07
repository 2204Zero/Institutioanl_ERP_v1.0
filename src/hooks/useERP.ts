import { useContext } from 'react';
import { ERPContext, ERPContextType } from '../context/ERPContext';

export function useERP(): ERPContextType {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
}
