import dbConnect from '../../../../../lib/mongodb';
import Admin from '../../../../../models/Admin';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();

    const { username, password } = await request.json();

    // Find admin by username
    const admin = await Admin.findOne({ username, isActive: true });

    if (!admin) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id,
        username: admin.username,
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return Response.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
