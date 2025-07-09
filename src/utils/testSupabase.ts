// Test-Script für Supabase-Verbindung
// Führen Sie dieses Script aus, nachdem Sie Ihre .env-Datei konfiguriert haben

import { supabase, authService, utils } from '../services/supabase';

export const testSupabaseConnection = async () => {
  console.log('🧪 Teste Supabase-Verbindung...');
  
  try {
    // 1. Test der Basis-Verbindung
    console.log('📡 Teste Basis-Verbindung...');
    const { error } = await supabase.from('exercises').select('count');
    
    if (error) {
      console.error('❌ Verbindungsfehler:', utils.formatSupabaseError(error));
      return false;
    }
    
    console.log('✅ Basis-Verbindung erfolgreich!');
    
    // 2. Test der Authentication
    console.log('🔐 Teste Authentication-Service...');
    const { data: session } = await authService.getSession();
    
    if (session.session) {
      console.log('✅ Benutzer bereits angemeldet:', session.session.user.email);
    } else {
      console.log('ℹ️ Kein Benutzer angemeldet (das ist normal)');
    }
    
    // 3. Test der Datenbank-Tabellen
    console.log('🗄️ Teste Datenbank-Tabellen...');
    
    const tables = ['exercises', 'workouts', 'user_profiles', 'fitness_goals'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('count').limit(1);
        
        if (tableError) {
          console.warn(`⚠️ Tabelle '${table}' nicht gefunden oder fehlerhaft:`, tableError.message);
        } else {
          console.log(`✅ Tabelle '${table}' verfügbar`);
        }
      } catch (err) {
        console.warn(`⚠️ Fehler beim Testen der Tabelle '${table}':`, err);
      }
    }
    
    console.log('🎉 Supabase-Verbindungstest abgeschlossen!');
    return true;
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler beim Test:', error);
    return false;
  }
};

// Anweisungen für den Benutzer
export const printSetupInstructions = () => {
  console.log(`
🚀 TrackApp Supabase Setup

Um die Supabase-Integration zu testen, folgen Sie diesen Schritten:

1. 🔑 API-Schlüssel konfigurieren:
   - Öffnen Sie: https://supabase.com/dashboard/project/zbkshutnsojsrjwzullq/settings/api
   - Kopieren Sie den "anon public" Schlüssel
   - Tragen Sie ihn in die .env-Datei ein:
   
   VITE_SUPABASE_ANON_KEY=ihr_anon_public_schlüssel_hier

2. 🗄️ Datenbank-Schema einrichten:
   - Öffnen Sie: https://supabase.com/dashboard/project/zbkshutnsojsrjwzullq/sql/new
   - Kopieren Sie den Inhalt von database-schema.sql
   - Führen Sie das Script aus

3. 🧪 Verbindung testen:
   - Importieren Sie diese Funktion in eine Komponente
   - Rufen Sie testSupabaseConnection() auf

4. 🔐 Authentication einrichten:
   - Gehen Sie zu: https://supabase.com/dashboard/project/zbkshutnsojsrjwzullq/auth/settings
   - Site URL: http://localhost:5174
   - Redirect URLs: http://localhost:5174/**

Weitere Informationen finden Sie in SUPABASE_SETUP.md
`);
};

// Für Entwicklungszwecke - kann in der Browser-Konsole aufgerufen werden
if (typeof window !== 'undefined') {
  // @ts-expect-error
  window.testSupabase = testSupabaseConnection;
  // @ts-expect-error
  window.supabaseInstructions = printSetupInstructions;
}

export default { testSupabaseConnection, printSetupInstructions };
