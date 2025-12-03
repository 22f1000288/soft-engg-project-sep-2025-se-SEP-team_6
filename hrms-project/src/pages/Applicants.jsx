import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/HRNavbar';
import useAuth from '../contexts/useAuth';

export default function Applicants() {
  const { id } = useParams(); // job id
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await authFetch(`/jobs/${id}/applications`);
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const data = await res.json();
        setApps(data);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, authFetch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName="Recruiter" />
      <main className="max-w-4xl mx-auto mt-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Applicants</h1>
          <button onClick={() => navigate('/hr-jobs')} className="px-3 py-1 border rounded">Back</button>
        </div>
        {loading && <div className="text-sm text-gray-600">Loading…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && apps.length === 0 && <div className="text-sm text-gray-500">No applicants yet.</div>}
        <div className="space-y-3 mt-4">
          {apps.map((a) => (
            <div key={`${a.candidate_id}-${a.application_id || Math.random()}`} className="bg-white p-4 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-medium">{a.candidate?.name ?? 'Unknown'}</div>
                <div className="text-sm text-gray-500">{a.candidate?.email}</div>
                <div className="text-sm text-gray-500">Submitted: {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : 'N/A'}</div>
              </div>
              <div className="text-sm text-gray-600">Status: {a.status_applied ? 'Applied' : 'N/A'}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
