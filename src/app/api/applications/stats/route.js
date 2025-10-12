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
          _id: '$firstPreference',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const departmentStats = await Application.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const yearStats = await Application.aggregate([
      {
        $group: {
          _id: '$yearOfStudy',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
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
      departmentStats,
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
