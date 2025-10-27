'use client';

import { useState } from 'react';

export default function CreateApplicationModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    branch: '',
    year: '',
    primaryRole: '',
    secondaryRole: '',
    whyThisRole: '',
    flexALittle: '',
    alreadyJugglingOtherClubs: '',
    timeAvailability: ''
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    'Events',
    'Design',
    'Technical',
    'Operations',
    'Marketing & Sponsorship',
    'Documentation',
    'Media'
  ];

  const branches = ['CSD', 'AnR', 'CEE'];
  const years = ['FE', 'SE', 'TE', 'BE'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating application:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Create New Application</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block font-medium mb-2">Branch *</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">Year *</label>
                  <select
                    name="year"
                    value={formData.year}
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

                <div>
                  <label className="block font-medium mb-2">Primary Role *</label>
                  <select
                    name="primaryRole"
                    value={formData.primaryRole}
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
                  <label className="block font-medium mb-2">Already juggling other clubs?</label>
                  <input
                    type="text"
                    name="alreadyJugglingOtherClubs"
                    value={formData.alreadyJugglingOtherClubs}
                    onChange={handleChange}
                    placeholder="Yes / No / Club details"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Experience & Motivation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Experience & Motivation</h3>
              
              <div>
                <label className="block font-medium mb-2">Why this role? What&apos;s the vibe?</label>
                <textarea
                  name="whyThisRole"
                  value={formData.whyThisRole}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Flex a little.</label>
                <textarea
                  name="flexALittle"
                  value={formData.flexALittle}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Availability</h3>
              
              <div>
                <label className="block font-medium mb-2">Time Availability</label>
                <input
                  type="text"
                  name="timeAvailability"
                  value={formData.timeAvailability}
                  onChange={handleChange}
                  placeholder="e.g., 4-6 hr, Available"
                  className="w-full border rounded px-3 py-2"
                />
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
