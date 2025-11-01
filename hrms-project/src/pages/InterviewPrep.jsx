import React, { useState } from "react";
import CandidateNavbar from "../components/CandidateNavbar";

export default function InterviewPrep() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");
  const [yoe, setYoe] = useState("");
  const [skillsText, setSkillsText] = useState("");

  const startInterview = (e) => {
    e?.preventDefault();
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Backend not implemented
    const payload = {
      company: company || "(not provided)",
      role: role || "(not provided)",
      interviewType,
      yearsOfExperience: yoe || "(not provided)",
      skills,
    };

    alert(`Starting interview (dummy)\n\n${JSON.stringify(payload, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      <main className="pt-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <section className="bg-white rounded-2xl p-6 shadow-lg">
          <h1 className="text-xl font-semibold text-blue-700 mb-2">
            Interview Practice
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Please enter the details of the interview you want to practice for:
          </p>

          <form onSubmit={startInterview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                1. Company Name
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                2. Role
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  3. Interview type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option>Technical</option>
                  <option>Behavioral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  4. Years of Experience (YoE)
                </label>
                <input
                  value={yoe}
                  onChange={(e) => setYoe(e.target.value)}
                  placeholder="e.g. 3"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                5. Skills to test
              </label>
              <input
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Comma separated, e.g. React, Algorithms, System Design"
                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter skills separated by commas; these will be used to tailor
                the practice.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                onClick={startInterview}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Start interview
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
