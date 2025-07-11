import type { Streak } from '../types/streaks';

export interface TrainingAnalysis {
  weeklyFrequency: number;
  moodPattern: {
    gut: number;
    mittel: number;
    schlecht: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  sportVariety: {
    dominantSport: string;
    varietyScore: number; // 0-10
  };
  consistency: {
    score: number; // 0-10
    longestStreak: number;
    currentStreak: number;
  };
  recentPerformance: {
    lastWeekWorkouts: number;
    moodAverage: number; // 1-3 scale
  };
}

export interface AIFeedback {
  overallScore: number; // 0-100
  title: string;
  message: string;
  recommendations: string[];
  motivationalTip: string;
  nextGoal: string;
  emoji: string;
}

class TrainingAI {
  // Analyze user's training data over the last 30 days
  analyzeTrainingData(streaks: Streak[]): TrainingAnalysis {
    const last30Days = streaks.filter(streak => {
      const streakDate = new Date(streak.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return streakDate >= thirtyDaysAgo;
    });

    const lastWeek = streaks.filter(streak => {
      const streakDate = new Date(streak.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return streakDate >= sevenDaysAgo;
    });

    // Weekly frequency
    const weeklyFrequency = Math.round((last30Days.length / 30) * 7 * 10) / 10;

    // Mood analysis
    const moodCounts = { gut: 0, mittel: 0, schlecht: 0 };
    last30Days.forEach(streak => {
      moodCounts[streak.mood]++;
    });

    const moodTrend = this.calculateMoodTrend(streaks.slice(0, 14), streaks.slice(14, 28));

    // Sport variety
    const sportCounts = last30Days.reduce((acc, streak) => {
      acc[streak.sport] = (acc[streak.sport] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantSport = Object.entries(sportCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'gym';
    const varietyScore = Math.min(10, Object.keys(sportCounts).length * 2);

    // Consistency analysis
    const consistency = this.calculateConsistency(streaks);

    // Recent performance
    const moodValues = { gut: 3, mittel: 2, schlecht: 1 };
    const moodAverage = lastWeek.length > 0 
      ? lastWeek.reduce((sum, streak) => sum + moodValues[streak.mood], 0) / lastWeek.length
      : 2;

    return {
      weeklyFrequency,
      moodPattern: {
        ...moodCounts,
        trend: moodTrend
      },
      sportVariety: {
        dominantSport,
        varietyScore
      },
      consistency,
      recentPerformance: {
        lastWeekWorkouts: lastWeek.length,
        moodAverage
      }
    };
  }

  // Generate AI feedback based on analysis
  generateFeedback(analysis: TrainingAnalysis): AIFeedback {
    const { weeklyFrequency, moodPattern, sportVariety, consistency, recentPerformance } = analysis;
    
    // Calculate overall score
    const frequencyScore = Math.min(100, (weeklyFrequency / 4) * 40); // 4 workouts/week = 40 points
    const moodScore = (moodPattern.gut * 3 + moodPattern.mittel * 2 + moodPattern.schlecht * 1) / 
                     (moodPattern.gut + moodPattern.mittel + moodPattern.schlecht) / 3 * 30;
    const varietyScore = sportVariety.varietyScore * 2; // 20 points max
    const consistencyScore = consistency.score; // 10 points max

    const overallScore = Math.round(frequencyScore + moodScore + varietyScore + consistencyScore);

    // Generate personalized feedback
    let title: string;
    let message: string;
    let emoji: string;
    const recommendations: string[] = [];

    if (overallScore >= 80) {
      title = "Fantastic Progress! 🏆";
      message = "You're crushing it! Your training consistency and positive mood show you've found a great rhythm.";
      emoji = "🔥";
    } else if (overallScore >= 60) {
      title = "Great Job! Keep Building 💪";
      message = "You're doing well with your training. Let's fine-tune a few areas to reach the next level.";
      emoji = "⭐";
    } else if (overallScore >= 40) {
      title = "Good Foundation 🌱";
      message = "You've established a good base. With some adjustments, you can really accelerate your progress.";
      emoji = "🌟";
    } else {
      title = "Let's Get Back on Track 🚀";
      message = "Everyone has ups and downs. Let's create a plan to get you feeling strong and motivated again.";
      emoji = "💫";
    }

    // Generate specific recommendations
    if (weeklyFrequency < 2) {
      recommendations.push("Try to aim for at least 2-3 workouts per week to build momentum");
    } else if (weeklyFrequency > 6) {
      recommendations.push("Great frequency! Consider adding 1-2 rest days for recovery");
    }

    if (moodPattern.schlecht > moodPattern.gut) {
      recommendations.push("Focus on workouts you enjoy - fun activities boost both mood and consistency");
      recommendations.push("Consider shorter, lighter sessions when feeling low energy");
    }

    if (sportVariety.varietyScore < 4) {
      recommendations.push(`Mix up your routine! Try adding yoga, swimming, or cycling to your ${sportVariety.dominantSport} sessions`);
    }

    if (consistency.score < 5) {
      recommendations.push("Try scheduling workouts at the same time each day to build a habit");
    }

    if (recentPerformance.lastWeekWorkouts === 0) {
      recommendations.push("Start with just one 20-minute session this week - small steps lead to big wins!");
    }

    // Generate motivational tip
    const motivationalTips = [
      "Remember: consistency beats perfection every time! 🎯",
      "Your body adapts to challenges - each workout makes you stronger! 💪",
      "Progress isn't always linear - trust the process! 📈",
      "Listen to your body - rest is part of training too! 😴",
      "Celebrate small wins - they add up to big changes! 🎉"
    ];

    const motivationalTip = motivationalTips[Math.floor(Math.random() * motivationalTips.length)];

    // Generate next goal
    let nextGoal: string;
    if (weeklyFrequency < 3) {
      nextGoal = `Aim for ${Math.ceil(weeklyFrequency) + 1} workouts next week`;
    } else if (consistency.currentStreak < 7) {
      nextGoal = "Build a 7-day training streak";
    } else if (sportVariety.varietyScore < 6) {
      nextGoal = "Try a new type of workout this week";
    } else {
      nextGoal = "Focus on enjoying your workouts and listening to your body";
    }

    return {
      overallScore,
      title,
      message,
      recommendations: recommendations.slice(0, 3), // Limit to 3 recommendations
      motivationalTip,
      nextGoal,
      emoji
    };
  }

  private calculateMoodTrend(recent: Streak[], previous: Streak[]): 'improving' | 'stable' | 'declining' {
    if (recent.length === 0 || previous.length === 0) return 'stable';

    const moodValues = { gut: 3, mittel: 2, schlecht: 1 };
    
    const recentAvg = recent.reduce((sum, s) => sum + moodValues[s.mood], 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + moodValues[s.mood], 0) / previous.length;

    if (recentAvg > previousAvg + 0.2) return 'improving';
    if (recentAvg < previousAvg - 0.2) return 'declining';
    return 'stable';
  }

  private calculateConsistency(streaks: Streak[]): { score: number; longestStreak: number; currentStreak: number } {
    if (streaks.length === 0) return { score: 0, longestStreak: 0, currentStreak: 0 };

    const sortedStreaks = [...streaks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 1;
    let lastDate: Date | null = null;

    for (const streak of sortedStreaks) {
      const currentDate = new Date(streak.date);
      
      if (lastDate) {
        const daysDiff = Math.abs(currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 1) {
          tempStreak++;
        } else if (daysDiff <= 3) {
          // 3-day rule: maintain streak if within 3 days
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      
      lastDate = currentDate;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Calculate current streak from most recent workout
    const today = new Date();
    const mostRecent = new Date(sortedStreaks[sortedStreaks.length - 1]?.date || today);
    const daysSinceLastWorkout = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastWorkout <= 3) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    // Score based on consistency (0-10)
    const score = Math.min(10, Math.round((longestStreak / 30) * 10));

    return { score, longestStreak, currentStreak };
  }
}

export const trainingAI = new TrainingAI();
