import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
  onProfileClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout, onProfileClick }) => {
  const [displayName, setDisplayName] = useState(user.email?.split('@')[0] || 'User');

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (data?.display_name) {
          setDisplayName(data.display_name);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback auf E-Mail-Präfix
        setDisplayName(user.email?.split('@')[0] || 'User');
      }
    };

    loadUserProfile();
  }, [user.id, user.email]);

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 flex items-center justify-center">
            <span className="text-lg">🔥</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Hey, {displayName}!
            </h1>
            <p className="text-sm text-gray-600">
              Keep the streak going 🚀
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-semibold hover:from-orange-500 hover:to-red-700 transition-all"
          >
            {displayName[0].toUpperCase()}
          </button>
          
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <span className="text-gray-600">→</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
