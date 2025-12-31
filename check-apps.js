const { MongoClient } = require('mongodb');

async function checkApplications() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable in .env file');
  }
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('applications');
    
    const count = await collection.countDocuments();
    console.log(`📊 Current applications in database: ${count}`);
    
    if (count > 0) {
      const latestApps = await collection.find({}).limit(5).toArray();
      console.log('\n📝 Latest applications:');
      latestApps.forEach((app, index) => {
        console.log(`${index + 1}. ${app.fullName} - ${app.email} - ${app.firstPreference}`);
      });
    }
    
    await client.close();
  } catch (error) {
    console.error('❌ Error checking applications:', error.message);
  }
}

checkApplications();
