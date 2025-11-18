import CommuteCost from '../models/CommuteCost.js';
import { AppError } from '../middlewares/errorHandler.js';
import csv from 'csv-parser';
import fs from 'fs';
import Location from '../models/Location.js';
import Carrier from '../models/Carrier.js';
import { logActivity } from '../utils/activityLogger.js';

export const getAllCommuteCosts = async (req, res, next) => {
  try {
    const { from, to, carrier, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (from) filter.fromLocation = from;
    if (to) filter.toLocation = to;
    if (carrier) filter.carrier = carrier;

    const commuteCosts = await CommuteCost.find(filter)
      .populate('fromLocation', 'code name')
      .populate('toLocation', 'code name')
      .populate('carrier', 'name capacityKg')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ fromLocation: 1, toLocation: 1 });

    const count = await CommuteCost.countDocuments(filter);

    res.json({
      success: true,
      data: {
        commuteCosts,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCommuteCostById = async (req, res, next) => {
  try {
    const commuteCost = await CommuteCost.findById(req.params.id)
      .populate('fromLocation', 'code name')
      .populate('toLocation', 'code name')
      .populate('carrier', 'name capacityKg');

    if (!commuteCost) {
      throw new AppError('Commute cost not found', 404);
    }

    res.json({
      success: true,
      data: { commuteCost },
    });
  } catch (error) {
    next(error);
  }
};

export const createCommuteCost = async (req, res, next) => {
  try {
    const commuteCost = await CommuteCost.create(req.body);
    
    await commuteCost.populate([
      { path: 'fromLocation', select: 'code name' },
      { path: 'toLocation', select: 'code name' },
      { path: 'carrier', select: 'name capacityKg' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Commute cost created successfully',
      data: { commuteCost },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCommuteCost = async (req, res, next) => {
  try {
    const commuteCost = await CommuteCost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('fromLocation', 'code name')
      .populate('toLocation', 'code name')
      .populate('carrier', 'name capacityKg');

    if (!commuteCost) {
      throw new AppError('Commute cost not found', 404);
    }

    res.json({
      success: true,
      message: 'Commute cost updated successfully',
      data: { commuteCost },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCommuteCost = async (req, res, next) => {
  try {
    const commuteCost = await CommuteCost.findByIdAndDelete(req.params.id);

    if (!commuteCost) {
      throw new AppError('Commute cost not found', 404);
    }

    res.json({
      success: true,
      message: 'Commute cost deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('CSV file is required', 400);
    }

    const results = [];
    const errors = [];

    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let successCount = 0;
          let errorCount = 0;

          for (const row of results) {
            try {
              // Find location and carrier IDs
              const fromLocation = await Location.findOne({ code: row.fromLocationCode?.toUpperCase() });
              const toLocation = await Location.findOne({ code: row.toLocationCode?.toUpperCase() });
              const carrier = await Carrier.findOne({ name: row.carrierName?.toLowerCase() });

              if (!fromLocation || !toLocation || !carrier) {
                errors.push({
                  row,
                  error: 'Location or carrier not found',
                });
                errorCount++;
                continue;
              }

              // Create or update commute cost
              await CommuteCost.findOneAndUpdate(
                {
                  fromLocation: fromLocation._id,
                  toLocation: toLocation._id,
                  carrier: carrier._id,
                },
                {
                  fromLocation: fromLocation._id,
                  toLocation: toLocation._id,
                  carrier: carrier._id,
                  cost: parseFloat(row.cost),
                },
                { upsert: true, new: true }
              );

              successCount++;
            } catch (err) {
              errors.push({
                row,
                error: err.message,
              });
              errorCount++;
            }
          }

          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            message: 'CSV upload completed',
            data: {
              successCount,
              errorCount,
              errors: errors.slice(0, 10), // Return first 10 errors
            },
          });
        } catch (error) {
          next(error);
        }
      })
      .on('error', (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

export const findCommuteCost = async (req, res, next) => {
  try {
    const { fromLocationId, toLocationId, carrierId } = req.query;

    if (!fromLocationId || !toLocationId || !carrierId) {
      throw new AppError('All parameters are required', 400);
    }

    const commuteCost = await CommuteCost.findOne({
      fromLocation: fromLocationId,
      toLocation: toLocationId,
      carrier: carrierId,
      active: true,
    })
      .populate('fromLocation', 'code name')
      .populate('toLocation', 'code name')
      .populate('carrier', 'name capacityKg');

    if (!commuteCost) {
      return res.json({
        success: true,
        data: { commuteCost: null },
      });
    }

    res.json({
      success: true,
      data: { commuteCost },
    });
  } catch (error) {
    next(error);
  }
};
