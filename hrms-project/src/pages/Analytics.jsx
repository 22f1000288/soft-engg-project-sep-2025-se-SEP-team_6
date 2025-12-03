import React from "react";
import Navbar from "../components/HRNavbar";
import { BarChart, Users, Briefcase, Clock } from "lucide-react";
import { useEffect, useState } from "react";
  import useAuth from "../contexts/useAuth";
export default function Analytics(props) {
  const userName = props?.userName ?? "Jane Recruiter";

  const { authFetch } = useAuth();
  const [openRoles, setOpenRoles] = useState(0);
  const [avgTimeToHire, setAvgTimeToHire] = useState(0); // placeholder
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
    { id: 2, label: "Avg Time to Hire (days)", value: avgTimeToHire, icon: Clock, delta: "-2" },
    { id: 3, label: "Applications", value: applicationsCount, icon: Users },
    { id: 4, label: "Hires (30d)", value: hiresCount, icon: BarChart },
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
  
        // Top roles: pick top 3 jobs by applicants if available
        if (Array.isArray(jobsData)) {
          // fetch scores for each job to compute screened count and top scores
          try {
            const scoreResPromises = jobsData.map((j) => authFetch(`/scores/job/${j.id}`));
            const scoreRes = await Promise.all(scoreResPromises);
            const scoreJsonPromises = scoreRes.map((r) => r.json().catch(() => ({ scores: [] })));
            const scoresPerJob = await Promise.all(scoreJsonPromises);

            const mapped = jobsData
              .map((j, idx) => {
                const scores = (scoresPerJob[idx] && scoresPerJob[idx].scores) || [];
                const open = scores.length || j.applicants || 0;
                const topScore = scores.length ? Math.max(...scores.map((s) => s.score || 0)) : 0;
                return { id: j.id || j.title, title: j.title, open, topScore, scores };
              })
              .sort((a, b) => b.open - a.open)
              .slice(0, 3);
            setTopRoles(mapped);

            // compute screened count from scores table (unique candidate-score entries)
            const totalScreened = scoresPerJob.reduce((acc, item) => {
              const list = (item && item.scores) || [];
              return acc + list.length;
            }, 0);
            setScreenedCount(totalScreened);
          } catch (err) {
            console.warn('Failed to load scores per job', err);
            const mapped = jobsData
              .map((j) => ({ id: j.id || j.title, title: j.title, open: j.applicants || 0 }))
              .sort((a, b) => b.open - a.open)
              .slice(0, 3);
            setTopRoles(mapped);
          }
        }
  
        // Pipeline counts from /applications/all
        const apps = appsAllData.applications || [];
        let applied = 0,
          screened = 0,
          interviewed = 0,
          offered = 0;
        apps.forEach((a) => {
          const s = a.status || "new-applications";
          if (s === "new-applications") applied += 1;
          else if (s === "under-review") screened += 1;
          else if (s === "interview-scheduled" || s === "final-review") interviewed += 1;
          else if (s === "hired") offered += 1;
        });
        setAppliedCount(applied);
        setScreenedCount(screened);
        setInterviewCount(interviewed);
        setOfferCount(offered);

        // compute hires over last 6 months
        try {
          const now = new Date();
          const months = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            return { year: d.getFullYear(), month: d.getMonth() };
          });
          const series = months.map(() => 0);
          apps.forEach((a) => {
            const s = a.status || "new-applications";
            if (s !== "hired") return;
            const t = a.submitted_at || a.created_at || a.updated_at;
            if (!t) return;
            const d = new Date(t);
            // find which month bucket this date belongs to
            months.forEach((m, idx) => {
              if (d.getFullYear() === m.year && d.getMonth() === m.month) series[idx] += 1;
            });
          });
          setHiresSeries(series);
          // make available to inline SVG renderer helper
          window.__analytics_hires_series__ = series;
        } catch (err) {
          console.warn('Failed to compute hires series', err);
        }
      } catch (err) {
        console.error("Failed to load analytics stats:", err);
      }
    };
  
    fetchStats();
  }, [authFetch]);



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
                  {/* hires-over-time: simple generated area chart from hiresSeries */}
                  <svg viewBox="0 0 200 80" className="w-full h-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {/** compute points from hiresSeries in JS below via a small helper rendered into JSX */}
                    {
                      (() => {
                        const series = (hiresSeries || []).slice();
                        const max = series.length ? Math.max(...series) : 1;
                        const width = 200;
                        const height = 60;
                        if (series.length === 0) {
                          // fallback placeholder
                          return (
                            <path d="M0,60 L200,60 L200,80 L0,80 Z" fill="url(#g1)" stroke="#3B82F6" strokeWidth="2" />
                          );
                        }
                        const step = width / Math.max(series.length - 1, 1);
                        const points = series.map((v, i) => {
                          const x = i * step;
                          const y = height - (v / Math.max(max, 1)) * height;
                          return `${x},${y}`;
                        });
                        const poly = points.join(' ');
                        const areaPath = `M0,${height} L${poly} L${width},${height} Z`;
                        return (
                          <>
                            <path d={areaPath} fill="url(#g1)" stroke="#3B82F6" strokeWidth="2" />
                            <polyline fill="none" stroke="#2563EB" strokeWidth="2" points={poly} />
                          </>
                        );
                      })()
                    }
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
                    <div className="text-xl font-bold">{appliedCount}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Screened</div>
                    <div className="text-xl font-bold">{screenedCount}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Interview</div>
                    <div className="text-xl font-bold">{interviewCount}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Offer</div>
                    <div className="text-xl font-bold">{offerCount}</div>
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
                          <div className="text-xs text-gray-500">
                            {r.open} open{r.topScore ? ` • top ${Number(r.topScore).toFixed(2)}` : ""}
                          </div>
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
