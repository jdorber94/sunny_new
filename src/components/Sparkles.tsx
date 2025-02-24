'use client';

import React from 'react';

interface SparkleProps {
  color?: string;
}

export function Sparkles({ color = 'currentColor' }: SparkleProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className={`absolute inline-block w-1 h-1 rounded-full bg-${color} opacity-0`}
          style={{
            left: `${50 + (Math.random() - 0.5) * 100}%`,
            top: `${50 + (Math.random() - 0.5) * 100}%`,
            animation: `sparkle 700ms ${i * 50}ms linear forwards`
          }}
        />
      ))}
    </div>
  );
} 