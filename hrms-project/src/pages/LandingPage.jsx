import React from "react";
import { FileText, Clipboard, MessageSquare } from "lucide-react";

export default function TalentFlowLanding() {
  const handleRecruiters = () => {
    window.location.href = "/login-signup";
  };

  const handleCandidates = () => {
    window.location.href = "/login-signup";
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="TalentFlow Logo"
              className="w-16 h-16 rounded-lg object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full">
        <div className="
            bg-gradient-to-r 
            from-indigo-600 
            via-purple-600
            to-purple-700
            w-full py-24 px-4 sm:px-6 lg:px-8
            text-center text-white
            animate-fadeIn
          "
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg">
            Intelligent Recruitment Platform
          </h1>

          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Streamline your hiring process with AI-powered tools for job creation,
            resume screening, and candidate management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRecruiters}
              className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold 
              hover:bg-gray-100 transition shadow-md hover:shadow-lg"
            >
              For Recruiters
            </button>

            <button
              onClick={handleCandidates}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold 
              hover:bg-white/10 transition shadow-md hover:shadow-lg"
            >
              For Candidates
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 animate-slideUp">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">

          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              AI Job Descriptions
            </h3>
            <p className="text-gray-600">
              Generate compelling job descriptions in under 10 minutes using AI-powered tools.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Clipboard className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Smart Resume Screening
            </h3>
            <p className="text-gray-600">
              Score and shortlist candidates in minutes with AI-driven matching.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Personalized Communication
            </h3>
            <p className="text-gray-600">
              Automate candidate messaging with multilingual AI capabilities.
            </p>
          </div>

        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
