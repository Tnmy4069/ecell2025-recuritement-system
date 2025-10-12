import dbConnect from '../../../../../lib/mongodb';
import Application from '../../../../../models/Application';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or json
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const search = searchParams.get('search') || '';

    // Build filter query
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (role) {
      filter.firstPreference = { $regex: role, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { whatsappNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch all applications matching filter
    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'json') {
      // Return JSON format
      return Response.json({
        data: applications,
        exportedAt: new Date().toISOString(),
        totalRecords: applications.length,
        filters: { status, role, search }
      });
    } else {
      // Return CSV format
      const csvHeaders = [
        'Full Name',
        'Email',
        'WhatsApp Number',
        'From Nashik',
        'Department', 
        'Year of Study',
        'First Preference',
        'Secondary Role',
        'Why This Role',
        'Past Experience',
        'Has Other Clubs',
        'Other Clubs Details',
        'Projects Worked On',
        'Availability Per Week',
        'Time Commitment',
        'Available For Events',
        'Status',
        'Admin Remarks',
        'Feedback',
        'Applied At'
      ];

      const csvRows = applications.map(app => [
        app.fullName || '',
        app.email || '',
        app.whatsappNumber || '',
        app.isFromNashik ? 'Yes' : 'No',
        app.department || '',
        app.yearOfStudy || '',
        app.firstPreference || '',
        app.secondaryRole || '',
        `"${(app.whyThisRole || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${(app.pastExperience || '').replace(/"/g, '""')}"`,
        app.hasOtherClubs ? 'Yes' : 'No',
        `"${(app.otherClubsDetails || '').replace(/"/g, '""')}"`,
        `"${(app.projectsWorkedOn || '').replace(/"/g, '""')}"`,
        app.availabilityPerWeek || '',
        app.timeCommitment ? 'Yes' : 'No',
        app.availableForEvents ? 'Yes' : 'No',
        app.status || 'pending',
        `"${(app.adminRemarks || '').replace(/"/g, '""')}"`,
        `"${(app.feedback || '').replace(/"/g, '""')}"`,
        app.createdAt ? new Date(app.createdAt).toLocaleString() : ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ecell_applications_${timestamp}.csv`;

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    return Response.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
