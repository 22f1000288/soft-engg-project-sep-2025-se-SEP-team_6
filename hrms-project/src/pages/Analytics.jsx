import React from "react";
import Navbar from "../components/HRNavbar";
import { BarChart, Users, Briefcase, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Analytics(props) {
  const userName = props?.userName ?? "Jane Recruiter";
  const navigate = useNavigate();

  const createJobHandler = () => {
    navigate("/job-creator");
  };

  // Backend Coming Soon
  const kpis = [
    { id: 1, label: "Open Roles", value: 24, icon: Briefcase},
    {
      id: 2,
      label: "Avg Time to Hire (days)",
      value: 32,
      icon: Clock,
      delta: "-2",
    },
    { id: 3, label: "Applications", value: 1240, icon: Users},
    { id: 4, label: "Hires (30d)", value: 8, icon: BarChart},
  ];

  const topRoles = [
    { id: "r1", title: "Frontend Engineer", open: 6 },
    { id: "r2", title: "Backend Engineer", open: 4 },
    { id: "r3", title: "Product Manager", open: 2 },
  ];

  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-6 sm:pt-12 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-auto bg-gray-50">
        <header className="mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Hiring insights and trends for your organization
            </p>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.id} className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{k.label}</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {k.value}
                      </div>
                      
                    </div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-md">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                </div>

                {/* tiny sparkline placeholder */}
                <div className="mt-4 h-8">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="2"
                      points="0,12 20,8 40,10 60,6 80,9 100,4"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* main charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Hires over time
                </h2>
                <div className="text-sm text-gray-500">Last 6 months</div>
              </div>
              <div className="w-full h-56">
                {/* simple area chart placeholder */}
                <svg viewBox="0 0 200 80" className="w-full h-full">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
                      <stop
                        offset="100%"
                        stopColor="#60A5FA"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,60 L30,50 L60,40 L90,30 L120,35 L150,25 L180,20 L200,18 L200,80 L0,80 Z"
                    fill="url(#g1)"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Candidate Pipeline
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Applied</div>
                    <div className="text-xl font-bold">920</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Screened</div>
                    <div className="text-xl font-bold">420</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Interview</div>
                    <div className="text-xl font-bold">68</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Offer</div>
                    <div className="text-xl font-bold">12</div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Diversity Snapshot
                </h3>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs text-gray-500">Gender split</div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-2/3 bg-white rounded h-4 flex">
                      <div
                        className="bg-blue-600 h-4"
                        style={{ width: "62%" }}
                      />
                      <div
                        className="bg-pink-400 h-4"
                        style={{ width: "38%" }}
                      />
                    </div>
                    <div className="text-sm text-gray-700">62% Male</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right column */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Top Open Roles
              </h3>
              <ul className="space-y-2">
                {topRoles.map((r) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.open} open</div>
                    </div>
                    <button className="text-sm text-blue-600">View</button>
                  </li>
                ))}
              </ul>
            </div>

            

            
          </aside>
        </div>
      </main>
    </div>
  );
}
