import React from 'react';

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 animate-gradient bg-[length:400%_400%] bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50" />
        </div>
      </div>
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
} 