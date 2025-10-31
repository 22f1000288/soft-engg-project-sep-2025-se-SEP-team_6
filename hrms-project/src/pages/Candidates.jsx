import React, { useState, useRef } from "react";
import Navbar from "../components/HRNavbar";
import { CloudUpload, Download,Users,Plus } from "lucide-react";

export default function Candidates(props) {
  //Props
  const userName = props?.userName ?? "Jane Recruiter";
  const onLogout = props?.onLogout ?? (() => {});

  const [selectedJob, setSelectedJob] = useState("");
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  //  sample job list and candidates
  const jobs = [
    { id: "j1", title: "Frontend Developer" },
    { id: "j2", title: "Backend Developer" },
    { id: "j3", title: "Product Manager" },
  ];

  const [candidates, setCandidates] = useState([]); //filled after "screening"

  const onFilesAdded = (newFiles) => {
    const list = Array.from(newFiles);
    setFiles((prev) => [...prev, ...list]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleUploadClick = () => inputRef.current?.click();

  const handleStartScreening = () => {
    // populate candidates from file names or sample list
    if (!selectedJob) {
      alert("Please select a job position first.");
      return;
    }
    // Build sample candidate list
    const sample =
      files.length > 0
        ? files.slice(0, 10).map((f, i) => ({
            id: `c${i + 1}`,
            name: f.name.replace(/\.[^/.]+$/, "") || `Candidate ${i + 1}`,
            score: Math.floor(50 + Math.random() * 50),
            summary: "Auto-screened candidate — quick summary",
          }))
        : Array.from({ length: 6 }).map((_, i) => ({
            id: `s${i + 1}`,
            name: `Candidate ${i + 1}`,
            score: Math.floor(50 + Math.random() * 50),
            summary: "Auto-generated sample candidate",
          }));

    setCandidates(sample);
  };

  const totalResumes = files.length || candidates.length || 0;
  const highMatch = candidates.filter((c) => c.score >= 80).length;
  const medMatch = candidates.filter(
    (c) => c.score >= 60 && c.score < 80
  ).length;
  const lowMatch = candidates.filter((c) => c.score < 60).length;

  const navItems = [
    { label: "Dashboard", to: "/hr-dashboard" },
    { label: "Jobs", to: "/jobs" },
    { label: "Candidates", to: "/candidates" },
    { label: "Communications", to: "/communications" },
    { label: "Analytics", to: "/analytics" },
    { label: "Schedule", to: "/schedule" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        navItems={navItems}
        userName={userName}
        onLogout={onLogout}
        brand={{ title: "TalentFlow" }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 mt-5">
        {/* Title */}
        <div className="mb-6 shadow-sm">
          <h1 className="text-2xl md:text-4xl font-bold text-blue-700">
            AI Resume Screening
          </h1>
          <p className="text-gray-600 mt-1">
            Score, cluster, and analyze resumes to shortlist top candidates in
            under 5 minutes
          </p>
        </div>

        {/* Top control card */}
        <section className="bg-white rounded-2xl p-6 shadow-2xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Job select */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job Position
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
              >
                <option value="">Choose a job position</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="lg:col-span-5 border border-dashed border-gray-300 rounded-md p-6 flex items-center justify-center bg-gray-50"
            >
              <div className="w-full text-center">
                <input
                  type="file"
                  ref={inputRef}
                  multiple
                  className="hidden"
                  onChange={(e) => onFilesAdded(e.target.files)}
                />
                <div className="flex flex-col items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Resumes
                  </label>
                  <CloudUpload className="w-8 h-1 text-gray-400" />
                  <p className="text-gray-600">Upload multiple resumes</p>
                  <div className="mt-1">
                    <button
                      onClick={handleUploadClick}
                      className="text-sm px-3 py-1 border rounded-md text-gray-700"
                    >
                      Select files
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Start button */}
            <div className="lg:col-span-3 flex items-center justify-end">
              <button
                onClick={handleStartScreening}
                className="ml-auto w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-2 rounded-md inline-flex items-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Start AI Screening
              </button>
            </div>
          </div>
        </section>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left card: Top 10 Candidates */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-700">
                Top 10 Candidates
              </h2>
              <div className="flex items-center gap-3">
                <button className="text-sm px-3 py-1 border rounded text-gray-600 inline-flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={() => alert("Shortlist all sample")}
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded"
                >
                  Shortlist All
                </button>
              </div>
            </div>

            {/* If no candidates, show placeholder */}
            {candidates.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-center text-gray-400 border border-dashed border-gray-200 rounded-md">
                <div>
                  <Users className="w-10 h-10 mx-auto mb-3" />
                  <p>
                    Select a job position and upload resumes to start AI
                    screening
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((c, idx) => (
                  <div
                    key={c.id}
                    className="border border-gray-100 rounded-md p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-gray-500">#{idx + 1}</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {c.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {c.summary}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Match</div>
                      <div
                        className={`text-lg font-bold ${
                          c.score >= 80
                            ? "text-green-600"
                            : c.score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {c.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column cards */}
          <div className="space-y-6">
            {/* Screening Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-blue-700 mb-4">
                Screening Summary
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Resumes</span>
                  <span className="font-semibold">{totalResumes}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Match (80%+)</span>
                  <span className="font-semibold text-green-600">
                    {highMatch}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Medium Match (60-79%)</span>
                  <span className="font-semibold text-yellow-600">
                    {medMatch}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Low Match (&lt;60%)</span>
                  <span className="font-semibold text-red-600">{lowMatch}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flagged Mismatches</span>
                  <span className="font-semibold text-red-600">0</span>
                </div>
              </div>
            </div>

            {/* Talent Clusters */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-blue-700 mb-4">
                Talent Clusters
              </h3>
              <div className="text-sm text-gray-600">
                {/* SamplePlaceholder clusters */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Frontend Engineers</div>
                      <div className="text-xs text-gray-500">
                        React, TypeScript
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      18
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Backend Engineers</div>
                      <div className="text-xs text-gray-500">Node, Python</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      12
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Product Managers</div>
                      <div className="text-xs text-gray-500">
                        Roadmap, Strategy
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">6</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
