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
      filter.primaryRole = { $regex: role, $options: 'i' };
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
      .sort({ submittedAt: -1 })
      .lean();

    if (format === 'json') {
      // Return JSON format with proper field mappings
      const formattedApplications = applications.map(app => ({
        fullName: app.fullName || '',
        email: app.email || '',
        whatsappNumber: app.whatsappNumber || '',
        branch: app.branch || '',
        year: app.year || '',
        primaryRole: app.primaryRole || '',
        secondaryRole: app.secondaryRole || '',
        whyThisRole: app.whyThisRole || '',
        pastExperience: app.pastExperience || '',
        hasOtherClubs: app.hasOtherClubs || '',
        timeAvailability: app.timeAvailability || '',
        status: app.status || 'pending',
        adminRemarks: app.adminRemarks || '',
        feedback: app.feedback || '',
        submittedAt: app.submittedAt,
        updatedAt: app.updatedAt
      }));

      return Response.json({
        data: formattedApplications,
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
        'Branch',
        'Year',
        'Primary Role',
        'Secondary Role',
        'Why This Role',
        'Past Experience',
        'Has Other Clubs',
        'Time Availability',
        'Status',
        'Admin Remarks',
        'Feedback',
        'Submitted At',
        'Last Updated'
      ];

      const csvRows = applications.map(app => [
        app.fullName || '',
        app.email || '',
        app.whatsappNumber || '',
        app.branch || '',
        app.year || '',
        app.primaryRole || '',
        app.secondaryRole || '',
        `"${(app.whyThisRole || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${(app.pastExperience || '').replace(/"/g, '""')}"`,
        app.hasOtherClubs || '',
        `"${(app.timeAvailability || '').replace(/"/g, '""')}"`,
        app.status || 'pending',
        `"${(app.adminRemarks || '').replace(/"/g, '""')}"`,
        `"${(app.feedback || '').replace(/"/g, '""')}"`,
        app.submittedAt ? new Date(app.submittedAt).toLocaleString() : '',
        app.updatedAt ? new Date(app.updatedAt).toLocaleString() : ''
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
