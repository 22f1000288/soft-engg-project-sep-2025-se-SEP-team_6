import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Linkedin, Github, Link as LinkIcon,
  Briefcase, GraduationCap, Award, Code, Edit2, Save, X, Loader2
} from 'lucide-react';

export default function ResumeDisplay({ resumeData, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(resumeData);
  const [saving, setSaving] = useState(false);

  if (!resumeData) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-md text-center">
        <p className="text-gray-500">No resume data available. Please upload a resume.</p>
      </div>
    );
  }

  const handleEdit = () => {
    setEditedData(JSON.parse(JSON.stringify(resumeData))); // Deep copy
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData(resumeData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/resume', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update resume');
      }

      const data = await response.json();
      setIsEditing(false);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(editedData);
      }
    } catch (error) {
      console.error('Error updating resume:', error);
      alert('Failed to update resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalInfo = (field, value) => {
    setEditedData({
      ...editedData,
      personal_info: {
        ...editedData.personal_info,
        [field]: value
      }
    });
  };

  const updateSectionItem = (sectionIndex, itemIndex, field, value) => {
    const newSections = [...editedData.sections];
    if (Array.isArray(newSections[sectionIndex].items)) {
      newSections[sectionIndex].items[itemIndex][field] = value;
      setEditedData({
        ...editedData,
        sections: newSections
      });
    }
  };

  const data = isEditing ? editedData : resumeData;
  const personalInfo = data.personal_info || {};
  const sections = data.sections || [];

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600">Resume</h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={personalInfo.name || ''}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                className="text-3xl font-bold text-gray-900 bg-white rounded px-3 py-2 w-full mb-2"
                placeholder="Full Name"
              />
            ) : (
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{personalInfo.name}</h3>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              {isEditing ? (
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  className="text-sm text-gray-700 bg-white rounded px-2 py-1 flex-1"
                />
              ) : (
                <span className="text-sm text-gray-700">{personalInfo.email}</span>
              )}
            </div>
          )}
          
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              {isEditing ? (
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  className="text-sm text-gray-700 bg-white rounded px-2 py-1 flex-1"
                />
              ) : (
                <span className="text-sm text-gray-700">{personalInfo.phone}</span>
              )}
            </div>
          )}

          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  className="text-sm text-gray-700 bg-white rounded px-2 py-1 flex-1"
                />
              ) : (
                <span className="text-sm text-gray-700">{personalInfo.location}</span>
              )}
            </div>
          )}

          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-indigo-600" />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  className="text-sm text-gray-700 bg-white rounded px-2 py-1 flex-1"
                />
              ) : (
                <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  LinkedIn
                </a>
              )}
            </div>
          )}

          {personalInfo.github && (
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-indigo-600" />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.github}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  className="text-sm text-gray-700 bg-white rounded px-2 py-1 flex-1"
                />
              ) : (
                <a href={`https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border-b border-gray-200 pb-6 last:border-b-0">
            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {getSectionIcon(section.content_type)}
              {section.section_name}
            </h4>

            {/* Render section based on content type */}
            {section.content_type === 'skills' && (
              <div className="flex flex-wrap gap-2">
                {Array.isArray(section.items) ? section.items.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    {typeof skill === 'string' ? skill : skill.name || JSON.stringify(skill)}
                  </span>
                )) : <p className="text-gray-600">{JSON.stringify(section.items)}</p>}
              </div>
            )}

            {section.content_type === 'experience' && Array.isArray(section.items) && (
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-indigo-200">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={item.title || item.position || ''}
                          onChange={(e) => updateSectionItem(sectionIndex, idx, 'title', e.target.value)}
                          className="font-semibold text-gray-900 bg-gray-50 rounded px-2 py-1 w-full"
                          placeholder="Job Title"
                        />
                        <input
                          type="text"
                          value={item.company || ''}
                          onChange={(e) => updateSectionItem(sectionIndex, idx, 'company', e.target.value)}
                          className="text-gray-700 bg-gray-50 rounded px-2 py-1 w-full"
                          placeholder="Company"
                        />
                        <textarea
                          value={Array.isArray(item.description) ? item.description.join('\n') : item.description || ''}
                          onChange={(e) => updateSectionItem(sectionIndex, idx, 'description', e.target.value.split('\n'))}
                          className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1 w-full"
                          rows={3}
                          placeholder="Description"
                        />
                      </div>
                    ) : (
                      <>
                        <h5 className="font-semibold text-gray-900">{item.title || item.position}</h5>
                        <p className="text-gray-700">{item.company}</p>
                        <p className="text-sm text-gray-500">{item.dates || item.duration}</p>
                        {item.description && (
                          <div className="mt-2 text-sm text-gray-600">
                            {Array.isArray(item.description) ? (
                              <ul className="list-disc list-inside space-y-1">
                                {item.description.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>{item.description}</p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.content_type === 'education' && Array.isArray(section.items) && (
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-indigo-200">
                    <h5 className="font-semibold text-gray-900">{item.degree || item.title}</h5>
                    <p className="text-gray-700">{item.institution || item.school}</p>
                    <p className="text-sm text-gray-500">{item.dates || item.year}</p>
                  </div>
                ))}
              </div>
            )}

            {section.content_type === 'projects' && Array.isArray(section.items) && (
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-indigo-200">
                    <h5 className="font-semibold text-gray-900">{item.name || item.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    {item.technologies && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(Array.isArray(item.technologies) ? item.technologies : [item.technologies]).map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!['skills', 'experience', 'education', 'projects'].includes(section.content_type) && (
              <div className="text-gray-700 whitespace-pre-wrap">
                {typeof section.items === 'string' ? section.items : JSON.stringify(section.items, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getSectionIcon(contentType) {
  switch (contentType) {
    case 'experience':
      return <Briefcase className="w-5 h-5 text-indigo-600" />;
    case 'education':
      return <GraduationCap className="w-5 h-5 text-indigo-600" />;
    case 'skills':
      return <Code className="w-5 h-5 text-indigo-600" />;
    case 'projects':
      return <Award className="w-5 h-5 text-indigo-600" />;
    default:
      return <User className="w-5 h-5 text-indigo-600" />;
  }
}
