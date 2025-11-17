import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/kanban.css";
import Navbar from "../components/HRNavbar";
import { Users, Clock, CheckCircle, Calendar, Mail, Phone, MapPin, GraduationCap, Briefcase, Search, Filter } from "lucide-react";
import { useAuth } from "../contexts/useAuth";

// Empty initial state - data will be loaded from API
const initialApplications = {
  "new-applications": [],
  "under-review": [],
  "interview-scheduled": [],
  "final-review": [],
  "hired": [],
  "rejected": []
};

const columns = [
  { id: "new-applications", title: "Applied", color: "bg-blue-50 border-blue-200" },
  { id: "under-review", title: "Screened", color: "bg-yellow-50 border-yellow-200" },
  { id: "interview-scheduled", title: "Interviewed", color: "bg-purple-50 border-purple-200" },
  { id: "final-review", title: "Under Review", color: "bg-orange-50 border-orange-200" },
  { id: "hired", title: "Offered", color: "bg-green-50 border-green-200" },
  { id: "rejected", title: "Rejected", color: "bg-red-50 border-red-200" }
];

export default function KanbanBoard(props) {
  const { authFetch } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const userName = props?.userName ?? "Jane Recruiter";
  const [applications, setApplications] = useState(initialApplications);
  const [draggedItem, setDraggedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);

  // API integration functions
  const fetchAllApplications = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/applications/all', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform API response to match Kanban structure
        const transformedApplications = {
          "new-applications": [],
          "under-review": [],
          "interview-scheduled": [],
          "final-review": [],
          "hired": [],
          "rejected": []
        };
        
        data.applications.forEach(app => {
          // Transform the comprehensive API data to match the Kanban card structure
          const transformedApp = {
            id: app.id,
            name: app.candidate_name,
            position: app.job_title,
            email: app.candidate_email,
            phone: app.phone || "N/A",
            location: app.job_location || "N/A",
            experience: app.experience || "N/A",
            education: app.education || "N/A",
            skills: app.skills || "N/A",
            appliedDate: app.submitted_at ? app.submitted_at.split('T')[0] : new Date().toISOString().split('T')[0],
            status: app.status,
            resume_url: app.resume_url,
            profile_summary: app.profile_summary,
            job_description: app.job_description,
            job_requirements: app.job_requirements,
            employment_type: app.employment_type,
            score: app.score,
            status_flags: app.status_flags
          };
          
          if (transformedApplications[app.status]) {
            transformedApplications[app.status].push(transformedApp);
          }
        });
        
        setApplications(transformedApplications);
        
        // Extract unique job titles for filter dropdown
        const jobs = [...new Set(data.applications.map(app => app.job_title).filter(Boolean))];
        setAvailableJobs(jobs);
      } else {
        console.error('Failed to fetch applications');
        // Fallback to initial data on error
        setApplications(initialApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Fallback to initial data on error
      setApplications(initialApplications);
    } finally {
      setIsLoading(false);
    }
  };

  // Search and filter applications
  const searchApplications = async (query = "", jobFilter = "") => {
    setIsLoading(true);
    try {
      const response = await authFetch('/applications/all', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        let filteredApplications = data.applications;
        
        // Apply search query filter
        if (query.trim()) {
          const searchTerm = query.toLowerCase();
          filteredApplications = filteredApplications.filter(app => 
            app.candidate_name?.toLowerCase().includes(searchTerm) ||
            app.candidate_email?.toLowerCase().includes(searchTerm) ||
            app.skills?.toLowerCase().includes(searchTerm) ||
            app.experience?.toLowerCase().includes(searchTerm) ||
            app.job_title?.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply job filter
        if (jobFilter.trim()) {
          filteredApplications = filteredApplications.filter(app => 
            app.job_title === jobFilter
          );
        }
        
        // Transform filtered results to match Kanban structure
        const transformedApplications = {
          "new-applications": [],
          "under-review": [],
          "interview-scheduled": [],
          "final-review": [],
          "hired": [],
          "rejected": []
        };
        
        filteredApplications.forEach(app => {
          const transformedApp = {
            id: app.id,
            name: app.candidate_name,
            position: app.job_title,
            email: app.candidate_email,
            phone: app.phone || "N/A",
            location: app.job_location || "N/A",
            experience: app.experience || "N/A",
            education: app.education || "N/A",
            skills: app.skills || "N/A",
            appliedDate: app.submitted_at ? app.submitted_at.split('T')[0] : new Date().toISOString().split('T')[0],
            status: app.status,
            resume_url: app.resume_url,
            profile_summary: app.profile_summary,
            job_description: app.job_description,
            job_requirements: app.job_requirements,
            employment_type: app.employment_type,
            score: app.score,
            status_flags: app.status_flags
          };
          
          if (transformedApplications[app.status]) {
            transformedApplications[app.status].push(transformedApp);
          }
        });
        
        setApplications(transformedApplications);
        
        // Extract unique job titles for filter dropdown from all data
        const jobs = [...new Set(data.applications.map(app => app.job_title).filter(Boolean))];
        setAvailableJobs(jobs);
      } else {
        console.error('Failed to search applications');
        setApplications(initialApplications);
      }
    } catch (error) {
      console.error('Error searching applications:', error);
      setApplications(initialApplications);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle query parameters on component mount
  useEffect(() => {
    const jobParam = searchParams.get('job');
    if (jobParam) {
      setJobFilter(jobParam);
      // Fetch applications and then filter by job
      fetchAllApplications().then(() => {
        searchApplications("", jobParam);
      });
    } else {
      fetchAllApplications();
    }
  }, [searchParams]);

  // Update URL when job filter changes
  useEffect(() => {
    if (jobFilter) {
      setSearchParams({ job: jobFilter });
    } else {
      setSearchParams({});
    }
  }, [jobFilter, setSearchParams]);

  // Handle search
  const handleSearch = () => {
    searchApplications(searchQuery, jobFilter);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setJobFilter("");
    fetchAllApplications();
  };

  const handleDragStart = (e, application, sourceColumn) => {
    setDraggedItem({ application, sourceColumn });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.sourceColumn === targetColumn) {
      setDraggedItem(null);
      return;
    }

    // Optimistically update UI first
    const updatedApplications = { ...applications };
    
    // Remove from source column
    updatedApplications[draggedItem.sourceColumn] = updatedApplications[draggedItem.sourceColumn].filter(
      app => app.id !== draggedItem.application.id
    );
    
    // Add to target column with updated status
    const updatedApplication = { ...draggedItem.application, status: targetColumn };
    updatedApplications[targetColumn] = [...updatedApplications[targetColumn], updatedApplication];
    
    setApplications(updatedApplications);
    setDraggedItem(null);

    // Call API to update status in backend
    try {
      const response = await authFetch(`/applications/${draggedItem.application.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: targetColumn
        }),
      });

      if (!response.ok) {
        // If API call fails, revert the UI changes
        console.error('Failed to update application status');
        
        // Revert UI changes
        const revertedApplications = { ...applications };
        
        // Remove from target column
        revertedApplications[targetColumn] = revertedApplications[targetColumn].filter(
          app => app.id !== draggedItem.application.id
        );
        
        // Add back to source column
        revertedApplications[draggedItem.sourceColumn] = [...revertedApplications[draggedItem.sourceColumn], draggedItem.application];
        
        setApplications(revertedApplications);
        alert('Failed to update application status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      
      // Revert UI changes on error
      const revertedApplications = { ...applications };
      
      // Remove from target column
      revertedApplications[targetColumn] = revertedApplications[targetColumn].filter(
        app => app.id !== draggedItem.application.id
      );
      
      // Add back to source column
      revertedApplications[draggedItem.sourceColumn] = [...revertedApplications[draggedItem.sourceColumn], draggedItem.application];
      
      setApplications(revertedApplications);
      alert('Failed to update application status. Please try again.');
    }
  };

  const totalApplications = Object.values(applications).flat().length;
  const inProgress = applications["under-review"].length + applications["interview-scheduled"].length + applications["final-review"].length;
  const hired = applications["hired"].length;

  const stats = [
    {
      label: "Total Applications",
      value: totalApplications.toString(),
      icon: Users,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "In Progress",
      value: inProgress.toString(),
      icon: Clock,
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Hired",
      value: hired.toString(),
      icon: CheckCircle,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <main className="py-6 sm:pt-12 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] overflow-auto bg-gray-50">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, skills, or experience..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
                >
                  <option value="">All Positions</option>
                  {availableJobs.map((job, index) => (
                    <option key={index} value={job}>{job}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
              <button
                onClick={handleClearFilters}
                disabled={isLoading}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-700">
              Application Pipeline
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading applications...</span>
            </div>
          ) : (
            <div className="kanban-board">
              {columns.map((column) => (
              <div
                key={column.id}
                className={`kanban-column ${column.color}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="kanban-column-header">
                  <h3 className="kanban-column-title">{column.title}</h3>
                  <span className="kanban-column-count">
                    {applications[column.id].length}
                  </span>
                </div>
                
                <div className="kanban-column-content">
                  {applications[column.id].map((application) => (
                    <div
                      key={application.id}
                      className="kanban-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, application, column.id)}
                    >
                      <div className="kanban-card-header">
                        <h4 className="kanban-card-name">{application.name}</h4>
                        <span className="kanban-card-position">{application.position}</span>
                      </div>
                      
                      <div className="kanban-card-details">
                        <div className="kanban-card-detail">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{application.email}</span>
                        </div>
                        <div className="kanban-card-detail">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{application.phone}</span>
                        </div>
                        <div className="kanban-card-detail">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{application.location}</span>
                        </div>
                        <div className="kanban-card-detail">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{application.experience}</span>
                        </div>
                        <div className="kanban-card-detail">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <span>{application.education}</span>
                        </div>
                        <div className="kanban-card-detail">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                        </div>
                        {application.interviewDate && (
                          <div className="kanban-card-detail">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="text-purple-600 font-medium">
                              Interview: {new Date(application.interviewDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {application.hiredDate && (
                          <div className="kanban-card-detail">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-medium">
                              Hired: {new Date(application.hiredDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}