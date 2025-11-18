import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import * as carrierController from '../controllers/carrier.controller.js';

const router = express.Router();

const createCarrierSchema = z.object({
  body: z.object({
    name: z.enum(['porter', 'small-donkey', 'pickup-truck']),
    capacityKg: z.number().min(0, 'Capacity cannot be negative'),
    active: z.boolean().optional(),
  }),
});

const updateCarrierSchema = z.object({
  body: z.object({
    name: z.enum(['porter', 'small-donkey', 'pickup-truck']).optional(),
    capacityKg: z.number().min(0).optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  }),
});

router.use(verifyToken);

router.get('/', carrierController.getAllCarriers);
router.get('/:id', carrierController.getCarrierById);
router.post('/', requireRole('Admin'), validate(createCarrierSchema), carrierController.createCarrier);
router.put('/:id', requireRole('Admin'), validate(updateCarrierSchema), carrierController.updateCarrier);
router.delete('/:id', requireRole('Admin'), carrierController.deleteCarrier);

export default router;
