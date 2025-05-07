import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { AppProvider } from '../contexts/AppContext';

// Initialize theme on app load
function initializeTheme() {
  // Check localStorage first
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Check system preference if no localStorage value
    document.documentElement.classList.add('dark');
  }
}

// Main App component that provides context
export default function Layout() {
  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <Outlet />
      </div>
    </AppProvider>
  );
} 