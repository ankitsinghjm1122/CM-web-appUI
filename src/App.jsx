import React from 'react';
import { useApp } from './context/AppContext';
import LoginScreen from './components/screens/LoginScreen';

export default function App() {
  const { user } = useApp();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8">
      <h1 className="text-2xl font-bold">Authenticated as {user.name}</h1>
      <p>Dashboard screen is next.</p>
    </div>
  );
}
