import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfilePageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack, onLogout }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
      } else {
        // Erstelle ein neues Profil, wenn keines existiert
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
          }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        setDisplayName(newProfile.display_name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Error loading profile');
    } finally {
      setLoading(false);
    }
  }, [user.id, user.email]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!profile || !displayName.trim()) return;

    try {
      setSaving(true);
      setMessage('');

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setMessage('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      
      // Delete all user data
      const { error: deleteError } = await supabase.rpc('delete_user_data');
      
      if (deleteError) {
        throw deleteError;
      }

      // Log out user
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage('Error deleting account');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            ←
          </button>
          
          <h1 className="text-xl font-bold text-gray-900">
            Profile
          </h1>
          
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <main className="px-6 py-8 space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-bold text-2xl mb-4">
              {(displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            <p className="text-gray-600 text-sm">
              Registered since {new Date(user.created_at).toLocaleDateString('en-US')}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address cannot be changed
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              className="w-full py-3 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onLogout}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors"
          >
            Sign Out
          </button>

          <button
            onClick={handleDeleteAccount}
            disabled={saving}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-2xl text-sm ${
            message.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
