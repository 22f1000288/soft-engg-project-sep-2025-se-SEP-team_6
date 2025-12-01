import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Edit2, Calendar, MapPin, Linkedin } from "lucide-react";
import CandidateNavbar from "./CandidateNavbar";

export default function CandidateProfile() {
  const { user, authFetch } = useAuth();

  const [profile, setProfile] = useState({
    name: "Loading name...",
    email: "Loading email...",
    birthDate: "Add birth date",
    location: "Add current location",
    bio: "Add a short bio describing your experience and interests",
    url: "Add your LinkedIn / portfolio URL",
    resumeUrl: "",
    skills: "Add comma separated skills (e.g. React, Python, SQL)",
    experience: "Add a short summary of experience (years, roles)",
    education: "Add highest qualification and institute",
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [resumeFile, setResumeFile] = useState(null);

  // fetch candidate profile
  const fetchCandidateProfile = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const res = await authFetch("/candidates/me");

      if (res.ok) {
        const data = await res.json();

        const composed = {
          name: user?.name || data.user_name || "Your full name",
          email: user?.email || data.user_email || "Your email",
          birthDate: data.birthDate || "Add birth date",
          location: data.location || "Add your city",
          bio: data.profile_summary || "Add a professional summary",
          url: data.linkedin_url || "",
          resumeUrl: data.resume_url || "",
          skills: data.skills || "",
          experience: data.experience || "",
          education: data.education || "",
        };

        setProfile(composed);
      } else {
        setProfile((p) => ({
          ...p,
          name: user?.name || p.name,
          email: user?.email || p.email,
        }));
      }
    } catch (err) {
      console.error("Failed to load candidate profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateProfile();
  }, [user]);

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
        linkedin_url: editForm.url,
        birthDate: editForm.birthDate,
        location: editForm.location,
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

  if (loading) return <div className="p-6 text-gray-600">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateNavbar />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mt-8 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
          {!isEditing ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-blue-600">
                    {profile.name}
                  </h2>
                  <p className="text-blue-600">{profile.bio}</p>
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
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">
                      {profile.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">
                      {profile.birthDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">
                      {profile.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">
                      {profile.url}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setResumeFile(e.target.files?.[0] || null)
                      }
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
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {editForm.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div>
                  <input
                    type="text"
                    name="name"
                    className="text-2xl font-bold bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.name}
                    onChange={handleEditChange}
                  />

                  <textarea
                    name="bio"
                    className="bg-gray-100 rounded px-2 py-1 w-full mt-1"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-3">
                  <input
                    type="email"
                    name="email"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />

                  <input
                    type="text"
                    name="birthDate"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.birthDate}
                    onChange={handleEditChange}
                  />

                  <input
                    type="text"
                    name="location"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.location}
                    onChange={handleEditChange}
                  />

                  <input
                    type="text"
                    name="url"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.url}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    name="skills"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.skills}
                    onChange={handleEditChange}
                  />

                  <input
                    type="text"
                    name="experience"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.experience}
                    onChange={handleEditChange}
                  />

                  <input
                    type="text"
                    name="education"
                    className="text-md bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.education}
                    onChange={handleEditChange}
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
