import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import * as commuteCostController from '../controllers/commuteCost.controller.js';

const router = express.Router();

const createCommuteCostSchema = z.object({
  body: z.object({
    fromLocation: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid from location ID'),
    toLocation: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid to location ID'),
    carrier: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid carrier ID'),
    cost: z.number().min(0, 'Cost cannot be negative'),
    active: z.boolean().optional(),
  }),
});

const updateCommuteCostSchema = z.object({
  body: z.object({
    fromLocation: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    toLocation: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    carrier: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    cost: z.number().min(0).optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  }),
});

router.use(verifyToken);

router.get('/', commuteCostController.getAllCommuteCosts);
router.get('/find', commuteCostController.findCommuteCost);
router.get('/:id', commuteCostController.getCommuteCostById);
router.post('/', requireRole('Admin', 'Supervisor'), validate(createCommuteCostSchema), commuteCostController.createCommuteCost);
router.post('/upload', requireRole('Admin', 'Supervisor'), upload.single('file'), commuteCostController.uploadCSV);
router.put('/:id', requireRole('Admin', 'Supervisor'), validate(updateCommuteCostSchema), commuteCostController.updateCommuteCost);
router.delete('/:id', requireRole('Admin'), commuteCostController.deleteCommuteCost);

export default router;
