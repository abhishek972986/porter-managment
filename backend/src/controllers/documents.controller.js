import { AppError } from '../middlewares/errorHandler.js';
import { generateWorksPdf } from '../utils/pdf/generateWorksPdf.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worksTemplatePath = path.resolve(__dirname, '../templates/works.template.html');

export const getPdfServiceHealth = async (req, res, next) => {
  try {
    await fs.access(worksTemplatePath);

    res.status(200).json({
      success: true,
      message: 'PDF service is ready',
      data: {
        template: 'works.template.html',
      },
    });
  } catch (error) {
    next(new AppError('PDF service is not ready: template missing', 503));
  }
};

export const generateDocumentPdf = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      throw new AppError('No data provided. Please send document form data in request body.', 400);
    }

    const generatedPdf = await generateWorksPdf(data);
    const pdfBuffer = Buffer.isBuffer(generatedPdf) ? generatedPdf : Buffer.from(generatedPdf);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new AppError('PDF generation returned an empty document.', 500);
    }

    const safeUnit = (data.unitName || 'unit').replace(/\s+/g, '-').toLowerCase();
    const fileName = `document-${safeUnit}-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    res.status(200).end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
