import React, { useState, useEffect } from 'react';
import StartPage from './pages/start';
import LoginPage from './pages';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';

// Einfacher Router-State für Demo-Zwecke
type PageType = 'start' | 'login' | 'register' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('start');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Prüfe Authentication-Status beim App-Start
  useEffect(() => {
    // Hier würde die Supabase-Session-Prüfung erfolgen
    const checkAuth = async () => {
      // Für Demo-Zwecke: Prüfe localStorage
      const savedAuth = localStorage.getItem('trackapp_demo_auth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
      }
    };

    checkAuth();
  }, []);

  // Navigation Handler
  const navigate = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('trackapp_demo_auth', 'true');
    navigate('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('trackapp_demo_auth');
    navigate('start');
  };

  // Page Rendering
  const renderPage = () => {
    switch (currentPage) {
      case 'start':
        return <StartPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'dashboard':
        return isAuthenticated ? <DashboardPage /> : <LoginPage />;
      default:
        return <StartPage />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
