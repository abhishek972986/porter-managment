import Attendance from '../models/Attendance.js';
import CommuteCost from '../models/CommuteCost.js';
import { AppError } from '../middlewares/errorHandler.js';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { logActivity } from '../utils/activityLogger.js';

export const getAllAttendance = async (req, res, next) => {
  try {
    const { month, porterId, startDate, endDate, date, page = 1, limit = 100 } = req.query;

    const filter = {};

    // Filter by single date (YYYY-MM-DD format) - use local timezone
    if (date) {
      const d = parseISO(date);
      const localStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const localEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      filter.date = { $gte: localStart, $lte: localEnd };
    }
    // Filter by month (YYYY-MM format) - use local timezone
    else if (month) {
      const monthDate = parseISO(`${month}-01`);
      const year = monthDate.getFullYear();
      const mon = monthDate.getMonth();
      const localStart = new Date(year, mon, 1, 0, 0, 0, 0);
      const localEnd = new Date(year, mon + 1, 0, 23, 59, 59, 999);
      filter.date = { $gte: localStart, $lte: localEnd };
    }
    // Filter by date range - use local timezone
    else if (startDate && endDate) {
      const s = parseISO(startDate);
      const e = parseISO(endDate);
      const sLocal = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
      const eLocal = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
      filter.date = { $gte: sLocal, $lte: eLocal };
    }

    if (porterId) {
      filter.porter = porterId;
    }

    const attendance = await Attendance.find(filter)
      .populate('porter', 'uid name designation')
      .populate('carrier', 'name capacityKg')
      .populate('locationFrom', 'code name')
      .populate('locationTo', 'code name')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await Attendance.countDocuments(filter);

    res.json({
      success: true,
      data: {
        attendance,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('porter', 'uid name designation')
      .populate('carrier', 'name capacityKg')
      .populate('locationFrom', 'code name')
      .populate('locationTo', 'code name')
      .populate('createdBy', 'name email');

    if (!attendance) {
      throw new AppError('Attendance record not found', 404);
    }

    res.json({
      success: true,
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

export const createAttendance = async (req, res, next) => {
  try {
    const { carrier, locationFrom, locationTo, date, ...otherData } = req.body;

    // Parse date string (YYYY-MM-DD) and store as local midnight
    // This ensures the date stays the same regardless of timezone
    let normalizedDate = undefined;
    if (typeof date === 'string') {
      const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        const year = parseInt(m[1], 10);
        const month = parseInt(m[2], 10) - 1; // JS months are 0-indexed
        const day = parseInt(m[3], 10);
        // Create date in LOCAL timezone at midnight
        normalizedDate = new Date(year, month, day, 0, 0, 0, 0);
      } else {
        // Fallback for ISO datetime strings
        const dIn = new Date(date);
        normalizedDate = new Date(dIn.getFullYear(), dIn.getMonth(), dIn.getDate(), 0, 0, 0, 0);
      }
    } else if (date instanceof Date) {
      normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    }

    // Find the commute cost
    const commuteCost = await CommuteCost.findOne({
      carrier,
      fromLocation: locationFrom,
      toLocation: locationTo,
      active: true,
    });

    if (!commuteCost) {
      throw new AppError('Commute cost not found for this route and carrier', 404);
    }

    // Create attendance with computed cost snapshot
    const attendance = await Attendance.create({
      ...otherData,
      date: normalizedDate || date,
      carrier,
      locationFrom,
      locationTo,
      commuteCostId: commuteCost._id,
      computedCost: commuteCost.cost, // Store snapshot
      createdBy: req.user._id,
    });

    await attendance.populate([
      { path: 'porter', select: 'uid name designation' },
      { path: 'carrier', select: 'name capacityKg' },
      { path: 'locationFrom', select: 'code name' },
      { path: 'locationTo', select: 'code name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    await logActivity(
      'attendance_created',
      `New attendance entry for ${attendance.porter?.name || 'porter'}`,
      req.user._id,
      { 
        attendanceId: attendance._id, 
        porterName: attendance.porter?.name,
        carrierName: attendance.carrier?.name,
        fromLocation: attendance.locationFrom?.name,
        toLocation: attendance.locationTo?.name,
        cost: attendance.computedCost
      }
    );

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const { carrier, locationFrom, locationTo, date, ...otherData } = req.body;
    
    const updateData = { ...otherData };

    if (date) {
      // Normalize date updates to local midnight
      if (typeof date === 'string') {
        const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
          const year = parseInt(m[1], 10);
          const month = parseInt(m[2], 10) - 1;
          const day = parseInt(m[3], 10);
          updateData.date = new Date(year, month, day, 0, 0, 0, 0);
        } else {
          const dIn = new Date(date);
          updateData.date = new Date(dIn.getFullYear(), dIn.getMonth(), dIn.getDate(), 0, 0, 0, 0);
        }
      } else if (date instanceof Date) {
        updateData.date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      }
    }

    // If route or carrier changed, recalculate cost
    if (carrier || locationFrom || locationTo) {
      const existingAttendance = await Attendance.findById(req.params.id);
      
      if (!existingAttendance) {
        throw new AppError('Attendance record not found', 404);
      }

      const finalCarrier = carrier || existingAttendance.carrier;
      const finalFrom = locationFrom || existingAttendance.locationFrom;
      const finalTo = locationTo || existingAttendance.locationTo;

      const commuteCost = await CommuteCost.findOne({
        carrier: finalCarrier,
        fromLocation: finalFrom,
        toLocation: finalTo,
        active: true,
      });

      if (!commuteCost) {
        throw new AppError('Commute cost not found for this route and carrier', 404);
      }

      updateData.carrier = finalCarrier;
      updateData.locationFrom = finalFrom;
      updateData.locationTo = finalTo;
      updateData.commuteCostId = commuteCost._id;
      updateData.computedCost = commuteCost.cost;
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('porter', 'uid name designation')
      .populate('carrier', 'name capacityKg')
      .populate('locationFrom', 'code name')
      .populate('locationTo', 'code name')
      .populate('createdBy', 'name email');

    if (!attendance) {
      throw new AppError('Attendance record not found', 404);
    }

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      throw new AppError('Attendance record not found', 404);
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getCalendarData = async (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      throw new AppError('Month parameter is required (YYYY-MM)', 400);
    }

    const monthDate = parseISO(`${month}-01`);
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);

    // Aggregate attendance by date
    const calendarData = await Attendance.aggregate([
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
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'UTC' } },
          count: { $sum: 1 },
          porterCount: { $addToSet: '$porter' },
          totalCost: { $sum: '$computedCost' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
          porterCount: { $size: '$porterCount' },
          totalCost: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    // Convert to object format
    const calendar = {};
    calendarData.forEach((day) => {
      calendar[day.date] = {
        count: day.count,
        porterCount: day.porterCount,
        totalCost: day.totalCost,
      };
    });

    res.json({
      success: true,
      data: { calendar },
    });
  } catch (error) {
    next(error);
  }
};
