const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');

// Read .env.local file manually
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const lines = envFile.split('\n');
  lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Application Schema matching the CSV structure
const applicationSchema = new mongoose.Schema({
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
  primaryRole: {
    type: String,
    required: true,
    trim: true
  },
  secondaryRole: {
    type: String,
    trim: true
  },
  whyThisRole: {
    type: String,
    trim: true
  },
  pastExperience: {
    type: String,
    trim: true
  },
  hasOtherClubs: {
    type: String,
    trim: true
  },
  timeAvailability: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'selected', 'rejected'],
    default: 'pending'
  },
  adminRemarks: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Application = mongoose.model('Application', applicationSchema);

async function deleteAndImportApplications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing applications
    const deleteResult = await Application.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing applications`);

    // Read and parse CSV file
    const applications = [];
    const csvFilePath = 'Ecell MET Responses 25-26(Sheet1).csv';
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Skip empty rows
          if (!row['Full Name'] || !row['Email address']) {
            return;
          }

          const application = {
            fullName: row['Full Name'] || '',
            email: row['Email address'] || '',
            whatsappNumber: row['Whatsapp Number  '] || '',
            branch: row['Branch '] || '',
            year: row['Year'] || '',
            primaryRole: row['Primary Role'] || '',
            secondaryRole: row[' Secondary Role  '] || '',
            whyThisRole: row['Why this role? What\'s the vibe?  '] || '',
            pastExperience: row['Flex a little.  '] || '',
            hasOtherClubs: row['Already juggling other clubs?  '] || '',
            timeAvailability: row['Time Availability '] || '',
            status: row['status'] || 'pending',
            adminRemarks: row['adminRemarks'] || ''
          };

          applications.push(application);
        })
        .on('end', async () => {
          try {
            console.log(`Parsed ${applications.length} applications from CSV`);
            
            // Insert all applications
            if (applications.length > 0) {
              const insertResult = await Application.insertMany(applications);
              console.log(`Successfully imported ${insertResult.length} applications`);
            }
            
            await mongoose.disconnect();
            console.log('Import completed successfully');
            resolve();
          } catch (error) {
            console.error('Error during import:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        });
    });

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

deleteAndImportApplications();
