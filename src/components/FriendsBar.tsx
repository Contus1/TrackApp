import React from 'react';
import type { FriendWithStreak } from '../types/streaks';

interface FriendsBarProps {
  friends: FriendWithStreak[];
  isLoading?: boolean;
  onFriendClick: (friend: FriendWithStreak) => void;
  onManageFriends: () => void;
}

const FriendsBar: React.FC<FriendsBarProps> = ({ 
  friends, 
  isLoading = false, 
  onFriendClick, 
  onManageFriends
}) => {
  // Zeige maximal 6 Freunde an
  const displayFriends = friends.slice(0, 6);
  const remainingCount = Math.max(0, friends.length - 6);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 text-center animate-pulse">
              <div className="w-12 h-12 mb-2 rounded-full bg-white/20"></div>
              <div className="w-16 h-3 mb-1 rounded bg-white/20"></div>
              <div className="w-12 h-3 mx-auto rounded bg-white/20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">
          {friends.length > 0 ? `${friends.length} Training Partners` : 'No Training Partners'}
        </span>
        <button
          onClick={onManageFriends}
          className="px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-200 font-medium"
        >
          Manage
        </button>
      </div>

      {friends.length === 0 ? (
        <div className="py-6 text-center text-gray-400">
          <div className="mb-2 text-2xl">👥</div>
          <p className="mb-3 text-sm">No training partners yet</p>
          <button 
            onClick={onManageFriends}
            className="mt-3 text-sm font-medium text-orange-400 hover:text-orange-300"
          >
            Add friends
          </button>
        </div>
      ) : (
        <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide">
          {displayFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onFriendClick(friend)}
              className="flex-shrink-0 p-2 text-center transition-all duration-200 hover:bg-white/10 rounded-2xl backdrop-blur-sm"
            >
              <div className="relative">
                {friend.avatar_url ? (
                  <img
                    src={friend.avatar_url}
                    alt={friend.display_name || friend.email}
                    className="object-cover w-12 h-12 border-2 rounded-full shadow-lg border-white/20"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 text-lg font-semibold text-white rounded-full shadow-lg bg-gradient-to-br from-orange-400 to-red-600">
                    {(friend.display_name || friend.email)[0].toUpperCase()}
                  </div>
                )}
                
                {/* Streak Badge */}
                {friend.current_streak > 0 && (
                  <div className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-500 border rounded-full shadow-lg -top-1 -right-1 border-white/20">
                    {friend.current_streak > 99 ? '99+' : friend.current_streak}
                  </div>
                )}
              </div>
              
              <div className="mt-2 max-w-[64px]">
                <div className="text-xs font-medium text-white truncate">
                  {friend.display_name || friend.email.split('@')[0]}
                </div>
                <div className="flex items-center justify-center mt-1 text-xs text-gray-300">
                  <span className="mr-1">🔥</span>
                  <span>{friend.current_streak}</span>
                </div>
              </div>
            </button>
          ))}
          
          {/* Weitere Freunde Indikator */}
          {remainingCount > 0 && (
            <div className="flex-shrink-0 p-2 text-center">
              <div className="flex items-center justify-center w-12 h-12 font-semibold text-gray-600 bg-gray-200 rounded-full">
                +{remainingCount}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                more
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsBar;
