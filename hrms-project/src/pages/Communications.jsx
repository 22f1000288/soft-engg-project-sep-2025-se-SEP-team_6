import { useState, useEffect } from "react";
import Navbar from "../components/HRNavbar";
import { Send } from "lucide-react";
import useAuth from "../contexts/useAuth";

export default function Communications(props) {
  const userName = props?.userName ?? "Jane Recruiter";
  const { authFetch } = useAuth();

  // Form state
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [messageType, setMessageType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [candidateList, setCandidateList] = useState([]);

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

  const handleSend = async () => {
    if (!selectedCandidate || !messageType || message.trim().length === 0) {
      alert("Please choose a candidate, message type and write a message.");
      return;
    }

    // Find the selected candidate's email
    const selectedCandidateData = candidateList.find(
      (c) => c.name === selectedCandidate
    );
    const candidateEmail = selectedCandidateData ? selectedCandidateData.email : "";

    const emailData = {
      candidate_email: candidateEmail,
      subject,
      body: message,
      message_type: messageType,
      auto_translate: autoTranslate,
      scheduled,
    };

    try {
      const res = await fetch("http://localhost:8000/notify-candidate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
      if (!res.ok) {
        throw new Error("Failed to send email");
      }
      await res.json();
      alert(`Message sent to ${selectedCandidate}: ${subject || "[no subject]"}`);
      setSelectedCandidate("");
      setMessageType("");
      setSubject("");
      setMessage("");
      setAutoTranslate(false);
      setScheduled(false);
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Error sending email. Please try again.");
    }
  };

  const handlePreview = () => {
    alert("Preview\n\n" + message);
  };

  useEffect(() => {
    authFetch("/candidate-list")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch candidates");
        }
        return res.json();
      })
      .then((data) => {
        setCandidateList(data.candidates ?? []);
      })
      .catch((err) => {
        console.error("Error fetching candidate list:", err);
      });
  }, [authFetch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-6 sm:pt-12 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-auto bg-gray-50">
        {/* Page header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            Candidate Communications
          </h1>
          <p className="text-gray-600 mt-1 mb-2">
            Automate follow-ups, translate messages, and provide personalized
            feedback to candidates
          </p>
        </div>
        {/* Middle section: Send Message + AI Suggestions */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6  mb-6 ">
            {/* Send Message card */}
            <div className="lg:col-span-18 bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Send Message
                </h3>
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
                      {candidateList.map((c) => (
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
          </div>
        </section>

        {/* BottomRecent Communications Card */}
        <section>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Communications
              </h3>
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
