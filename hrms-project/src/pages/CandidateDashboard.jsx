import {
  FileText,
  Calendar,
  CheckCircle,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import CandidateNavbar from "../components/CandidateNavbar";
import { useEffect, useState } from "react";
import useAuth from "../contexts/useAuth";

export default function CandidateDashboard() {
  const { authFetch } = useAuth();
  const [applicationCount, setApplicationCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [jobOfferedCount, setjobOfferedCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch("/candidate/applications");
        const apps = await res.json();
        const applicationCount = Array.isArray(apps) ? apps.length : 0;
        const interviewCount = Array.isArray(apps)
          ? apps.filter((a) => a.status === "Interview" || a.status_interviewed).length
          : 0;
        const jobOfferedCount = Array.isArray(apps)
          ? apps.filter((a) => a.status === "Offered" || a.status_offered).length
          : 0;
        setApplicationCount(applicationCount);
        setInterviewCount(interviewCount);
        setjobOfferedCount(jobOfferedCount);
      } catch (err) {
        console.error("Error loading candidate dashboard stats:", err);
      }
    };

    fetchStats();
  }, [authFetch]);

  const stats = [
    {
      label: "Applications",
      value: applicationCount,
      icon: FileText,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Interviews",
      value: interviewCount,
      icon: Calendar,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Offers",
      value: jobOfferedCount,
      icon: CheckCircle,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadRecent = async () => {
      try {
        const res = await authFetch("/candidate/applications");
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const mapped = data.slice(0, 5).map((a) => {
          // map backend shape to the UI shape used below
          const status = a.status || (a.status_applied ? "Applied" : "Unknown");
          const statusColor =
            status === "Rejected"
              ? "bg-red-100 text-red-700"
              : status === "Offered"
              ? "bg-green-100 text-green-700"
              : status === "Interview"
              ? "bg-green-50 text-green-700"
              : "bg-yellow-100 text-yellow-700";

          return {
            id: a.application_id,
            title: a.job_title || `Job ${a.job_id}`,
            company: "", // not provided by backend currently
            appliedDate: a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : "",
            status,
            statusColor,
          };
        });
        if (mounted) setRecentApplications(mapped);
      } catch (err) {
        console.error("Failed to load recent applications", err);
      }
    };
    loadRecent();
    return () => {
      mounted = false;
    };
  }, [authFetch]);

  

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8 mt-4">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Candidate Dashboard
          </h1>
          <p className="text-gray-600">
            Track your job applications and prepare for interviews
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-blue-600 text-sm mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-blue-600">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="bg-white rounded-2xl p-6 shadow-lg w-100">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">
              Recent Applications
            </h2>

            <div className="space-y-4">
              {recentApplications.map((app, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-blue-600 mb-1">
                        {app.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {app.company && <>{app.company} • </>}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {app.appliedDate}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`${app.statusColor} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
          
        </div>
      </main>
    </div>
  );
}
