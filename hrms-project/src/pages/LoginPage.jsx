import React, { useState } from "react";
import {
  User,
  Briefcase,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import useAuth from "../contexts/useAuth";

const AuthSystem = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  // do not track logged-in user locally; AuthContext manages that
  const auth = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please enter email and password");
      return;
    }
    if (!formData.email.includes("@") && !formData.email.includes(".")) {
      setError("Please enter a valid email");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      return;
    }
    setError("");

    if (isLogin) {
      try {
  // delegate login to AuthContext; it handles storing user and navigation
  // AuthProvider.login expects (email, password)
  await auth.login(formData.email, formData.password);
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      } catch (err) {
        setError(err.message || "Login failed");
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      try {
        // delegate signup to AuthContext; AuthContext should handle navigation
        await auth.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: userRole,
        });
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      } catch (err) {
        setError(err.message || "Signup failed");
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5" />;
      case "hr":
        return <Briefcase className="w-5 h-5" />;
      case "candidate":
        return <User className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const _getStatusBadge = (status) => {
    const configs = {
      pending: {
        color: "bg-gray-100 text-gray-700",
        icon: <Clock className="w-4 h-4" />,
      },
      "under-review": {
        color: "bg-blue-100 text-blue-700",
        icon: <Clock className="w-4 h-4" />,
      },
      approved: {
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        color: "bg-red-100 text-red-700",
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    const config = configs[status] || configs["pending"];
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.icon}
        {status.replace("-", " ")}
      </span>
    );
  };

  // Note: navigation will redirect to the appropriate dashboard route after login/signup

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600">
              {isLogin ? "Sign in to your account" : "Sign up to get started"}
            </p>
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["candidate", "hr"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserRole(role)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      userRole === role
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {getRoleIcon(role)}
                    <span className="text-xs mt-2 font-medium capitalize">
                      {role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-gray-500">
              Admin: admin@company.com / admin123
            </p>
            <p className="text-xs text-gray-500">HR: hr@company.com / hr123</p>
            <p className="text-xs text-gray-500">
              Candidate: candidate@example.com / candidate123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;
