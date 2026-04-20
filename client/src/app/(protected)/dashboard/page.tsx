'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Sign out
          </button>
        </div>
        {user && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-2">
            <p className="text-gray-700"><span className="font-medium">Name:</span> {user.name}</p>
            <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
            <p className="text-gray-700"><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        )}
      </div>
    </main>
  );
}
