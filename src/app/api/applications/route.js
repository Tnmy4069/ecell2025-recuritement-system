import dbConnect from '../../../../lib/mongodb';
import Application from '../../../../models/Application';

export async function POST(request) {
  try {
    await dbConnect();

    const data = await request.json();
    
    // Check if application with this email already exists
    const existingApplication = await Application.findOne({ 
      email: data.email.toLowerCase() 
    });
    
    if (existingApplication) {
      return Response.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      );
    }

    // Convert string booleans to actual booleans
    const processedData = {
      ...data,
      isFromNashik: data.isFromNashik === 'true',
      hasOtherClubs: data.hasOtherClubs === 'true',
      email: data.email.toLowerCase()
    };

    const application = new Application(processedData);
    await application.save();

    return Response.json(
      { 
        message: 'Application submitted successfully',
        applicationId: application._id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application submission error:', error);
    return Response.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (role) {
      filter.$or = [
        { firstPreference: { $regex: role, $options: 'i' } },
        { secondaryRole: { $regex: role, $options: 'i' } }
      ];
    }
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { whatsappNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const applications = await Application.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    return Response.json({
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return Response.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
