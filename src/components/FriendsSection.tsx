import React, { useState, useEffect } from 'react';
import { friendsService, streakComparisonService } from '../services/friendsService';
import type { User } from '@supabase/supabase-js';
import type { FriendWithProfile, InviteLink, StreakComparison } from '../types/streaks';
import { 
  UserPlusIcon, 
  LinkIcon, 
  UserGroupIcon,
  FireIcon,
  ChartBarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface FriendsSectionProps {
  user: User;
  onNavigateToFriend: (friendId: string) => void;
}

const FriendsSection: React.FC<FriendsSectionProps> = ({ user, onNavigateToFriend }) => {
  // State
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState<StreakComparison[]>([]);
  const [loading, setLoading] = useState({
    friends: true,
    invite: false,
    comparison: false
  });
  const [linkCopied, setLinkCopied] = useState(false);

  // Load friends on mount
  useEffect(() => {
    const loadFriendsData = async () => {
      try {
        setLoading(prev => ({ ...prev, friends: true }));
        const { data, error } = await friendsService.getConnectedFriends(user.id);
        
        if (error) {
          console.error('Error loading friends:', error);
        } else {
          setFriends(data || []);
        }
      } catch (err) {
        console.error('Friends loading failed:', err);
      } finally {
        setLoading(prev => ({ ...prev, friends: false }));
      }
    };
    
    loadFriendsData();
  }, [user.id]);

  const handleCreateInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      setLoading(prev => ({ ...prev, invite: true }));
      console.log('🚀 Creating invite for:', inviteEmail.trim());
      
      const { data, error } = await friendsService.createInviteLink(user.id, inviteEmail.trim());
      
      console.log('Invite result:', { data, error });
      
      if (error) {
        console.error('Invite error:', error);
        const errorMessage = typeof error === 'string' ? error : 'Fehler beim Erstellen der Einladung';
        alert(errorMessage);
      } else if (data) {
        console.log('✅ Invite created successfully:', data);
        
        // Check if it's an invite link or a direct friend request
        if ('url' in data) {
          // It's an invite link
          setInviteLink(data);
          setInviteEmail('');
          alert('Einladung erfolgreich erstellt! Link wurde generiert.');
        } else {
          // It's a direct friend request result
          setInviteEmail('');
          alert(data.message || 'Freundschaftsanfrage gesendet!');
        }
      } else {
        alert('Unbekannter Fehler beim Erstellen der Einladung');
      }
    } catch (err) {
      console.error('Invite creation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      alert(`Fehler: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, invite: false }));
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink?.url) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink.url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback für ältere Browser
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleShowComparison = async () => {
    try {
      setLoading(prev => ({ ...prev, comparison: true }));
      setShowComparisonModal(true);
      
      const { data, error } = await streakComparisonService.getStreakComparison(user.id);
      
      if (error) {
        console.error('Error loading comparison:', error);
      } else {
        setComparisonData(data || []);
      }
    } catch (err) {
      console.error('Comparison loading failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, comparison: false }));
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Freunde</h2>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="p-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          <UserPlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-orange-50 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Freund einladen</h3>
          
          <div className="space-y-3">
            <input
              type="email"
              placeholder="E-Mail-Adresse des Freundes"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            
            <button
              onClick={handleCreateInvite}
              disabled={loading.invite || !inviteEmail.trim()}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading.invite ? 'Erstelle Einladung...' : 'Einladungslink erstellen'}
            </button>
          </div>

          {/* Generated Link */}
          {inviteLink && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Einladungslink:</span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {linkCopied ? (
                    <>
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">Kopieren</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-sm text-gray-600 break-all">
                {inviteLink.url}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Friends Grid */}
      {loading.friends ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : friends.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => onNavigateToFriend(friend.friend_id)}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all active:scale-95"
              >
                {/* Avatar */}
                <div className="w-12 h-12 mx-auto mb-2">
                  {friend.friend_avatar ? (
                    <img
                      src={friend.friend_avatar}
                      alt={friend.friend_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {friend.friend_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Name */}
                <div className="text-sm font-medium text-gray-900 truncate mb-1">
                  {friend.friend_name}
                </div>
                
                {/* Streak */}
                <div className="flex items-center justify-center space-x-1">
                  <FireIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-600">
                    {friend.friend_streak}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Compare Button */}
          <button
            onClick={handleShowComparison}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-orange-600 hover:to-red-600 transition-all"
          >
            <ChartBarIcon className="h-5 w-5" />
            <span>Streaks vergleichen</span>
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Freunde</h3>
          <p className="text-gray-500 mb-4">
            Lade deine Freunde ein und vergleicht eure Streaks!
          </p>
          <button
            onClick={() => setShowInviteForm(true)}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            Ersten Freund einladen
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Streak-Vergleich</h3>
                <button
                  onClick={() => setShowComparisonModal(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span className="sr-only">Schließen</span>
                  ✕
                </button>
              </div>

              {loading.comparison ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Lade Vergleichsdaten...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comparisonData.map((user) => (
                    <div key={user.user_id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">{user.user_name}</span>
                        <div className="flex items-center space-x-1">
                          <FireIcon className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-semibold text-orange-600">
                            {user.streak_data[user.streak_data.length - 1]?.streak_count || 0}
                          </span>
                        </div>
                      </div>
                      
                      {/* Streak Chart Placeholder */}
                      <div className="h-16 bg-gradient-to-r from-orange-200 to-red-200 rounded-lg flex items-end justify-center space-x-1 p-2">
                        {user.streak_data.slice(-7).map((day, i) => (
                          <div
                            key={i}
                            className="bg-orange-500 rounded-sm"
                            style={{
                              height: `${Math.max(4, (day.streak_count / 10) * 100)}%`,
                              width: '8px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-xs text-gray-500 text-center mt-4">
                    📊 Detaillierte Charts kommen bald!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsSection;
