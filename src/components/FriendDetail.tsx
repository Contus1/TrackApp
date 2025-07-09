import React, { useState, useEffect } from 'react';
import { streakService } from '../services/streakService';
import { friendsService as enhancedFriendsService } from '../services/friendsService';
import type { Streak, FriendWithProfile } from '../types/streaks';
import { 
  ArrowLeftIcon, 
  FireIcon, 
  CalendarDaysIcon,
  FaceSmileIcon,
  FaceFrownIcon
} from '@heroicons/react/24/outline';

interface FriendDetailProps {
  friendId: string;
  onBack: () => void;
}

const FriendDetail: React.FC<FriendDetailProps> = ({ friendId, onBack }) => {
  // State
  const [friend, setFriend] = useState<FriendWithProfile | null>(null);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState({
    profile: true,
    streaks: true
  });

  // Load friend data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading({ profile: true, streaks: true });
        
        // Load friend profile (from connected friends)
        const { data: friendsData, error: friendsError } = await enhancedFriendsService.getConnectedFriends(friendId);
        
        if (friendsError) {
          console.error('Error loading friend profile:', friendsError);
        } else if (friendsData && friendsData.length > 0) {
          // Find current friend in the list (this is a simplified approach)
          setFriend(friendsData[0]); // For demo - in real app you'd find the specific friend
        }
        
        setLoading(prev => ({ ...prev, profile: false }));
        
        // Load friend's streaks
        const { data: streaksData, error: streaksError } = await streakService.getRecentStreaks(friendId, 30);
        
        if (streaksError) {
          console.error('Error loading friend streaks:', streaksError);
        } else {
          setStreaks(streaksData || []);
        }
        
        // Load current streak
        const { data: currentStreakData, error: currentStreakError } = await streakService.getCurrentStreak(friendId);
        
        if (currentStreakError) {
          console.error('Error loading current streak:', currentStreakError);
        } else {
          setCurrentStreak(currentStreakData || 0);
        }
        
        setLoading(prev => ({ ...prev, streaks: false }));
      } catch (err) {
        console.error('Friend data loading failed:', err);
        setLoading({ profile: false, streaks: false });
      }
    };
    
    loadData();
  }, [friendId]);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'gut':
        return <FaceSmileIcon className="h-5 w-5 text-green-500" />;
      case 'mittel':
        return <div className="h-5 w-5 rounded-full bg-yellow-500" />;
      case 'schlecht':
        return <FaceFrownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-400" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'gut': return 'bg-green-100 border-green-200';
      case 'mittel': return 'bg-yellow-100 border-yellow-200';
      case 'schlecht': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (loading.profile) {
    return (
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white shadow-sm hover:shadow transition-all"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {friend?.friend_name || 'Freund'}
          </h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-16 h-16">
            {friend?.friend_avatar ? (
              <img
                src={friend.friend_avatar}
                alt={friend.friend_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {friend?.friend_name?.charAt(0).toUpperCase() || 'F'}
                </span>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {friend?.friend_name || 'Freund'}
            </h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <FireIcon className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-orange-600">{currentStreak}</span>
                <span className="text-sm text-gray-500">Tage</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <CalendarDaysIcon className="h-4 w-4" />
                <span>{streaks.length} Trainings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flame Display */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-6 text-white">
        <div className="text-center">
          <div className="flex justify-center space-x-1 mb-4">
            {[...Array(Math.min(currentStreak, 10))].map((_, i) => (
              <FireIcon key={i} className="h-6 w-6 text-yellow-300" />
            ))}
            {currentStreak > 10 && (
              <span className="text-yellow-300 font-bold">+{currentStreak - 10}</span>
            )}
          </div>
          <div className="text-2xl font-bold mb-1">{currentStreak} Tage</div>
          <div className="text-orange-100">Aktuelle Streak</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">Aktivitäten</h3>
        
        {loading.streaks ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : streaks.length > 0 ? (
          <div className="space-y-3">
            {streaks.map((streak) => (
              <div 
                key={streak.id} 
                className={`flex items-center space-x-3 p-3 rounded-xl border ${getMoodColor(streak.mood)}`}
              >
                {/* Mood Icon */}
                <div className="flex-shrink-0">
                  {getMoodIcon(streak.mood)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {streak.sport}
                      {streak.category && (
                        <span className="text-gray-500 ml-1">
                          · {streak.category}
                        </span>
                      )}
                    </h4>
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      {formatDate(streak.date)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    Stimmung: {streak.mood}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Noch keine Aktivitäten</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendDetail;
