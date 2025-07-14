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

  const shareFriendCode = () => {
    const text = `Hey! Add me on TrackApp with my friend code: ${myFriendCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'TrackApp Friend Code',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      setMessage('✅ Share text copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
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
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
        👥 Friends
      </h2>

      {/* My Friend Code */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">📱 My Friend Code</h3>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200 font-mono text-lg sm:text-xl font-bold text-blue-600 text-center">
            {myFriendCode || 'Loading...'}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyFriendCode}
              className="flex-1 sm:flex-none bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              📋 Copy
            </button>
            <button
              onClick={shareFriendCode}
              className="flex-1 sm:flex-none bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
            >
              📤 Share
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Share this code with friends so they can add you!
        </p>
      </div>

      {/* Add Friend */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-3">➕ Add Friend</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            value={addFriendCode}
            onChange={(e) => setAddFriendCode(e.target.value.toUpperCase())}
            placeholder="Enter friend code (e.g. AB1234)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-base sm:text-lg"
            maxLength={6}
          />
          <button
            onClick={addFriend}
            disabled={loading}
            className="bg-orange-500 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? '⏳' : '➕ Add'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          👫 My Friends ({friends.length})
        </h3>
        
        {friends.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <div className="text-3xl sm:text-4xl mb-2">😔</div>
            <p className="text-sm sm:text-base">No friends yet. Share your friend code above!</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {friends.map((friend) => (
              <div key={friend.friend_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                    {friend.friend_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{friend.friend_name || 'Unknown'}</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">
                      🔥 {friend.friend_streak} day streak • {friend.friend_code}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFriend(friend.friend_id)}
                  className="text-red-500 hover:text-red-700 p-1 sm:p-2 flex-shrink-0"
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
