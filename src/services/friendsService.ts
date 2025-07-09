import { supabase } from './supabase';
import type { 
  Friend, 
  FriendWithProfile, 
  InviteLink,
  StreakComparison 
} from '../types/streaks';

// Enhanced Friends Service mit Deep Link Support
export const friendsService = {
  // Einladungslink generieren
  async createInviteLink(userId: string, inviteeEmail: string): Promise<{ data: InviteLink | null; error: unknown }> {
    try {
      // Generiere Token direkt in JavaScript als Fallback
      const generateToken = () => {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      };

      // Versuche zuerst die Supabase-Funktion
      let token: string;
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .rpc('generate_invite_token');
        
        if (tokenError || !tokenData) {
          console.warn('Supabase token generation failed, using fallback:', tokenError);
          token = generateToken();
        } else {
          token = tokenData;
        }
      } catch (err) {
        console.warn('RPC call failed, using fallback token generation:', err);
        token = generateToken();
      }
      
      // Prüfe, ob bereits eine Einladung für diese E-Mail existiert
      const { data: existingInvite } = await supabase
        .from('friends')
        .select('*')
        .eq('inviter_id', userId)
        .eq('invitee_email', inviteeEmail)
        .eq('status', 'pending')
        .single();
      
      if (existingInvite) {
        // Verwende bestehende Einladung
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/invite/${existingInvite.invite_token}`;
        
        return {
          data: {
            token: existingInvite.invite_token,
            url: inviteUrl
          },
          error: null
        };
      }
      
      // Erstelle neue Friend-Einladung
      const { error: friendError } = await supabase
        .from('friends')
        .insert([{
          inviter_id: userId,
          invitee_email: inviteeEmail,
          invite_token: token,
          status: 'pending'
        }]);
      
      if (friendError) throw friendError;
      
      // Erstelle Deep Link URL
      const baseUrl = window.location.origin;
      const inviteUrl = `${baseUrl}/invite/${token}`;
      
      return {
        data: {
          token,
          url: inviteUrl
        },
        error: null
      };
    } catch (error) {
      console.error('Create invite link error:', error);
      return { data: null, error };
    }
  },

  // Einladung über Token verarbeiten
  async acceptInviteByToken(token: string, inviteeUserId: string): Promise<{ data: Friend | null; error: unknown }> {
    try {
      // Finde Einladung
      const { data: invite, error: findError } = await supabase
        .from('friends')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();
      
      if (findError || !invite) {
        throw new Error('Einladung nicht gefunden oder bereits verwendet');
      }
      
      // Aktualisiere Einladung
      const { data: updatedFriend, error: updateError } = await supabase
        .from('friends')
        .update({
          invitee_id: inviteeUserId,
          status: 'connected',
          connected_at: new Date().toISOString(),
          invite_token: null // Token nach Verwendung löschen
        })
        .eq('id', invite.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Erstelle umgekehrte Verbindung (beidseitig)
      await supabase
        .from('friends')
        .insert([{
          inviter_id: inviteeUserId,
          invitee_id: invite.inviter_id,
          status: 'connected',
          connected_at: new Date().toISOString()
        }]);
      
      return { data: updatedFriend, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Alle verbundenen Freunde abrufen
  async getConnectedFriends(userId: string): Promise<{ data: FriendWithProfile[] | null; error: unknown }> {
    const { data, error } = await supabase
      .from('friends_with_streaks')
      .select('*')
      .eq('user_id', userId)
      .limit(6); // Maximal 6 für mobile UI
    
    return { data, error };
  },

  // Einladungsstatus prüfen
  async getInviteByToken(token: string): Promise<{ data: Friend | null; error: unknown }> {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();
    
    return { data, error };
  },

  // Pending Einladungen
  async getPendingInvites(userId: string): Promise<{ data: Friend[] | null; error: unknown }> {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('inviter_id', userId)
      .eq('status', 'pending');
    
    return { data, error };
  },

  // Freund entfernen
  async removeFriend(userId: string, friendId: string): Promise<{ error: unknown }> {
    try {
      // Beide Richtungen der Freundschaft löschen
      await supabase
        .from('friends')
        .delete()
        .or(`and(inviter_id.eq.${userId},invitee_id.eq.${friendId}),and(inviter_id.eq.${friendId},invitee_id.eq.${userId})`);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// Streak Comparison Service
export const streakComparisonService = {
  // Streak-Vergleichsdaten für User und Freunde
  async getStreakComparison(userId: string, days = 30): Promise<{ data: StreakComparison[] | null; error: unknown }> {
    try {
      // Hole User-Streaks
      const { data: userStreaks, error: userError } = await supabase
        .from('streaks')
        .select('date')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date');
      
      if (userError) throw userError;
      
      // Hole Freunde
      const { data: friends, error: friendsError } = await friendsService.getConnectedFriends(userId);
      if (friendsError) throw friendsError;
      
      // Erstelle Vergleichsdaten
      const comparisons: StreakComparison[] = [];
      
      // User-Daten
      const userStreakData = this.calculateStreakCurve(userStreaks || [], days);
      comparisons.push({
        user_id: userId,
        user_name: 'Du',
        streak_data: userStreakData
      });
      
      // Freunde-Daten
      for (const friend of friends || []) {
        const { data: friendStreaks } = await supabase
          .from('streaks')
          .select('date')
          .eq('user_id', friend.friend_id)
          .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date');
        
        const friendStreakData = this.calculateStreakCurve(friendStreaks || [], days);
        comparisons.push({
          user_id: friend.friend_id,
          user_name: friend.friend_name,
          streak_data: friendStreakData
        });
      }
      
      return { data: comparisons, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Hilfsfunktion für Streak-Kurve
  calculateStreakCurve(streaks: Array<{ date: string }>, days: number) {
    const result = [];
    const streakDates = new Set(streaks.map(s => s.date));
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Berechne Streak-Länge bis zu diesem Tag
      let streakCount = 0;
      for (let j = 0; j <= i; j++) {
        const checkDate = new Date(Date.now() - j * 24 * 60 * 60 * 1000);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        if (streakDates.has(checkDateStr)) {
          streakCount++;
        } else {
          break; // Streak unterbrochen
        }
      }
      
      result.push({
        date: dateStr,
        streak_count: streakCount
      });
    }
    
    return result;
  }
};
