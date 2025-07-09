import { useState, useEffect } from 'react';
import { authService, utils } from './services/supabase';
import type { User } from '@supabase/supabase-js';
import StartPage from './pages/start';
import LoginPage from './pages';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';

// Einfacher Router-State für Demo-Zwecke
type PageType = 'start' | 'login' | 'register' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('start');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Prüfe Authentication-Status beim App-Start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Prüfe aktuelle Session
        const { data: { session } } = await authService.getSession();
        
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(session.user);
          setCurrentPage('dashboard');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Überwache Auth-Status-Änderungen
    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
        setCurrentPage('dashboard');
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setCurrentPage('start');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigation Handler
  const navigate = (page: PageType) => {
    setCurrentPage(page);
  };

  // Authentication Handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        throw new Error(utils.formatSupabaseError(error));
      }
      
      if (data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        setCurrentPage('dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen');
    }
  };

  const handleRegister = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }) => {
    try {
      const { data, error } = await authService.signUp(
        userData.email, 
        userData.password,
        {
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      );
      
      if (error) {
        throw new Error(utils.formatSupabaseError(error));
      }
      
      if (data.user) {
        // Bei erfolgreicher Registrierung automatisch einloggen
        setIsAuthenticated(true);
        setUser(data.user);
        setCurrentPage('dashboard');
        alert('Registrierung erfolgreich! Willkommen bei TrackApp!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error instanceof Error ? error.message : 'Registrierung fehlgeschlagen');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await authService.signOut();
      
      if (error) {
        throw new Error(utils.formatSupabaseError(error));
      }
      
      setIsAuthenticated(false);
      setUser(null);
      setCurrentPage('start');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Abmeldung fehlgeschlagen');
    }
  };

  // Page Rendering
  const renderPage = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">💪</span>
            </div>
            <div className="w-8 h-8 mx-auto border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">TrackApp wird geladen...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'start':
        return <StartPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} onLogin={handleLogin} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} onRegister={handleRegister} />;
      case 'dashboard':
        return isAuthenticated ? <DashboardPage onLogout={handleLogout} user={user} /> : <LoginPage onNavigate={navigate} onLogin={handleLogin} />;
      default:
        return <StartPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
