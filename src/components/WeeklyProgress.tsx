'use client';

interface WeeklyProgressProps {
  habits: {
    id: number;
    name: string;
    logs: string[];
  }[];
}

export function WeeklyProgress({ habits }: WeeklyProgressProps) {
  // Get dates for the current week
  const getDaysOfWeek = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getDaysOfWeek();

  // Calculate completion percentage for each day
  const getDailyCompletion = (date: string) => {
    if (habits.length === 0) return 0;
    const completedHabits = habits.filter(habit => habit.logs.includes(date)).length;
    return Math.round((completedHabits / habits.length) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  };

  return (
    <div className="glass-card mb-8">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Weekly Progress</h3>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => {
          const completion = getDailyCompletion(date);
          const isToday = date === new Date().toISOString().split('T')[0];
          
          return (
            <div 
              key={date}
              className={`flex flex-col items-center p-2 rounded-xl
                ${isToday ? 'bg-blue-50/50 ring-1 ring-blue-100' : ''}`}
            >
              <span className="text-sm font-medium text-slate-500 mb-1">
                {formatDate(date)}
              </span>
              <div className="w-full h-24 bg-slate-100/50 rounded-lg relative overflow-hidden">
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-indigo-400 transition-all duration-300"
                  style={{ height: `${completion}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-700">
                    {completion}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 