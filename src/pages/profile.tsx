import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const flameTrailRef = useRef<HTMLDivElement>(null);
  const magneticButtonRef = useRef<HTMLButtonElement>(null);

  // Advanced flame cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (flameTrailRef.current) {
        const flame = document.createElement('div');
        flame.className = 'flame-trail';
        flame.style.left = e.clientX + 'px';
        flame.style.top = e.clientY + 'px';
        flame.innerHTML = '🔥';
        flameTrailRef.current.appendChild(flame);
        
        setTimeout(() => {
          if (flame.parentNode) {
            flame.parentNode.removeChild(flame);
          }
        }, 1500);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Magnetic button effect
  useEffect(() => {
    const button = magneticButtonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 100;
      
      if (distance < maxDistance) {
        const strength = (maxDistance - distance) / maxDistance * 20;
        button.style.transform = `translate(${x * strength / maxDistance}px, ${y * strength / maxDistance}px) scale(1.05)`;
      }
    };

    const handleMouseLeave = () => {
      button.style.transform = 'translate(0px, 0px) scale(1)';
    };

    document.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      button?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

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
      <>
        {/* Flame trail container */}
        <div ref={flameTrailRef} className="pointer-events-none fixed inset-0 z-50">
          <style>{`
            .flame-trail {
              position: absolute;
              animation: flameTrail 1.5s ease-out forwards;
              pointer-events: none;
              font-size: 16px;
              z-index: 9999;
            }
            @keyframes flameTrail {
              0% { opacity: 0.8; transform: scale(1) rotate(0deg); }
              50% { opacity: 0.6; transform: scale(1.2) rotate(180deg); }
              100% { opacity: 0; transform: scale(0.3) rotate(360deg) translateY(-30px); }
            }
          `}</style>
        </div>

        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          {/* Floating orbs background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          {/* Additional CSS for blob animation */}
          <style>{`
            @keyframes blob {
              0% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
              100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob { animation: blob 7s infinite; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
          `}</style>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 shadow-xl animate-spin">
              <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
              <span className="relative z-10 text-2xl">🔥</span>
            </div>
            <p className="text-gray-300">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Flame trail container */}
      <div ref={flameTrailRef} className="pointer-events-none fixed inset-0 z-50">
        <style>{`
          .flame-trail {
            position: absolute;
            animation: flameTrail 1.5s ease-out forwards;
            pointer-events: none;
            font-size: 16px;
            z-index: 9999;
          }
          @keyframes flameTrail {
            0% { opacity: 0.8; transform: scale(1) rotate(0deg); }
            50% { opacity: 0.6; transform: scale(1.2) rotate(180deg); }
            100% { opacity: 0; transform: scale(0.3) rotate(360deg) translateY(-30px); }
          }
        `}</style>
      </div>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Floating orbs background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Additional CSS for blob animation */}
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>

        <div className="relative z-10">
          {/* Header */}
          <header className="px-6 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center text-gray-300 hover:bg-white/20 transition-all"
              >
                ←
              </button>
              
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text">
                Profile
              </h1>
              
              <div className="w-12"></div> {/* Spacer */}
            </div>
          </header>

          <main className="px-6 py-8 space-y-6">
            {/* Profile Info */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-xl">
                    {(displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <p className="text-gray-300 text-sm">
                    Registered since {new Date(user.created_at).toLocaleDateString('en-US')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-400 backdrop-blur-xl"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 cursor-not-allowed backdrop-blur-xl"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 rounded-3xl blur-lg opacity-50 animate-pulse"></div>
                    <button
                      ref={magneticButtonRef}
                      onClick={handleSave}
                      disabled={saving || !displayName.trim()}
                      className="relative w-full py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-bold rounded-3xl shadow-2xl transition-all duration-300 transform hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/20"
                      style={{ transition: 'transform 0.1s ease-out' }}
                    >
                      <span className="relative z-10 flex items-center justify-center space-x-3">
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                        <span className="text-xl animate-bounce">💾</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-slate-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <button
                  onClick={onLogout}
                  className="relative w-full py-4 bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-3xl transition-all border border-white/20 backdrop-blur-xl"
                >
                  Sign Out
                </button>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="relative w-full py-4 bg-red-500/80 hover:bg-red-600/80 text-white font-semibold rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-red-400/30 backdrop-blur-xl"
                >
                  {saving ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-2xl text-sm border ${
                message.includes('successfully') 
                  ? 'bg-green-500/20 border-green-400/30 text-green-300' 
                  : 'bg-red-500/20 border-red-400/30 text-red-300'
              }`}>
                {message}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
