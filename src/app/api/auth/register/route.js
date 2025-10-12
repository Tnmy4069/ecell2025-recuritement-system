import dbConnect from '../../../../../lib/mongodb';
import Admin from '../../../../../models/Admin';

export async function POST(request) {
  try {
    await dbConnect();

    const { username, email, password } = await request.json();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      return Response.json(
        { error: 'Admin with this username or email already exists' },
        { status: 400 }
      );
    }

    // Create new admin
    const admin = new Admin({
      username,
      email,
      password,
      role: 'admin'
    });

    await admin.save();

    return Response.json(
      { 
        message: 'Admin created successfully',
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
