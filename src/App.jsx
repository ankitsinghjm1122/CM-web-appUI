import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import LoginScreen from './components/screens/LoginScreen';
import AppLayout from './components/layout/AppLayout';
import DashboardScreen from './components/screens/DashboardScreen';
import CustomerListScreen from './components/screens/CustomerListScreen';
import CustomerFormModal from './components/screens/CustomerFormModal';
import SettingsScreen from './components/screens/SettingsScreen';
import CopilotDrawer from './components/copilot/CopilotDrawer';

export default function App() {
  const { user, activeTab, setActiveTab } = useApp();

  // Modal State for Add / Edit Customer
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const handleOpenAddCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setCustomerToEdit(null);
  };

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <AppLayout onOpenAddCustomer={handleOpenAddCustomer}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onNavigateToCustomers={() => setActiveTab('customers')}
            onOpenAddCustomer={handleOpenAddCustomer}
          />
        )}
        {activeTab === 'customers' && (
          <CustomerListScreen
            onAddCustomer={handleOpenAddCustomer}
            onEditCustomer={handleOpenEditCustomer}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen />
        )}
      </AppLayout>

      {/* Reusable Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        customerToEdit={customerToEdit}
      />

      {/* Autonomous AI Copilot Drawer */}
      <CopilotDrawer />
    </>
  );
}
