import { useState } from "react";
import Navbar from "../components/HRNavbar";
import { Send } from "lucide-react";

export default function Communications(props) {
  const userName = props?.userName ?? "Jane Recruiter";

  // Form state
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [messageType, setMessageType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  // Sample data
  const candidates = [
    { id: "c1", name: "Sarah Chen", status: "Interview Feedback Sent" },
    { id: "c2", name: "Michael Rodriguez", status: "Interview Scheduled" },
    { id: "c3", name: "Emily Johnson", status: "Application Follow-up" },
  ];

  const messageTypes = [
    "Select type",
    "Application Received",
    "Interview Invite",
    "Feedback",
    "Other",
  ];

  const recent = [
    {
      id: 1,
      name: "Sarah Chen",
      snippet:
        "Thank you for interviewing with us. We were impressed with your technical skills and problem-solving approach...",
      time: "2 hours ago",
      tags: ["Delivered", "Translated"],
      color: "text-green-600",
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      snippet:
        "We'd like to invite you for a technical interview. Please confirm your availability for the proposed time slots...",
      time: "Tomorrow 9:00 AM",
      tags: ["Scheduled"],
      color: "text-yellow-600",
    },
    {
      id: 3,
      name: "Emily Johnson",
      snippet:
        "Thank you for your application. We're currently reviewing your profile and will update you on next steps...",
      time: "1 day ago",
      tags: ["Delivered", "Auto-sent"],
      color: "text-green-600",
    },
  ];

  const handleSend = () => {
    if (!selectedCandidate || !messageType || message.trim().length === 0) {
      alert("Please choose a candidate, message type and write a message.");
      return;
    }
    // Dummy send action
    alert(`Message sent to ${selectedCandidate}: ${subject || "[no subject]"}`);
    // reset
    setSelectedCandidate("");
    setMessageType("");
    setSubject("");
    setMessage("");
    setAutoTranslate(false);
    setScheduled(false);
  };

  const handlePreview = () => {
    alert("Preview\n\n" + message);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-6 sm:pt-12 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-auto bg-gray-50">
        {/* Page header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            Candidate Communications
          </h1>
          <p className="text-gray-600 mt-1">
            Automate follow-ups, translate messages, and provide personalized
            feedback to candidates
          </p>
        </div>

        {/* Top: Cards Section */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
            {/* Automated Follow-ups */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Automated Follow-ups
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start justify-between bg-gray-50 p-3 rounded-md">
                  <div>
                    <div className="font-medium">Application Received</div>
                    <div className="text-xs text-gray-500">
                      Auto-sent within 2 hours
                    </div>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-green-500 mt-2" />
                </div>

                <div className="flex items-start justify-between bg-gray-50 p-3 rounded-md">
                  <div>
                    <div className="font-medium">Under Review</div>
                    <div className="text-xs text-gray-500">
                      Send after 3 days
                    </div>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400 mt-2" />
                </div>

                <div className="flex items-start justify-between bg-gray-50 p-3 rounded-md">
                  <div>
                    <div className="font-medium">Interview Scheduled</div>
                    <div className="text-xs text-gray-500">
                      Immediate notification
                    </div>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-blue-400 mt-2" />
                </div>

                <div className="flex items-start justify-between bg-gray-50 p-3 rounded-md">
                  <div>
                    <div className="font-medium">Post-Interview Feedback</div>
                    <div className="text-xs text-gray-500">
                      Send within 24 hours
                    </div>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-indigo-400 mt-2" />
                </div>

                <div className="pt-3">
                  <button className="w-full bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md">
                    + Create New Template
                  </button>
                </div>
              </div>
            </div>

            {/* AI Translation */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                AI Translation
              </h3>
              <div className="text-sm text-gray-600">
                <div className="bg-indigo-50 p-3 rounded-md text-indigo-700 mb-3">
                  25% Response Rate Boost — Auto-translate messages to
                  candidate's preferred language
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />{" "}
                    English
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />{" "}
                    Spanish
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />{" "}
                    French
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />{" "}
                    German
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />{" "}
                    Hindi
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />{" "}
                    Mandarin
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-violet-600 text-white px-4 py-2 rounded-md">
                    Test Translation
                  </button>
                </div>
              </div>
            </div>

            {/* Communication Metrics */}
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Communication Metrics
              </h3>
              <div className="text-sm text-gray-600 space-y-3">
                <div className="flex justify-between">
                  <span>Messages Sent Today</span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Rate</span>
                  <span className="font-semibold text-green-600">78%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response Time</span>
                  <span className="font-semibold">4.2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Translations Used</span>
                  <span className="font-semibold text-blue-600">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Feedback Sent</span>
                  <span className="font-semibold text-purple-600">12</span>
                </div>

                <div className="mt-3 p-3 bg-green-50 rounded-md text-sm text-green-700">
                  + 25% improvement — Response rate increased this month
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Middle section: Send Message + AI Suggestions */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6  mb-6 ">
            {/* Send Message card */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Send Message
                </h3>
                <div className="flex gap-3">
                  <button className="px-3 py-1 text-sm border rounded-md">
                    Load Template
                  </button>
                  <button className="px-3 py-1 text-sm border rounded-md">
                    Save Draft
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="text-sm text-gray-700">
                      Select Candidate
                    </label>
                    <select
                      value={selectedCandidate}
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                    >
                      <option value="">Choose candidate</option>
                      {candidates.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-700">
                        Message Type
                      </label>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value)}
                      >
                        {messageTypes.map((t, i) => (
                          <option key={i} value={t === "Select type" ? "" : t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">
                        Message Options
                      </label>
                      <div className="mt-1 flex gap-4">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={autoTranslate}
                            onChange={() => setAutoTranslate((s) => !s)}
                            className="rounded"
                          />
                          Auto-translate
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={scheduled}
                            onChange={() => setScheduled((s) => !s)}
                            className="rounded"
                          />
                          Schedule
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Subject</label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                      placeholder="Enter message subject"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">
                      Message Content
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={7}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                      placeholder="Type your message here..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSend}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md inline-flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Send Message
                    </button>
                    <button
                      onClick={handlePreview}
                      className="px-4 py-2 border rounded-md"
                    >
                      Preview
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-5"></div>
              </div>
            </div>

            {/* AI Suggestions card */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                AI Suggestions
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="rounded-full bg-gray-100 w-16 h-16 mx-auto mb-3"></div>
                  <p>Select a candidate and message type for AI suggestions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BottomRecent Communications Card */}
        <section>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Communications
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border rounded-md">
                  All
                </button>
                <button className="px-3 py-1 text-sm border rounded-md">
                  Sent
                </button>
                <button className="px-3 py-1 text-sm border rounded-md">
                  Scheduled
                </button>
                <button className="px-3 py-1 text-sm border rounded-md">
                  Translated
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {r.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-gray-900">
                            {r.name}
                          </div>
                          <div className="text-xs text-gray-500">{r.time}</div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {r.snippet}
                        </div>

                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 bg-blue-100 rounded-sm"></span>{" "}
                            Email
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 bg-indigo-100 rounded-sm"></span>{" "}
                            Auto-translated to Spanish
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 bg-green-100 rounded-sm"></span>{" "}
                            Opened
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-semibold ${r.color}`}>
                        {r.tags.join(", ")}
                      </div>
                      <div className="text-xs text-blue-600 mt-3">
                        View Full
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
