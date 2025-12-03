import React, { useMemo, useState, useEffect } from "react";
import CandidateNavbar from "../components/CandidateNavbar";
import { useAuth } from "../contexts/useAuth";
import { MapPin, Users, Send, Check, Briefcase } from "lucide-react";

export default function CandidateJobs() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { authFetch } = useAuth();

  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/jobs`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setJobs(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message || "Failed to load jobs"))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [API_BASE]);

  // load which jobs the candidate already applied to
  useEffect(() => {
    let mounted = true;
    const loadApplied = async () => {
      try {
        const res = await authFetch('/candidate/applications');
        if (!res.ok) return;
        const data = await res.json();
        const ids = (Array.isArray(data) ? data : []).map((a) => String(a.job_id)).filter(Boolean);
        if (mounted) setAppliedJobIds(new Set(ids));
      } catch {
        // ignore
      }
    };
    loadApplied();
    return () => (mounted = false);
  }, [authFetch]);

  const allSkills = useMemo(() => {
    const s = new Set();
    jobs.forEach((j) => {
      if (j.skills_required) {
        j.skills_required.split(",").map((x) => x.trim()).forEach((sk) => sk && s.add(sk));
      }
    });
    return Array.from(s);
  }, [jobs]);

  const results = useMemo(() => {
    return jobs.filter((job) => {
      if (typeFilter !== "All" && job.employment_type !== typeFilter) return false;
      if (selectedSkill) {
        const skills = (job.skills_required || "").toLowerCase();
        if (!skills.includes(selectedSkill.toLowerCase())) return false;
      }
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (job.title || "").toLowerCase().includes(q) ||
        (job.description || "").toLowerCase().includes(q) ||
        (job.skills_required || "").toLowerCase().includes(q)
      );
    });
  }, [jobs, query, typeFilter, selectedSkill]);

  // color styles for skill chips (cycled)
  const skillColors = [
    "bg-indigo-50 text-indigo-700",
    "bg-pink-50 text-pink-700",
    "bg-green-50 text-green-700",
    "bg-yellow-50 text-yellow-700",
    "bg-sky-50 text-sky-700",
    "bg-rose-50 text-rose-700",
  ];

  const handleApply = async (job) => {
    try {
      const resp = await authFetch(`/jobs/${job.id}/apply`, { method: "POST" });
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        alert(payload.detail || "Failed to apply");
        return;
      }
      alert("Application submitted");
      // Optionally update local applicants count
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, applicants: (j.applicants || 0) + 1 } : j)));
      // mark as applied locally
      setAppliedJobIds((prev) => new Set([...Array.from(prev), String(job.id)]));
    } catch (err) {
      alert(err.message || "Unable to apply. Please login as candidate.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-blue-700">Open Roles</h1>
            <p className="text-sm text-gray-600">Explore and apply to jobs</p>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/3">
            <label htmlFor="search" className="sr-only">
              Search jobs
            </label>
            <div className="relative">
              <input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, skills or description..."
                className="block w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm rounded-md border border-gray-200 bg-white px-2 py-1"
            >
              <option>All</option>
              <option>Full-time</option>
              <option>Contract</option>
              <option>Part-time</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Skills:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSkill(null)}
                className={`text-sm px-2 py-1 rounded-md border ${
                  selectedSkill === null
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                All
              </button>
              {allSkills.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedSkill((s) => (s === t ? null : t))}
                  className={`text-sm px-2 py-1 rounded-md border ${
                    selectedSkill === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full bg-white p-6 rounded-md shadow-lg text-center">
              <p className="text-gray-600">Loading jobs…</p>
            </div>
          ) : error ? (
            <div className="col-span-full bg-white p-6 rounded-md shadow-lg text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="col-span-full bg-white p-6 rounded-md shadow-lg text-center">
              <p className="text-gray-600">No jobs found. Try adjusting filters.</p>
            </div>
          ) : (
            results.map((job) => (
              <article
                key={job.id}
                className="bg-white p-5 rounded-lg shadow-lg flex flex-col justify-between"
              >
                <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="ml-2">
                            <h2 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h2>
                            <div className="mt-1 text-sm text-gray-600 flex items-center gap-3">
                              <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" />{job.location || 'Remote'}</span>
                              <span className="inline-flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" />{job.applicants ?? 0} applicants</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <div className="text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{job.employment_type || 'N/A'}</span>
                          </div>
                          <div className="text-sm text-gray-500">{job.applicants ?? 0} applicants</div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-gray-700 line-clamp-3">{job.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(job.skills_required || "").split(",").map((s) => s.trim()).filter(Boolean).map((t, i) => (
                          <span key={`${job.id}-${t}-${i}`} className={`text-xs px-2 py-1 rounded-full font-medium ${skillColors[i % skillColors.length]}`}>
                            {t}
                          </span>
                        ))}
                      </div>

                      {job.qualification ? (
                        <div className="mt-3 text-sm text-gray-600">Qualification: {job.qualification}</div>
                      ) : null}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {appliedJobIds.has(String(job.id)) ? (
                      <button
                        disabled
                        className="flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-green-100 text-green-800 cursor-default"
                      >
                        <Check className="w-4 h-4" /> Applied
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleApply(job)}
                      >
                        <Send className="w-4 h-4" /> Apply
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
