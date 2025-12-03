import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/HRNavbar';
import useAuth from '../contexts/useAuth';
import { Check, X, FileText, DownloadCloud, Calendar, ExternalLink } from 'lucide-react';

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
          {apps.map((a) => {
            const name = a.candidate?.name || 'Unknown';
            const email = a.candidate?.email || '';
            const submitted = a.submitted_at ? new Date(a.submitted_at) : null;
            const status = a.status || (a.status_applied ? 'Applied' : 'N/A');
            const statusCls = status === 'Shortlisted' ? 'bg-green-100 text-green-800' : status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
            const initials = name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase();

            const handleViewResume = () => {
              const url = a.resume_url || a.candidate?.resume_url;
              if (url) window.open(url, '_blank');
              else alert('No resume URL available');
            };

            const updateStatus = async (newStatus) => {
              if (!a.application_id) return alert('Missing application id');
              if (newStatus === 'Rejected' && !confirm(`Reject ${name}'s application?`)) return;
              try {
                const res = await authFetch(`/applications/${a.application_id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus }),
                });
                if (!res.ok) throw new Error('Update failed');
                setApps((prev) => prev.map((p) => (p.application_id === a.application_id ? { ...p, status: newStatus } : p)));
                alert('Status updated');
              } catch (err) {
                console.error('Status update failed', err);
                alert(err?.message || 'Failed to update status');
              }
            };

            return (
              <div key={`${a.candidate_id}-${a.application_id || Math.random()}`} className="bg-white p-4 rounded shadow flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-semibold">{initials}</div>
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-500">{email}</div>
                    <div className="text-sm text-gray-500 inline-flex items-center gap-2 mt-1"><Calendar className="w-4 h-4 text-gray-400" />{submitted ? submitted.toLocaleString() : 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${statusCls}`}>{status}</div>

                  <div className="flex items-center gap-2">
                    <button onClick={handleViewResume} title="View resume" className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> View
                    </button>
                    <a href={a.resume_url || a.candidate?.resume_url || '#'} target="_blank" rel="noreferrer" title="Open resume" className="text-sm px-3 py-1 rounded-md bg-white border hover:bg-gray-50 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> Open
                    </a>
                    <button onClick={() => updateStatus('Shortlisted')} className="text-sm px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
                      <Check className="w-4 h-4" /> Shortlist
                    </button>
                    <button onClick={() => updateStatus('Rejected')} className="text-sm px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-2">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
