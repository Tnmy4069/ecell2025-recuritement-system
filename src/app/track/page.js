'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TrackApplication() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApplication(null);

    try {
      const response = await fetch('/api/applications/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whatsappNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setApplication(data.application);
      } else {
        setError(data.error || 'Application not found');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'shortlisted':
        return 'bg-blue-500';
      case 'selected':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'shortlisted':
        return '📋';
      case 'selected':
        return '🎉';
      case 'rejected':
        return '❌';
      default:
        return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Track Your Application</h1>
            <Link href="/" className="text-white hover:text-purple-300 transition-colors">
              ← Back to Form
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Search Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Track Your Application Status
            </h2>
            
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Enter Your WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your WhatsApp number"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Track Application 🔍'}
              </button>
            </form>
          </div>

          {/* Application Details */}
          {application && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {getStatusIcon(application.status)}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Hi, {application.fullName}!
                </h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-semibold ${getStatusColor(application.status)}`}>
                  Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </div>
              </div>

              <div className="space-y-4 text-white">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">📧 Email</h4>
                  <p className="text-gray-300">{application.email}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">📅 Submitted At</h4>
                  <p className="text-gray-300">
                    {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Submission date not available'}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🔄 Last Updated</h4>
                  <p className="text-gray-300">
                    {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Not updated yet'}
                  </p>
                </div>

                {application.adminRemarks && (
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-blue-300">💬 Admin Remarks</h4>
                    <p className="text-gray-300">{application.status} </p>
                  </div>
                )}

                {application.feedback && (
                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-green-300">📝 Feedback</h4>
                    <p className="text-gray-300">{application.status}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 p-4 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                <h4 className="font-semibold text-purple-300 mb-2">📞 Need Help?</h4>
                <p className="text-gray-300 text-sm">
                  If you have any questions about your application status, feel free to reach out to us at{' '}
                  <a href="mailto:new_family@ecellmet.tech" className="text-purple-300 hover:underline">
                    new_family@ecellmet.tech
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
