import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

interface SimpleInviteProps {
  user: User;
  onClose: () => void;
}

const SimpleInvite: React.FC<SimpleInviteProps> = ({ user, onClose }) => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInviteLink = async () => {
    setLoading(true);
    try {
      // Erstelle einfachen Token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Speichere Token in einer einfachen friends-Tabelle
      const { error } = await supabase
        .from('friends')
        .insert({
          inviter_id: user.id,
          invite_token: token,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating invite:', error);
        alert('Fehler beim Erstellen der Einladung');
        return;
      }

      // Erstelle Link
      const link = `${window.location.origin}/invite/${token}`;
      setInviteLink(link);
      
    } catch (err) {
      console.error('Failed to generate invite:', err);
      alert('Fehler beim Generieren des Links');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Freund einladen</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {!inviteLink ? (
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Erstelle einen Einladungslink für deine Freunde!
            </p>
            <button
              onClick={generateInviteLink}
              disabled={loading}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Erstelle Link...' : 'Link generieren'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Teile diesen Link mit deinem Freund:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 break-all">
              {inviteLink}
            </div>
            
            <button
              onClick={copyLink}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              {copied ? '✓ Kopiert!' : 'Link kopieren'}
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Wenn dein Freund auf den Link klickt und sich anmeldet, werdet ihr automatisch verbunden.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleInvite;
