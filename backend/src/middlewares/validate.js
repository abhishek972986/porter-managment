import { z } from 'zod';
import logger from '../utils/logger.js';

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      logger.error('Validation error:', error);

      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  };
};

// Common validation schemas
export const schemas = {
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  
  pagination: z.object({
    query: z.object({
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    }),
  }),

  dateRange: z.object({
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),

  month: z.object({
    query: z.object({
      month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (use YYYY-MM)'),
    }),
  }),
};
