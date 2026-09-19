import React from 'react';
import { AppProviders } from './providers/AppProviders';
import { FinanceDashboardPage } from './pages/FinanceDashboardPage';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <FinanceDashboardPage />
    </AppProviders>
  );
};

export default App;
