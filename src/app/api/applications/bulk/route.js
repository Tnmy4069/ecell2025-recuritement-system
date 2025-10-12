import dbConnect from '../../../../../lib/mongodb';
import Application from '../../../../../models/Application';
import { parse } from 'csv-parse';

// Flexible column mapping - handles various column names and formats
const COLUMN_MAPPINGS = {
  fullName: ['fullName', 'full_name', 'name', 'student_name', 'studentName', 'Full Name'],
  email: ['email', 'emailId', 'email_id', 'emailAddress', 'email_address', 'Email', 'Email ID'],
  whatsappNumber: ['whatsappNumber', 'whatsapp_number', 'phone', 'phoneNumber', 'phone_number', 'mobile', 'WhatsApp Number', 'Phone Number'],
  isFromNashik: ['isFromNashik', 'is_from_nashik', 'fromNashik', 'from_nashik', 'nashik', 'From Nashik', 'Is From Nashik'],
  department: ['department', 'dept', 'branch', 'course', 'Department', 'Branch'],
  yearOfStudy: ['yearOfStudy', 'year_of_study', 'year', 'currentYear', 'current_year', 'Year of Study', 'Year'],
  firstPreference: ['firstPreference', 'first_preference', 'preference1', 'role1', 'primaryRole', 'primary_role', 'First Preference', 'First Choice'],
  secondaryRole: ['secondaryRole', 'secondary_role', 'preference2', 'role2', 'secondChoice', 'second_choice', 'Secondary Role', 'Second Preference'],
  whyThisRole: ['whyThisRole', 'why_this_role', 'whyJoinEcell', 'why_join_ecell', 'motivation', 'reason', 'Why This Role', 'Why Join E-Cell'],
  pastExperience: ['pastExperience', 'past_experience', 'relevantExperience', 'relevant_experience', 'experience', 'skills', 'Past Experience', 'Relevant Experience'],
  hasOtherClubs: ['hasOtherClubs', 'has_other_clubs', 'otherClubs', 'other_clubs', 'clubs', 'Other Clubs', 'Has Other Clubs'],
  otherClubsDetails: ['otherClubsDetails', 'other_clubs_details', 'clubDetails', 'club_details', 'Other Clubs Details'],
  projectsWorkedOn: ['projectsWorkedOn', 'projects_worked_on', 'projects', 'project_experience', 'Projects Worked On', 'Projects'],
  availabilityPerWeek: ['availabilityPerWeek', 'availability_per_week', 'availability', 'timeCommitment', 'time_commitment', 'Availability Per Week', 'Time Commitment'],
  status: ['status', 'application_status', 'Status'],
  adminRemarks: ['adminRemarks', 'admin_remarks', 'remarks', 'Admin Remarks'],
  feedback: ['feedback', 'comments', 'Feedback', 'Comments']
};

// Function to find the best matching column name
function findColumnMatch(headers, fieldName) {
  const possibleNames = COLUMN_MAPPINGS[fieldName] || [fieldName];
  
  // First try exact matches (case-sensitive)
  for (const possibleName of possibleNames) {
    if (headers.includes(possibleName)) {
      return possibleName;
    }
  }
  
  // Then try case-insensitive matches
  for (const possibleName of possibleNames) {
    const match = headers.find(header => 
      header.toLowerCase().trim() === possibleName.toLowerCase().trim()
    );
    if (match) {
      return match;
    }
  }
  
  // Finally try partial matches
  for (const possibleName of possibleNames) {
    const match = headers.find(header => 
      header.toLowerCase().includes(possibleName.toLowerCase()) ||
      possibleName.toLowerCase().includes(header.toLowerCase())
    );
    if (match) {
      return match;
    }
  }
  
  return null;
}

// Function to normalize boolean values
function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return ['true', 'yes', '1', 'y', 'on'].includes(normalized);
  }
  return false;
}

// Function to normalize role values (handle emoji issues)
function normalizeRoleValue(value) {
  if (!value) return '';
  
  const roleMap = {
    // Handle broken emoji characters
    '?? Documentation (The storytellers)': '📝 Documentation (The storytellers)',
    '?? Marketing & Sponsorship (Bring home the bacon)': '🤝 Marketing & Sponsorship (Bring home the bacon)', 
    '?? Events (Chaos coordinator extraordinaire)': '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
    '?? Events (Anchoring & Chaos coordinator extraordinaire)': '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
    '?? Design Team (Make it pretty. Make it pop.)': '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
    '?? Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)': '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
    '?? Technical / Web (Code is poetry, right?)': '💻 Technical / Web (Code is poetry, right?)',
    '?? Operations (The backbone. The MVP.)': '⚙️ Operations (The backbone. The MVP.)',
    '??Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)': '📸Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)',
    
    // Also handle variations without emojis
    'Documentation (The storytellers)': '📝 Documentation (The storytellers)',
    'Marketing & Sponsorship (Bring home the bacon)': '🤝 Marketing & Sponsorship (Bring home the bacon)',
    'Events (Chaos coordinator extraordinaire)': '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
    'Events (Anchoring & Chaos coordinator extraordinaire)': '🎉 Events (Anchoring & Chaos coordinator extraordinaire)',
    'Design Team (Make it pretty. Make it pop.)': '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
    'Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)': '🎨 Design Team (Make it pretty. Make it pop. CANVA or VideoEditing Must)',
    'Technical / Web (Code is poetry, right?)': '💻 Technical / Web (Code is poetry, right?)',
    'Operations (The backbone. The MVP.)': '⚙️ Operations (The backbone. The MVP.)',
    'Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)': '📸Photography/Videography ( click photos & videos that made everyone look like startup founders in a Netflix documentary)'
  };
  
  // Try exact match first
  if (roleMap[value]) {
    return roleMap[value];
  }
  
  // Try partial match
  for (const [key, mappedValue] of Object.entries(roleMap)) {
    if (value.includes(key) || key.includes(value)) {
      return mappedValue;
    }
  }
  
  return value;
}

