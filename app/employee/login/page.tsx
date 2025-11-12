'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeLogin() {
  const [uniqueLink, setUniqueLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uniqueLink.trim()) {
      router.push(`/attendance/${uniqueLink.trim()}`);
    } else {
      setError('Please enter your unique link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Employee Portal</h2>
        <p className="text-gray-300 mb-6">
          Enter your unique employee link to access your attendance page
        </p>
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Unique Link
            </label>
            <input
              type="text"
              value={uniqueLink}
              onChange={(e) => setUniqueLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., john-doe"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              This is the unique identifier in your attendance URL
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Go to Attendance Page
          </button>
        </form>
        <a href="/" className="block text-center mt-4 text-primary-400 hover:underline">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
