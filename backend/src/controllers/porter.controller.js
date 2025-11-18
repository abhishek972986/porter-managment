import Porter from '../models/Porter.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logActivity } from '../utils/activityLogger.js';

export const getAllPorters = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, active, search, field } = req.query;

    const filter = {};
    if (active !== undefined) filter.active = active === 'true';
    if (search) {
      const s = String(search);
      const f = field && ['name', 'uid', 'designation'].includes(field) ? field : undefined;
      if (f) {
        filter[f] = { $regex: s, $options: 'i' };
      } else {
        filter.$or = [
          { name: { $regex: s, $options: 'i' } },
          { uid: { $regex: s, $options: 'i' } },
          { designation: { $regex: s, $options: 'i' } },
        ];
      }
    }

    const porters = await Porter.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const count = await Porter.countDocuments(filter);

    res.json({
      success: true,
      data: {
        porters,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPorterById = async (req, res, next) => {
  try {
    const porter = await Porter.findById(req.params.id);

    if (!porter) {
      throw new AppError('Porter not found', 404);
    }

    res.json({
      success: true,
      data: { porter },
    });
  } catch (error) {
    next(error);
  }
};

export const createPorter = async (req, res, next) => {
  try {
    const porter = await Porter.create(req.body);

    await logActivity(
      'porter_created',
      `Porter ${porter.name} (${porter.uid}) was created`,
      req.user?._id,
      { porterId: porter._id, porterUid: porter.uid, porterName: porter.name }
    );

    res.status(201).json({
      success: true,
      message: 'Porter created successfully',
      data: { porter },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePorter = async (req, res, next) => {
  try {
    const porter = await Porter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!porter) {
      throw new AppError('Porter not found', 404);
    }

    await logActivity(
      'porter_updated',
      `Porter ${porter.name} (${porter.uid}) was updated`,
      req.user?._id,
      { porterId: porter._id, porterUid: porter.uid, porterName: porter.name }
    );

    res.json({
      success: true,
      message: 'Porter updated successfully',
      data: { porter },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePorter = async (req, res, next) => {
  try {
    const porter = await Porter.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!porter) {
      throw new AppError('Porter not found', 404);
    }

    res.json({
      success: true,
      message: 'Porter deactivated successfully',
      data: { porter },
    });
  } catch (error) {
    next(error);
  }
};
