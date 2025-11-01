import React, { useMemo, useState } from "react";
import CandidateNavbar from "../components/CandidateNavbar";

const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Frontend Engineer",
    company: "Acme Corp",
    location: "Remote",
    type: "Full-time",
    salary: "₹12L - ₹18L",
    tags: ["React", "Tailwind", "Frontend"],
    description:
      "Work with a small team building beautiful web experiences. Strong React skills required.",
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "DataWorks",
    location: "Bengaluru, India",
    type: "Full-time",
    salary: "₹14L - ₹22L",
    tags: ["Node.js", "Postgres", "APIs"],
    description: "Design highly scalable backend services and APIs.",
  },
  {
    id: 3,
    title: "Product Designer",
    company: "PixelHouse",
    location: "Hyderabad, India",
    type: "Contract",
    salary: "₹8L - ₹12L",
    tags: ["Figma", "Design Systems"],
    description: "Create delightful user experiences across web and mobile.",
  },
];

export default function CandidateJobs() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedTag, setSelectedTag] = useState(null);

  const allTags = useMemo(() => {
    const set = new Set();
    SAMPLE_JOBS.forEach((j) => j.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, []);

  const results = useMemo(() => {
    return SAMPLE_JOBS.filter((job) => {
      if (typeFilter !== "All" && job.type !== typeFilter) return false;
      if (selectedTag && !job.tags.includes(selectedTag)) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q)
      );
    });
  }, [query, typeFilter, selectedTag]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      {/* content area: offset for fixed navbar (h-16) */}
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
                placeholder="Search by title, company or skills..."
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
            <span className="text-sm text-gray-700">Tags:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-sm px-2 py-1 rounded-md border ${
                  selectedTag === null
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag((s) => (s === t ? null : t))}
                  className={`text-sm px-2 py-1 rounded-md border ${
                    selectedTag === t
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
          {results.length === 0 ? (
            <div className="col-span-full bg-white p-6 rounded-md shadow-lg text-center">
              <p className="text-gray-600">
                No jobs found. Try adjusting filters.
              </p>
            </div>
          ) : (
            results.map((job) => (
              <article
                key={job.id}
                className="bg-white p-5 rounded-lg shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {job.title}
                      </h2>
                      <div className="mt-1 text-sm text-gray-600">
                        <span>{job.company}</span>
                        <span className="mx-2">•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-700">{job.type}</div>
                      <div className="text-sm text-gray-500">{job.salary}</div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-700 line-clamp-3">
                    {job.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-2">
                    <button
                      className="text-sm px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => alert(`Saved ${job.title}`)}
                    >
                      Save
                    </button>
                    <button
                      className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => alert(`Applied to ${job.title} (dummy)`)}
                    >
                      Apply
                    </button>
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
