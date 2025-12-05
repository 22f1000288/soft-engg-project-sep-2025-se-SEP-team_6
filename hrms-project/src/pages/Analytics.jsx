import React, { useEffect, useState } from "react";
import Navbar from "../components/HRNavbar";
import { BarChart, Users, Briefcase, Clock, CheckCircle } from "lucide-react";
import useAuth from "../contexts/useAuth";

export default function Analytics(props) {
  const userName = props?.userName ?? "Recruiter";
  const { authFetch } = useAuth();

  const [openRoles, setOpenRoles] = useState(0);
  const [avgTimeToHire, setAvgTimeToHire] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [hiresCount, setHiresCount] = useState(0);
  const [topRoles, setTopRoles] = useState([]);

  const [appliedCount, setAppliedCount] = useState(0);
  const [screenedCount, setScreenedCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [offerCount, setOfferCount] = useState(0);
  const [hiresSeries, setHiresSeries] = useState([]);

  const kpis = [
    { id: 1, label: "Open Roles", value: openRoles, icon: Briefcase, bg: "bg-indigo-50", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
    { id: 2, label: "Applications", value: applicationsCount, icon: Users, bg: "bg-sky-50", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
    { id: 3, label: "Hires (30d)", value: hiresCount, icon: CheckCircle, bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [activeRes, appRes, hiredRes, jobsRes, appsAllRes] = await Promise.all([
          authFetch("/active-jobs"),
          authFetch("/application-count"),
          authFetch("/hired-count"),
          authFetch("/jobs"),
          authFetch("/applications/all"),
        ]);

        const activeData = await activeRes.json().catch(() => ({}));
        const appData = await appRes.json().catch(() => ({}));
        const hiredData = await hiredRes.json().catch(() => ({}));
        const jobsData = await jobsRes.json().catch(() => []);
        const appsAllData = await appsAllRes.json().catch(() => ({ applications: [] }));

        setOpenRoles(activeData.active_jobs_count ?? 0);
        setApplicationsCount(appData.application_count ?? 0);
        setHiresCount(hiredData.hired_count ?? 0);

        if (Array.isArray(jobsData)) {
          setTopRoles(
            jobsData
              .map((j) => ({
                id: j.id,
                title: j.title,
                open: j.applicants ?? 0,
              }))
              .sort((a, b) => b.open - a.open)
              .slice(0, 3)
          );
        }

        const apps = appsAllData.applications || [];
        let applied = 0,
          screened = 0,
          interviewed = 0,
          offered = 0;

        apps.forEach((a) => {
          const s = a.status;
          if (s === "new-applications") applied++;
          else if (s === "under-review") screened++;
          else if (s.includes("interview")) interviewed++;
          else if (s === "hired") offered++;
        });

        setAppliedCount(applied);
        setScreenedCount(screened);
        setInterviewCount(interviewed);
        setOfferCount(offered);

        // hires over last 6 months
        const now = new Date();
        const months = Array.from({ length: 6 }).map((_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return { year: d.getFullYear(), month: d.getMonth() };
        });

        const series = months.map(() => 0);

        apps.forEach((a) => {
          if (a.status !== "hired") return;
          const d = new Date(a.submitted_at || a.created_at);
          months.forEach((m, idx) => {
            if (d.getFullYear() === m.year && d.getMonth() === m.month)
              series[idx] += 1;
          });
        });

        setHiresSeries(series);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    };

    fetchStats();
  }, [authFetch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-full mx-auto space-y-10">

          {/* KPI CARDS */}
          <section className="grid grid-cols-1 pt-3 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div
                  key={k.id}
                  className={`bg-white shadow-lg border border-gray-100 rounded-xl p-5 hover:shadow-2xl transition ${k.bg}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{k.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {k.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${k.iconBg}`}>
                      <Icon className={`w-5 h-5 ${k.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* PIPELINE FULL WIDTH */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Candidate Pipeline
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Applied", value: appliedCount, color: "bg-sky-50 text-sky-800" },
                { label: "Screened", value: screenedCount, color: "bg-indigo-50 text-indigo-800" },
                { label: "Interview", value: interviewCount, color: "bg-amber-50 text-amber-800" },
                { label: "Offer", value: offerCount, color: "bg-emerald-50 text-emerald-800" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`border border-gray-200 rounded-lg p-4 text-center ${item.color}`}
                >
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CHART + ROLES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* HIRES OVER TIME - WITH AXES */}
            <div className="lg:col-span-2 bg-white border shadow-lg  border-gray-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Hires over time
                </h2>
                <span className="text-sm text-gray-500">Last 6 months</span>
              </div>

              <div className="w-full h-64 flex items-center justify-center">
                <svg viewBox="0 0 220 120" className="w-full h-full">

                  {/* Horizontal axis */}
                  <line x1="0" y1="100" x2="200" y2="100" stroke="#e5e7eb" strokeWidth="2" />

                  {/* Vertical axis */}
                  <line x1="0" y1="0" x2="0" y2="100" stroke="#e5e7eb" strokeWidth="2" />

                  {(() => {
                    const series = hiresSeries.slice();
                    const max = series.length ? Math.max(...series) : 1;
                    const width = 200;
                    const height = 100;

                    if (!series.length) {
                      return (
                        <text
                          x="50%"
                          y="55%"
                          fill="#9ca3af"
                          fontSize="14"
                          textAnchor="middle"
                        >
                          No data yet
                        </text>
                      );
                    }

                    const step = width / (series.length - 1);
                    const points = series.map((v, i) => {
                      const x = i * step;
                      const y = height - (v / max) * height;
                      return `${x},${y}`;
                    });

                    return (
                      <>
                        <defs>
                          <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        <polyline
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="3"
                          points={points.join(" ")}
                          strokeLinecap="round"
                        />

                        <polygon
                          fill="url(#lineGradient)"
                          points={`0,100 ${points.join(" ")} 200,100`}
                          opacity="0.5"
                        />

                        {points.map((p, i) => {
                          const [x, y] = p.split(",");
                          return (
                            <circle key={i} cx={x} cy={y} r="3" fill="#1d4ed8" />
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="bg-white border border-gray-100 shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Open Roles
              </h3>

              {topRoles.length === 0 && (
                <p className="text-sm text-gray-500">No open roles</p>
              )}

              <ul className="space-y-4">
                {topRoles.map((r) => (
                  <li key={r.id} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-800">{r.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4 text-indigo-600" />
                        {r.open} applicants
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">Open</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
