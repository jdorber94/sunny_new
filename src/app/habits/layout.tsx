import React from 'react';

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 animate-gradient bg-[length:400%_400%] bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50" />
      </div>
      {/* Content container */}
      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>
    </main>
  );
} 