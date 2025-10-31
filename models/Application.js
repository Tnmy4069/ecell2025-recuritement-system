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
  
  // Academic Information
  branch: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  
  // Role Preferences
  primaryRole: {
    type: String,
    required: true,
    trim: true
  },
  secondaryRole: {
    type: String,
    trim: true
  },
  
  // Experience and Motivation
  whyThisRole: {
    type: String,
    trim: true
  },
  pastExperience: {
    type: String,
    trim: true
  },
  
  // Other Activities
  hasOtherClubs: {
    type: String,
    trim: true
  },
  
  // Availability
  timeAvailability: {
    type: String,
    trim: true
  },
  
  // Admin Fields
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'selected', 'rejected'],
    default: 'pending'
  },
  adminRemarks: {
    type: String,
    trim: true
  },
  feedback: {
    type: String,
    trim: true
  },
  
  // Timestamps
  submittedAt: {
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
ApplicationSchema.index({ branch: 1 });
ApplicationSchema.index({ year: 1 });
ApplicationSchema.index({ primaryRole: 1 });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
