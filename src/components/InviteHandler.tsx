import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { friendsService } from '../services/friendsService';
import type { User } from '@supabase/supabase-js';

interface InviteData {
  token: string;
  inviter_id: string;
  invitee_email: string;
  created_at: string;
  expires_at: string;
}

interface InviteHandlerProps {
  token: string;
  user: User | null;
  onCompleted: () => void;
}

const InviteHandler: React.FC<InviteHandlerProps> = ({ 
  token, 
  user, 
  onCompleted 
}) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error' | 'expired'>('loading');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [message, setMessage] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const acceptInvite = useCallback(async () => {
    if (!user) return;

    try {
      setStatus('loading');
      
      const { error } = await friendsService.acceptInviteByToken(token, user.id);
      
      if (error) {
        setStatus('error');
        setMessage(error);
        return;
      }

      setStatus('success');
      setMessage('Einladung erfolgreich angenommen! Du bist jetzt mit deinem Freund verbunden.');
      
      // Redirect after success
      setTimeout(() => {
        onCompleted();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to accept invite:', error);
      setStatus('error');
      setMessage('Fehler beim Annehmen der Einladung');
    }
  }, [user, token, onCompleted]);

  useEffect(() => {
    const loadInvite = async () => {
      try {
        console.log('🔍 Loading invite with token:', token);
        
        // Try to get invite from localStorage first
        const { data: invite, error } = await friendsService.getInviteByToken(token);
        
        if (error) {
          console.error('Invite error:', error);
          setStatus('error');
          setMessage(error);
          return;
        }

        if (!invite) {
          setStatus('error');
          setMessage('Einladung nicht gefunden oder bereits verwendet');
          return;
        }

        setInviteData(invite);
        setStatus('ready');
        
        // If user is already logged in, try to accept invite immediately
        if (user) {
          await acceptInvite();
        } else {
          // Pre-fill email if available
          if (invite.invitee_email) {
            setEmail(invite.invitee_email);
          }
          setShowAuth(true);
        }
        
      } catch (error) {
        console.error('Failed to load invite:', error);
        setStatus('error');
        setMessage('Fehler beim Laden der Einladung');
      }
    };

    if (token) {
      loadInvite();
    } else {
      setStatus('error');
      setMessage('Kein Einladungstoken gefunden');
    }
  }, [token, user, acceptInvite]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        
        if (error) throw error;
        
        // User will be detected in useEffect and invite will be accepted
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim() || email.split('@')[0],
            },
          },
        });
        
        if (error) throw error;
        setMessage('Registrierung erfolgreich! Bestätige deine E-Mail-Adresse.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten';
      setMessage(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  // Clear browser data for testing
  const clearBrowserData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear browser data:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lade Einladung...</h2>
          <p className="text-gray-600">Einen Moment bitte</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Einladung ungültig</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="space-y-3">
            <button 
              onClick={onCompleted}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Zur App
            </button>
            <button 
              onClick={clearBrowserData}
              className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Browser-Daten löschen & neu laden
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Erfolgreich verbunden!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <p className="text-sm text-gray-500">Du wirst automatisch weitergeleitet...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not logged in
  if (!user && showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Freundeseinladung</h2>
            <p className="text-gray-600">
              {inviteData?.invitee_email ? `Einladung für ${inviteData.invitee_email}` : 'Du wurdest eingeladen!'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!inviteData?.invitee_email}
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Anzeigename (optional)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50"
            >
              {authLoading ? 'Verarbeitung...' : (isLogin ? 'Anmelden' : 'Registrieren')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isLogin ? 'Kein Account? Registrieren' : 'Account vorhanden? Anmelden'}
            </button>
          </div>
          
          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">{message}</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button 
              onClick={onCompleted}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Später einlösen →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show ready state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
        <div className="text-6xl mb-6">🤝</div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Freundeseinladung</h2>
        <p className="text-gray-600 mb-6">
          Du wurdest eingeladen! {user ? 'Einladung annehmen?' : 'Melde dich an um die Einladung anzunehmen.'}
        </p>
        
        {user ? (
          <button 
            onClick={() => acceptInvite()}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
          >
            Einladung annehmen
          </button>
        ) : (
          <button 
            onClick={() => setShowAuth(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
          >
            Anmelden / Registrieren
          </button>
        )}
        
        <button 
          onClick={onCompleted}
          className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
        >
          Später
        </button>
      </div>
    </div>
  );
};

export default InviteHandler;
