import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';
import * as attendanceController from '../controllers/attendance.controller.js';

const router = express.Router();

const createAttendanceSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Invalid date format (expected YYYY-MM-DD or ISO datetime)'),
    carrier: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid carrier ID'),
    porter: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid porter ID'),
    locationFrom: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid from location ID'),
    locationTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid to location ID'),
    task: z.string().optional(),
  }),
});

const updateAttendanceSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Invalid date format').optional(),
    carrier: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    porter: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    locationFrom: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    locationTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    task: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  }),
});

router.use(verifyToken);

router.get('/', attendanceController.getAllAttendance);
router.get('/calendar', attendanceController.getCalendarData);
router.get('/:id', attendanceController.getAttendanceById);
router.post('/', requireRole('Admin', 'Supervisor'), validate(createAttendanceSchema), attendanceController.createAttendance);
router.put('/:id', requireRole('Admin', 'Supervisor'), validate(updateAttendanceSchema), attendanceController.updateAttendance);
router.delete('/:id', requireRole('Admin'), attendanceController.deleteAttendance);

export default router;
