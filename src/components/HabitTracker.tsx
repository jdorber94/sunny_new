'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from './Sparkles';
import { WeeklyProgress } from './WeeklyProgress';
import { format, addDays, subDays, isToday } from 'date-fns';

interface Habit {
  id: number;
  name: string;
  logs: string[];
  xp: number;
}

interface UserStats {
  totalXP: number;
  dailyXP: {
    date: string;
    xp: number;
  };
}

const MAX_HABITS = 5;
const XP_PER_COMPLETION = 20;
const MAX_DAILY_XP = 100;

const calculateLevel = (xp: number) => {
  // Each level requires double XP of the previous level
  const levels = [0, 60, 120, 240, 480, 960, 1920, 3840, 7680];
  let level = 1;
  
  // Find current level
  for (let i = 1; i < levels.length; i++) {
    if (xp >= levels[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  // Calculate progress to next level
  const currentLevelXP = xp - levels[level - 1];
  const nextLevelXP = levels[level] - levels[level - 1];

  return { level, currentLevelXP, nextLevelXP };
};

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window !== 'undefined') {
      const savedHabits = localStorage.getItem('habits');
      return savedHabits ? JSON.parse(savedHabits) : [];
    }
    return [];
  });

  const [newHabit, setNewHabit] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<UserStats>(() => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('habitStats');
      return savedStats ? JSON.parse(savedStats) : {
        totalXP: 0,
        dailyXP: {
          date: new Date().toISOString().split('T')[0],
          xp: 0
        }
      };
    }
    return {
      totalXP: 0,
      dailyXP: {
        date: new Date().toISOString().split('T')[0],
        xp: 0
      }
    };
  });

  const [celebrateHabitId, setCelebrateHabitId] = useState<number | null>(null);
  const [celebrateProgress, setCelebrateProgress] = useState(false);

  const { level, currentLevelXP, nextLevelXP } = calculateLevel(stats.totalXP);

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('habitStats', JSON.stringify(stats));
  }, [habits, stats]);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    
    if (habits.length >= MAX_HABITS) {
      setError(`Maximum ${MAX_HABITS} habits allowed`);
      return;
    }

    const habit: Habit = {
      id: Date.now(),
      name: newHabit,
      logs: [],
      xp: 0
    };
    
    setHabits([...habits, habit]);
    setNewHabit('');
    setError('');
  };

  const toggleHabit = (habitId: number) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const hasLog = habit.logs.includes(dateStr);
        
        if (!hasLog && stats.dailyXP.xp < MAX_DAILY_XP) {
          setCelebrateHabitId(habitId);
          setCelebrateProgress(true);
          setTimeout(() => {
            setCelebrateHabitId(null);
            setCelebrateProgress(false);
          }, 1000);

          setStats(prev => ({
            totalXP: prev.totalXP + XP_PER_COMPLETION,
            dailyXP: {
              date: dateStr,
              xp: prev.dailyXP.xp + XP_PER_COMPLETION
            }
          }));

          return {
            ...habit,
            logs: [...habit.logs, dateStr],
            xp: habit.xp + XP_PER_COMPLETION
          };
        } else if (hasLog) {
          setStats(prev => ({
            totalXP: prev.totalXP - XP_PER_COMPLETION,
            dailyXP: {
              date: dateStr,
              xp: prev.dailyXP.xp - XP_PER_COMPLETION
            }
          }));

          return {
            ...habit,
            logs: habit.logs.filter(date => date !== dateStr),
            xp: habit.xp - XP_PER_COMPLETION
          };
        }
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId: number) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  const isHabitCompletedForDate = (habit: Habit, date: Date) => {
    return habit.logs.includes(format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="grid place-items-center min-h-screen">
      <div className="w-full max-w-4xl px-4 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text tracking-tight">
            Quest
          </h1>
          <p className="text-slate-500 text-base sm:text-lg">Build better habits, one quest at a time</p>
        </div>

        {/* Level Overview */}
        <div className="glass-card mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold text-slate-700">
                Lvl {level}
              </span>
              <div className="bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium">
                {currentLevelXP}/{nextLevelXP} XP
              </div>
            </div>
            <div className="w-full h-3 bg-slate-100/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${(currentLevelXP / nextLevelXP) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Weekly Progress after the level overview */}
        <WeeklyProgress habits={habits} />

        {/* Progress Card - update classes for better mobile */}
        <div className="glass-card mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-wider text-slate-400 mb-1">
                Today&apos;s Progress
              </p>
              <p className="text-3xl font-bold text-slate-700">
                {stats.dailyXP.xp}
                <span className="text-lg text-slate-400 font-normal">/{MAX_DAILY_XP} XP</span>
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-slate-400 mb-1">
                Total XP
              </p>
              <p className="text-3xl font-bold text-slate-700">
                {stats.totalXP}
                <span className="text-lg text-slate-400 font-normal"> XP</span>
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full h-4 bg-slate-100/50 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 
                transition-all duration-300 ease-out
                ${celebrateProgress ? 'animate-[progress-celebration_1s_ease-in-out]' : ''}`}
              style={{ width: `${(stats.dailyXP.xp / MAX_DAILY_XP) * 100}%` }}
            />
          </div>
        </div>

        {/* Add Date Navigation */}
        <div className="glass-card mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDate(prev => subDays(prev, 1))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              ←
            </button>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700 mb-1">
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
              </div>
              <div className="text-sm text-slate-500">
                {format(selectedDate, 'MMMM d, yyyy')}
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              disabled={isToday(selectedDate)}
            >
              →
            </button>
          </div>
        </div>

        {/* Add Habit Form - update for mobile */}
        <div className="glass-card mb-8">
          <form onSubmit={addHabit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="What habit would you like to build?"
              className="flex-1 px-6 py-4 bg-white/80 border border-slate-100 rounded-2xl
                text-slate-700 placeholder-slate-400
                focus:ring-2 focus:ring-blue-100 focus:border-blue-200 outline-none
                transition-all duration-200 text-lg"
            />
            <button 
              type="submit" 
              onClick={() => {
                if (habits.length < MAX_HABITS) {
                  setCelebrateHabitId(-1);
                  setTimeout(() => setCelebrateHabitId(null), 1000);
                }
              }}
              disabled={habits.length >= MAX_HABITS}
              className={`relative px-8 py-4 rounded-2xl font-medium transition-all duration-200 text-lg
                ${habits.length >= MAX_HABITS 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:translate-y-[-1px]'
                }`}
            >
              Add Habit
              {celebrateHabitId === -1 && <Sparkles color="white" />}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <p>
              {habits.length}/{MAX_HABITS} habits created
            </p>
            <p>
              {MAX_DAILY_XP - stats.dailyXP.xp} XP available today
            </p>
          </div>
        </div>

        {/* Habits List */}
        {habits.length > 0 && (
          <div className="space-y-4">
            {habits.map(habit => (
              <div 
                key={habit.id} 
                className={`relative glass-card
                  ${celebrateHabitId === habit.id ? 'animate-[scale-bounce_0.5s_ease-in-out]' : ''}`}
              >
                {celebrateHabitId === habit.id && (
                  <Sparkles color={isHabitCompletedForDate(habit, selectedDate) ? 'green-400' : 'blue-400'} />
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full 
                        text-sm font-medium bg-slate-100/50 backdrop-blur-sm
                        text-slate-600">
                        {habit.logs.length} days
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full 
                        text-sm font-medium bg-blue-50/50 backdrop-blur-sm
                        text-blue-600">
                        {habit.xp} XP
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      disabled={!isToday(selectedDate) || (!isHabitCompletedForDate(habit, selectedDate) && stats.dailyXP.xp >= MAX_DAILY_XP)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center 
                        transition-all duration-200
                        ${isHabitCompletedForDate(habit, selectedDate)
                          ? 'bg-white/80 backdrop-blur-sm border-2 border-green-100 text-green-500 hover:text-white hover:scale-105 active:scale-95 hover:shadow-lg hover:border-transparent hover:bg-gradient-to-r hover:from-green-400 hover:to-emerald-400'
                          : !isToday(selectedDate)
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : stats.dailyXP.xp >= MAX_DAILY_XP
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-white/80 backdrop-blur-sm border-2 border-slate-100 text-slate-400 hover:text-white hover:scale-105 active:scale-95 hover:shadow-lg hover:border-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400'
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        {isHabitCompletedForDate(habit, selectedDate) ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v12m6-6H6"
                          />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center
                        bg-white/80 backdrop-blur-sm border-2 border-red-100
                        text-red-400 hover:text-white
                        hover:bg-gradient-to-r hover:from-red-400 hover:to-red-500
                        hover:border-transparent hover:shadow-lg
                        hover:scale-105 active:scale-95
                        transition-all duration-200 text-lg"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {habits.length === 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            border border-white/20 text-center transition-all duration-300 hover:bg-white/70">
            <div className="mb-4 text-4xl">✨</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Start Your Journey
            </h3>
            <p className="text-slate-500">
              Add your first habit above and begin building a better you
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 