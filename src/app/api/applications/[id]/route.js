import dbConnect from '../../../../../lib/mongodb';
import Application from '../../../../../models/Application';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const application = await Application.findById(id);
    
    if (!application) {
      return Response.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return Response.json(application);
  } catch (error) {
    console.error('Fetch application error:', error);
    return Response.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const updateData = await request.json();
    
    const application = await Application.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!application) {
      return Response.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    return Response.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const application = await Application.findByIdAndDelete(id);
    
    if (!application) {
      return Response.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    return Response.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
