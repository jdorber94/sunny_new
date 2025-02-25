'use client';

import { QuestHistory } from '@/components/QuestHistory';
import Link from 'next/link';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-700">Quest History</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            Back to Quest
          </Link>
        </div>
        <QuestHistory habits={[]} /> {/* You'll need to pass the habits here */}
      </div>
    </div>
  );
} 