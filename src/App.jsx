import React from 'react';
import { useApp } from './context/AppContext';
import LoginScreen from './components/screens/LoginScreen';
import AppLayout from './components/layout/AppLayout';
import DashboardScreen from './components/screens/DashboardScreen';

export default function App() {
  const { user, activeTab, setActiveTab } = useApp();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <AppLayout
      onOpenAddCustomer={() => {
        setActiveTab('customers');
      }}
    >
      {activeTab === 'dashboard' && (
        <DashboardScreen
          onNavigateToCustomers={() => setActiveTab('customers')}
          onOpenAddCustomer={() => setActiveTab('customers')}
        />
      )}
      {activeTab === 'customers' && (
        <div className="p-4 text-center">Customer List Screen will be rendered here.</div>
      )}
      {activeTab === 'settings' && (
        <div className="p-4 text-center">Settings Screen will be rendered here.</div>
      )}
    </AppLayout>
  );
}
