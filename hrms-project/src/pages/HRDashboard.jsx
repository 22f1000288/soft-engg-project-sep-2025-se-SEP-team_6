import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  Plus,
  ChevronDown,
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

  const createJobHandler = () => {
    navigate("/job-creator");
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [activeRes, candidateRes, hiredRes] = await Promise.all([
          authFetch("/active-jobs"),
          authFetch("/candidate-count"),
          authFetch("/hired-count"),
        ]);
        const activeData = await activeRes.json();
        const candidateData = await candidateRes.json();
        const hiredData = await hiredRes.json();
        setActiveJobs(activeData.active_jobs_count ?? 0);
        setCandidateCount(candidateData.candidate_count ?? 0);
        setHiredCount(hiredData.hired_count ?? 0);
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
      label: "Interviews Today",
      value: "8",
      icon: Clock,
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Hired",
      value: hiredCount,
      icon: CheckCircle,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const jobs = [
    {
      title: "Senior Frontend Developer",
      status: "Active",
      statusColor: "bg-green-100 text-green-700",
      applied: 45,
      screened: 12,
      interviewed: 5,
      offered: 1,
      progress: 65,
      progressColor: "bg-blue-500",
    },
    {
      title: "Product Manager",
      status: "Review",
      statusColor: "bg-yellow-100 text-yellow-700",
      applied: 32,
      screened: 8,
      interviewed: 3,
      offered: 0,
      progress: 35,
      progressColor: "bg-yellow-500",
    },
  ];

  const interviews = [
    {
      name: "Abhinav Namikaze",
      role: "Executive Assistant",
      time: "10:00 AM - 11:00 AM",
      color: "border-blue-500",
    },
    {
      name: "Suhani Sharma",
      role: "CFO",
      time: "2:00 PM - 3:00 PM",
      color: "border-green-500",
    },
    {
      name: "Saurabh Singh",
      role: "FullStack Developer",
      time: "4:00 PM - 5:00 PM",
      color: "border-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userName={userName}
      />

      {/* Header
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg"></div>
              <span className="text-xl font-semibold text-gray-900">
                TalentFlow
              </span>
            </div>
            <nav className="flex gap-6">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    navigate(
                      item === "Dashboard"
                        ? "/hr-dashboard"
                        : `/${item.toLowerCase()}`
                    );
                  }}
                  className={`text-sm font-medium transition ${
                    activeTab === item
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900"></button>
            <div>Saurabh Shukla</div>
            <div className="flex items-center gap-2">
              <span
                onClick={handleLogout}
                className="text-sm text-gray-700 cursor-pointer"
              >
                Logout
              </span>
            </div>
          </div>
        </div>
      </header>
 */}
      {/* Main Content */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hiring Pipeline */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                Hiring Pipeline
              </h2>
              <button
                onClick={createJobHandler}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Job
              </button>
            </div>

            <div className="space-y-6">
              {jobs.map((job, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {job.title}
                    </h3>
                    <span
                      className={`${job.statusColor} px-3 py-1 rounded-full text-xs font-semibold`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="flex gap-6 text-sm text-gray-600 mb-4">
                    <span>
                      Applied:{" "}
                      <span className="font-semibold text-gray-900">
                        {job.applied}
                      </span>
                    </span>
                    <span>
                      Screened:{" "}
                      <span className="font-semibold text-gray-900">
                        {job.screened}
                      </span>
                    </span>
                    <span>
                      Interviewed:{" "}
                      <span className="font-semibold text-gray-900">
                        {job.interviewed}
                      </span>
                    </span>
                    <span>
                      Offered:{" "}
                      <span className="font-semibold text-gray-900">
                        {job.offered}
                      </span>
                    </span>
                  </div>

                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${job.progressColor} rounded-full transition-all duration-500`}
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Interviews */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">
              Today's Interviews
            </h2>
            <div className="space-y-4">
              {interviews.map((interview, index) => (
                <div
                  key={index}
                  className={`border-l-4 ${interview.color} pl-4 py-2`}
                >
                  <h3 className="font-bold text-gray-900 mb-1">
                    {interview.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">{interview.role}</p>
                  <p className="text-gray-500 text-sm">{interview.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
