import React, { useState } from 'react';
import { FileText, Calendar, CheckCircle, ChevronDown, HelpCircle } from 'lucide-react';

export default function CandidateApplications(props) {
  const [activeTab, setActiveTab] = useState('Applications');
  
  const handleLogout = () => {
    props.setLoggedInUser(null);
    props.setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const stats = [
    { label: 'Applications', value: '12', icon: FileText, color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Interviews', value: '3', icon: Calendar, color: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Offers', value: '1', icon: CheckCircle, color: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];

  const applications = [
    {
      title: 'Frontend Developer',
      company: 'TechCorp Inc.',
      appliedDate: 'Applied 2 days ago',
      status: 'Under Review',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      title: 'React Developer',
      company: 'StartupXYZ',
      appliedDate: 'Applied 5 days ago',
      status: 'Interview Scheduled',
      statusColor: 'bg-green-100 text-green-700'
    }
  ];

  const preparationTools = [
    {
      title: 'Mock Interview',
      description: 'Practice with AI-generated questions',
      icon: HelpCircle,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Resume Analysis',
      description: 'Get AI feedback on your resume',
      icon: FileText,
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  const navItems = ['Dashboard', 'Jobs', 'Applications', 'Interview Prep', 'Profile'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg"></div>
              <span className="text-xl font-semibold text-gray-900">TalentFlow</span>
            </div>
            <nav className="flex gap-6">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`text-sm font-medium transition ${
                    activeTab === item
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              
            </button>
              <div>Saurabh Shukla</div>
            <div className="flex items-center gap-2">
              
              <span onClick={handleLogout} className="text-sm text-gray-700 cursor-pointer">Logout</span>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track your job applications and prepare for interviews</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Applications</h2>
            
            <div className="space-y-4">
              {applications.map((app, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{app.title}</h3>
                      <p className="text-gray-600 text-sm">{app.company} • {app.appliedDate}</p>
                    </div>
                    <span className={`${app.statusColor} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Preparation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interview Preparation</h2>
            
            <div className="space-y-4">
              {preparationTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`${tool.color} p-3 rounded-xl flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{tool.title}</h3>
                        <p className="text-gray-600 text-sm">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}