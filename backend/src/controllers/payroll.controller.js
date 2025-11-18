import Attendance from '../models/Attendance.js';
import Porter from '../models/Porter.js';
import Payment from '../models/Payment.js';
import { logActivity } from '../utils/activityLogger.js';
import { AppError } from '../middlewares/errorHandler.js';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

export const getMonthlyPayroll = async (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      throw new AppError('Month parameter is required (YYYY-MM)', 400);
    }

    const monthDate = parseISO(`${month}-01`);
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);

    // Aggregate payroll data
    const payrollData = await Attendance.aggregate([
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
          _id: '$porter',
          totalSalary: { $sum: '$computedCost' },
          totalTrips: { $count: {} },
          trips: {
            $push: {
              date: '$date',
              cost: '$computedCost',
              carrier: '$carrier',
              from: '$locationFrom',
              to: '$locationTo',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'porters',
          localField: '_id',
          foreignField: '_id',
          as: 'porter',
        },
      },
      {
        $unwind: '$porter',
      },
      {
        $project: {
          _id: 0,
          porterId: '$_id',
          porterUid: '$porter.uid',
          porterName: '$porter.name',
          designation: '$porter.designation',
          totalSalary: 1,
          totalTrips: 1,
        },
      },
      {
        $sort: { porterName: 1 },
      },
    ]);

    const totalPayroll = payrollData.reduce((sum, porter) => sum + porter.totalSalary, 0);

    res.json({
      success: true,
      data: {
        month,
        payroll: payrollData,
        summary: {
          totalPorters: payrollData.length,
          totalPayroll,
          totalTrips: payrollData.reduce((sum, porter) => sum + porter.totalTrips, 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPorterPayroll = async (req, res, next) => {
  try {
    const { porterId } = req.params;
    const { month } = req.query;

    if (!month) {
      throw new AppError('Month parameter is required (YYYY-MM)', 400);
    }

    const porter = await Porter.findById(porterId);
    if (!porter) {
      throw new AppError('Porter not found', 404);
    }

    const monthDate = parseISO(`${month}-01`);
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);

    const attendance = await Attendance.find({
      porter: porterId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate('carrier', 'name capacityKg')
      .populate('locationFrom', 'code name')
      .populate('locationTo', 'code name')
      .sort({ date: 1 });

    const totalSalary = attendance.reduce((sum, entry) => sum + entry.computedCost, 0);

    const year = monthDate.getUTCFullYear();
    const mon = monthDate.getUTCMonth() + 1;
    const payment = await Payment.findOne({ porter: porterId, year, month: mon });

    res.json({
      success: true,
      data: {
        porter: {
          id: porter._id,
          uid: porter.uid,
          name: porter.name,
          designation: porter.designation,
        },
        month,
        totalSalary,
        totalTrips: attendance.length,
        trips: attendance,
        payment: payment
          ? {
              isPaid: payment.isPaid,
              amount: payment.amount,
              paidAt: payment.paidAt,
              notes: payment.notes,
            }
          : {
              isPaid: false,
              amount: 0,
              paidAt: null,
              notes: '',
            },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const setPorterPaymentStatus = async (req, res, next) => {
  try {
    const { porterId } = req.params;
    const { month, isPaid, amount, notes } = req.body || {};

    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new AppError('Month parameter is required (YYYY-MM)', 400);
    }

    const porter = await Porter.findById(porterId);
    if (!porter) {
      throw new AppError('Porter not found', 404);
    }

    const monthDate = parseISO(`${month}-01`);
    const year = monthDate.getUTCFullYear();
    const mon = monthDate.getUTCMonth() + 1;

    // Amount is the total amount paid (frontend handles the addition)
    const finalAmount = typeof amount === 'number' ? amount : 0;

    const update = {
      porter: porterId,
      year,
      month: mon,
      amount: finalAmount,
      isPaid: finalAmount > 0,
      notes: notes || '',
      updatedBy: req.user?._id,
      paidAt: new Date(),
    };

    const payment = await Payment.findOneAndUpdate(
      { porter: porterId, year, month: mon },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

      // Log activity
      try {
        await logActivity(
          'payroll_paid',
          `Payment updated for ${porter.name} for ${month}: Total paid ${finalAmount}`,
          req.user?._id,
          {
            porterId,
            month,
            totalPaid: finalAmount,
          }
        );
      } catch {}

    res.json({
      success: true,
      data: {
        payment: {
          isPaid: payment.isPaid,
          amount: payment.amount,
          paidAt: payment.paidAt,
          notes: payment.notes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPayrollSummary = async (req, res, next) => {
  try {
    const { startMonth, endMonth } = req.query;

    if (!startMonth || !endMonth) {
      throw new AppError('Start and end month parameters are required (YYYY-MM)', 400);
    }

    const startDate = startOfMonth(parseISO(`${startMonth}-01`));
    const endDate = endOfMonth(parseISO(`${endMonth}-01`));

    const summary = await Attendance.aggregate([
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
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalCost: { $sum: '$computedCost' },
          totalTrips: { $count: {} },
          uniquePorters: { $addToSet: '$porter' },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          totalCost: 1,
          totalTrips: 1,
          uniquePorters: { $size: '$uniquePorters' },
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    res.json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};
