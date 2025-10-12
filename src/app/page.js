'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    isFromNashik: '',
    department: '',
    yearOfStudy: '',
    firstPreference: '',
    secondaryRole: '',
    whyThisRole: '',
    pastExperience: '',
    hasOtherClubs: '',
    otherClubsDetails: '',
    timeCommitment: false,
    availableForEvents: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          whatsappNumber: '',
          isFromNashik: '',
          department: '',
          yearOfStudy: '',
          firstPreference: '',
          secondaryRole: '',
          whyThisRole: '',
          pastExperience: '',
          hasOtherClubs: '',
          otherClubsDetails: '',
          timeCommitment: false,
          availableForEvents: false
        });
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying! Your application has been received successfully.
            You can track your application status using your phone number.
          </p>
          <div className="space-y-3">
            <Link href="/track" className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Track Application
            </Link>
            <button 
              onClick={() => setSuccess(false)}
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">E-CELL MET Recruitment 2025-26</h1>
            <div className="space-x-4">
              <Link href="/track" className="text-white hover:text-purple-300 transition-colors">
                Track Application
              </Link>
              {/* <Link href="/admin69" className="text-white hover:text-purple-300 transition-colors">
                Admin
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 text-white">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Where Ideas Meet Execution
            </h1>
            <p className="text-xl mb-8 leading-relaxed">
              We're assembling the dream team for E-Cell 2025–26 — innovators, hustlers, creatives, and tech wizards who don't just think outside the box... they redesign it.
            </p>
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 mb-8 inline-block">
              <p className="text-red-200 font-semibold">
                🕐 Deadline: 15th October 2025
              </p>
            </div>
            <p className="text-lg">
              Questions? Doubts? Vibes? Hit up: <br />
              <a href="mailto:new_family@ecellmet.tech" className="text-purple-300 hover:underline">
                new_family@ecellmet.tech
              </a>
            </p>
            <p className="text-sm mt-4 text-gray-300">
              P.S. – We're not looking for perfect. We're looking for passionate.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 text-red-200">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    What do we call you? *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your Full Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="(because carrier pigeons are so last century)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Are you from Nashik? *
                  </label>
                  <select
                    name="isFromNashik"
                    value={formData.isFromNashik}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Your Department / Branch *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science & Design (CSD)">Computer Science & Design (CSD)</option>
                    <option value="Automation & Robotics (A&R)">Automation & Robotics (A&R)</option>
                    <option value="Civil and Environmental Engineering (CEE)">Civil and Environmental Engineering (CEE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Year of Study *
                  </label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="FE (Energetic Soul? We love it.)">FE (Energetic Soul? We love it.)</option>
                    <option value="SE (Getting warmed up, huh?)">SE (Getting warmed up, huh?)</option>
                    <option value="TE (The sweet spot.)">TE (The sweet spot.)</option>
                    <option value="BE (Final boss energy.)">BE (Final boss energy.)</option>
                  </select>
                </div>
              </div>

              {/* Role Preferences */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Pick Your Power Role *
                  </label>
                  <select
                    name="firstPreference"
                    value={formData.firstPreference}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select First Preference</option>
                    <option value="📝 Documentation (The storytellers)">📝 Documentation (The storytellers)</option>
                    <option value="📸Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)">📸Photography/Videography (Netflix vibes)</option>
                    <option value="🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)">🎨 Design Team (Make it pretty. Make it pop.)</option>
                    <option value="🎉 Events (Anchoring & Chaos coordinator extraordinaire)">🎉 Events (Chaos coordinator extraordinaire)</option>
                    <option value="💻 Technical / Web (Code is poetry, right?)">💻 Technical / Web (Code is poetry, right?)</option>
                    <option value="⚙️ Operations (The backbone. The MVP.)">⚙️ Operations (The backbone. The MVP.)</option>
                    <option value="🤝 Marketing & Sponsorship (Bring home the bacon)">🤝 Marketing & Sponsorship (Bring home the bacon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Pick Your Secondary Role
                  </label>
                  <select
                    name="secondaryRole"
                    value={formData.secondaryRole}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Secondary Role</option>
                    <option value="📝 Documentation (The storytellers)">📝 Documentation (The storytellers)</option>
                    <option value="🎨 Design Team (Make it pretty. Make it pop.)">🎨 Design Team (Make it pretty. Make it pop.)</option>
                    <option value="🎉 Events (Chaos coordinator extraordinaire)">🎉 Events (Chaos coordinator extraordinaire)</option>
                    <option value="💻 Technical / Web (Code is poetry, right?)">💻 Technical / Web (Code is poetry, right?)</option>
                    <option value="⚙️ Operations (The backbone. The MVP.)">⚙️ Operations (The backbone. The MVP.)</option>
                    <option value="🤝 Marketing & Sponsorship (Bring home the bacon)">🤝 Marketing & Sponsorship (Bring home the bacon)</option>
                  </select>
                </div>
              </div>

              {/* Experience and Motivation */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Why this role? What's the vibe? *
                </label>
                <textarea
                  name="whyThisRole"
                  value={formData.whyThisRole}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tell us your origin story"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Flex a little *
                </label>
                <textarea
                  name="pastExperience"
                  value={formData.pastExperience}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Past experience, skills, secret talents — spill it"
                  required
                />
              </div>

              {/* Other Activities */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Already juggling other clubs? *
                </label>
                <select
                  name="hasOtherClubs"
                  value={formData.hasOtherClubs}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select</option>
                  <option value="true">✅ Yes</option>
                  <option value="false">❌ No</option>
                </select>
              </div>

              {formData.hasOtherClubs === 'true' && (
                <div>
                  <label className="block text-white font-medium mb-2">
                    If yes, spill the tea:
                  </label>
                  <textarea
                    name="otherClubsDetails"
                    value={formData.otherClubsDetails}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell us about your other commitments"
                  />
                </div>
              )}

              {/* Availability */}
              <div>
                <label className="block text-white font-medium mb-4">
                  Are you ready to dive in? (Check all that apply) *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center text-white">
                    <input
                      type="checkbox" required
                      name="timeCommitment"
                      checked={formData.timeCommitment}
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                    />
                    ⏱️ 4–6 hrs/week minimum (We're not asking for your soul... just some quality time)
                  </label>
                  <label className="flex items-center text-white">
                    <input
                      type="checkbox" required
                      name="availableForEvents"
                      checked={formData.availableForEvents}
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                    />
                    🌙 Available for late-night / off-campus events (When duty calls, you answer)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application 🚀'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
