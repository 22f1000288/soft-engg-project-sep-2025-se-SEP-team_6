import React from "react";
import Navbar from "../components/HRNavbar";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

//slots data
const SAMPLE_SLOTS = [
  {
    time: "9:00 AM",
    candidate: "John Smith",
    position: "Frontend Developer",
    type: "Technical",
    status: "Confirmed",
  },
  {
    time: "10:00 AM",
    candidate: "Available",
    position: "-",
    type: "-",
    status: "",
  },
  {
    time: "11:00 AM",
    candidate: "Sarah Johnson",
    position: "Product Manager",
    type: "Behavioral",
    status: "Pending",
  },
  {
    time: "12:00 PM",
    candidate: "Lunch Break",
    position: "-",
    type: "-",
    status: "Blocked",
  },
  {
    time: "1:00 PM",
    candidate: "Available",
    position: "-",
    type: "-",
    status: "",
  },
  {
    time: "2:00 PM",
    candidate: "Mike Chen",
    position: "Backend Developer",
    type: "Final",
    status: "Confirmed",
  },
  {
    time: "3:00 PM",
    candidate: "Available",
    position: "-",
    type: "-",
    status: "",
  },
  {
    time: "4:00 PM",
    candidate: "Lisa Wang",
    position: "UX Designer",
    type: "Portfolio",
    status: "Confirmed",
  },
];

export default function Schedule(props) {
  const userName = props?.userName ?? "HR Manager";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-6 sm:pt-12 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-auto bg-gray-50">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-blue-700">
            Interview Schedule
          </h1>
          <p className="text-sm text-gray-600">
            Manage your daily commitments and interview timeline effectively
          </p>
        </div>

        <section className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-md hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-sm font-medium">
                Today -{" "}
                {new Date().toLocaleString("default", { month: "long" })}{" "}
                {new Date().getDate()}, {new Date().getFullYear()}
              </div>
              <button className="p-2 rounded-md hover:bg-gray-100">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Backend coming soon")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
              >
                <Plus className="w-4 h-4" />
                Schedule Interview
              </button>
              <button className="px-3 py-2 rounded-md border text-sm">
                Week View
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left mt-6">
                <thead>
                  <tr className="text-sm text-gray-500">
                    <th className="py-4">Time</th>
                    <th className="py-4">Candidate</th>
                    <th className="py-4">Position</th>
                    <th className="py-4">Type</th>
                    <th className="py-4">Status</th>
                    <th className="py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {SAMPLE_SLOTS.map((s, i) => (
                    <tr
                      key={i}
                      className={`${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-b border-gray-100`}
                    >
                      <td className="py-5 align-top w-28 font-medium text-gray-900">
                        {s.time}
                      </td>
                      <td className="py-5 align-top text-gray-700">
                        {s.candidate}
                      </td>
                      <td className="py-5 align-top text-gray-700">
                        {s.position}
                      </td>
                      <td className="py-5 align-top">
                        {s.type && (
                          <span className="inline-block text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                            {s.type}
                          </span>
                        )}
                      </td>
                      <td className="py-5 align-top">
                        {s.status ? (
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded-full ${
                              s.status === "Confirmed"
                                ? "bg-green-100 text-green-700"
                                : s.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {s.status}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-5 align-top text-sm">
                        {s.candidate === "Available" ? (
                          <button className="text-blue-600">+ Schedule</button>
                        ) : s.candidate === "Lunch Break" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <div className="flex items-center gap-4">
                            <button className="text-blue-600">Edit</button>
                            <button className="text-red-600">Cancel</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Today's Interviews</div>
              <div className="text-2xl font-bold text-gray-900">4</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Available Slots</div>
              <div className="text-2xl font-bold text-gray-900">3</div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <div className="w-5 h-5 bg-green-400 rounded-full" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Utilization</div>
              <div className="text-2xl font-bold text-gray-900">57%</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <div className="w-5 h-5 bg-purple-400 rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
