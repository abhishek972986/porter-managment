import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import * as locationController from '../controllers/location.controller.js';

const router = express.Router();

const createLocationSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required').toUpperCase(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    active: z.boolean().optional(),
  }),
});

const updateLocationSchema = z.object({
  body: z.object({
    code: z.string().toUpperCase().optional(),
    name: z.string().min(2).optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  }),
});

router.use(verifyToken);

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.post('/', requireRole('Admin', 'Supervisor'), validate(createLocationSchema), locationController.createLocation);
router.put('/:id', requireRole('Admin', 'Supervisor'), validate(updateLocationSchema), locationController.updateLocation);
router.delete('/:id', requireRole('Admin'), locationController.deleteLocation);

export default router;
