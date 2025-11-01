import React, { useMemo, useState } from "react";
import Navbar from "../components/HRNavbar";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Jobs(props) {
  const navigate = useNavigate();
  const userName = props?.userName ?? "Jane Recruiter";

  // jobs data
  const sampleJobs = [
    {
      id: "j1",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      posted: "3 days ago",
      applicants: 45,
      status: "Active",
    },
    {
      id: "j2",
      title: "Backend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      posted: "1 week ago",
      applicants: 32,
      status: "Review",
    },
    {
      id: "j3",
      title: "Product Manager",
      department: "Product",
      location: "New York, NY",
      type: "Contract",
      posted: "2 weeks ago",
      applicants: 12,
      status: "Closed",
    },
    {
      id: "j4",
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      type: "Part-time",
      posted: "5 days ago",
      applicants: 20,
      status: "Active",
    },
  ];

  const [jobs] = useState(sampleJobs);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const departments = Array.from(new Set(jobs.map((j) => j.department)));
  const statuses = Array.from(new Set(jobs.map((j) => j.status)));

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
    if (sortBy === "applicants")
      out = out.slice().sort((a, b) => b.applicants - a.applicants);
    else
      out = out
        .slice()
        .sort(
          (a, b) =>
            Date.parse(new Date(b.posted)) - Date.parse(new Date(a.posted))
        );
    return out;
  }, [jobs, query, departmentFilter, statusFilter, sortBy]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg p-5 shadow-lg border border-gray-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
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
                  <div className="text-sm text-gray-600 mt-1">
                    {job.department}, {job.location}, {job.type}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Posted {job.posted}, {job.applicants} applicants
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => alert(`Open applicants for ${job.title}`)}
                    className="text-sm text-indigo-600"
                  >
                    View applicants
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert("Edit")}
                      className="px-3 py-1 border rounded-md text-sm hover:bg-green-500 hover:text-white transition hover:cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => alert("Close job")}
                      className="px-3 py-1 border rounded-md text-sm hover:bg-red-600 hover:text-white transition hover:cursor-pointer"
                    >
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
