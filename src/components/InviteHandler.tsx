import React, { useEffect, useState } from 'react';
import { friendsService } from '../services/friendsService';
import type { User } from '@supabase/supabase-js';
import type { Friend } from '../types/streaks';
import { CheckCircleIcon, XCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface InviteHandlerProps {
  token: string;
  user: User | null;
  onAccepted: () => void;
  onError: (message: string) => void;
}

const InviteHandler: React.FC<InviteHandlerProps> = ({ token, user, onAccepted, onError }) => {
  const [invite, setInvite] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const loadInviteData = async () => {
      try {
        setLoading(true);
        const { data, error } = await friendsService.getInviteByToken(token);
        
        if (error || !data) {
          onError('Einladung nicht gefunden oder bereits verwendet');
          return;
        }
        
        setInvite(data);
      } catch (err) {
        console.error('Failed to load invite:', err);
        onError('Fehler beim Laden der Einladung');
      } finally {
        setLoading(false);
      }
    };
    
    loadInviteData();
  }, [token, onError]);

  const handleAcceptInvite = async () => {
    if (!user || !invite) return;
    
    try {
      setAccepting(true);
      const { error } = await friendsService.acceptInviteByToken(token, user.id);
      
      if (error) {
        onError('Fehler beim Akzeptieren der Einladung');
        return;
      }
      
      setAccepted(true);
      setTimeout(() => {
        onAccepted();
      }, 2000);
    } catch (err) {
      console.error('Failed to accept invite:', err);
      onError('Fehler beim Akzeptieren der Einladung');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Einladung...</p>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Einladung nicht gefunden</h2>
          <p className="text-gray-600 mb-6">
            Diese Einladung ist nicht gültig oder wurde bereits verwendet.
          </p>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Freundschaft bestätigt! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Du bist jetzt mit deinem Freund verbunden und könnt eure Streaks vergleichen!
          </p>
          <div className="text-sm text-gray-500">
            Weiterleitung zum Dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <UserPlusIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Du wurdest eingeladen!</h2>
          <p className="text-gray-600 mb-6">
            Melde dich an oder registriere dich, um die Freundschaftsanfrage zu akzeptieren.
          </p>
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-orange-800">
              📧 Eingeladen als: <strong>{invite.invitee_email}</strong>
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Nach der Anmeldung wird die Einladung automatisch akzeptiert.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
        <UserPlusIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Freundschaftsanfrage</h2>
        <p className="text-gray-600 mb-6">
          Du wurdest zu TrackApp eingeladen! Möchtest du die Freundschaftsanfrage akzeptieren?
        </p>
        
        <div className="bg-orange-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-orange-800">
            📧 Eingeladen als: <strong>{invite.invitee_email}</strong>
          </p>
        </div>

        <button
          onClick={handleAcceptInvite}
          disabled={accepting}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {accepting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Akzeptiere...</span>
            </div>
          ) : (
            'Freundschaftsanfrage akzeptieren'
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          Ihr könnt dann eure Fitness-Streaks vergleichen! 🔥
        </p>
      </div>
    </div>
  );
};

export default InviteHandler;
