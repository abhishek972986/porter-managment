/**
 * Express server
 * POST /generate-pdf
 * Accept JSON from frontend form
 * Call pdf.js
 * Send generated PDF as downloadable response
 */

const express = require('express');
const cors = require('cors');
const { generatePDF } = require('./pdf');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'PDF Generator API is running' });
});

/**
 * PDF Generation endpoint
 * POST /generate-pdf
 * Body: { brigade, unitName, financialYear, brigadeName, letterNo, date, remarks }
 */
app.post('/generate-pdf', async (req, res) => {
  try {
    const data = req.body;

    // Validate that we have some data
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        error: 'No data provided. Please send form data in request body.'
      });
    }

    console.log('Generating PDF with data:', data);

    // Generate PDF
    const generatedPdf = await generatePDF(data);
    const pdfBuffer = Buffer.isBuffer(generatedPdf) ? generatedPdf : Buffer.from(generatedPdf);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(500).json({
        error: 'PDF generation failed',
        message: 'Generated PDF is empty'
      });
    }

    // Set headers for PDF download
    const fileName = `document-${(data.unitName || 'unit').replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Send PDF
    res.status(200).end(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PDF Generator API running on http://localhost:${PORT}`);
  console.log(`📄 POST to http://localhost:${PORT}/generate-pdf to generate PDFs`);
});

module.exports = app;
