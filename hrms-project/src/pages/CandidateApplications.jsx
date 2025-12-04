import React, { useMemo, useState, useEffect } from "react";
import CandidateNavbar from "../components/CandidateNavbar";
import useAuth from "../contexts/useAuth";
import { MapPin, Calendar, Eye, Trash2, Check } from "lucide-react";

const SAMPLE_APPLICATIONS = [
  {
    id: "a1",
    jobTitle: "Frontend Engineer",
    company: "Acme Corp",
    appliedOn: "2025-10-22",
    status: "Under Review",
    location: "Remote",
  },
  {
    id: "a2",
    jobTitle: "Backend Engineer",
    company: "DataWorks",
    appliedOn: "2025-09-30",
    status: "Interview",
    location: "Bengaluru",
  },
  {
    id: "a3",
    jobTitle: "Product Designer",
    company: "PixelHouse",
    appliedOn: "2025-10-01",
    status: "Rejected",
    location: "Hyderabad",
  },
];

export default function CandidateApplications() {
  const [query, setQuery] = useState("");
  const [statusFilter] = useState("All");
  const { authFetch } = useAuth();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authFetch("/candidate/applications");
        const data = await res.json();
        // map backend shape to frontend display shape
        const mapped = (Array.isArray(data) ? data : []).map((a) => ({
          id: a.application_id,
          jobId: a.job_id,
          jobTitle: a.job_title || `Job ${a.job_id}`,
          company: "", // backend does not expose poster name currently
          appliedOn: a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : "",
          status: a.status || "Unknown",
          location: a.location || "",
        }));
        setApplications(mapped);
      } catch (err) {
        console.error("Failed to load applications", err);
        setApplications(SAMPLE_APPLICATIONS);
      }
    };
    load();
  }, [authFetch]);

  // modal state for viewing job details
  const [modalOpen, setModalOpen] = useState(false);
  const [, setModalLoading] = useState(false);
  const [modalJob, setModalJob] = useState(null);

  const openJobModal = async (app) => {
    setModalOpen(true);
    setModalLoading(true);
    // seed modal with application-level info
    setModalJob({ jobTitle: app.jobTitle, status: app.status, appliedOn: app.appliedOn, location: app.location, company: app.company, details: null });

    // fetch job details if jobId present
    if (app.jobId) {
      try {
        const res = await authFetch(`/jobs/${app.jobId}`);
        if (res.ok) {
          const jobData = await res.json();
          setModalJob((m) => ({ ...m, details: jobData }));
        } else {
          setModalJob((m) => ({ ...m, details: null }));
        }
      } catch (err) {
        console.error("Failed to fetch job details", err);
        setModalJob((m) => ({ ...m, details: null }));
      }
    }

    setModalLoading(false);
  };

  const closeJobModal = () => {
    setModalOpen(false);
    setModalJob(null);
    setModalLoading(false);
  };

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        a.jobTitle.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        (a.location || "").toLowerCase().includes(q)
      );
    });
  }, [applications, query, statusFilter]);

  const withdraw = async (id) => {
    if (!confirm("Withdraw application? This action cannot be undone.")) return;
    try {
      const res = await authFetch(`/applications/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || 'Withdraw failed');
      }
      setApplications((prev) => prev.filter((p) => p.id !== id));
      alert("Application withdrawn");
    } catch (err) {
      console.error("Withdraw failed", err);
      alert(err.message || "Unable to withdraw application");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      <main className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-blue-700">
            </h1>
            <p className="text-sm text-gray-600">
              Track your submitted applications and their status.
            </p>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by role, company or location"
              className="block w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        {/* Job details modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl mx-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{modalJob?.details?.title || modalJob?.jobTitle}</h3>
                  <div className="text-sm text-gray-600">Status: <span className="font-medium">{modalJob?.status}</span></div>
                </div>
                <div className="text-right">
                  <button onClick={closeJobModal} className="text-gray-500 hover:text-gray-700">Close</button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500">Applied On</div>
                  <div className="font-medium">{modalJob?.appliedOn || '-'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="font-medium">{modalJob?.details?.location || modalJob?.location || '-'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Company</div>
                  <div className="font-medium">{modalJob?.details?.company || modalJob?.company || '-'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Job Description</div>
                  <div className="prose max-w-none text-sm text-gray-800 mt-2">{modalJob?.details?.description || <span className="text-gray-500">No description available.</span>}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {filtered.map((app) => (
          <div
            key={app.id}
            className="bg-white p-5 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-2xl transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-semibold">{(app.jobTitle||"").split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {app.jobTitle}
                  </h2>
                  <div className="text-sm text-gray-600 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" />{app.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" />{app.appliedOn || '-'}</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700 line-clamp-3">{app.company ? `${app.company} • ${app.location || ''}` : ''}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${app.status === 'Rejected' ? 'bg-red-50 text-red-700' : app.status === 'Offered' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {app.status}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openJobModal(app)}
                  className="flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"
                >
                  <Eye className="w-4 h-4" /> View
                </button>

                <button
                  onClick={() => withdraw(app.id)}
                  className="flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
                >
                  <Trash2 className="w-4 h-4" /> Withdraw
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
