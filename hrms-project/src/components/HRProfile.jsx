import React, { useState, useEffect } from "react";
import HRNavbar from "../components/HRNavbar";
import useAuth from "../contexts/useAuth";

export default function HRProfilePage() {
  const { user } = useAuth();

  // no dummy values
  const derived = {
    name: user?.name || "",
    email: user?.email || "",
    company: user?.company || "",
    location: user?.location || "",
  };

  const [profile, setProfile] = useState(derived);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(derived);

  useEffect(() => {
    const next = {
      name: user?.name || "",
      email: user?.email || "",
      company: user?.company || "",
      location: user?.location || "",
    };
    setProfile(next);
    setEditForm(next);
  }, [user]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const initials =
    profile.name
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gray-50">
      <HRNavbar />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* CARD WRAPPER */}
        <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">

          {/* AVATAR + NAME */}
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <div className="w-28 h-28 rounded-full bg-indigo-600 text-white flex items-center justify-center text-4xl font-semibold">
              {initials}
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900">
                {profile.name || "Unnamed User"}
              </h2>
              <p className="text-gray-500 mt-1">{profile.company || "---"}</p>
            </div>

            {/* EDIT BUTTON */}
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              Edit Profile
            </button>
          </div>

          {/* INFO SECTION */}
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Email
              </h3>
              <p className="text-gray-800 text-lg">{profile.email || "---"}</p>
            </section>

            <section>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Location
              </h3>
              <p className="text-gray-800 text-lg">{profile.location || "---"}</p>
            </section>
          </div>
        </div>

        {/* EDIT MODE OVERLAY */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Edit Profile
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="mt-1 w-full bg-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Company</label>
                  <input
                    name="company"
                    value={editForm.company}
                    onChange={handleEditChange}
                    className="mt-1 w-full bg-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="mt-1 w-full bg-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <input
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    className="mt-1 w-full bg-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
