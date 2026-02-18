import express from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { verifyToken } from '../middlewares/auth.js';
import { generateDocumentPdf, getPdfServiceHealth } from '../controllers/documents.controller.js';

const router = express.Router();

const generatePdfSchema = z.object({
  body: z.object({
    brigade: z.string().min(1, 'Brigade is required'),
    unitName: z.string().min(1, 'Unit name is required'),
    financialYear: z.string().min(1, 'Financial year is required'),
    brigadeName: z.string().min(1, 'Brigade group is required'),
    letterNo: z.string().min(1, 'Letter number is required'),
    date: z.string().min(1, 'Date is required'),
    remarks: z.string().optional().default(''),
  }),
});

router.get('/health', getPdfServiceHealth);

router.use(verifyToken);
router.post('/generate-pdf', validate(generatePdfSchema), generateDocumentPdf);

export default router;
