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
    <header className="safe-top bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="mobile-container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center shadow-lg">
              <span className="text-lg sm:text-xl">🔥</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                Hey, {displayName}!
              </h1>
              <p className="text-xs sm:text-sm text-white/80 font-medium">
                Keep the streak going 🚀
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={onProfileClick}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              aria-label="View profile"
            >
              {displayName[0].toUpperCase()}
            </button>
            
            <button
              onClick={onLogout}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              aria-label="Logout"
            >
              <span className="text-gray-600 text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
