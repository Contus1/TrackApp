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
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Freund einladen</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {!inviteLink ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-gray-600 mb-8">
              Erstelle einen Einladungslink für deine Freunde!
            </p>
            <button
              onClick={generateInviteLink}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Erstelle Link...
                </div>
              ) : (
                'Link generieren'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Link erstellt!
              </h4>
              <p className="text-gray-600 text-sm">
                Teile diesen Link mit deinem Freund:
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 break-all border border-gray-200">
              {inviteLink}
            </div>
            
            <button
              onClick={copyLink}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {copied ? (
                <div className="flex items-center justify-center">
                  <span className="mr-2">✓</span>
                  Kopiert!
                </div>
              ) : (
                'Link kopieren'
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Wenn dein Freund auf den Link klickt und sich anmeldet, werdet ihr automatisch verbunden. 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleInvite;
