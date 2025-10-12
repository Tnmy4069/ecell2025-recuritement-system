import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true
  },
  isFromNashik: {
    type: Boolean,
    required: true
  },
  
  // Academic Information
  department: {
    type: String,
    required: true,
    enum: [
      'Computer Science & Design (CSD)',
      'Automation & Robotics (A&R)',
      'Civil and Environmental Engineering (CEE)'
    ]
  },
  yearOfStudy: {
    type: String,
    required: true,
    enum: [
      'FE (Energetic Soul? We love it.)',
      'SE (Getting warmed up, huh?)',
      'TE (The sweet spot.)',
      'BE (Final boss energy.)'
    ]
  },
  
  // Role Preferences
  firstPreference: {
    type: String,
    required: true,
    enum: [
      '📝 Documentation (The storytellers)',
      '📸Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)',
      '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
      '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
      '💻 Technical / Web (Code is poetry, right?)',
      '⚙️ Operations (The backbone. The MVP.)',
      '🤝 Marketing & Sponsorship (Bring home the bacon)'
    ]
  },
  secondaryRole: {
    type: String,
    enum: [
      '📝 Documentation (The storytellers)',
      '🎨 Design Team (Make it pretty. Make it pop.)',
      '🎉 Events (Chaos coordinator extraordinaire)',
      '💻 Technical / Web (Code is poetry, right?)',
      '⚙️ Operations (The backbone. The MVP.)',
      '🤝 Marketing & Sponsorship (Bring home the bacon)'
    ]
  },
  
  // Experience and Motivation
  whyThisRole: {
    type: String,
    required: true
  },
  pastExperience: {
    type: String,
    required: true
  },
  
  // Other Activities
  hasOtherClubs: {
    type: Boolean,
    required: true
  },
  otherClubsDetails: {
    type: String,
    default: ''
  },
  
  // Projects and Experience
  projectsWorkedOn: {
    type: String,
    default: ''
  },
  
  // Availability
  availabilityPerWeek: {
    type: String,
    default: ''
  },
  timeCommitment: {
    type: Boolean,
    required: true,
    default: false
  },
  availableForEvents: {
    type: Boolean,
    required: true,
    default: false
  },
  
  // Admin Fields
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'selected', 'rejected'],
    default: 'pending'
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  feedback: {
    type: String,
    default: ''
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient searching
ApplicationSchema.index({ email: 1 });
ApplicationSchema.index({ whatsappNumber: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ submittedAt: -1 });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
