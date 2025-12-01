import React, { useEffect, useState } from "react";
import Navbar from "../components/HRNavbar";
import config from "../../public/config.json";

export default function Schedule(props) {
  const userName = props?.userName ?? "HR Manager";
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Read token from localStorage
  let token = localStorage.getItem("tf_tokens") ?? "";
  try {
    if (token.startsWith("{")) {
      token = JSON.parse(token).access_token ?? "";
    }
  } catch (e) {
    token = "";
  }

  useEffect(() => {
    document.title = "Candidate Calendar - HRMS";
    setLoading(true);
    setError("");
    fetch(`${config.backend}:${config.port}/candidate-list`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch candidate list");
        }
        return response.json();
      })
      .then((data) => {
        setCandidates(data.candidates || []);
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching candidate list.");
        setLoading(false);
      });
  }, []);

  const openScheduleModal = (candidateId) => {
    setSelectedCandidate(candidateId);
    setScheduledTime("");
    setShowModal(true);
    setSuccessMsg("");
  };

  const handleSchedule = () => {
    if (!scheduledTime) {
      setError("Please select date and time.");
      return;
    }
    setError("");
    fetch(`${config.backend}:${config.port}/schedule-interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Remove Authorization
      body: JSON.stringify({ candidate_id: selectedCandidate, scheduled_time: scheduledTime }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSuccessMsg(data.message || "Interview scheduled!");
        setShowModal(false);
        setScheduledTime("");
        setSelectedCandidate(null);
        // Optionally, refresh calendar or candidate list here
      })
      .catch((error) => {
        setError("Error scheduling interview: " + error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4 mt-5 text-blue-600">Candidate Calendar</h1>
        <p className="mb-4">Select a candidate below to send an automated interview invite.</p>
        {successMsg && <p className="text-green-600">{successMsg}</p>}
      </div>
      
      <div className="p-6">
        {loading ? (
          <p>Loading candidates...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : candidates.length === 0 ? (
          <p>No candidates found.</p>
        ) : (
          candidates.map((c) => (
            <div key={c.id} className="mb-4 flex items-center">
              <span className="mr-4">{c.name} ({c.email})</span>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={() => openScheduleModal(c.id)}
              >
                Schedule Interview
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal for scheduling interview */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Select Interview Date & Time</h2>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={handleSchedule}
              >
                Schedule
              </button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      )}

      {/* Google Calendar Tab */}
      <div className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-2 text-green-700">Interview Calendar</h2>
        <div className="flex justify-center">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=your_calendar_id%40group.calendar.google.com&ctz=UTC"
            style={{ border: 0 }}
            width="800"
            height="600"
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
