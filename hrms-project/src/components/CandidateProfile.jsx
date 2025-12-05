import React, { useEffect, useState, useCallback } from "react";
import useAuth from "../contexts/useAuth";
import { Mail, Lock, Edit2 } from "lucide-react";
import CandidateNavbar from "./CandidateNavbar";

export default function CandidateProfile() {
  const { user, authFetch } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    resumeUrl: "",
    skills: "",
    experience: "",
    education: "",
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [resumeFile, setResumeFile] = useState(null);

  // fetch candidate profile
  const fetchCandidateProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setProfile((p) => ({ ...p, name: user?.name || p.name, email: user?.email || p.email }));
    setLoading(true);

    try {
      const res = await authFetch("/candidates/me");

      if (res.ok) {
        const data = await res.json();

        const composed = {
          name: user?.name || data.user_name || "",
          email: user?.email || data.user_email || "",
          bio: data.profile_summary || "",
          resumeUrl: data.resume_url || "",
          skills: data.skills || "",
          experience: data.experience || "",
          education: data.education || "",
        };

        setProfile(composed);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }

    setLoading(false);
  }, [user, authFetch]);

  useEffect(() => {
    fetchCandidateProfile();
  }, [fetchCandidateProfile]);

  useEffect(() => {
    const onFocus = () => fetchCandidateProfile();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchCandidateProfile]);

  const startEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setResumeFile(files?.[0] || null);
      return;
    }

    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      const payload = {
        resume_url: editForm.resumeUrl,
        skills: editForm.skills,
        experience: editForm.experience,
        education: editForm.education,
        profile_summary: editForm.bio,
      };

      const res = await authFetch("/candidates/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to save profile");
      }

      await fetchCandidateProfile();
      setIsEditing(false);
      alert("Profile saved!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save profile: " + err.message);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return alert("Please choose a resume first.");

    try {
      const form = new FormData();
      form.append("file", resumeFile, resumeFile.name);

      const res = await authFetch("/resumes/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }

      await fetchCandidateProfile();
      alert("Resume uploaded!");
      setResumeFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    }
  };

  const skillsArr = (profile.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
  const chipColors = [
    "bg-indigo-100 text-indigo-800",
    "bg-emerald-100 text-emerald-800",
    "bg-yellow-100 text-yellow-800",
    "bg-pink-100 text-pink-800",
    "bg-sky-100 text-sky-800",
  ];

  const initials = ((profile.name || user?.name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2) || "");

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg space-y-8">

          {/* ---------- VIEW MODE ---------- */}
          {!isEditing && (
            <>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-semibold">
                  {initials}
                </div>

                <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>

                {profile.bio && (
                  <p className="text-gray-600 max-w-md leading-relaxed">{profile.bio}</p>
                )}

                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition mt-2"
                  onClick={startEdit}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              <hr className="border-gray-200 my-8" />

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</h4>
                  <p className="mt-1 text-gray-800 font-medium break-all">{profile.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience</h4>
                  <p className="mt-1 text-gray-800">{profile.experience || "Not set"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg sm:col-span-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Education</h4>
                  <p className="mt-1 text-gray-800">{profile.education || "Not set"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg sm:col-span-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skillsArr.length ? (
                      skillsArr.map((s, i) => (
                        <span
                          key={s + i}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${chipColors[i % chipColors.length]}`}
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 bg-gray-50 p-6 rounded-xl">
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="text-sm border p-2 rounded bg-white"
                  />
                  <button
                    onClick={uploadResume}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Upload Resume
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ---------- EDIT MODE ---------- */}
          {isEditing && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>

              <div className="space-y-4">
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Bio"
                />

                <textarea
                  name="skills"
                  value={editForm.skills}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Skills (comma separated)"
                />

                <textarea
                  name="experience"
                  value={editForm.experience}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Experience"
                />

                <textarea
                  name="education"
                  value={editForm.education}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded"
                  placeholder="Education"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleEditSave}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="border px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
