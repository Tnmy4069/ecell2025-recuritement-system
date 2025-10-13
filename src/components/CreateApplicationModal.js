'use client';

import { useState } from 'react';

export default function CreateApplicationModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    isFromNashik: false,
    department: '',
    yearOfStudy: '',
    firstPreference: '',
    secondaryRole: '',
    whyThisRole: '',
    pastExperience: '',
    hasOtherClubs: false,
    otherClubsDetails: '',
    projectsWorkedOn: '',
    availabilityPerWeek: '',
    timeCommitment: true,
    availableForEvents: true
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    '📝 Documentation (The storytellers)',
    '🤝 Marketing & Sponsorship (Bring home the bacon)',
    '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
    '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
    '💻 Technical / Web (Code is poetry, right?)',
    '⚙️ Operations (The backbone. The MVP.)',
    '📸Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)'
  ];

  const departments = [
    'Computer Engineering',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Electrical Engineering',
    'Instrumentation Engineering',
    'Biotechnology',
    'Production Engineering',
    'Other'
  ];

  const years = ['First Year', 'Second Year', 'Third Year', 'Final Year'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">➕ Create New Application</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div>
                  <label className="block font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">WhatsApp Number *</label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFromNashik"
                      checked={formData.isFromNashik}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    From Nashik
                  </label>
                </div>

                <div>
                  <label className="block font-medium mb-2">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">Year of Study *</label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Role Preferences</h3>
                
                <div>
                  <label className="block font-medium mb-2">First Preference *</label>
                  <select
                    name="firstPreference"
                    value={formData.firstPreference}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">Secondary Role</label>
                  <select
                    name="secondaryRole"
                    value={formData.secondaryRole}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Secondary Role (Optional)</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasOtherClubs"
                      checked={formData.hasOtherClubs}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Member of other clubs
                  </label>
                </div>

                {formData.hasOtherClubs && (
                  <div>
                    <label className="block font-medium mb-2">Other Clubs Details</label>
                    <textarea
                      name="otherClubsDetails"
                      value={formData.otherClubsDetails}
                      onChange={handleChange}
                      rows="3"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-medium mb-2">Projects Worked On</label>
                  <textarea
                    name="projectsWorkedOn"
                    value={formData.projectsWorkedOn}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Availability Per Week</label>
                  <input
                    type="text"
                    name="availabilityPerWeek"
                    value={formData.availabilityPerWeek}
                    onChange={handleChange}
                    placeholder="e.g., 10-15 hours"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Experience & Motivation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Experience & Motivation</h3>
              
              <div>
                <label className="block font-medium mb-2">Why this role? *</label>
                <textarea
                  name="whyThisRole"
                  value={formData.whyThisRole}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Past Experience *</label>
                <textarea
                  name="pastExperience"
                  value={formData.pastExperience}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Commitment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Commitment</h3>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="timeCommitment"
                    checked={formData.timeCommitment}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Can commit 4-6 hours per week
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="availableForEvents"
                    checked={formData.availableForEvents}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Available for events
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
