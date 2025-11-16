import React, { useEffect } from "react";
import Navbar from "../components/HRNavbar";
import config from "../../public/config.json";

export default function Schedule(props) {
  const userName = props?.userName ?? "HR Manager";
  useEffect(() => {
    document.title = "Candidate Calendar - HRMS";
    fetch(`${config.backend}:${config.port}/create-calendar-event`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Calendar event created:", data);
      })
      .catch((error) => {
        console.error("Error creating calendar event:", error);
      });
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4 mt-5 text-blue-600">Candidate Calendar</h1>
        <p className="mb-4">This is where the candidate's calendar will be displayed.</p>
      </div>
      
    </div>
  );
}
