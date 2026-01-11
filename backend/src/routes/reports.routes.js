import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { verifyToken } from '../middlewares/auth.js';
import * as reportsController from '../controllers/reports.controller.js';

const router = express.Router();

const monthSchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (use YYYY-MM)'),
  }),
});

router.use(verifyToken);

router.get('/generate', validate(monthSchema), reportsController.generateMonthlyReport);
router.get('/dashboard', reportsController.getDashboardStats);
router.get('/porter-nominal-roll', validate(monthSchema), reportsController.downloadNominalRoll);

export default router;
