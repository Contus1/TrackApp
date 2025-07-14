import React from 'react';
import SimpleFriends from './SimpleFriends';
import type { User } from '@supabase/supabase-js';

interface FriendsSectionProps {
  user: User;
  onNavigateToFriend: (friendId: string) => void;
}

const FriendsSection: React.FC<FriendsSectionProps> = ({ user, onNavigateToFriend }) => {
  return (
    <div className="space-y-6">
      <SimpleFriends user={user} />
    </div>
  );
};

export default FriendsSection;
