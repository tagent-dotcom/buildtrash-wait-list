"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface WaitlistEntry {
  id: number;
  email: string;
  name: string;
  created_at: string;
  status: 'waiting' | 'approved' | 'rejected';
  position?: number;
  notes?: string;
}

interface WaitlistStats {
  total: number;
  waiting: number;
  approved: number;
  rejected: number;
}

export default function AdminDashboard() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, entriesResponse] = await Promise.all([
        fetch('/api/waitlist'),
        fetch('/api/admin/entries')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setEntries(entriesData.entries);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'waiting' | 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Waitlist Admin</h1>
          
          {stats && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                      <div className="text-sm font-medium text-gray-500">Total Entries</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
                      <div className="text-sm font-medium text-gray-500">Waiting</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                      <div className="text-sm font-medium text-gray-500">Approved</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                      <div className="text-sm font-medium text-gray-500">Rejected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <li key={entry.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {entry.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Position: {entry.position || 'N/A'} • Joined: {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {entry.status}
                        </span>
                        
                        <select
                          value={entry.status}
                          onChange={(e) => updateStatus(entry.id, e.target.value as any)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="waiting">Waiting</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 