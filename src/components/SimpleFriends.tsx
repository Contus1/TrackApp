import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface SimpleFriendsProps {
  user: User;
  onFriendsChange?: () => void;
}

interface Friend {
  friend_id: string;
  friend_name: string;
  friend_avatar: string;
  friend_code: string;
  friend_streak: number;
  friendship_created: string;
}

const SimpleFriends: React.FC<SimpleFriendsProps> = ({ user, onFriendsChange }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myFriendCode, setMyFriendCode] = useState<string>('');
  const [addFriendCode, setAddFriendCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadMyFriendCode();
    loadFriends();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadMyFriendCode = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('friend_code')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setMyFriendCode(data.friend_code || '');
    } catch (error) {
      console.error('Error loading friend code:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends_simple')
        .select('*')
        .eq('user_id', user.id)
        .order('friendship_created', { ascending: false });

      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const addFriend = async () => {
    if (!addFriendCode.trim()) {
      setMessage('Please enter a friend code');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .rpc('add_friend_by_code', { friend_code_input: addFriendCode.trim().toUpperCase() });

      if (error) throw error;

      if (data.success) {
        setMessage(`✅ Added ${data.friend.name} as friend!`);
        setAddFriendCode('');
        loadFriends(); // Reload friends list
        onFriendsChange?.(); // Notify parent component
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      setMessage('❌ Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  const copyFriendCode = () => {
    navigator.clipboard.writeText(myFriendCode);
    setMessage('✅ Friend code copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const copyQuickLink = async () => {
    // For now, use the current domain with a hash parameter that could be handled
    const currentDomain = window.location.origin;
    const appLink = `${currentDomain}/#/add-friend/${myFriendCode}`;
    try {
      await navigator.clipboard.writeText(appLink);
      setMessage('🔗 Quick link copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Clipboard failed:', error);
      setMessage('❌ Unable to copy link');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const shareFriendCode = async () => {
    // Share just the homepage with friend code and instructions
    const homepageUrl = window.location.origin;
    const text = `🔥 Join me on TrackApp!

My Friend Code: ${myFriendCode}

📱 How to add me:
1. Go to: ${homepageUrl}
2. Sign up or log in
3. Click "Add Friend" 
4. Enter my code: ${myFriendCode}

Track workouts together and stay motivated! 💪🚀`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on TrackApp! 🔥',
          text: text,
          url: homepageUrl
        });
      } catch (error) {
        // User cancelled share or share failed, silently handle it
        if (error instanceof Error && error.name !== 'AbortError') {
          // If it's not a user cancellation, fall back to clipboard
          try {
            await navigator.clipboard.writeText(text);
            setMessage('✅ Share text copied to clipboard!');
            setTimeout(() => setMessage(''), 3000);
          } catch (clipboardError) {
            console.error('Share and clipboard both failed:', clipboardError);
          }
        }
        // For AbortError (user cancelled), do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setMessage('✅ Share text copied to clipboard!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Clipboard failed:', error);
        setMessage('❌ Unable to copy to clipboard');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('simple_friendships')
        .delete()
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`);

      if (error) throw error;
      
      setMessage('✅ Friend removed');
      loadFriends();
      onFriendsChange?.(); // Notify parent component
    } catch (error) {
      console.error('Error removing friend:', error);
      setMessage('❌ Failed to remove friend');
    }
  };

  return (
    <div className="p-4 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-2xl sm:p-6 border-white/20">
      <h2 className="flex items-center mb-4 text-xl font-bold text-white sm:text-2xl sm:mb-6">
        👥 Friends
      </h2>

      {/* My Friend Code */}
      <div className="p-3 mb-4 border sm:mb-6 sm:p-4 bg-white/10 backdrop-blur-sm rounded-2xl border-white/20">
        <h3 className="mb-2 font-semibold text-white">📱 My Friend Code</h3>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <div className="px-3 py-2 font-mono text-lg font-bold text-center text-orange-300 border bg-white/20 backdrop-blur-sm sm:px-4 rounded-2xl border-white/30 sm:text-xl">
            {myFriendCode || 'Loading...'}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyFriendCode}
              className="flex-1 sm:flex-none bg-blue-500/80 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-2xl hover:bg-blue-600/80 transition-colors text-sm sm:text-base border border-blue-400/30 min-w-[80px]"
            >
              📋 Copy
            </button>
            <button
              onClick={copyQuickLink}
              className="flex-1 sm:flex-none bg-purple-500/80 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-2xl hover:bg-purple-600/80 transition-colors text-sm sm:text-base border border-purple-400/30 min-w-[80px]"
            >
              🔗 Link
            </button>
            <button
              onClick={shareFriendCode}
              className="flex-1 sm:flex-none bg-green-500/80 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-2xl hover:bg-green-600/80 transition-colors text-sm sm:text-base border border-green-400/30 min-w-[80px]"
            >
              📤 Share
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-white/80">
          📋 Copy code • 🔗 Copy quick link • 📤 Share with message
        </p>
        <p className="mt-1 text-xs text-white/60">
          Share your code with friends and start tracking workouts together! 💪
        </p>
      </div>

      {/* Add Friend */}
      <div className="p-3 mb-4 border sm:mb-6 sm:p-4 bg-white/5 backdrop-blur-sm rounded-2xl border-white/10">
        <h3 className="mb-3 font-semibold text-white">➕ Add Friend</h3>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            value={addFriendCode}
            onChange={(e) => setAddFriendCode(e.target.value.toUpperCase())}
            placeholder="Enter friend code (e.g. AB1234)"
            className="flex-1 p-3 font-mono text-base text-center text-white placeholder-gray-400 transition-all duration-200 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 sm:text-lg"
            maxLength={6}
          />
          <button
            onClick={addFriend}
            disabled={loading}
            className="px-4 py-3 text-sm text-white transition-colors border bg-orange-500/80 backdrop-blur-sm sm:px-6 rounded-2xl hover:bg-orange-600/80 disabled:opacity-50 sm:text-base border-orange-400/30"
          >
            {loading ? '⏳' : '➕ Add'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-2xl backdrop-blur-sm border ${
          message.includes('✅') ? 'bg-green-500/20 text-green-200 border-green-400/30' : 'bg-red-500/20 text-red-200 border-red-400/30'
        }`}>
          {message}
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="mb-3 font-semibold text-white">
          👫 My Friends ({friends.length})
        </h3>
        
        {friends.length === 0 ? (
          <div className="py-6 text-center text-gray-400 sm:py-8">
            <div className="mb-2 text-3xl sm:text-4xl">😔</div>
            <p className="text-sm sm:text-base">No friends yet. Share your friend code above!</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {friends.map((friend) => (
              <div key={friend.friend_id} className="flex items-center justify-between p-3 transition-all duration-200 border bg-white/10 backdrop-blur-sm rounded-2xl border-white/20 hover:bg-white/20">
                <div className="flex items-center flex-1 min-w-0 space-x-2 sm:space-x-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold text-white rounded-full shadow-lg sm:w-10 sm:h-10 bg-gradient-to-r from-orange-400 to-red-500 sm:text-base">
                    {friend.friend_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate sm:text-base">{friend.friend_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-300 truncate sm:text-sm">
                      🔥 {friend.friend_streak} day streak • {friend.friend_code}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFriend(friend.friend_id)}
                  className="flex-shrink-0 p-2 text-red-400 transition-colors border hover:text-red-300 rounded-xl bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
                  title="Remove friend"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleFriends;
