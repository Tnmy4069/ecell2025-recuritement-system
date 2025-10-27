const mongoose = require('mongoose');
const fs = require('fs');

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

async function debugApplications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the raw collection
    const db = mongoose.connection.db;
    const collection = db.collection('applications');
    
    // Count all documents in the collection
    const totalDocs = await collection.countDocuments();
    console.log('Total documents in applications collection:', totalDocs);
    
    // Get all documents (raw)
    const allDocs = await collection.find({}).toArray();
    console.log('Total documents found via raw query:', allDocs.length);
    
    // Check for any validation issues by trying to use the Application model
    const Application = require('./models/Application');
    
    try {
      const modelDocs = await Application.find({});
      console.log('Documents found via Application model:', modelDocs.length);
    } catch (error) {
      console.error('Error with Application model:', error.message);
    }
    
    // Check if there are any documents with different schemas
    const sampleDocs = await collection.find({}).limit(5).toArray();
    console.log('\nSample document structures:');
    sampleDocs.forEach((doc, index) => {
      console.log(`Doc ${index + 1} fields:`, Object.keys(doc));
    });
    
    // Check for documents that might not match the schema
    const docsWithoutPrimaryRole = await collection.find({ primaryRole: { $exists: false } }).toArray();
    console.log('Documents without primaryRole:', docsWithoutPrimaryRole.length);
    
    const docsWithoutFullName = await collection.find({ fullName: { $exists: false } }).toArray();
    console.log('Documents without fullName:', docsWithoutFullName.length);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugApplications();
