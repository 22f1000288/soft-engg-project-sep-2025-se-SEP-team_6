import { useState, useEffect } from "react";
import Navbar from "../components/HRNavbar";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../contexts/useAuth";

export default function JobCreater() {
  const { id } = useParams(); // optional job id for edit

  const [aiJobDescription, setAiJobDescription] = useState("");

  const [form, setForm] = useState({
    title: "",
    department: "",
    level: "",
    skills: "",
    location: "",
  });

  const navigate = useNavigate();
  const { user, authFetch } = useAuth(); // get authenticated user and authFetch from AuthContext

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navItems = [
    { label: "Dashboard", to: "/hr-dashboard" },
    { label: "Jobs", to: "/hr-jobs" },
    { label: "Candidates", to: "/candidates" },
    { label: "Communications", to: "/communications" },
    { label: "Analytics", to: "/analytics" },
    { label: "Schedule", to: "/schedule" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!user) {
      setError("You must be signed in to create or edit a job.");
      return;
    }
    if (!form.title || !form.skills) {
      setError("Please provide a job title and required skills.");
      return;
    }

    const payload = {
      posted_by: user.id,
      title: form.title,
      // description: `${form.title} — ${form.level} in ${form.department}. Skills: ${form.skills}.`,
      skills_required: form.skills,
      qualification: form.level,
      location: form.location,
      employment_type: form.department,
      status: form.status || "open",
      // server will set created_at when missing
    };

    setLoading(true);
    setError("");

    try {
      let res;
      if (id) {
        // edit mode
        res = await authFetch(`/generate-job-summary/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // create mode
        res = await authFetch('/generate-job-summary', {
          method: 'POST',
          // credentials : 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok){
          const data =  await res.json();
          setAiJobDescription(JSON.stringify(data.job_summary));
          // console.log("Generated Job Summary:", JSON.stringify(data));
        }

      }

      setLoading(false);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Server returned ${res.status}`);
      }

      await res.json();
      alert(id ? 'Job updated successfully' : 'Job created successfully');
      navigate('/hr-jobs');
    } catch (err) {
      setLoading(false);
      setError(err.message || `Failed to ${id ? 'update' : 'create'} job`);
    }
  };

  // If editing, load job details and prefill form
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/jobs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch job (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setForm((prev) => ({
          ...prev,
          title: data.title || '',
          department: data.employment_type || '',
          level: data.qualification || '',
          skills: data.skills_required || '',
          location: data.location || '',
          status: data.status || 'open',
        }));
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
    return () => { mounted = false };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        navItems={navItems}
        userName="Jane Recruiter"
        onLogout={() => navigate("/")}
        brand={{ title: "TalentFlow" }}
      />
      <div className="max-w-7xl mx-auto mt-7">
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold mt-7 text-blue-600">
              AI Job Description Creator
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:hidden">
              Generate compelling job descriptions in under 10 minutes
            </p>
          </div>
        </header>

        {/* Main content */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Job Details</h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <div className="sm:col-span-2">
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Senior Frontend Developer"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option>Engineering</option>
                    <option>Product</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                  </select>

                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Level</option>
                    <option>Entry Level(0-2 years)</option>
                    <option>Mid Level(2-5 years)</option>
                    <option>Senior Level(5+ years)</option>
                    <option>Lead/Principal(8+ years)</option>
                  </select>
                </div>
              </div>

              {/* Required Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-3">
                <label className="text-sm font-medium text-gray-700 pt-2">
                  Required Skills
                </label>
                <div className="sm:col-span-2">
                  <textarea
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="e.g., React, JavaScript, Node.js, TypeScript, AWS"
                    rows={4}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Location */}

              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="sm:col-span-2">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g., San Francisco, CA / Remote"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Generate button */}

              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                <div />
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (id ? "Saving…" : "Creating…") : (id ? "Save Changes" : "Generate Job Description with AI")}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Generated description card */}

          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h3 className="text-lg font-medium">Generated Job Description</h3>
              <div className="flex items-center gap-2">
                <button className="text-sm px-3 py-1 border rounded text-gray-600">
                  Edit
                </button>
                <button onClick={handleGenerate
                } className="text-sm px-3 py-1 bg-green-600 text-white rounded">
                  Publish
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[260px] sm:min-h-[420px] border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center text-gray-400 p-6 overflow-auto">
              <div className="text-center">
                <svg
                  className="mx-auto mb-3"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                  <path d="M17 21v-8h-6"></path>
                </svg>
                <textarea className="text-sm"
                readOnly={false}
                rows={15}
                cols={100}
                value={aiJobDescription}/>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
