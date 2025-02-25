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
  // Level 1: 0-60
  // Level 2: 60-180 (60 + 120)
  // Level 3: 180-420 (180 + 240)
  // Level 4: 420-900 (420 + 480)
  // and so on...
  const getRequiredXP = (level: number): number => {
    if (level === 1) return 60;
    return getRequiredXP(level - 1) * 2;
  };

  let level = 1;
  let totalRequired = 60; // First level requirement

  while (xp >= totalRequired) {
    level++;
    totalRequired += getRequiredXP(level);
  }

  const prevLevelXP = level === 1 ? 0 : totalRequired - getRequiredXP(level);
  const currentLevelXP = xp - prevLevelXP;
  const nextLevelXP = getRequiredXP(level);

  return { level, currentLevelXP, nextLevelXP };
};

function CheckmarkIcon({ checked, animate = false }: { checked: boolean; animate?: boolean }) {
  return checked ? (
    <div className="relative">
      {animate && (
        <>
          <div className="absolute inset-0 animate-ping opacity-30 rounded-full bg-[#00B971]" />
          <div className="absolute inset-[-8px] animate-scale-up rounded-full border-2 border-[#00B971]" />
        </>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-6 h-6 ${animate ? 'animate-bounce-small' : ''}`}
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  ) : (
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
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

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
      <div className="w-full max-w-4xl px-4 py-6 sm:py-12 pb-24 lg:pb-6">
        {/* Level Overview */}
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-medium text-black">
                Level {level}
              </span>
              <div className="text-sm text-[#6B7280]">
                {currentLevelXP}/{nextLevelXP} XP
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#00B971]">+{stats.dailyXP.xp} today</span>
            </div>
          </div>
          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${(currentLevelXP / nextLevelXP) * 100}%` }}
            />
          </div>
        </div>

        {/* Add Habit Form - Moved up */}
        <div className="glass-card mb-8">
          <form onSubmit={addHabit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Add a new habit"
              className="input-field w-full text-base"
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
              className={`relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 text-lg
                ${habits.length >= MAX_HABITS 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 active:scale-100 border-2 border-transparent hover:border-indigo-200'
                }`}
            >
              Add Habit
              {celebrateHabitId === -1 && <Sparkles color="white" />}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-red-400 text-sm font-medium">{error}</p>
          )}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400 font-medium">
            <p>
              {habits.length}/{MAX_HABITS} habits created
            </p>
            <p>
              {MAX_DAILY_XP - stats.dailyXP.xp} XP available today
            </p>
          </div>
        </div>

        {/* Date Navigation - Moved down */}
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
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-medium text-black">
                        {habit.name}
                      </h3>
                      {habit.logs.length >= 3 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#FEF3C7] rounded-full">
                          <span className="text-[#D97706] text-xs">🔥 {habit.logs.length}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full mb-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-out
                          ${isHabitCompletedForDate(habit, selectedDate)
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                            : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                          }`}
                        style={{ 
                          width: `${(habit.logs.length / 30) * 100}%`,
                          transform: isHabitCompletedForDate(habit, selectedDate) ? 'scale(1.02)' : 'scale(1)'
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <span>{habit.logs.length} days</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="text-[#00B971]">{habit.xp}</span> XP
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center
                      transition-all duration-200
                      ${isHabitCompletedForDate(habit, selectedDate)
                        ? 'bg-[#00B971] text-white'
                        : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                      }`}
                  >
                    <CheckmarkIcon checked={isHabitCompletedForDate(habit, selectedDate)} animate={celebrateProgress} />
                  </button>
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