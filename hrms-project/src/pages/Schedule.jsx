import Navbar from "../components/HRNavbar";

export default function Schedule(props) {
  const userName = props?.userName ?? "Jane Recruiter";
  const onLogout = props?.onLogout ?? (() => {});

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl p-12 shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Schedule</h1>
          <p className="text-gray-600 text-lg">Coming Soon....</p>
        </div>
      </main>
    </div>
  );
}
