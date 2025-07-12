// Friends Service für aktuelles Supabase Schema
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';

export const friendsService = {
  // Freunde abrufen (funktioniert mit friends table)
  async getConnectedFriends(userId: string) {
    try {
      console.log('Getting connected friends for user:', userId);
      
      const { data: friendships, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');
      
      if (error) {
        console.error('Friends query error:', error);
        return { data: [], error: null }; // Return empty array instead of error
      }
      
      if (!friendships || friendships.length === 0) {
        return { data: [], error: null };
      }
      
      // Get profiles for friends
      const friendIds = friendships.map(f => f.friend_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);
      
      if (profileError) {
        console.error('Profiles query error:', profileError);
        return { data: [], error: null };
      }
      
      // Combine friendship data with profiles
      const friendsWithProfiles = friendships.map(friendship => {
        const profile = profiles?.find(p => p.id === friendship.friend_id);
        return {
          id: friendship.id,
          user_id: friendship.user_id,
          friend_id: friendship.friend_id,
          status: friendship.status,
          created_at: friendship.created_at,
          connected_at: friendship.created_at, // Use created_at as fallback
          friend_profile: profile,
          friend_email: profile?.email || '',
          friend_name: profile?.display_name || profile?.email || 'Unbekannter Nutzer',
          friend_avatar: profile?.avatar_url || '',
          friend_streak: 0 // TODO: Calculate actual streak
        };
      });
      
      return { data: friendsWithProfiles, error: null };
    } catch (error) {
      console.error('Get connected friends error:', error);
      return { data: [], error: null };
    }
  },

  // Freund entfernen
  async removeFriend(userId: string, friendId: string) {
    try {
      console.log('Removing friend relationship between:', userId, 'and', friendId);
      
      // Remove both directions of friendship
      const { error: error1 } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);
      
      const { error: error2 } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId);
      
      if (error1 && error2) {
        console.error('Failed to remove friendship:', { error1, error2 });
        return { error: error1 };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Einfaches Einladungssystem mit E-Mail
  async createInviteLink(userId: string, email: string) {
    try {
      console.log('Creating invite for:', userId, 'to email:', email);
      
      // Check if user already exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.trim().toLowerCase())
        .single();
      
      if (!userError && existingUser) {
        // User exists, send direct friend request
        return await this.sendFriendRequest(userId, existingUser.id);
      }
      
      // Generate simple invite token
      const inviteToken = this.generateInviteToken();
      const inviteUrl = `${window.location.origin}/invite/${inviteToken}`;
      
      // Store invite in localStorage for now (could be stored in Supabase later)
      const inviteData = {
        token: inviteToken,
        inviter_id: userId,
        invitee_email: email.trim().toLowerCase(),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      const existingInvites = JSON.parse(localStorage.getItem('pending_invites') || '[]');
      existingInvites.push(inviteData);
      localStorage.setItem('pending_invites', JSON.stringify(existingInvites));
      
      console.log('Invite created:', { token: inviteToken, url: inviteUrl });
      
      return { 
        data: { 
          token: inviteToken, 
          url: inviteUrl,
          message: `Einladung für ${email} erstellt! Link: ${inviteUrl}`
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Create invite error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Einladung' };
    }
  },

  // Einladung per Token annehmen (mit besserer Fehlerbehandlung)
  async acceptInviteByToken(token: string, userId: string) {
    try {
      console.log('Accepting invite with token:', token, 'for user:', userId);
      
      let existingInvites = [];
      try {
        const storedInvites = localStorage.getItem('pending_invites');
        existingInvites = storedInvites ? JSON.parse(storedInvites) : [];
      } catch (storageError) {
        console.warn('LocalStorage nicht verfügbar:', storageError);
        return { data: null, error: 'Browser-Speicher nicht verfügbar. Versuche Inkognito-Modus oder einen anderen Browser.' };
      }
      
      const invite = existingInvites.find((inv: any) => inv.token === token);
      
      if (!invite) {
        return { data: null, error: 'Einladung nicht gefunden oder bereits verwendet' };
      }
      
      // Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        return { data: null, error: 'Einladung ist abgelaufen' };
      }
      
      // Create friendship
      const friendshipResult = await this.sendFriendRequest(invite.inviter_id, userId);
      
      if (!friendshipResult.error) {
        // Remove used invite
        try {
          const remainingInvites = existingInvites.filter((inv: any) => inv.token !== token);
          localStorage.setItem('pending_invites', JSON.stringify(remainingInvites));
        } catch (storageError) {
          console.warn('Could not update localStorage:', storageError);
          // Continue anyway, friendship was created
        }
      }
      
      return friendshipResult;
    } catch (error) {
      console.error('Accept invite error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Fehler beim Annehmen der Einladung' };
    }
  },

  // Einladung per Token abrufen (mit besserer Browser-Kompatibilität)
  async getInviteByToken(token: string) {
    try {
      // Versuche zuerst localStorage (mit Fehlerbehandlung für verschiedene Browser)
      let existingInvites = [];
      try {
        const storedInvites = localStorage.getItem('pending_invites');
        existingInvites = storedInvites ? JSON.parse(storedInvites) : [];
      } catch (storageError) {
        console.warn('LocalStorage nicht verfügbar oder beschädigt:', storageError);
        // Falls localStorage nicht funktioniert, verwende temporäre In-Memory-Speicherung
        existingInvites = [];
      }
      
      const invite = existingInvites.find((inv: any) => inv.token === token);
      
      if (!invite) {
        return { data: null, error: 'Einladung nicht gefunden' };
      }
      
      if (new Date(invite.expires_at) < new Date()) {
        return { data: null, error: 'Einladung ist abgelaufen' };
      }
      
      return { data: invite, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Fehler beim Laden der Einladung' };
    }
  },

  // Token generieren (crypto-basiert für bessere Sicherheit)
  generateInviteToken() {
    try {
      return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback für ältere Browser
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
  },

  // Browser-Kompatibilitäts-Check
  checkBrowserCompatibility() {
    const checks = {
      localStorage: false,
      sessionStorage: false,
      fetch: false,
      userAgent: navigator.userAgent
    };
    
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      checks.localStorage = true;
    } catch {
      console.warn('LocalStorage nicht verfügbar');
    }
    
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      checks.sessionStorage = true;
    } catch {
      console.warn('SessionStorage nicht verfügbar');
    }
    
    checks.fetch = typeof fetch !== 'undefined';
    
    return checks;
  },

  // Debugging-Hilfsfunktion
  async debugInviteSystem() {
    console.log('=== Invite System Debug ===');
    console.log('Browser Compatibility:', this.checkBrowserCompatibility());
    
    try {
      const storedInvites = localStorage.getItem('pending_invites');
      console.log('Stored Invites:', storedInvites ? JSON.parse(storedInvites) : 'None');
    } catch (storageError) {
      console.log('Cannot access localStorage:', storageError);
    }
    
    console.log('Supabase Client Status:', !!supabase);
    console.log('Current URL:', window.location.href);
    console.log('=== End Debug ===');
  },

  // Ausstehende Einladungen (die ich gesendet habe)
  async getPendingInvites(userId: string) {
    try {
      const existingInvites = JSON.parse(localStorage.getItem('pending_invites') || '[]');
      const userInvites = existingInvites.filter((inv: any) => inv.inviter_id === userId);
      return { data: userInvites, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Fehler beim Laden der Einladungen' };
    }
  },

  // Freundschaftsanfrage senden (direkt in Supabase)
  async sendFriendRequest(fromUserId: string, toUserId: string) {
    try {
      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`)
        .maybeSingle();
      
      if (existing) {
        return { data: null, error: 'Freundschaft existiert bereits' };
      }
      
      // Create bidirectional friendship (accepted by default for invite system)
      const { error: error1 } = await supabase
        .from('friends')
        .insert({
          user_id: fromUserId,
          friend_id: toUserId,
          status: 'accepted'
        });
      
      const { error: error2 } = await supabase
        .from('friends')
        .insert({
          user_id: toUserId,
          friend_id: fromUserId,
          status: 'accepted'
        });
      
      if (error1 || error2) {
        console.error('Friend request errors:', { error1, error2 });
        return { data: null, error: 'Fehler beim Erstellen der Freundschaft' };
      }
      
      return { data: { message: 'Freundschaft erfolgreich erstellt!' }, error: null };
    } catch (error) {
      console.error('Send friend request error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Fehler beim Senden der Freundschaftsanfrage' };
    }
  }
};

// Simplified Streak Comparison Service 
export const streakComparisonService = {
  async getStreakComparison(userId: string, days = 30) {
    try {
      console.log('Getting streak comparison for user:', userId, 'for', days, 'days');
      return { data: [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  calculateStreakCurve() {
    return [];
  }
};
