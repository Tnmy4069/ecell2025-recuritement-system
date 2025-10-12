import dbConnect from '../../../../../lib/mongodb';
import Application from '../../../../../models/Application';

export async function POST(request) {
  try {
    await dbConnect();

    const { whatsappNumber } = await request.json();

    if (!whatsappNumber) {
      return Response.json(
        { error: 'WhatsApp number is required' },
        { status: 400 }
      );
    }

    const application = await Application.findOne({ 
      whatsappNumber: whatsappNumber.trim() 
    }).select('fullName email status submittedAt lastUpdated adminRemarks feedback');

    if (!application) {
      return Response.json(
        { error: 'No application found with this WhatsApp number' },
        { status: 404 }
      );
    }

    return Response.json({
      application: {
        fullName: application.fullName,
        email: application.email,
        status: application.status,
        submittedAt: application.submittedAt,
        lastUpdated: application.lastUpdated,
        adminRemarks: application.adminRemarks || '',
        feedback: application.feedback || ''
      }
    });
  } catch (error) {
    console.error('Track application error:', error);
    return Response.json(
      { error: 'Failed to track application' },
      { status: 500 }
    );
  }
}
