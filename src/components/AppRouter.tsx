import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import LandingPage from '../pages/landing';
import DashboardPage from '../pages/dashboard';
import AuthPage from '../pages/auth';
import SimpleInviteAcceptor from '../components/SimpleInviteAcceptor';

// Simple Router für die TrackApp
const AppRouter: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<{
    path: string;
    params?: Record<string, string>;
  }>({ path: '/' });

  // Route Detection
  useEffect(() => {
    const detectRoute = () => {
      const path = window.location.pathname;
      
      if (path.startsWith('/invite/')) {
        const token = path.split('/invite/')[1];
        setCurrentRoute({
          path: '/invite',
          params: { token }
        });
      } else if (path === '/friends') {
        setCurrentRoute({ path: '/friends' });
      } else if (path.startsWith('/friend/')) {
        const friendId = path.split('/friend/')[1];
        setCurrentRoute({
          path: '/friend',
          params: { friendId }
        });
      } else {
        setCurrentRoute({ path: '/' });
      }
    };

    detectRoute();

    // Listen for route changes
    const handlePopState = () => detectRoute();
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auth State
  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [currentRoute]);

  // Navigation helpers
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute({ path });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAuth(false);
    navigate('/');
  };

  const handleLogin = () => {
    setShowAuth(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade App...</p>
        </div>
      </div>
    );
  }

  // Route Rendering
  switch (currentRoute.path) {
    case '/invite':
      return (
        <SimpleInviteAcceptor
          token={currentRoute.params?.token || ''}
          user={user}
          onCompleted={() => navigate('/')}
        />
      );

    case '/friends':
    case '/friend':
      if (!user) {
        return <AuthPage onLogin={handleLogin} onBack={() => setShowAuth(false)} />;
      }
      return (
        <DashboardPage
          user={user}
          onLogout={handleLogout}
        />
      );

    default:
      if (!user) {
        if (showAuth) {
          return <AuthPage onLogin={handleLogin} onBack={() => setShowAuth(false)} />;
        } else {
          return <LandingPage onGetStarted={() => setShowAuth(true)} />;
        }
      }
      return (
        <DashboardPage
          user={user}
          onLogout={handleLogout}
        />
      );
  }
};

export default AppRouter;
