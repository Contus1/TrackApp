import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

interface SimpleInviteAcceptorProps {
  token: string;
  user: User | null;
  onCompleted: () => void;
}

const SimpleInviteAcceptor: React.FC<SimpleInviteAcceptorProps> = ({ 
  token, 
  user, 
  onCompleted 
}) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [inviterEmail, setInviterEmail] = useState<string>('');
  
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  const checkInvite = useCallback(async () => {
    try {
      console.log('🔍 Checking invite with token:', token);
      
      // Hole zuerst die Einladung
      const { data: friendData, error: friendError } = await supabase
        .from('friends')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();

      if (friendError || !friendData) {
        console.error('Invite not found:', friendError);
        setStatus('error');
        return;
      }

      // Hole dann die Benutzerinformationen des Einladers
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', friendData.inviter_id)
        .single();

      if (userError) {
        console.error('Failed to get inviter info:', userError);
        setInviterEmail('Unbekannt');
      } else {
        setInviterEmail(userData?.email || 'Unbekannt');
      }

      setStatus('ready');
      
    } catch (err) {
      console.error('Failed to check invite:', err);
      setStatus('error');
    }
  }, [token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // User wird automatisch über useEffect erkannt und acceptInvite aufgerufen
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setAuthMessage('Cool! Schau in deine E-Mails für die Bestätigung.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten';
      setAuthMessage(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const acceptInvite = useCallback(async () => {
    if (!user) return;

    try {
      // Hole die Einladung
      const { data: invite, error: inviteError } = await supabase
        .from('friends')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invite) {
        console.error('Invite not found for acceptance:', inviteError);
        setStatus('error');
        return;
      }

      // Aktualisiere die Einladung
      const { error: updateError } = await supabase
        .from('friends')
        .update({
          invitee_id: user.id,
          status: 'connected',
          connected_at: new Date().toISOString(),
          invite_token: null
        })
        .eq('id', invite.id);

      if (updateError) {
        console.error('Failed to update invite:', updateError);
        setStatus('error');
        return;
      }

      // Erstelle umgekehrte Verbindung
      await supabase
        .from('friends')
        .insert({
          inviter_id: user.id,
          invitee_id: invite.inviter_id,
          status: 'connected',
          connected_at: new Date().toISOString()
        });

      setStatus('success');
      setTimeout(onCompleted, 2000);
      
    } catch (err) {
      console.error('Failed to accept invite:', err);
      setStatus('error');
    }
  }, [user, token, onCompleted]);

  useEffect(() => {
    checkInvite();
  }, [checkInvite]);

  useEffect(() => {
    if (user && status === 'ready') {
      acceptInvite();
    }
  }, [user, status, acceptInvite]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl max-w-sm w-full border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <p className="text-gray-600">Lade Einladung...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl max-w-sm w-full border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ungültige Einladung</h2>
          <p className="text-gray-600 mb-8">
            Diese Einladung ist nicht gültig oder wurde bereits verwendet.
          </p>
          <button
            onClick={onCompleted}
            className="w-full py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Zur App
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl max-w-sm w-full border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Erfolgreich verbunden!</h2>
          <p className="text-gray-600 mb-8">
            Du bist jetzt mit deinem Freund verbunden und könnt eure Streaks vergleichen! 🚀
          </p>
          <div className="text-sm text-gray-500">
            Weiterleitung...
          </div>
        </div>
      </div>
    );
  }

  // status === 'ready' && !user - zeige Auth-Formular
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Du wurdest eingeladen!</h2>
          <p className="text-gray-600 mb-6">
            <strong>{inviterEmail}</strong> hat dich zu TrackApp eingeladen.
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              E-Mail Adresse
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              placeholder="deine@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-200"
          >
            {authLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Lädt...
              </div>
            ) : (
              isLogin ? 'Anmelden & Verbinden' : 'Registrieren & Verbinden'
            )}
          </button>
        </form>

        {authMessage && (
          <div className={`mt-6 p-4 rounded-2xl text-sm ${
            authMessage.includes('Cool!') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {authMessage}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
          >
            {isLogin ? 'Noch kein Account? Registrieren' : 'Bereits registriert? Anmelden'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleInviteAcceptor;
