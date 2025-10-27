import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import Application from '../models/Application.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecell-recruitment');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const importCSVData = async () => {
  try {
    await connectDB();
    
    const csvFilePath = path.join(__dirname, '..', 'Ecell MET Responses 25-26(Sheet1).csv');
    const applications = [];
    
    console.log('Reading CSV file...');
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Skip empty rows
          if (!row['Full Name'] || row['Full Name'].trim() === '') {
            return;
          }
          
          const application = {
            fullName: row['Full Name'] || '',
            email: row['Email address'] || '',
            whatsappNumber: row['Whatsapp Number  '] || '',
            branch: row['Branch '] || '',
            year: row['Year'] || '',
            primaryRole: row['Primary Role'] || '',
            secondaryRole: row[' Secondary Role  '] || undefined, // Set to undefined for empty values
            whyThisRole: row["Why this role? What's the vibe?  "] || '',
            flexALittle: row['Flex a little.  '] || '',
            alreadyJugglingOtherClubs: row['Already juggling other clubs?  '] || '',
            timeAvailability: row['Time Availability '] || '',
            status: row['status'] || 'pending',
            adminRemarks: row['adminRemarks'] || ''
          };
          
          // Remove undefined values to let mongoose use default values
          Object.keys(application).forEach(key => {
            if (application[key] === undefined || application[key] === '') {
              if (key === 'secondaryRole') {
                delete application[key]; // Remove completely for optional enum fields
              }
            }
          });
          
          applications.push(application);
        })
        .on('end', async () => {
          try {
            console.log(`Found ${applications.length} applications to import`);
            
            // Clear existing data
            await Application.deleteMany({});
            console.log('Cleared existing applications');
            
            // Insert new data
            if (applications.length > 0) {
              await Application.insertMany(applications);
              console.log(`Successfully imported ${applications.length} applications`);
            }
            
            // Show summary
            const stats = await Application.aggregate([
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ]);
            
            console.log('\nImport Summary:');
            stats.forEach(stat => {
              console.log(`${stat._id}: ${stat.count} applications`);
            });
            
            await mongoose.connection.close();
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error importing CSV data:', error);
    process.exit(1);
  }
};

// Run the import
importCSVData()
  .then(() => {
    console.log('\nCSV import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
