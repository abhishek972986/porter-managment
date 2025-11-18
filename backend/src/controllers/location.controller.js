import Location from '../models/Location.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logActivity } from '../utils/activityLogger.js';

export const getAllLocations = async (req, res, next) => {
  try {
    const { active, search } = req.query;
    const filter = {};
    if (active !== undefined) filter.active = active === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const locations = await Location.find(filter).sort({ code: 1 });

    res.json({
      success: true,
      data: { locations },
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    res.json({
      success: true,
      data: { location },
    });
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const location = await Location.create(req.body);

    await logActivity(
      'location_created',
      `Location ${location.name} (${location.code}) was added`,
      req.user?._id,
      { locationId: location._id, locationCode: location.code, locationName: location.name }
    );

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: { location },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    await logActivity(
      'location_updated',
      `Location ${location.name} (${location.code}) was updated`,
      req.user?._id,
      { locationId: location._id, locationCode: location.code, locationName: location.name }
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: { location },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    res.json({
      success: true,
      message: 'Location deactivated successfully',
      data: { location },
    });
  } catch (error) {
    next(error);
  }
};
