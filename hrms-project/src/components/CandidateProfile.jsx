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
    // If user exists, immediately show their name/email while we fetch the rest
    // Use presence of `user` object instead of `user.id` (some auth shapes don't include `id`).
    if (!user) {
      setLoading(false);
      return;
    }

    setProfile((p) => ({ ...p, name: user?.name || p.name, email: user?.email || p.email }));
    setLoading(true);

    let attempt = 0;
    let success = false;
    while (attempt < 3 && !success) {
      attempt += 1;
      try {
        const res = await authFetch("/candidates/me");

        if (res.ok) {
          const data = await res.json();

          const composed = {
            name: user?.name || data.user_name || "Your full name",
            email: user?.email || data.user_email || "Your email",
            bio: data.profile_summary || "",
            resumeUrl: data.resume_url || "",
            skills: data.skills || "",
            experience: data.experience || "",
            education: data.education || "",
          };

          setProfile(composed);
          success = true;
          break;
        } else {
          // transient auth/state issue; wait and retry
          console.warn(`Candidate profile fetch attempt ${attempt} failed:`, res.status);
          if (attempt < 3) await new Promise((r) => setTimeout(r, 400));
        }
      } catch (err) {
        console.warn(`Candidate profile fetch attempt ${attempt} error:`, err.message || err);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!success) {
      // ensure name/email are present even if backend failed
      setProfile((p) => ({
        ...p,
        name: user?.name || p.name,
        email: user?.email || p.email,
      }));
    }

    setLoading(false);
  }, [user, authFetch]);

  useEffect(() => {
    fetchCandidateProfile();
  }, [fetchCandidateProfile]);

  // If user logs in or tokens become available after navigation, re-fetch when window gains focus
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
    if (!resumeFile) {
      alert("Please choose a resume first.");
      return;
    }

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

  // Don't block rendering while loading — show available profile fields immediately
  // and render an inline loading indicator next to the name when the fetch is in progress.

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

      <main className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mt-8 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>

        <div className="bg-white rounded-2xl p-10 shadow-xl space-y-6">
          {!isEditing ? (
            <>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-28 h-28 bg-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                  {initials}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-blue-600">
                    {profile.name}
                    {loading && <span className="text-sm text-gray-500 ml-3">Loading…</span>}
                  </h2>
                  <p className="text-gray-700 italic mt-1">{profile.bio}</p>
                </div>

                <button
                  className="ml-auto bg-indigo-100 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  onClick={startEdit}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium text-blue-600">{profile.email}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Resume</div>
                    <div className="mt-1">
                      {profile.resumeUrl ? (
                        <a
                          href={profile.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-indigo-600 underline"
                        >
                          View resume
                        </a>
                      ) : (
                        <span className="text-sm text-gray-600">No resume uploaded</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="text-sm"
                      />

                      <button
                        onClick={uploadResume}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Upload Resume
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500">Skills</div>
                    <div className="mt-2">
                      {skillsArr.length ? (
                        <div className="flex flex-wrap">
                          {skillsArr.map((s, i) => (
                            <span
                              key={s + i}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2 ${chipColors[i % chipColors.length]}`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="font-medium text-gray-800"><span className="text-gray-500">Not set</span></div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Experience</div>
                    <div className="font-medium text-gray-800">{profile.experience || <span className="text-gray-500">Not set</span>}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Education</div>
                    <div className="font-medium text-gray-800">{profile.education || <span className="text-gray-500">Not set</span>}</div>
                  </div>

                  {/* Profile summary is shown at the top header to avoid duplication */}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-28 h-28 bg-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                  {initials}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-blue-600">{profile.name} {loading && <span className="text-sm text-gray-500 ml-3">Loading…</span>}</h2>
                  <textarea
                    name="bio"
                    className="bg-gray-100 rounded px-2 py-1 w-full mt-2"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    rows={3}
                    placeholder="Short professional summary (what you do, years of experience, key strengths)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-800 mb-2">{profile.email}</div>

                  <input
                    type="text"
                    name="resumeUrl"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.resumeUrl}
                    onChange={handleEditChange}
                    placeholder="Resume URL (optional)"
                  />
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    name="skills"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.skills}
                    onChange={handleEditChange}
                    placeholder="e.g. React, Python, SQL"
                  />

                  <input
                    type="text"
                    name="experience"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.experience}
                    onChange={handleEditChange}
                    placeholder="Brief experience summary (years, roles)"
                  />

                  <input
                    type="text"
                    name="education"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.education}
                    onChange={handleEditChange}
                    placeholder="Highest qualification and institute"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
