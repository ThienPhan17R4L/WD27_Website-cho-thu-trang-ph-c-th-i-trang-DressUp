import React from 'react';
import AppRouter from '@/router/router';
import { NotificationProvider } from '@/contexts/NotificationContext';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppRouter />
    </NotificationProvider>
  );
};

export default App;
