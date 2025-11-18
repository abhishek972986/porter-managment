import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { verifyToken } from '../middlewares/auth.js';
import * as payrollController from '../controllers/payroll.controller.js';

const router = express.Router();

const monthSchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (use YYYY-MM)'),
  }),
});

const monthRangeSchema = z.object({
  query: z.object({
    startMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid start month format'),
    endMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid end month format'),
  }),
});

router.use(verifyToken);

router.get('/', validate(monthSchema), payrollController.getMonthlyPayroll);
router.get('/summary', validate(monthRangeSchema), payrollController.getPayrollSummary);
router.get('/:porterId', validate(monthSchema), payrollController.getPorterPayroll);
router.patch('/:porterId/payment', payrollController.setPorterPaymentStatus);

export default router;
