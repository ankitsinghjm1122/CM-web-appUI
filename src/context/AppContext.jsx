import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_CUSTOMERS } from '../data/mockCustomers';
import {
  checkBackendHealth,
  fetchCustomersApi,
  addCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  resetCustomersApi
} from '../services/apiClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Backend connection & sync state
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  // 1. Theme State (persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('crm_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    localStorage.setItem('crm_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Authentication State (persisted in sessionStorage/localStorage)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    const mockUser = {
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Administrator',
      email: email,
      role: 'Operations Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setUser(mockUser);
    localStorage.setItem('crm_user', JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  // 3. User Profile State (for Settings page)
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('crm_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          role: 'Operations Director'
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Alex Morgan',
      email: 'alex.morgan@nexuscrm.io',
      role: 'Operations Director',
      phone: '+1 (555) 019-2834',
      company: 'Nexus Global Technologies',
      bio: 'Leading customer growth, onboarding workflows, and operational efficiency across all client accounts.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
  });

  const updateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('crm_profile', JSON.stringify(updatedProfile));
  };

  // 4. Customers State (persisted in localStorage and synced with FastAPI SQLite)
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('crm_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved customers, falling back to initial', e);
      }
    }
    return INITIAL_CUSTOMERS;
  });

  // Fetch customers from backend on load & periodic health check
  const refreshFromBackend = useCallback(async () => {
    try {
      setIsSyncing(true);
      const isHealthy = await checkBackendHealth();
      setIsBackendConnected(isHealthy);
      if (isHealthy) {
        const backendCustomers = await fetchCustomersApi();
        if (backendCustomers && Array.isArray(backendCustomers) && backendCustomers.length > 0) {
          setCustomers(backendCustomers);
          localStorage.setItem('crm_customers', JSON.stringify(backendCustomers));
          return backendCustomers;
        }
      }
    } catch (err) {
      console.warn('[AppContext] Failed to refresh from backend', err);
    } finally {
      setIsSyncing(false);
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const isHealthy = await checkBackendHealth();
        if (!mounted) return;
        setIsBackendConnected(isHealthy);
        if (isHealthy) {
          const backendCustomers = await fetchCustomersApi();
          if (mounted && backendCustomers && Array.isArray(backendCustomers) && backendCustomers.length > 0) {
            setCustomers(backendCustomers);
            localStorage.setItem('crm_customers', JSON.stringify(backendCustomers));
          }
        }
      } catch (err) {
        console.warn('[AppContext] Backend health check failed', err);
      }
    };
    init();

    // Check backend health periodically (every 12 seconds)
    const timer = setInterval(async () => {
      const isHealthy = await checkBackendHealth();
      if (mounted) {
        setIsBackendConnected(isHealthy);
      }
    }, 12000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('crm_customers', JSON.stringify(customers));
  }, [customers]);

  const addCustomer = async (customerData) => {
    const newCustomer = {
      ...customerData,
      id: customerData.id || `cust-${Date.now()}`,
      createdAt: customerData.createdAt || new Date().toISOString(),
      avatar: customerData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customerData.name)}`
    };
    // Optimistic local update
    setCustomers(prev => [newCustomer, ...prev]);

    // Backend sync
    if (isBackendConnected) {
      try {
        setIsSyncing(true);
        const savedApi = await addCustomerApi(newCustomer);
        if (savedApi && savedApi.id) {
          // Sync with exact backend payload if returned
          setCustomers(prev => prev.map(c => c.id === newCustomer.id ? { ...c, ...savedApi } : c));
        }
      } catch (err) {
        console.warn('[AppContext] Backend add failed, keeping optimistic copy', err);
      } finally {
        setIsSyncing(false);
      }
    }
    return newCustomer;
  };

  const updateCustomer = async (id, updatedData) => {
    // Optimistic local update
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updatedData } : c))
    );

    // Backend sync
    if (isBackendConnected) {
      try {
        setIsSyncing(true);
        await updateCustomerApi(id, updatedData);
      } catch (err) {
        console.warn('[AppContext] Backend update failed', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const deleteCustomer = async (id) => {
    // Optimistic local update
    setCustomers(prev => prev.filter(c => c.id !== id));

    // Backend sync
    if (isBackendConnected) {
      try {
        setIsSyncing(true);
        await deleteCustomerApi(id);
      } catch (err) {
        console.warn('[AppContext] Backend delete failed', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const resetCustomers = async () => {
    if (isBackendConnected) {
      try {
        setIsSyncing(true);
        const resetData = await resetCustomersApi();
        if (resetData && Array.isArray(resetData) && resetData.length > 0) {
          setCustomers(resetData);
          localStorage.setItem('crm_customers', JSON.stringify(resetData));
          return;
        }
      } catch (err) {
        console.warn('[AppContext] Backend reset failed, falling back to local seed', err);
      } finally {
        setIsSyncing(false);
      }
    }
    setCustomers(INITIAL_CUSTOMERS);
  };

  // 5. Customer Profile Modal State (opens when clicking any customer photo)
  const [profileCustomer, setProfileCustomer] = useState(null);

  const openCustomerProfile = (customer) => {
    setProfileCustomer(customer);
  };

  const closeCustomerProfile = () => {
    setProfileCustomer(null);
  };

  // 6. Operations Director Profile Modal State
  const [isDirectorProfileOpen, setIsDirectorProfileOpen] = useState(false);

  const openDirectorProfile = () => {
    setIsDirectorProfileOpen(true);
  };

  const closeDirectorProfile = () => {
    setIsDirectorProfileOpen(false);
  };

  // 7. Active Screen Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'customers' | 'settings'

  // 6. Dynamically Calculated Metrics
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'Active').length;
    const inactive = customers.filter(c => c.status === 'Inactive').length;

    // Determine "new this month" (current month or past 30 days)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const newThisMonth = customers.filter(c => {
      const created = new Date(c.createdAt);
      return created.getFullYear() === currentYear && created.getMonth() === currentMonth;
    }).length;

    return {
      total,
      active,
      inactive,
      newThisMonth
    };
  }, [customers]);

  // Monthly customer acquisition chart data dynamically calculated from customer data
  const monthlyChartData = useMemo(() => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthCounts = {
      'May': 0,
      'Jun': 0,
      'Jul': 0,
      'Aug': 0,
      'Sep': 0,
      'Oct': 0
    };

    customers.forEach(c => {
      const date = new Date(c.createdAt);
      const monthIndex = date.getMonth();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mName = monthNames[monthIndex];
      if (monthCounts[mName] !== undefined) {
        monthCounts[mName] += 1;
      }
    });

    return months.map(month => ({
      month,
      customers: monthCounts[month] || 0,
      activeRate: Math.min(100, Math.round(((monthCounts[month] || 0) * 12) + 65))
    }));
  }, [customers]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        user,
        login,
        logout,
        profile,
        updateProfile,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        resetCustomers,
        activeTab,
        setActiveTab,
        stats,
        monthlyChartData,
        profileCustomer,
        openCustomerProfile,
        closeCustomerProfile,
        isDirectorProfileOpen,
        openDirectorProfile,
        closeDirectorProfile,
        isBackendConnected,
        isSyncing,
        refreshFromBackend
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
