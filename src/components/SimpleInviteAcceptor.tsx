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

  const checkInvite = useCallback(async () => {
    try {
      // Hole zuerst die Einladung
      const { data: friendData, error: friendError } = await supabase
        .from('friends')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();

      if (friendError || !friendData) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Einladung...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ungültige Einladung</h2>
          <p className="text-gray-600 mb-6">
            Diese Einladung ist nicht gültig oder wurde bereits verwendet.
          </p>
          <button
            onClick={onCompleted}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600"
          >
            Zur App
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <div className="text-green-500 text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erfolgreich verbunden!</h2>
          <p className="text-gray-600 mb-6">
            Du bist jetzt mit deinem Freund verbunden und könnt eure Streaks vergleichen!
          </p>
          <div className="text-sm text-gray-500">
            Weiterleitung...
          </div>
        </div>
      </div>
    );
  }

  // status === 'ready' && !user
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
        <div className="text-orange-500 text-4xl mb-4">👋</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Du wurdest eingeladen!</h2>
        <p className="text-gray-600 mb-6">
          <strong>{inviterEmail}</strong> hat dich zu TrackApp eingeladen.
          Melde dich an, um verbunden zu werden!
        </p>
        <button
          onClick={onCompleted}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600"
        >
          Anmelden
        </button>
      </div>
    </div>
  );
};

export default SimpleInviteAcceptor;
