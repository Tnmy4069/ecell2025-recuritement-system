'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateApplicationModal from '../../../components/CreateApplicationModal';
import EditApplicationModal from '../../../components/EditApplicationModal';
import MultipleEntryFormModal from '../../../components/MultipleEntryFormModal';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    role: ''
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMultipleEntryForm, setShowMultipleEntryForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showNewApplicationDropdown, setShowNewApplicationDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token) {
      router.push('/admin69');
      return;
    }

    if (user) {
      setAdminUser(JSON.parse(user));
    }

    fetchStats();
    fetchApplications();
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (adminUser) {
      fetchApplications();
    }
  }, [filters, adminUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowExportDropdown(false);
        setShowNewApplicationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/applications/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '1000', // Get all applications
        ...filters
      });

      const response = await fetch(`/api/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id, status, remarks = '', feedback = '') => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          status,
          adminRemarks: remarks,
          feedback
        })
      });

      if (response.ok) {
        fetchApplications();
        fetchStats();
        setSelectedApplication(null);
      } else {
        setError('Failed to update application');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // CRUD Operations
  const deleteApplication = async (id) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setApplications(prev => prev.filter(app => app._id !== id));
        setSelectedApplication(null);
        setError('');
        fetchStats(); // Refresh stats
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete application');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const createApplication = async (applicationData) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(applicationData)
      });

      const data = await response.json();
      
      if (response.ok) {
        fetchApplications(); // Refresh the list
        fetchStats(); // Refresh stats
        setShowCreateForm(false);
        setError('');
        return true;
      } else {
        setError(data.error || 'Failed to create application');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  const updateApplication = async (id, applicationData) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(applicationData)
      });

      const data = await response.json();
      
      if (response.ok) {
        fetchApplications(); // Refresh the list
        setShowEditForm(false);
        setEditingApplication(null);
        setError('');
        return true;
      } else {
        setError(data.error || 'Failed to update application');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin69');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });

      const response = await fetch(`/api/applications/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        if (format === 'json') {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ecell_applications_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // CSV format - browser will handle download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ecell_applications_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        setError('Failed to export data');
      }
    } catch (err) {
      setError('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  if (!adminUser) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">📊 Admin Dashboard</h1>
              <p className="text-sm lg:text-base text-gray-600">Welcome, {adminUser.username}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Link href="/" className="text-purple-600 hover:text-purple-800 text-sm lg:text-base font-medium">
                🌐 View Site
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm lg:text-base font-medium"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-8">
        {/* Stats Cards */}
        {stats && (
          <>
            {/* Status Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-blue-500">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Total Applications</h3>
                <p className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-yellow-500">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Pending</h3>
                <p className="text-2xl lg:text-3xl font-bold text-yellow-600">{stats.statusStats.pending || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-blue-500">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Shortlisted</h3>
                <p className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.statusStats.shortlisted || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-green-500">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Selected</h3>
                <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.statusStats.selected || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-red-500">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Rejected</h3>
                <p className="text-2xl lg:text-3xl font-bold text-red-600">{stats.statusStats.rejected || 0}</p>
              </div>
            </div>

            {/* Role Stats */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 lg:mb-8">
              <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">First Preference Role Distribution</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stats.roleStats && stats.roleStats.map((role, index) => {
                  const cleanRole = role._id ? role._id.replace(/[📝📸🎨🎉💻⚙️🤝]\s*/, '').split('(')[0].trim() : 'Unknown Role';
                  const colors = [
                    'bg-purple-100 text-purple-800 border-purple-300',
                    'bg-blue-100 text-blue-800 border-blue-300',
                    'bg-green-100 text-green-800 border-green-300',
                    'bg-yellow-100 text-yellow-800 border-yellow-300',
                    'bg-red-100 text-red-800 border-red-300',
                    'bg-indigo-100 text-indigo-800 border-indigo-300',
                    'bg-pink-100 text-pink-800 border-pink-300',
                    'bg-gray-100 text-gray-800 border-gray-300'
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={role._id} className={`rounded-lg border-2 p-4 ${colorClass}`}>
                      <h4 className="font-semibold text-sm mb-2">{cleanRole}</h4>
                      <p className="text-2xl font-bold">{role.count}</p>
                      <p className="text-xs opacity-75">
                        {((role.count / stats.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>

              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:col-span-2 lg:col-span-1"
              />

              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="Documentation">Documentation</option>
                <option value="Photography">Photography/Videography</option>
                <option value="Design">Design Team</option>
                <option value="Events">Events</option>
                <option value="Technical">Technical / Web</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing & Sponsorship</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📱 Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Table
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* NEW APPLICATION Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowNewApplicationDropdown(!showNewApplicationDropdown)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    ➕ NEW APPLICATION
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showNewApplicationDropdown && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowCreateForm(true);
                            setShowNewApplicationDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          ➕ Add Application
                        </button>
                        <button
                          onClick={() => {
                            setShowMultipleEntryForm(true);
                            setShowNewApplicationDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          📝 Multiple Entry Form
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Template and Bulk Upload */}
                <a
                  href="/api/applications/template"
                  download="ecell_applications_template.csv"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
                >
                  📥 Download Template
                </a>
                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  📁 Bulk Upload CSV
                </button>
                
                {/* EXPORT Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    disabled={exportLoading}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {exportLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        📊 EXPORT
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {showExportDropdown && !exportLoading && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleExport('csv');
                            setShowExportDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          📊 Export CSV
                        </button>
                        <button
                          onClick={() => {
                            handleExport('json');
                            setShowExportDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          📋 Export JSON
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Display */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">❌ {error}</p>
            <button
              onClick={() => {
                setError('');
                fetchApplications();
              }}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters to see more results.' 
                : 'No applications have been submitted yet.'}
            </p>
            {Object.values(filters).some(f => f) && (
              <button
                onClick={() => setFilters({ status: '', search: '', role: '' })}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Showing {applications.length} applications
                {Object.values(filters).some(f => f) && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Filtered
                  </span>
                )}
              </div>
              {Object.values(filters).some(f => f) && (
                <button
                  onClick={() => setFilters({ status: '', search: '', role: '' })}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-4 lg:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{app.fullName}</h3>
                      <p className="text-sm text-gray-600 mb-1">{app.email}</p>
                      <p className="text-sm text-gray-600">{app.whatsappNumber}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Branch</p>
                      <p className="text-sm text-gray-900 mt-1">{app.branch}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Role</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {app.primaryRole}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year</p>
                      <p className="text-sm text-gray-900 mt-1">{app.year}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</p>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(app.submittedAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => {
                        setEditingApplication(app);
                        setShowEditForm(true);
                      }}
                      className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteApplication(app._id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Primary Role
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                          <div className="text-sm text-gray-500">{app.whatsappNumber}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.branch}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.primaryRole}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(app.submittedAt)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => {
                              setEditingApplication(app);
                              setShowEditForm(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteApplication(app._id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

          </>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationModal 
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdate={updateApplicationStatus}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal 
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setShowBulkUpload(false);
            fetchApplications();
            fetchStats();
          }}
        />
      )}

      {/* Create Application Modal */}
      {showCreateForm && (
        <CreateApplicationModal 
          onClose={() => setShowCreateForm(false)}
          onSubmit={createApplication}
        />
      )}

      {/* Edit Application Modal */}
      {showEditForm && editingApplication && (
        <EditApplicationModal 
          application={editingApplication}
          onClose={() => {
            setShowEditForm(false);
            setEditingApplication(null);
          }}
          onSubmit={updateApplication}
        />
      )}

      {/* Multiple Entry Form Modal */}
      {showMultipleEntryForm && (
        <MultipleEntryFormModal 
          onClose={() => setShowMultipleEntryForm(false)}
          onSubmit={createApplication}
        />
      )}
    </div>
  );
}

// Application Details Modal Component
function ApplicationModal({ application, onClose, onUpdate }) {
  const [status, setStatus] = useState(application.status);
  const [remarks, setRemarks] = useState(application.adminRemarks || '');
  const [feedback, setFeedback] = useState(application.feedback || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    await onUpdate(application._id, status, remarks, feedback);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Application Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div><strong>Name:</strong> {application.fullName}</div>
              <div><strong>Email:</strong> {application.email}</div>
              <div><strong>WhatsApp:</strong> {application.whatsappNumber}</div>
              <div><strong>Branch:</strong> {application.branch}</div>
              <div><strong>Year:</strong> {application.year}</div>
            </div>

            {/* Role Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Role Preferences</h3>
              <div><strong>Primary Role:</strong> {application.primaryRole}</div>
              <div><strong>Secondary Role:</strong> {application.secondaryRole || 'None'}</div>
              <div><strong>Other Clubs:</strong> {application.hasOtherClubs}</div>
            </div>

            {/* Experience */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold">Experience & Motivation</h3>
              <div>
                <strong>Why this role:</strong>
                <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">{application.whyThisRole}</p>
              </div>
              <div>
                <strong>Flex a little:</strong>
                <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">{application.pastExperience}</p>
              </div>
            </div>

            {/* Availability */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold">Availability</h3>
              <div><strong>Time Availability:</strong> {application.timeAvailability}</div>
            </div>

            {/* Admin Actions */}
            <div className="md:col-span-2 space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Admin Actions</h3>
              
              <div>
                <label className="block font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Admin Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Add your remarks..."
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Add feedback for the applicant..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bulk Upload Modal Component
function BulkUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/applications/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      const data = await response.json();
      setResult(data);

      if (response.ok) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setResult({ error: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl lg:text-2xl font-bold">📁 Bulk Upload Applications</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Template Download Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900">📥 Download CSV Template</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Download the template with proper format and exact column headers.
                    The template includes sample data with different application statuses.
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    <span className="font-medium">✨ New:</span> Flexible column mapping! Upload works with different column names and orders.
                  </div>
                </div>
                <a
                  href="/api/applications/template"
                  download="ecell_applications_template.csv"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap ml-4"
                >
                  📥 Download
                </a>
              </div>
            </div>

            {/* Flexible Upload Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">🚀 Smart Column Detection</h3>
              <p className="text-sm text-green-700 mb-2">
                Our system automatically detects columns even if they&apos;re in different order or have different names!
              </p>
              <div className="text-xs text-green-600 space-y-1">
                <div><span className="font-medium">✅ Column names:</span> &quot;Full Name&quot;, &quot;Student Name&quot;, &quot;name&quot;, &quot;fullName&quot; all work</div>
                <div><span className="font-medium">✅ Any order:</span> Columns can be in any sequence</div>
                <div><span className="font-medium">✅ Extra columns:</span> Additional columns are automatically ignored</div>
                <div><span className="font-medium">✅ Case insensitive:</span> &quot;EMAIL&quot;, &quot;email&quot;, &quot;Email&quot; all work</div>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">📁 Upload CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium mb-1">📋 Core fields (flexible column names accepted):</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span>• Full Name</span>
                  <span>• Email address</span>
                  <span>• Whatsapp Number</span>
                  <span>• Branch</span>
                  <span>• Year</span>
                  <span>• Primary Role</span>
                  <span>• Secondary Role</span>
                  <span>• Why this role? What&apos;s the vibe?</span>
                  <span>• Flex a little.</span>
                  <span>• Already juggling other clubs?</span>
                  <span>• Time Availability</span>
                  <span>• Status (optional)</span>
                  <span>• Admin Remarks (optional)</span>
                </div>
                <p className="mt-2 text-green-600">
                  ✨ <span className="font-medium">Smart Upload:</span> System will auto-detect your column format!
                </p>
              </div>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.error 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {result.error ? (
                  <div className="flex items-start gap-2">
                    <span className="text-red-500">❌</span>
                    <div>
                      <div className="font-medium">Upload Failed</div>
                      <div className="text-sm">{result.error}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✅</span>
                    <div>
                      <div className="font-medium">Upload Successful!</div>
                      <div className="text-sm">
                        Successfully imported: {result.successful} applications
                        {result.errors > 0 && (
                          <div className="text-yellow-600 mt-1">
                            ⚠️ {result.errors} errors occurred during import
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? '⏳ Uploading...' : '📤 Upload CSV'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
