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

    // Process the data
    const processedData = {
      ...data,
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
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (role) {
      filter.$or = [
        { primaryRole: { $regex: role, $options: 'i' } },
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

    console.log('Filter:', JSON.stringify(filter));

    const applications = await Application.find(filter)
      .sort({ submittedAt: -1 });

    console.log('Applications found:', applications.length);

    const total = applications.length;

    return Response.json({
      applications,
      total
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return Response.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
