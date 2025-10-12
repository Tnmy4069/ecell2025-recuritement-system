import dbConnect from '../lib/mongodb.js';
import Admin from '../models/Admin.js';

async function createDefaultAdmin() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Default admin already exists');
      return;
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@ecellmet.tech',
      password: 'admin123',
      role: 'super_admin'
    });

    await admin.save();
    console.log('Default admin created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

createDefaultAdmin();
