import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ExerciseCard from '../components/ExerciseCard';

// Mock-Daten für Übungen
const mockExercises = [
  {
    id: '1',
    name: 'Liegestütze',
    category: 'Kraft',
    sets: 3,
    reps: 15,
    lastPerformed: new Date('2025-07-07')
  },
  {
    id: '2',
    name: 'Laufen',
    category: 'Cardio',
    duration: 30,
    lastPerformed: new Date('2025-07-06')
  },
  {
    id: '3',
    name: 'Kniebeugen',
    category: 'Kraft',
    sets: 4,
    reps: 12,
    weight: 50,
    lastPerformed: new Date('2025-07-05')
  },
  {
    id: '4',
    name: 'Yoga Stretch',
    category: 'Flexibilität',
    duration: 20,
    lastPerformed: new Date('2025-07-04')
  }
];

const DashboardPage: React.FC = () => {
  const [exercises, setExercises] = useState(mockExercises);
  const [filter, setFilter] = useState<string>('alle');

  const filteredExercises = exercises.filter(exercise => 
    filter === 'alle' || exercise.category.toLowerCase() === filter.toLowerCase()
  );

  const handleEditExercise = (id: string) => {
    console.log('Edit exercise:', id);
    // Hier würde die Bearbeitungslogik implementiert
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const handleAddExercise = () => {
    console.log('Add new exercise');
    // Hier würde die Navigation zur Hinzufügen-Seite erfolgen
  };

  const handleLogout = () => {
    console.log('Logout user');
  };

  const getStats = () => {
    const totalExercises = exercises.length;
    const thisWeek = exercises.filter(ex => {
      const daysDiff = (new Date().getTime() - ex.lastPerformed.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    }).length;
    
    return { totalExercises, thisWeek };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Dashboard" />
      
      <main className="flex-1">
        <div className="mobile-container">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold mb-1">Willkommen zurück! 👋</h1>
                <p className="text-primary-100">Bereit für Ihr nächstes Training?</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Abmelden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.totalExercises}
              </div>
              <div className="text-sm text-gray-600">Gesamt Übungen</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-accent-600 mb-1">
                {stats.thisWeek}
              </div>
              <div className="text-sm text-gray-600">Diese Woche</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddExercise}
                className="flex flex-col items-center justify-center p-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors min-h-[80px]"
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Übung hinzufügen</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors min-h-[80px]">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium">Training starten</span>
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Meine Übungen</h2>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {['alle', 'kraft', 'cardio', 'flexibilität'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-4 mb-6">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  {...exercise}
                  onEdit={handleEditExercise}
                  onDelete={handleDeleteExercise}
                />
              ))
            ) : (
              <div className="card text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Übungen gefunden
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'alle' 
                    ? 'Fügen Sie Ihre erste Übung hinzu, um zu beginnen.'
                    : `Keine Übungen in der Kategorie "${filter}" gefunden.`
                  }
                </p>
                <button
                  onClick={handleAddExercise}
                  className="btn-primary"
                >
                  Erste Übung hinzufügen
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
