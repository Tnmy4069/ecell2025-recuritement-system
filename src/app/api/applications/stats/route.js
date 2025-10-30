import dbConnect from '../../../../../lib/mongodb';
import Application from '../../../../../models/Application';

export async function GET() {
  try {
    await dbConnect();

    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = await Application.aggregate([
      {
        $group: {
          _id: '$primaryRole',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const branchStats = await Application.aggregate([
      {
        $group: {
          _id: '$branch',
          count: { $sum: 1 }
        }
      }
    ]);

    const yearStats = await Application.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const statusStats = stats.reduce((acc, stat) => {
      // Map 'approved' to 'selected' for counting
      const status = stat._id === 'approved' ? 'selected' : stat._id;
      acc[status] = (acc[status] || 0) + stat.count;
      return acc;
    }, {
      pending: 0,
      shortlisted: 0,
      selected: 0,
      rejected: 0
    });

    const total = await Application.countDocuments();

    return Response.json({
      total,
      statusStats,
      roleStats,
      branchStats,
      yearStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    return Response.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
