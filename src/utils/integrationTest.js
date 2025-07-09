// Integration Test für TrackApp mit Supabase
// Diese Datei kann in der Browser-Konsole ausgeführt werden, um die API-Funktionen zu testen

console.log('🧪 TrackApp Integration Test gestartet...');

// Importiere Services (nur in der Browser-Konsole)
// import { authService, exerciseService } from './src/services/supabase';

const runIntegrationTest = async () => {
  try {
    console.log('📊 Teste Supabase-Verbindung...');
    
    // 1. Test Supabase Health
    const healthCheck = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    
    if (healthCheck.ok) {
      console.log('✅ Supabase-Verbindung erfolgreich');
    } else {
      console.error('❌ Supabase-Verbindung fehlgeschlagen:', healthCheck.status);
      return;
    }

    // 2. Test User Authentication (wenn eingeloggt)
    const currentUser = await authService.getCurrentUser();
    if (currentUser.data.user) {
      console.log('✅ Benutzer authentifiziert:', currentUser.data.user.email);
      
      // 3. Test Exercise Loading
      const exercises = await exerciseService.getUserExercises(currentUser.data.user.id);
      console.log('✅ Übungen geladen:', exercises.data?.length || 0, 'Übungen');
      
      // 4. Test Exercise Creation
      const testExercise = {
        user_id: currentUser.data.user.id,
        name: 'Test Übung',
        category: 'kraft',
        sets: 3,
        reps: 10,
        description: 'Integration Test Übung'
      };
      
      const createResult = await exerciseService.createExercise(testExercise);
      if (createResult.data) {
        console.log('✅ Test-Übung erstellt:', createResult.data[0]?.name);
        
        // 5. Test Exercise Deletion
        const deleteResult = await exerciseService.deleteExercise(createResult.data[0].id);
        if (!deleteResult.error) {
          console.log('✅ Test-Übung gelöscht');
        }
      }
    } else {
      console.log('ℹ️ Kein Benutzer eingeloggt - Auth-Tests übersprungen');
    }

    console.log('🎉 Integration Test abgeschlossen!');
    
  } catch (error) {
    console.error('❌ Integration Test fehlgeschlagen:', error);
  }
};

// Exportiere Test-Funktion für Konsolen-Nutzung
window.runTrackAppTest = runIntegrationTest;

console.log('🔧 Integration Test geladen. Führe "runTrackAppTest()" in der Konsole aus.');
