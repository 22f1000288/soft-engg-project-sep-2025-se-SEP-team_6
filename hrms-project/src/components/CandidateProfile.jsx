import React, { useState } from 'react';
import { User, Mail, Lock, Edit2, Calendar, MapPin, Linkedin } from 'lucide-react';
import CandidateNavbar from './CandidateNavbar';

// Mock profile data (replace with props or API response)
const initialProfile = {
  name: 'Candidate',
  email: 'john.candidate@email.com',
  password: '********',
  birthDate: 'Jan 20, 2025',
  location: 'New Delhi, India',
  bio: "Motivated frontend developer with a passion for creating user-centric web applications. Experienced with React, JavaScript, and UI/UX principles.",
  url: "Linkedin.com/johncandidate",
};

export default function CandidateProfilePage(props) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  // For Edit logic
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CandidateNavbar />

      {/* Main Profile Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mt-8 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
          {/* Personal Info */}
          {!isEditing ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-50 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-600">{profile.name}</h2>
                  <p className="text-blue-600">{profile.bio}</p>
                </div>
                <button
                  className="ml-auto bg-indigo-100  hover:bg-green-600 hover:text-white hover:cursor-pointer text-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">{profile.password}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">{profile.birthDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-blue-600">{profile.url}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {editForm.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <input
                    type="text"
                    name="name"
                    className="text-2xl font-bold text-gray-900 bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.name}
                    onChange={handleEditChange}
                  />
                  <textarea
                    name="bio"
                    className="text-gray-900 bg-gray-100 rounded px-2 py-1 w-full mt-1"
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
                    className="text-md text-gray-700 bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />
                  <input
                    type="text"
                    name="password"
                    className="text-md text-gray-700 bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.password}
                    onChange={handleEditChange}
                  />
                  <input
                    type="text"
                    name="joinedDate"
                    className="text-md text-gray-700 bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.birthDate}
                    onChange={handleEditChange}
                  />
                  <input
                    type="text"
                    name="location"
                    className="text-md text-gray-700 bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.location}
                    onChange={handleEditChange}
                  />
                  <input
                    type="text"
                    name="location"
                    className="text-md text-gray-700 bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.url}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium"
                  onClick={handleEditSave}
                >
                  Save
                </button>
                <button
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
