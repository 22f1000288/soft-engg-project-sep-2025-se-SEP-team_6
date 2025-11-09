import {
  FileText,
  Calendar,
  CheckCircle,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import CandidateNavbar from "../components/CandidateNavbar";

export default function CandidateDashboard() {
  const stats = [
    {
      label: "Applications",
      value: "12",
      icon: FileText,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Interviews",
      value: "3",
      icon: Calendar,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Offers",
      value: "1",
      icon: CheckCircle,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const applications = [
    {
      title: "Frontend Developer",
      company: "TechCorp Inc.",
      appliedDate: "Applied 2 days ago",
      status: "Under Review",
      statusColor: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "React Developer",
      company: "StartupXYZ",
      appliedDate: "Applied 5 days ago",
      status: "Interview Scheduled",
      statusColor: "bg-green-100 text-green-700",
    },
  ];

  

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
              {applications.map((app, index) => (
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
                        {app.company} • {app.appliedDate}
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
