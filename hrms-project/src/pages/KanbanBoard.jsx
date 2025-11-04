import React, { useState } from "react";
import "../styles/kanban.css";
import Navbar from "../components/HRNavbar";
import { Users, Clock, CheckCircle, Plus, Calendar, Mail, Phone, MapPin, GraduationCap, Briefcase } from "lucide-react";

const initialApplications = {
  "new-applications": [
    {
      id: 1,
      name: "John Smith",
      position: "Senior Frontend Developer",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      experience: "5 years",
      education: "BS Computer Science",
      appliedDate: "2024-11-01",
      status: "new"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      position: "Product Manager",
      email: "sarah.j@email.com",
      phone: "+1 (555) 234-5678",
      location: "New York, NY",
      experience: "3 years",
      education: "MBA, Marketing",
      appliedDate: "2024-11-02",
      status: "new"
    }
  ],
  "under-review": [
    {
      id: 3,
      name: "Mike Chen",
      position: "Backend Developer",
      email: "mike.chen@email.com",
      phone: "+1 (555) 345-6789",
      location: "Seattle, WA",
      experience: "4 years",
      education: "MS Software Engineering",
      appliedDate: "2024-10-28",
      status: "under-review"
    }
  ],
  "interview-scheduled": [
    {
      id: 4,
      name: "Emily Davis",
      position: "UX Designer",
      email: "emily.davis@email.com",
      phone: "+1 (555) 456-7890",
      location: "Austin, TX",
      experience: "6 years",
      education: "BFA Design",
      appliedDate: "2024-10-25",
      status: "interview-scheduled",
      interviewDate: "2024-11-05"
    }
  ],
  "final-review": [
    {
      id: 5,
      name: "Alex Rodriguez",
      position: "Data Scientist",
      email: "alex.r@email.com",
      phone: "+1 (555) 567-8901",
      location: "Boston, MA",
      experience: "2 years",
      education: "PhD Data Science",
      appliedDate: "2024-10-20",
      status: "final-review"
    }
  ],
  "hired": [
    {
      id: 6,
      name: "Lisa Wang",
      position: "DevOps Engineer",
      email: "lisa.wang@email.com",
      phone: "+1 (555) 678-9012",
      location: "Denver, CO",
      experience: "4 years",
      education: "BS Computer Engineering",
      appliedDate: "2024-10-15",
      status: "hired",
      hiredDate: "2024-11-01"
    }
  ]
};

const columns = [
  { id: "new-applications", title: "Applied", color: "bg-blue-50 border-blue-200" },
  { id: "under-review", title: "Screened", color: "bg-yellow-50 border-yellow-200" },
  { id: "interview-scheduled", title: "Interviewed", color: "bg-purple-50 border-purple-200" },
  { id: "final-review", title: "Under Review", color: "bg-orange-50 border-orange-200" },
  { id: "hired", title: "Offered", color: "bg-green-50 border-green-200" }
];

export default function KanbanBoard(props) {
  const userName = props?.userName ?? "Jane Recruiter";
  const [applications, setApplications] = useState(initialApplications);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, application, sourceColumn) => {
    setDraggedItem({ application, sourceColumn });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.sourceColumn === targetColumn) {
      setDraggedItem(null);
      return;
    }

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
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">
            HR Application Management
          </h1>
          <p className="text-gray-600">
            Track and manage job applications through the hiring process
          </p>
        </div>

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

        {/* Kanban Board */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-700">
              Application Pipeline
            </h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition font-medium">
              <Plus className="w-4 h-4" />
              Add Application
            </button>
          </div>

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
        </div>
      </main>
    </div>
  );
}