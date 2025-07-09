import React from 'react';
import type { FriendWithStreak } from '../types/streaks';

interface FriendsBarProps {
  friends: FriendWithStreak[];
  isLoading?: boolean;
  onFriendClick: (friend: FriendWithStreak) => void;
  onInviteFriend: () => void;
}

const FriendsBar: React.FC<FriendsBarProps> = ({ 
  friends, 
  isLoading = false, 
  onFriendClick, 
  onInviteFriend
}) => {
  // Zeige maximal 6 Freunde an
  const displayFriends = friends.slice(0, 6);
  const remainingCount = Math.max(0, friends.length - 6);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Freunde</h3>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 text-center animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Friends {friends.length > 0 && `(${friends.length})`}
        </h3>
        <button
          onClick={onInviteFriend}
          className="px-4 py-2 text-sm bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full hover:from-orange-200 hover:to-red-200 transition-all duration-200 font-medium"
        >
          Invite
        </button>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm">No friends added yet</p>
          <button 
            onClick={onInviteFriend}
            className="mt-3 text-orange-600 text-sm hover:text-orange-700 font-medium"
          >
            Invite friends
          </button>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onFriendClick(friend)}
              className="flex-shrink-0 text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="relative">
                {friend.avatar_url ? (
                  <img
                    src={friend.avatar_url}
                    alt={friend.display_name || friend.email}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-semibold text-lg">
                    {(friend.display_name || friend.email)[0].toUpperCase()}
                  </div>
                )}
                
                {/* Streak Badge */}
                {friend.current_streak > 0 && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {friend.current_streak > 99 ? '99+' : friend.current_streak}
                  </div>
                )}
              </div>
              
              <div className="mt-2 max-w-[64px]">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {friend.display_name || friend.email.split('@')[0]}
                </div>
                <div className="flex items-center justify-center text-xs text-gray-600 mt-1">
                  <span className="mr-1">🔥</span>
                  <span>{friend.current_streak}</span>
                </div>
              </div>
            </button>
          ))}
          
          {/* Weitere Freunde Indikator */}
          {remainingCount > 0 && (
            <div className="flex-shrink-0 text-center p-2">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
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
