import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Edit2, Calendar, MapPin } from 'lucide-react';
import HRNavbar from '../components/HRNavbar';
import useAuth from '../contexts/useAuth';

// Mock profile data (replace with props or API response)
const initialProfile = {
  name: 'John HR',
  email: 'john.hr@email.com',
  password: '********',
  company: 'ABC Company',
  location: 'New Delhi, India',
};

export default function HRProfilePage() {
  const { user } = useAuth();
  const derived = {
    name: user?.name || initialProfile.name,
    email: user?.email || initialProfile.email,
    password: '********',
    company: user?.company || initialProfile.company,
    location: user?.location || initialProfile.location,
  };
  const [profile, setProfile] = useState(derived);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(derived);

  useEffect(() => {
    // keep local profile in sync if auth user changes
    const next = {
      name: user?.name || initialProfile.name,
      email: user?.email || initialProfile.email,
      password: '********',
      company: user?.company || initialProfile.company,
      location: user?.location || initialProfile.location,
    };
    setProfile(next);
    setEditForm(next);
  }, [user]);

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
  <HRNavbar />

      {/* Main Profile Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
          {/* Personal Info */}
          {!isEditing ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.company}</p>
                </div>
                <button
                  className="ml-auto bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2"
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
                    <span className="font-medium text-gray-700">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">{profile.password}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">{profile.location}</span>
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
                    name="company"
                    className="text-gray-900 bg-gray-100 rounded px-2 py-1 w-full mt-1"
                    value={editForm.company}
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
                    name="location"
                    className="text-md text-gray-700 bg-gray-100 rounded px-2 py-1 w-full"
                    value={editForm.location}
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
