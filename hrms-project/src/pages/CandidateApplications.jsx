import React, { useMemo, useState } from "react";
import CandidateNavbar from "../components/CandidateNavbar";

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
  const [statusFilter, setStatusFilter] = useState("All");
  const [applications, setApplications] = useState(SAMPLE_APPLICATIONS);

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

  const withdraw = (id) => {
    if (!confirm("Withdraw application? This action cannot be undone.")) return;
    setApplications((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      <main className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-blue-700">
              My Applications
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

        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-md border border-gray-200 bg-white px-2 py-1"
          >
            <option>All</option>
            <option>Under Review</option>
            <option>Interview</option>
            <option>Offered</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-500">
              No applications found.
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                className="bg-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {app.jobTitle}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {app.company} , {app.location}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Applied on: {app.appliedOn}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700 text-right">
                    <div
                      className={`font-medium ${
                        app.status === "Rejected"
                          ? "text-red-600"
                          : app.status === "Offered"
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {app.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        alert(
                          `View details for ${app.jobTitle} (Backend coming soon)`
                        )
                      }
                      className="text-sm px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => withdraw(app.id)}
                      className="text-sm px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
