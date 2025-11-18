import Carrier from '../models/Carrier.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logActivity } from '../utils/activityLogger.js';

export const getAllCarriers = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) filter.active = active === 'true';

    const carriers = await Carrier.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      data: { carriers },
    });
  } catch (error) {
    next(error);
  }
};

export const getCarrierById = async (req, res, next) => {
  try {
    const carrier = await Carrier.findById(req.params.id);

    if (!carrier) {
      throw new AppError('Carrier not found', 404);
    }

    res.json({
      success: true,
      data: { carrier },
    });
  } catch (error) {
    next(error);
  }
};

export const createCarrier = async (req, res, next) => {
  try {
    const carrier = await Carrier.create(req.body);

    await logActivity(
      'carrier_created',
      `Carrier type "${carrier.name}" was added`,
      req.user?._id,
      { carrierId: carrier._id, carrierName: carrier.name, capacity: carrier.capacityKg }
    );

    res.status(201).json({
      success: true,
      message: 'Carrier created successfully',
      data: { carrier },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCarrier = async (req, res, next) => {
  try {
    const carrier = await Carrier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!carrier) {
      throw new AppError('Carrier not found', 404);
    }

    await logActivity(
      'carrier_updated',
      `Carrier type "${carrier.name}" was updated`,
      req.user?._id,
      { carrierId: carrier._id, carrierName: carrier.name, capacity: carrier.capacityKg }
    );

    res.json({
      success: true,
      message: 'Carrier updated successfully',
      data: { carrier },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCarrier = async (req, res, next) => {
  try {
    const carrier = await Carrier.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!carrier) {
      throw new AppError('Carrier not found', 404);
    }

    res.json({
      success: true,
      message: 'Carrier deactivated successfully',
      data: { carrier },
    });
  } catch (error) {
    next(error);
  }
};
