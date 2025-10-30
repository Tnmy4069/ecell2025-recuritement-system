'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateApplicationModal from '../../../components/CreateApplicationModal';
import EditApplicationModal from '../../../components/EditApplicationModal';
import MultipleEntryFormModal from '../../../components/MultipleEntryFormModal';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

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
  const [showStatsSection, setShowStatsSection] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 12l5 5 5-5H5z" />
          <path d="M5 8l5-5 5 5H5z" />
        </svg>
      );
    }
    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 8l5-5 5 5H5z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 ml-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 12l5 5 5-5H5z" />
      </svg>
    );
  };

  const sortedApplications = React.useMemo(() => {
    if (!sortConfig.key) return applications;

    return [...applications].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'submittedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting (case insensitive)
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [applications, sortConfig]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/80 to-purple-50/80 backdrop-blur-sm shadow-lg border-b border-white/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="bg-gradient-to-r from-purple-100/50 to-blue-100/50 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-inner border border-white/40">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">📊 Admin Dashboard</h1>
              <p className="text-sm lg:text-base text-gray-600 font-medium">Welcome, {adminUser.username}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Link href="/" className="bg-gradient-to-r from-purple-100/60 to-blue-100/60 backdrop-blur-sm text-purple-700 hover:text-purple-900 text-sm lg:text-base font-semibold px-4 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-white/40">
                🌐 View Site
              </Link>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-100/80 to-pink-100/80 backdrop-blur-sm text-red-700 hover:text-red-900 px-4 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 text-sm lg:text-base font-semibold border border-white/40"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-100/80 backdrop-blur-sm rounded-3xl shadow-lg p-4 lg:p-6 border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Total Applications</h3>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50/80 to-amber-100/80 backdrop-blur-sm rounded-3xl shadow-lg p-4 lg:p-6 border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Pending</h3>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">{stats.statusStats.pending || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-sky-50/80 to-cyan-100/80 backdrop-blur-sm rounded-3xl shadow-lg p-4 lg:p-6 border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Shortlisted</h3>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">{stats.statusStats.shortlisted || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50/80 to-green-100/80 backdrop-blur-sm rounded-3xl shadow-lg p-4 lg:p-6 border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Selected</h3>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{stats.statusStats.selected || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-rose-50/80 to-red-100/80 backdrop-blur-sm rounded-3xl shadow-lg p-4 lg:p-6 border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-700 mb-1 lg:mb-2">Rejected</h3>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">{stats.statusStats.rejected || 0}</p>
              </div>



            </div>

            {/* Role Stats */}
            <div className="bg-gradient-to-br from-white/60 to-purple-50/60 backdrop-blur-sm rounded-3xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-white/40">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">📊 Detailed Statistics</h3>
                <button
                  onClick={() => setShowStatsSection(!showStatsSection)}
                  className="bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-sm text-blue-700 hover:text-blue-900 font-medium text-sm flex items-center gap-2 px-4 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-white/40"
                >
                  {showStatsSection ? '👁️ Hide Details' : '👁️ Show Details'}
                  <svg className={`w-4 h-4 transition-transform ${showStatsSection ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {showStatsSection && (
                <div className="space-y-6">
                  {/* Role Distribution */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">🎯 First Preference Role Distribution</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
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
                          <div key={role._id} className={`rounded-2xl border border-white/30 p-4 ${colorClass} backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
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

                  {/* Branch and Year Distribution - Pie Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Branch Distribution Pie Chart */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">🏫 Branch Distribution</h4>
                      <div className="bg-gradient-to-br from-white/60 to-cyan-50/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-md">
                        <div className="w-full h-64 flex items-center justify-center">
                          {stats.branchStats && stats.branchStats.length > 0 ? (
                            <Pie
                              data={{
                                labels: stats.branchStats.map(branch => branch._id || 'Unknown'),
                                datasets: [{
                                  data: stats.branchStats.map(branch => branch.count),
                                  backgroundColor: [
                                    'rgba(59, 130, 246, 0.8)',   // Blue
                                    'rgba(234, 179, 8, 0.8)',    // Yellow
                                    'rgba(239, 68, 68, 0.8)',    // Red
                                    'rgba(16, 185, 129, 0.8)',   // Emerald
                                    'rgba(168, 85, 247, 0.8)',   // Purple
                                    'rgba(244, 114, 182, 0.8)',  // Pink
                                  ],
                                  borderColor: [
                                    'rgba(59, 130, 246, 1)',
                                    'rgba(234, 179, 8, 1)',
                                    'rgba(239, 68, 68, 1)',
                                    'rgba(16, 185, 129, 1)',
                                    'rgba(168, 85, 247, 1)',
                                    'rgba(244, 114, 182, 1)',
                                  ],
                                  borderWidth: 2,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                    labels: {
                                      padding: 15,
                                      usePointStyle: true,
                                      font: {
                                        size: 12
                                      }
                                    }
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        const percentage = ((context.parsed / stats.total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="text-gray-500 text-center">
                              <div className="text-4xl mb-2">📊</div>
                              <p>No branch data available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Year Distribution Pie Chart */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">📚 Year Distribution</h4>
                      <div className="bg-gradient-to-br from-white/60 to-emerald-50/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-md">
                        <div className="w-full h-64 flex items-center justify-center">
                          {stats.yearStats && stats.yearStats.length > 0 ? (
                            <Pie
                              data={{
                                labels: stats.yearStats.map(year => `Year ${year._id}` || 'Unknown'),
                                datasets: [{
                                  data: stats.yearStats.map(year => year.count),
                                  backgroundColor: [
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(251, 191, 36, 0.8)',
                                    'rgba(244, 63, 94, 0.8)',
                                    'rgba(139, 92, 246, 0.8)',
                                    'rgba(59, 130, 246, 0.8)',
                                  ],
                                  borderColor: [
                                    'rgba(34, 197, 94, 1)',
                                    'rgba(251, 191, 36, 1)',
                                    'rgba(244, 63, 94, 1)',
                                    'rgba(139, 92, 246, 1)',
                                    'rgba(59, 130, 246, 1)',
                                  ],
                                  borderWidth: 2,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                    labels: {
                                      padding: 15,
                                      usePointStyle: true,
                                      font: {
                                        size: 12
                                      }
                                    }
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        const percentage = ((context.parsed / stats.total) * 100).toFixed(1);
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="text-gray-500 text-center">
                              <div className="text-4xl mb-2">📊</div>
                              <p>No year data available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Filters and Actions */}
        <div className="bg-gradient-to-br from-white/60 to-blue-50/60 backdrop-blur-sm rounded-3xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-white/40">
          <div className="space-y-4">
            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-md transition-all duration-300"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                <option value="approved">Approved</option>
              </select>

              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1"
              />

              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-md transition-all duration-300"
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

            {/* Actions Row */}
            <div className="flex flex-col gap-4">
              {/* View Toggle */}
              <div className="flex justify-center sm:justify-start">
                <div className="flex bg-gradient-to-r from-gray-100/80 to-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-inner border border-white/40">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${viewMode === 'cards'
                      ? 'bg-gradient-to-r from-white to-purple-50 text-purple-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    📱 Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${viewMode === 'table'
                      ? 'bg-gradient-to-r from-white to-purple-50 text-purple-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    📊 Table
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* NEW APPLICATION Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowNewApplicationDropdown(!showNewApplicationDropdown)}
                    className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm text-blue-700 hover:text-blue-900 px-4 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 border border-white/40"
                  >
                    ➕ NEW APPLICATION
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {showNewApplicationDropdown && (
                    <div className="absolute left-0 mt-2 w-56 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowCreateForm(true);
                            setShowNewApplicationDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 w-full text-left rounded-xl transition-all duration-300"
                        >
                          ➕ Add Application
                        </button>
                        <button
                          onClick={() => {
                            setShowMultipleEntryForm(true);
                            setShowNewApplicationDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 w-full text-left rounded-xl transition-all duration-300"
                        >
                          📝 Multiple Entry Form
                        </button>
                      </div>
                    </div>
                  )}
                </div>


                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 backdrop-blur-sm text-green-700 hover:text-green-900 px-4 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 font-medium border border-white/40"
                >
                  📁 Bulk Upload CSV
                </button>

                {/* EXPORT Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    disabled={exportLoading}
                    className="bg-gradient-to-r from-orange-100/80 to-amber-100/80 backdrop-blur-sm text-orange-700 hover:text-orange-900 px-4 py-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/40"
                  >
                    {exportLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
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
                    <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleExport('csv');
                            setShowExportDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50/60 hover:to-amber-50/60 w-full text-left rounded-xl transition-all duration-300"
                        >
                          📊 Export CSV
                        </button>
                        <button
                          onClick={() => {
                            handleExport('json');
                            setShowExportDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50/60 hover:to-amber-50/60 w-full text-left rounded-xl transition-all duration-300"
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
          <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-lg rounded-3xl shadow-lg p-8 text-center border border-white/40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-lg border border-red-200/40 rounded-3xl p-6 text-center shadow-lg">
            <p className="text-red-800 font-medium">❌ {error}</p>
            <button
              onClick={() => {
                setError('');
                fetchApplications();
              }}
              className="mt-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-lg rounded-3xl shadow-lg p-8 text-center border border-white/40">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">No applications found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(f => f)
                ? 'Try adjusting your filters to see more results.'
                : 'No applications have been submitted yet.'}
            </p>
            {Object.values(filters).some(f => f) && (
              <button
                onClick={() => setFilters({ status: '', search: '', role: '' })}
                className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
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
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start sm:self-center"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {viewMode === 'cards' ? (
              /* Card View */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {applications.map((app) => (
                  <div key={app._id} className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/40 hover:scale-105">
                    <div className="p-4 lg:p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">{app.fullName}</h3>
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
                          className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm text-blue-700 hover:text-blue-900 px-3 py-2 rounded-xl hover:shadow-md transition-all duration-300 text-sm font-medium border border-white/40"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => {
                            setEditingApplication(app);
                            setShowEditForm(true);
                          }}
                          className="bg-gradient-to-r from-yellow-100/80 to-amber-100/80 backdrop-blur-sm text-yellow-700 hover:text-yellow-900 px-3 py-2 rounded-xl hover:shadow-md transition-all duration-300 text-sm font-medium border border-white/40"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteApplication(app._id)}
                          className="bg-gradient-to-r from-red-100/80 to-pink-100/80 backdrop-blur-sm text-red-700 hover:text-red-900 px-3 py-2 rounded-xl hover:shadow-md transition-all duration-300 text-sm font-medium border border-white/40"
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
              <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-lg rounded-3xl shadow-lg overflow-hidden border border-white/40">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-100/80 to-slate-100/80 backdrop-blur-sm">
                      <tr>
                        <th
                          className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 select-none transition-all duration-300"
                          onClick={() => handleSort('fullName')}
                        >
                          <div className="flex items-center">
                            Applicant
                            {getSortIcon('fullName')}
                          </div>
                        </th>
                        <th
                          className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 select-none transition-all duration-300"
                          onClick={() => handleSort('branch')}
                        >
                          <div className="flex items-center">
                            Branch
                            {getSortIcon('branch')}
                          </div>
                        </th>
                        <th
                          className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 select-none transition-all duration-300"
                          onClick={() => handleSort('primaryRole')}
                        >
                          <div className="flex items-center">
                            Primary Role
                            {getSortIcon('primaryRole')}
                          </div>
                        </th>
                        <th
                          className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 select-none transition-all duration-300"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {getSortIcon('status')}
                          </div>
                        </th>
                        <th
                          className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 select-none transition-all duration-300"
                          onClick={() => handleSort('submittedAt')}
                        >
                          <div className="flex items-center">
                            Submitted
                            {getSortIcon('submittedAt')}
                          </div>
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gradient-to-br from-white/60 to-gray-50/60 backdrop-blur-sm divide-y divide-white/40">
                      {sortedApplications.map((app) => (
                        <tr key={app._id} className="hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-purple-50/40 transition-all duration-300">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{app.fullName}</div>
                              <div className="text-sm text-gray-600">{app.email}</div>
                              <div className="text-sm text-gray-600">{app.whatsappNumber}</div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {app.branch}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {app.primaryRole}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDate(app.submittedAt)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedApplication(app)}
                                className="bg-gradient-to-r from-blue-100/60 to-indigo-100/60 backdrop-blur-sm text-blue-700 hover:text-blue-900 px-3 py-1 rounded-xl hover:shadow-md transition-all duration-300 border border-white/40"
                              >
                                👁️ View
                              </button>
                              <button
                                onClick={() => {
                                  setEditingApplication(app);
                                  setShowEditForm(true);
                                }}
                                className="bg-gradient-to-r from-yellow-100/60 to-amber-100/60 backdrop-blur-sm text-yellow-700 hover:text-yellow-900 px-3 py-1 rounded-xl hover:shadow-md transition-all duration-300 border border-white/40"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteApplication(app._id)}
                                className="bg-gradient-to-r from-red-100/60 to-pink-100/60 backdrop-blur-sm text-red-700 hover:text-red-900 px-3 py-1 rounded-xl hover:shadow-md transition-all duration-300 border border-white/40"
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
              <div className={`p-4 rounded-lg border ${result.error
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
