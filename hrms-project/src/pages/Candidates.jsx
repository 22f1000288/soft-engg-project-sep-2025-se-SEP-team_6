import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/HRNavbar";
import { CloudUpload, Download, Users, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Candidates(props) {
  const userName = props?.userName ?? "Jane Recruiter";
  const { authFetch } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const jobData = await res.json();
        setJobs(jobData);

        if (jobData.length > 0) {
          setSelectedJob(jobData[0].id);
          await fetchTopCandidatesForJob(jobData[0].id);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [authFetch]);

  const fetchTopCandidatesForJob = async (jobId) => {
    try {
      const res = await authFetch(`/scores/job/${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch scores');
      const data = await res.json();
      const scores = data.scores || [];

      // Sort scores in descending order and take top 5
      const topScores = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // Fetch candidate details for each score
      const candidatesData = await Promise.all(
        topScores.map(async (score) => {
          try {
            const userRes = await authFetch(`/users/${score.candidate_id}`);
            if (!userRes.ok) return null;
            const userData = await userRes.json();
            return {
              id: score.id,
              candidateId: score.candidate_id,
              name: userData.name || `Candidate ${score.candidate_id}`,
              email: userData.email,
              score: score.score,
              createdAt: score.created_at,
            };
          } catch (err) {
            console.error(`Error fetching user ${score.candidate_id}:`, err);
            return null;
          }
        })
      );

      setTopCandidates(candidatesData.filter(c => c !== null));
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setTopCandidates([]);
    }
  };


  const handleScoreResumes = async () => {
    if (!selectedJob) {
      alert("Please select a job first.");
      return;
    }

    try {
      setLoading(true);

      const res = await authFetch(`/jobs/${selectedJob}/score`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Scoring failed");
      }

      alert("Scoring complete!");

      // Refresh UI
      await fetchTopCandidatesForJob(selectedJob);

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setSelectedJob(jobId);
    if (jobId) {
      fetchTopCandidatesForJob(jobId);
    }
  };

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

  const _totalResumes = files.length || topCandidates.length || 0;
  const _highMatch = topCandidates.filter((c) => c.score >= 80).length;
  const _medMatch = topCandidates.filter(
    (c) => c.score >= 60 && c.score < 80
  ).length;
  const _lowMatch = topCandidates.filter((c) => c.score < 60).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userName={userName} />
        <main className="py-6 sm:pt-12 min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-gray-600">Loading candidates...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-6 sm:pt-12 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-auto bg-gray-50">
        {/* Title */}
        <div className="mb-6 px-6">
          <h1 className="text-2xl md:text-4xl font-bold text-blue-700">
          </h1>
          <p className="text-gray-600 mt-1">
            Score, cluster, and analyze resumes to shortlist top candidates
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Top control card */}
          <section className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            
            {/* Job select */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job Position
              </label>
              <select
                value={selectedJob}
                onChange={handleJobChange}
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

            {/* SCORE BUTTON */}
            <div className="lg:col-span-2 flex items-end">
              <button
                onClick={handleScoreResumes}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition w-full"
              >
                Score
              </button>
            </div>

          </div>
        </section>



        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left card: Top 5 Candidates */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-700">
                Top 5 Candidates
              </h2>
              <div className="flex items-center gap-3">


              </div>
            </div>

            {/* If no candidates, show placeholder */}
            {topCandidates.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-center text-gray-400 border border-dashed border-gray-200 rounded-md">
                <div>
                  <Users className="w-10 h-10 mx-auto mb-3" />
                  <p>
                    No candidates scored for this job yet. Candidates will appear here once they upload resumes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {topCandidates.map((c, idx) => (
                  <div
                    key={c.id}
                    className="border border-gray-100 rounded-md p-4 flex items-center justify-between hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">#{idx + 1}</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {c.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {c.email}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">Match Score</div>
                      <div
                        className={`text-2xl font-bold ${
                          c.score >= 80
                            ? "text-green-600"
                            : c.score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {c.score.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right card: Summary Stats */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-4">
                Match Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Match (80+)</span>
                  <span className="text-lg font-bold text-green-600">
                    {_highMatch}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medium Match (60-79)</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {_medMatch}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Match (&lt;60)</span>
                  <span className="text-lg font-bold text-red-600">
                    {_lowMatch}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-4">
                Resumes Screened
              </h3>
              <div className="text-4xl font-bold text-blue-600">
                {_totalResumes}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
