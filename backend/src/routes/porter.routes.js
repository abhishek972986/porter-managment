import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import * as porterController from '../controllers/porter.controller.js';

const router = express.Router();

const createPorterSchema = z.object({
  body: z.object({
    uid: z.string().min(1, 'UID is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    designation: z.string().optional(),
    active: z.boolean().optional(),
  }),
});

const updatePorterSchema = z.object({
  body: z.object({
    uid: z.string().optional(),
    name: z.string().min(2).optional(),
    designation: z.string().optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  }),
});

router.use(verifyToken);

router.get('/', porterController.getAllPorters);
router.get('/:id', porterController.getPorterById);
router.post('/', requireRole('Admin', 'Supervisor'), validate(createPorterSchema), porterController.createPorter);
router.put('/:id', requireRole('Admin', 'Supervisor'), validate(updatePorterSchema), porterController.updatePorter);
router.delete('/:id', requireRole('Admin'), porterController.deletePorter);

export default router;
