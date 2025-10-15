import React, { useState, useEffect } from 'react';
import { User, Briefcase, Shield, Mail, Lock, Eye, EyeOff, CheckCircle, Clock, XCircle } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import HRDashboard from './HRDashboard';
import CandidateDashboard from './CandidateDashboard';

const AuthSystem = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  },[])


  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/applications')
      .then(res => res.json())
      .then(data => setApplications(data));
      
  },[])


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }
    if(!formData.email.includes('@') && !formData.email.includes('.')) {
      setError('Please enter a valid email');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      return;
    }
    setError('');

    if (isLogin) {
      try {
        const response = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        if (!response.ok) {
          // empty the email and password fields
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
          throw new Error('Invalid email or password');
        }
        const data = await response.json();
        setLoggedInUser(data.user);
        setUserRole(data.user.role);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } catch (err) {
        setError(err.message);
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: userRole
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Signup failed');
        }
        const data = await response.json();
        setLoggedInUser(data.user);
        setUserRole(data.user.role);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } catch (err) {
        setError(err.message);
      }
    }
  };
  

  const handleLogout = () => {
    setLoggedInUser(null);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Shield className="w-5 h-5" />;
      case 'hr': return <Briefcase className="w-5 h-5" />;
      case 'candidate': return <User className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'pending': { color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-4 h-4" /> },
      'under-review': { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-4 h-4" /> },
      'approved': { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
      'rejected': { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> }
    };
    const config = configs[status] || configs['pending'];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {status.replace('-', ' ')}
      </span>
    );
  };


  const renderDashboard = () => {
    if (!loggedInUser) return null;
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome, {loggedInUser.name}!</h1>
              <p className="text-gray-600 mt-1 font-bold text-left p-4">Role: {loggedInUser.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
          
          {loggedInUser.role === 'admin' && <AdminDashboard users={users} applications={applications} getRoleIcon={getRoleIcon} />}
          {loggedInUser.role === 'hr' && <HRDashboard applications={applications} getStatusBadge={getStatusBadge} />}
          {loggedInUser.role === 'candidate' && <CandidateDashboard applications={applications} loggedInUser={loggedInUser} getStatusBadge={getStatusBadge} />}
        </div>
      </div>
    );
  };

  if (loggedInUser) {
    return renderDashboard();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
            </p>
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
              <div className="grid grid-cols-2 gap-3">
                {['candidate', 'hr'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserRole(role)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      userRole === role
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getRoleIcon(role)}
                    <span className="text-xs mt-2 font-medium capitalize">{role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
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
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
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
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-500">Admin: admin@company.com / admin123</p>
            <p className="text-xs text-gray-500">HR: hr@company.com / hr123</p>
            <p className="text-xs text-gray-500">Candidate: candidate@example.com / candidate123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;