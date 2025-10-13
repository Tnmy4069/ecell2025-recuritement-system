'use client';

import { useState } from 'react';

export default function MultipleEntryFormModal({ onClose, onSubmit }) {
  const [entries, setEntries] = useState([
    {
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
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

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

  const addEntry = () => {
    setEntries([...entries, {
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
    }]);
  };

  const removeEntry = (index) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const successful = [];
    const failed = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      try {
        const success = await onSubmit(entry);
        if (success) {
          successful.push({ index: i + 1, ...entry });
        } else {
          failed.push({ index: i + 1, ...entry, error: 'Failed to create' });
        }
      } catch (error) {
        failed.push({ index: i + 1, ...entry, error: error.message });
      }
    }

    setResults({
      successful: successful.length,
      failed: failed.length,
      total: entries.length,
      failedEntries: failed
    });
    setLoading(false);
  };

  if (results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📝 Multiple Entry Results</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-100 border border-blue-300 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📊 Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{results.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>

              {results.failedEntries.length > 0 && (
                <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Failed Entries</h3>
                  <div className="space-y-2">
                    {results.failedEntries.map((entry, index) => (
                      <div key={index} className="text-sm">
                        <strong>Entry {entry.index}:</strong> {entry.fullName} ({entry.email}) - {entry.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">📝 Multiple Entry Form</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmitAll} className="space-y-6">
            {entries.map((entry, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Entry #{index + 1}</h3>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={entry.fullName}
                      onChange={(e) => handleEntryChange(index, 'fullName', e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={entry.email}
                      onChange={(e) => handleEntryChange(index, 'email', e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">WhatsApp Number *</label>
                    <input
                      type="tel"
                      value={entry.whatsappNumber}
                      onChange={(e) => handleEntryChange(index, 'whatsappNumber', e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Department *</label>
                    <select
                      value={entry.department}
                      onChange={(e) => handleEntryChange(index, 'department', e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Year *</label>
                    <select
                      value={entry.yearOfStudy}
                      onChange={(e) => handleEntryChange(index, 'yearOfStudy', e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">First Preference *</label>
                    <select
                      value={entry.firstPreference}
                      onChange={(e) => handleEntryChange(index, 'firstPreference', e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Secondary Role</label>
                    <select
                      value={entry.secondaryRole}
                      onChange={(e) => handleEntryChange(index, 'secondaryRole', e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select Role (Optional)</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium mb-1">Why this role? *</label>
                    <textarea
                      value={entry.whyThisRole}
                      onChange={(e) => handleEntryChange(index, 'whyThisRole', e.target.value)}
                      required
                      rows="2"
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Past Experience *</label>
                    <textarea
                      value={entry.pastExperience}
                      onChange={(e) => handleEntryChange(index, 'pastExperience', e.target.value)}
                      required
                      rows="2"
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={entry.isFromNashik}
                        onChange={(e) => handleEntryChange(index, 'isFromNashik', e.target.checked)}
                        className="mr-2"
                      />
                      From Nashik
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={entry.hasOtherClubs}
                        onChange={(e) => handleEntryChange(index, 'hasOtherClubs', e.target.checked)}
                        className="mr-2"
                      />
                      Other clubs member
                    </label>
                  </div>

                  {entry.hasOtherClubs && (
                    <div className="md:col-span-3">
                      <label className="block font-medium mb-1">Other Clubs Details</label>
                      <textarea
                        value={entry.otherClubsDetails}
                        onChange={(e) => handleEntryChange(index, 'otherClubsDetails', e.target.value)}
                        rows="2"
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={addEntry}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ➕ Add Another Entry
              </button>

              <div className="flex space-x-4">
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
                  {loading ? 'Creating Applications...' : `Create ${entries.length} Application${entries.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
