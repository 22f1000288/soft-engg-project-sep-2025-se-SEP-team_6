import React, { useMemo, useState, useEffect, useCallback } from "react";
import Navbar from "../components/HRNavbar";
import { Plus, Search, MapPin, Users, Calendar, Briefcase, Edit3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../contexts/useAuth";

export default function Jobs(props) {
  const navigate = useNavigate();
  const userName = props?.userName ?? "Jane Recruiter";

  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { authFetch } = useAuth();

  const departments = Array.from(new Set(jobs.map((j) => j.department || "")));
  const statuses = Array.from(new Set(jobs.map((j) => j.status || "")));

  // Colors for skill chips (cycled)
  const skillColors = [
    "bg-indigo-50 text-indigo-700",
    "bg-pink-50 text-pink-700",
    "bg-green-50 text-green-700",
    "bg-yellow-50 text-yellow-700",
    "bg-sky-50 text-sky-700",
  ];

  const filtered = useMemo(() => {
    let out = jobs;
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }
    if (departmentFilter)
      out = out.filter((j) => j.department === departmentFilter);
    if (statusFilter) out = out.filter((j) => j.status === statusFilter);
    if (sortBy === "applicants") out = out.slice().sort((a, b) => b.applicants - a.applicants);
    else out = out.slice().sort((a, b) => new Date(b.posted_at || b.created_at) - new Date(a.posted_at || a.created_at));
    return out;
  }, [jobs, query, departmentFilter, statusFilter, sortBy]);

  const fetchJobs = useCallback(async () => {
  setLoading(true);
  setError("");
  try {
    const res = await authFetch(`/jobs`, {
      method: "GET",
    });
    if (!res.ok) throw new Error(`Failed to load jobs (${res.status})`);
    const data = await res.json();

    const normalized = data.map((j) => ({
      id: j.id,
      title: j.title,
      department: j.employment_type || j.department || j.qualification || "",
      location: j.location,
      type: j.employment_type || "",
      posted_at: j.created_at,
      applicants: j.applicants ?? 0,
      status: j.status
        ? String(j.status).toLowerCase() === "open"
          ? "Active"
          : String(j.status).charAt(0).toUpperCase() + String(j.status).slice(1)
        : "Unknown",
      raw: j,
    }));

    setJobs(normalized);
  } catch (err) {
    setError(err.message || String(err));
  } finally {
    setLoading(false);
  }
}, [authFetch]);


  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const refresh = fetchJobs;

  const handleEdit = (job) => {
    navigate(`/job-creator/${job.id}`);
  };

  const handleClose = async (job) => {
    if (!window.confirm(`Close job "${job.title}"? This will mark it closed.`)) return;
    try {
      setLoading(true);
      const res = await authFetch(`/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      if (!res.ok) throw new Error(`Close failed (${res.status})`);
      await refresh();
    } catch (err) {
      alert(err.message || 'Failed to close job');
    } finally {
      setLoading(false);
    }
  };

  return (
    //Navbar

    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />
      {/* Main Content Section */}

      <main className="py-6 px-6 sm:pt-12 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-auto bg-gray-50  ">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Jobs</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage open roles, view applicants and pipeline status
            </p>
          </div>

          {/* search + create button wrapper */}
          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search  */}
              <div className="flex items-center bg-white border rounded-md px-3 py-1 gap-2 flex-1 min-w-0">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search jobs, departments, locations"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full min-w-0 text-sm outline-none"
                />
              </div>

              {/* Create Job  */}
              <button
                onClick={() => navigate("/job-creator")}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" /> Create Job
              </button>
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="text-xs text-gray-500">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="ml-2 rounded-md border px-3 py-1 bg-white"
                >
                  <option value="">All</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="ml-2 rounded-md border px-3 py-1 bg-white"
                >
                  <option value="">All</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500">Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="ml-2 rounded-md border px-3 py-1 bg-white"
                >
                  <option value="recent">Most recent</option>
                  <option value="applicants">Most applicants</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filtered.length}
              </span>{" "}
              jobs
            </div>
          </div>
        </div>

        {/* Jobs list */}

        {loading && (
          <div className="mb-4 text-sm text-gray-600">Loading jobs…</div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-600">Error: {error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg p-5 shadow-lg border border-gray-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
                      <Briefcase className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {job.title}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            job.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : job.status === "Review"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" />{job.location || 'Remote'}</span>
                        <span className="inline-flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" />{job.applicants ?? 0} applicants</span>
                        <span className="inline-flex items-center gap-1 text-sm text-gray-500"><Calendar className="w-4 h-4 text-gray-400" /> {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Unknown'}</span>
                      </div>

                      {/* skills from raw payload if present */}
                      {job.raw?.skills_required ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(job.raw.skills_required || "").split(",").map((s, i) => {
                            const t = s.trim();
                            if (!t) return null;
                            const cls = skillColors[i % skillColors.length];
                            return (
                              <span key={i} className={`text-xs px-2 py-1 rounded-full ${cls}`}>
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => navigate(`/job-applicants/${job.id}`)}
                    className="text-sm text-indigo-600 flex items-center gap-2"
                  >
                    View applicants
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(job)}
                      className="px-3 py-1 rounded-md text-sm bg-blue-400 text-black hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleClose(job)}
                      className="px-3 py-1 rounded-md text-sm bg-red-300 text-black hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg p-6 shadow-lg mt-6 text-center text-gray-500">
            No jobs match your filters. Try clearing filters or create a new
            job.
          </div>
        )}
      </main>
    </div>
  );
}
