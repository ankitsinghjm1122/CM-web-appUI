import React from 'react';
import { useApp } from './context/AppContext';
import LoginScreen from './components/screens/LoginScreen';
import AppLayout from './components/layout/AppLayout';
import DashboardScreen from './components/screens/DashboardScreen';
import CustomerListScreen from './components/screens/CustomerListScreen';

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
        <CustomerListScreen
          onAddCustomer={() => {
            alert('Add/Edit modal is implemented in Screen 4');
          }}
          onEditCustomer={(customer) => {
            alert(`Edit modal for ${customer.name} is implemented in Screen 4`);
          }}
        />
      )}
      {activeTab === 'settings' && (
        <div className="p-4 text-center">Settings Screen will be rendered here.</div>
      )}
    </AppLayout>
  );
}
