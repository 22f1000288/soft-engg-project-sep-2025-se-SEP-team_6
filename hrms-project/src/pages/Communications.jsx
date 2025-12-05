import { useState, useEffect } from "react";
import Navbar from "../components/HRNavbar";
import { Send } from "lucide-react";
import useAuth from "../contexts/useAuth";

export default function Communications(props) {
  const userName = props?.userName ?? "Jane Recruiter";
  const { authFetch } = useAuth();

  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [messageType, setMessageType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [candidateList, setCandidateList] = useState([]);
  const [recent, setRecent] = useState([]);

  const messageTypes = [
    "Select type",
    "Application Received",
    "Interview Invite",
    "Feedback",
    "Other",
  ];

  useEffect(() => {
    authFetch("/candidate-list")
      .then((res) => res.json())
      .then((data) => setCandidateList(data.candidates ?? []))
      .catch((err) => console.error("Error fetching candidate list:", err));

    authFetch("/recent-communications")
      .then((res) => res.json())
      .then((data) => setRecent(data.recent ?? []))
      .catch((err) =>
        console.error("Error fetching recent communications:", err)
      );
  }, [authFetch]);

  const handleSend = async () => {
    if (!selectedCandidate || !messageType || message.trim().length === 0) {
      alert("Please choose a candidate, message type and write a message.");
      return;
    }

    const candidate = candidateList.find((c) => c.name === selectedCandidate);
    const email = candidate?.email;

    if (!email) return alert("Candidate has no email.");

    const emailData = {
      candidate_email: email,
      subject,
      body: message,
      message_type: messageType,
    };

    try {
      const res = await authFetch("/notify-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      if (!res.ok) throw new Error();

      alert(`Message sent to ${selectedCandidate}`);
      setSelectedCandidate("");
      setMessageType("");
      setSubject("");
      setMessage("");
    } catch (err) {
      alert("Failed to send message.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-10 px-6 sm:px-10 max-w-7xl mx-auto">
        
        {/* PAGE INTRO */}
        <header className="mb-10">
          <p className="text-gray-600 mt-2">
            Send personalized messages, automate follow-ups, and manage communication workflows.
          </p>
        </header>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN — MESSAGE COMPOSER */}
          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Message</h2>

            <div className="space-y-6">

              {/* Candidate */}
              <div>
                <label className="text-sm font-medium text-gray-700">Select Candidate</label>
                <select
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900"
                >
                  <option value="">Choose candidate</option>
                  {candidateList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Type */}
              <div>
                <label className="text-sm font-medium text-gray-700">Message Type</label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                >
                  {messageTypes.map((t, i) => (
                    <option key={i} value={t === "Select type" ? "" : t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder="Write your message..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                />
              </div>

              {/* Send Button */}
              <div>
                <button
                  onClick={handleSend}
                  className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN — RECENT COMMUNICATIONS */}
          <aside className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm h-fit sticky top-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Recent Communications
            </h2>

            <div className="space-y-5">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                      {r.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{r.name}</p>
                        <span className="text-xs text-gray-500">{r.time}</span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {r.snippet}
                      </p>


                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
