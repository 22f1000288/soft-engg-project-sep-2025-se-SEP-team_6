import React, { useEffect, useState } from "react";
import Navbar from "../components/HRNavbar";
import { BarChart, Users, Briefcase, Clock } from "lucide-react";
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
    { id: 1, label: "Open Roles", value: openRoles, icon: Briefcase },
    { id: 2, label: "Applications", value: applicationsCount, icon: Users },
    { id: 3, label: "Hires (30d)", value: hiresCount, icon: BarChart },
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

      <main className="py-10 px-4 sm:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* KPI CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div
                  key={k.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{k.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {k.value}
                      </p>
                    </div>
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* PIPELINE FULL WIDTH */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Candidate Pipeline
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Applied", value: appliedCount },
                { label: "Screened", value: screenedCount },
                { label: "Interview", value: interviewCount },
                { label: "Offer", value: offerCount },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
                >
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CHART + ROLES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* HIRES OVER TIME - WITH AXES */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Hires over time
                </h2>
                <span className="text-sm text-gray-500">Last 6 months</span>
              </div>

              <div className="w-full h-64 flex items-center justify-center">
                <svg viewBox="0 0 220 120" className="w-full h-full">

                  {/* Horizontal axis */}
                  <line
                    x1="0"
                    y1="100"
                    x2="200"
                    y2="100"
                    stroke="#d1d5db"
                    strokeWidth="2"
                  />

                  {/* Vertical axis */}
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="100"
                    stroke="#d1d5db"
                    strokeWidth="2"
                  />

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
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          points={points.join(" ")}
                          strokeLinecap="round"
                        />

                        {points.map((p, i) => {
                          const [x, y] = p.split(",");
                          return (
                            <circle key={i} cx={x} cy={y} r="3" fill="#2563eb" />
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Open Roles
              </h3>

              {topRoles.length === 0 && (
                <p className="text-sm text-gray-500">No open roles</p>
              )}

              <ul className="space-y-4">
                {topRoles.map((r) => (
                  <li key={r.id} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{r.title}</p>
                      <p className="text-xs text-gray-500">
                        {r.open} applicants
                      </p>
                    </div>
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
