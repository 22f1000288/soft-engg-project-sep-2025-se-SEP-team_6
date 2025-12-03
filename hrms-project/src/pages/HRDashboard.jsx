import {
  Briefcase,
  Users,
  CheckCircle,
  Plus,
  MapPin,
  Calendar,
  BarChart2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/HRNavbar";
import { useEffect, useState } from "react";
import useAuth from "../contexts/useAuth";

export default function RecruitmentDashboard(props) {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const userName = props?.userName ?? "Jane Recruiter";
  const [activeJobs, setActiveJobs] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [hiredCount, setHiredCount] = useState(0);
  const [jobs, setJobs] = useState([]);

  const createJobHandler = () => {
    navigate("/job-creator");
  };

  const handleJobClick = (jobTitle) => {
    navigate(`/kanban-board?job=${encodeURIComponent(jobTitle)}`);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [activeRes, candidateRes, hiredRes, jobsRes] = await Promise.all([
          authFetch("/active-jobs"),
          authFetch("/candidate-count"),
          authFetch("/hired-count"),
          authFetch("/jobs"),
        ]);
        const activeData = await activeRes.json();
        const candidateData = await candidateRes.json();
        const hiredData = await hiredRes.json();
        const jobsData = await jobsRes.json();
        
        setActiveJobs(activeData.active_jobs_count ?? 0);
        setCandidateCount(candidateData.candidate_count ?? 0);
        setHiredCount(hiredData.hired_count ?? 0);
        setJobs(jobsData || []);
      } catch (error) {
        console.error("Error loading HR dashboard stats:", error);
      }
    };

    fetchStats();
  }, [authFetch]);

  const stats = [
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: Briefcase,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Candidates",
      value: candidateCount,
      icon: Users,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Hired",
      value: hiredCount,
      icon: CheckCircle,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-6 sm:pt-12 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-auto bg-gray-50">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">
            Recruitment Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your hiring pipeline efficiently
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid with sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Hiring Pipeline (main) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-700">Hiring Pipeline</h2>
            </div>

            <div className="space-y-6">
              {jobs.map((job, index) => (
                <div
                  key={job.id || index}
                  onClick={() => handleJobClick(job.title)}
                  className="border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-700">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 hover:text-blue-700 transition-colors">
                        {job.title}
                      </h3>
                    </div>

                    <span
                      className={`${
                        job.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      } px-3 py-1 rounded-full text-xs font-semibold`}
                    >
                      {job.status || "Active"}
                    </span>
                  </div>

                  <div className="flex gap-6 text-sm text-gray-600 mb-4 items-center">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> <span className="font-semibold text-gray-900">{job.location || 'Remote'}</span></span>
                    <span className="inline-flex items-center gap-1">Type: <span className="font-semibold text-gray-900">{job.employment_type}</span></span>
                    <span className="inline-flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" /> <span className="font-semibold text-gray-900">{job.applicants ?? 0}</span></span>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <p className="line-clamp-2">{job.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-medium">Click to view applications →</span>
                    <span className="text-xs text-gray-500 inline-flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>
              ))}

              {jobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No jobs found. Create your first job to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar - Quick actions & Hires Summary */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <button onClick={createJobHandler} className="w-full inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md">
                  <Plus className="w-4 h-4" /> New Job
                </button>
                <button onClick={() => navigate('/candidates')} className="w-full inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-md">
                  <Users className="w-4 h-4 text-gray-600" /> Candidates
                </button>
                <button onClick={() => navigate('/hr-jobs')} className="w-full inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-md">
                  <Briefcase className="w-4 h-4 text-gray-600" /> Jobs
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
