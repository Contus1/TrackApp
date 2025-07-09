import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { friendsService } from '../services/friendsService';
import type { User } from '@supabase/supabase-js';
import DashboardPage from '../pages/dashboard';
import AuthPage from '../pages/auth';
import InviteHandler from '../components/InviteHandler';

// Simple Router für die TrackApp
const AppRouter: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
      (event, session) => {
        setUser(session?.user ?? null);
        
        // Handle post-login invite acceptance
        if (event === 'SIGNED_IN' && currentRoute.path === '/invite' && currentRoute.params?.token) {
          handleAutoAcceptInvite(session?.user || null, currentRoute.params.token);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [currentRoute]);

  // Auto-accept invite after login
  const handleAutoAcceptInvite = async (user: User | null, token: string) => {
    if (!user || !token) return;
    
    try {
      await friendsService.acceptInviteByToken(token, user.id);
      // Redirect to dashboard
      window.history.pushState({}, '', '/');
      setCurrentRoute({ path: '/' });
    } catch (error) {
      console.error('Auto-accept invite failed:', error);
    }
  };

  // Navigation helpers
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute({ path });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
        <InviteHandler
          token={currentRoute.params?.token || ''}
          user={user}
          onAccepted={() => navigate('/')}
          onError={(message) => {
            alert(message);
            navigate('/');
          }}
        />
      );

    case '/friends':
    case '/friend':
      if (!user) {
        return <AuthPage onLogin={() => navigate('/')} />;
      }
      return (
        <DashboardPage
          user={user}
          onLogout={handleLogout}
        />
      );

    default:
      if (!user) {
        return <AuthPage onLogin={() => navigate('/')} />;
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
