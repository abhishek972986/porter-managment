import Attendance from '../models/Attendance.js';
import { AppError } from '../middlewares/errorHandler.js';
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns';

export const generateMonthlyReport = async (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      throw new AppError('Month parameter is required (YYYY-MM)', 400);
    }

    const monthDate = parseISO(`${month}-01`);
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);

    // Get attendance data grouped by porter
    const reportData = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: 'porters',
          localField: 'porter',
          foreignField: '_id',
          as: 'porterInfo',
        },
      },
      {
        $unwind: '$porterInfo',
      },
      {
        $lookup: {
          from: 'carriers',
          localField: 'carrier',
          foreignField: '_id',
          as: 'carrierInfo',
        },
      },
      {
        $unwind: '$carrierInfo',
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'locationFrom',
          foreignField: '_id',
          as: 'fromLocationInfo',
        },
      },
      {
        $unwind: '$fromLocationInfo',
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'locationTo',
          foreignField: '_id',
          as: 'toLocationInfo',
        },
      },
      {
        $unwind: '$toLocationInfo',
      },
      {
        $group: {
          _id: '$porter',
          porterUid: { $first: '$porterInfo.uid' },
          porterName: { $first: '$porterInfo.name' },
          designation: { $first: '$porterInfo.designation' },
          totalSalary: { $sum: '$computedCost' },
          totalTrips: { $count: {} },
          trips: {
            $push: {
              date: '$date',
              carrier: '$carrierInfo.name',
              from: '$fromLocationInfo.name',
              to: '$toLocationInfo.name',
              task: '$task',
              cost: '$computedCost',
            },
          },
        },
      },
      {
        $sort: { porterName: 1 },
      },
    ]);

    // Calculate summary statistics
    const summary = {
      month,
      monthName: format(monthDate, 'MMMM yyyy'),
      totalPorters: reportData.length,
      totalPayroll: reportData.reduce((sum, porter) => sum + porter.totalSalary, 0),
      totalTrips: reportData.reduce((sum, porter) => sum + porter.totalTrips, 0),
      generatedAt: new Date(),
    };

    // Get carrier statistics
    const carrierStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: 'carriers',
          localField: 'carrier',
          foreignField: '_id',
          as: 'carrierInfo',
        },
      },
      {
        $unwind: '$carrierInfo',
      },
      {
        $group: {
          _id: '$carrier',
          carrierName: { $first: '$carrierInfo.name' },
          count: { $count: {} },
          totalCost: { $sum: '$computedCost' },
        },
      },
      {
        $sort: { carrierName: 1 },
      },
    ]);

    // Get location statistics
    const locationStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $facet: {
          fromLocations: [
            {
              $lookup: {
                from: 'locations',
                localField: 'locationFrom',
                foreignField: '_id',
                as: 'locationInfo',
              },
            },
            {
              $unwind: '$locationInfo',
            },
            {
              $group: {
                _id: '$locationFrom',
                locationName: { $first: '$locationInfo.name' },
                count: { $count: {} },
              },
            },
            {
              $sort: { count: -1 },
            },
            {
              $limit: 10,
            },
          ],
          toLocations: [
            {
              $lookup: {
                from: 'locations',
                localField: 'locationTo',
                foreignField: '_id',
                as: 'locationInfo',
              },
            },
            {
              $unwind: '$locationInfo',
            },
            {
              $group: {
                _id: '$locationTo',
                locationName: { $first: '$locationInfo.name' },
                count: { $count: {} },
              },
            },
            {
              $sort: { count: -1 },
            },
            {
              $limit: 10,
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary,
        porters: reportData,
        statistics: {
          carriers: carrierStats,
          topFromLocations: locationStats[0]?.fromLocations || [],
          topToLocations: locationStats[0]?.toLocations || [],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const monthDate = parseISO(`${currentMonth}-01`);
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);

    // Get current month stats
    const [currentMonthStats] = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalEntries: { $count: {} },
          totalCost: { $sum: '$computedCost' },
          uniquePorters: { $addToSet: '$porter' },
        },
      },
    ]);

    // Get total active porters
    const totalPorters = await Attendance.distinct('porter').countDocuments();

    // Get recent attendance entries
    const recentEntries = await Attendance.find()
      .populate('porter', 'uid name')
      .populate('carrier', 'name')
      .populate('locationFrom', 'code name')
      .populate('locationTo', 'code name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        currentMonth: {
          month: currentMonth,
          totalEntries: currentMonthStats?.totalEntries || 0,
          totalCost: currentMonthStats?.totalCost || 0,
          activePorters: currentMonthStats?.uniquePorters?.length || 0,
        },
        totalPorters,
        recentEntries,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadNominalRoll = async (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      throw new AppError('Month parameter is required (YYYY-MM)', 400);
    }

    const monthDate = parseISO(`${month}-01`);
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);

    // Aggregate attendance to compute days worked and total amount per porter
    const data = await Attendance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $lookup: {
          from: 'porters',
          localField: 'porter',
          foreignField: '_id',
          as: 'porterInfo',
        },
      },
      { $unwind: '$porterInfo' },
      {
        $group: {
          _id: '$porter',
          accountNo: { $first: '$porterInfo.accountNo' },
          name: { $first: '$porterInfo.name' },
          fatherName: { $first: '$porterInfo.fatherName' },
          daysWorked: { $count: {} },
          totalAmount: { $sum: '$computedCost' },
        },
      },
      {
        $project: {
          _id: 1,
          accountNo: 1,
          name: 1,
          fatherName: 1,
          daysWorked: 1,
          totalAmount: 1,
          perDayRate: {
            $cond: [{ $gt: ['$daysWorked', 0] }, { $round: [{ $divide: ['$totalAmount', '$daysWorked'] }, 0] }, 0],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    const { generatePorterExcel } = await import('../utils/excel/generatePorterNominalRoll.js');
    const workbook = await generatePorterExcel(
      data.map((d) => ({
        accountNo: d.accountNo,
        name: d.name,
        fatherName: d.fatherName,
        daysWorked: d.daysWorked,
        perDayRate: d.perDayRate,
        totalAmount: d.totalAmount,
      })),
      month
    );

    res.setHeader('Content-Disposition', `attachment; filename=Nominal_Roll_${month}.xlsx`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
