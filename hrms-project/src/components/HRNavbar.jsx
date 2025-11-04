import React, { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";



export default function Navbar({
  navItems = [
    { label: "Dashboard", to: "/hr-dashboard" },
    { label: "Jobs", to: "/hr-jobs" },
    { label: "Candidates", to: "/candidates" },
    { label: "Pipeline", to: "/kanban-board" },
    { label: "Communications", to: "/communications" },
    { label: "Analytics", to: "/analytics" },
    // { label: "Schedule", to: "/schedule" },
  ],
  userName = "User",
  brand = { title: "TalentFlow" },
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const isActive = (to) => {
    return (
      location.pathname === to ||
      (to !== "/" && location.pathname.startsWith(to))
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 inset-x-0 h-16 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-left">
          {/* Brand +  nav */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              {/* logo color */}
              <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
              <span className="text-xl font-semibold text-gray-900">
                {brand.title}
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-14">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition ${
                    isActive(item.to)
                      ? "text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm text-gray-700">{userName}</div>
            <button
              onClick={() => {
                handleLogout();
              }}
              className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen((s) => !s)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-4 pb-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`block text-sm font-medium ${
                  isActive(item.to)
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-gray-700">{userName}</div>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
