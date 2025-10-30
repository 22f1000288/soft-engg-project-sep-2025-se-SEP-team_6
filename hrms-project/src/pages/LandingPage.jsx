import React from 'react';
import { FileText, Clipboard, MessageSquare } from 'lucide-react';

export default function TalentFlowLanding() {

    const handleRecruiters = () => {
        window.location.href = '/login-signup';
    };

    const handleCandidates = () => {
        window.location.href = '/login-signup';
    }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg"></div>
            <span className="text-xl font-semibold text-gray-900">TalentFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              
            </button>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 rounded-3xl px-12 py-20 text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-6">
            Intelligent Recruitment Platform
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Streamline your hiring process with AI-powered tools for job creation, resume screening, and candidate management
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleRecruiters} className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
              For Recruiters
            </button>
            <button onClick={handleCandidates} className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              For Candidates
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* AI Job Descriptions */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              AI Job Descriptions
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Generate compelling job descriptions in under 10 minutes with AI-powered content creation
            </p>
          </div>

          {/* Smart Resume Screening */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Clipboard className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Smart Resume Screening
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Score and shortlist top candidates in under 5 minutes with intelligent matching algorithms
            </p>
          </div>

          {/* Personalized Communication */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Personalized Communication
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Automate candidate engagement with AI-powered messaging and multi-language support
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}