export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    
    return new Promise((resolve) => {
      const results = [];
      const errors = [];
      let columnMapping = {};

      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, async (err, records) => {
        if (err) {
          resolve(Response.json(
            { error: 'Failed to parse CSV file' },
            { status: 400 }
          ));
          return;
        }

        try {
          // If no records, return early
          if (!records || records.length === 0) {
            resolve(Response.json({
              message: 'No records found in CSV file',
              successful: 0,
              errors: 0,
              errorDetails: []
            }));
            return;
          }

          // Build column mapping from the first record's headers
          const headers = Object.keys(records[0]);
          
          // Map our required fields to actual CSV columns
          for (const fieldName of Object.keys(COLUMN_MAPPINGS)) {
            const matchedColumn = findColumnMatch(headers, fieldName);
            if (matchedColumn) {
              columnMapping[fieldName] = matchedColumn;
            }
          }

          console.log('Column mapping detected:', columnMapping);

          for (let i = 0; i < records.length; i++) {
            const record = records[i];
            
            try {
              // Extract data using flexible column mapping
              const fullName = record[columnMapping.fullName] || '';
              const email = record[columnMapping.email] || '';
              const whatsappNumber = record[columnMapping.whatsappNumber] || '';
              const isFromNashik = normalizeBoolean(record[columnMapping.isFromNashik]);
              const department = record[columnMapping.department] || '';
              const yearOfStudy = record[columnMapping.yearOfStudy] || '';
              const firstPreference = normalizeRoleValue(record[columnMapping.firstPreference] || '');
              const secondaryRole = normalizeRoleValue(record[columnMapping.secondaryRole] || '');
              const whyThisRole = record[columnMapping.whyThisRole] || '';
              const pastExperience = record[columnMapping.pastExperience] || 'No prior experience';
              const hasOtherClubs = normalizeBoolean(record[columnMapping.hasOtherClubs]);

              // Validate required fields with better error messages
              const requiredFields = [
                { field: 'fullName', value: fullName },
                { field: 'email', value: email },
                { field: 'whatsappNumber', value: whatsappNumber },
                { field: 'department', value: department },
                { field: 'yearOfStudy', value: yearOfStudy },
                { field: 'firstPreference', value: firstPreference },
                { field: 'whyThisRole', value: whyThisRole || 'Interested in contributing to E-Cell' },
                { field: 'pastExperience', value: pastExperience || 'No prior experience' }
              ];
              
              const missingFields = requiredFields.filter(({ value }) => !value || value.trim() === '');
              if (missingFields.length > 0) {
                errors.push(`Row ${i + 2}: Missing required fields: ${missingFields.map(f => f.field).join(', ')}. Email: ${email || 'N/A'}`);
                continue;
              }

              // Check if application already exists
              const existingApplication = await Application.findOne({ 
                email: email.toLowerCase().trim()
              });
              
              if (existingApplication) {
                errors.push(`Row ${i + 2}: Application with email '${email}' already exists`);
                continue;
              }

              // Process data with flexible field extraction and defaults
              const processedData = {
                fullName: fullName.trim(),
                email: email.toLowerCase().trim(),
                whatsappNumber: whatsappNumber.trim(),
                isFromNashik,
                department: department.trim(),
                yearOfStudy: yearOfStudy.trim(),
                firstPreference: firstPreference.trim(),
                secondaryRole: secondaryRole.trim(),
                whyThisRole: (whyThisRole || 'Interested in contributing to E-Cell').trim(),
                pastExperience: (pastExperience || 'No prior experience').trim(),
                hasOtherClubs,
                otherClubsDetails: record[columnMapping.otherClubsDetails] || '',
                projectsWorkedOn: record[columnMapping.projectsWorkedOn] || '',
                availabilityPerWeek: record[columnMapping.availabilityPerWeek] || '',
                timeCommitment: true, // Default to true for bulk uploads
                availableForEvents: true, // Default to true for bulk uploads
                status: record[columnMapping.status] || 'pending',
                adminRemarks: record[columnMapping.adminRemarks] || '',
                feedback: record[columnMapping.feedback] || ''
              };

              const application = new Application(processedData);
              await application.save();
              results.push(application._id);

            } catch (recordError) {
              errors.push(`Row ${i + 2}: ${recordError.message}`);
            }
          }

          resolve(Response.json({
            message: `Bulk upload completed`,
            successful: results.length,
            errors: errors.length,
            errorDetails: errors,
            columnMapping: columnMapping // Include detected mapping for debugging
          }));

        } catch (error) {
          console.error('Processing error:', error);
          resolve(Response.json(
            { error: 'Failed to process applications' },
            { status: 500 }
          ));
        }
      });
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return Response.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    );
  }
}
