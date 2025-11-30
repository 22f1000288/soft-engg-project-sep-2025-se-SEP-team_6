import React, { useEffect, useState } from "react";
import Navbar from "../components/HRNavbar";
import config from "../../public/config.json";

export default function Schedule(props) {
  const userName = props?.userName ?? "HR Manager";
  const [candidates, setCandidates] = useState([]);
  const token = props?.token ?? "";

  useEffect(() => {
    document.title = "Candidate Calendar - HRMS";
    fetch(`${config.backend}:${config.port}/candidate-list`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        setCandidates(data.candidates || []);
      })
      .catch((error) => {
        console.error("Error fetching candidate list:", error);
      });
  }, [token]);

  const scheduleInterview = (candidateId) => {
    fetch(`${config.backend}:${config.port}/schedule-interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ candidate_id: candidateId })
    })
      .then((res) => res.json())
      .then((data) => alert(data.message))
      .catch((error) => alert("Error scheduling interview: " + error));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4 mt-5 text-blue-600">Candidate Calendar</h1>
        <p className="mb-4">Select a candidate below to send an automated interview invite.</p>
      </div>
      
      <div className="p-6">
        {candidates.length === 0 ? (
          <p>No candidates found.</p>
        ) : (
          candidates.map((c) => (
            <div key={c.id} className="mb-4 flex items-center">
              <span className="mr-4">{c.name} ({c.email})</span>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={() => scheduleInterview(c.id)}
              >
                Schedule Interview
              </button>
            </div>
          ))
        )}
      </div>

      {/* Google Calendar Tab */}
      <div className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-2 text-green-700">Interview Calendar</h2>
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
  );
}
