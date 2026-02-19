/**
 * PDF Generator Module
 * Read HTML template from /templates
 * Replace {{placeholders}} with data from JSON
 * Generate a PDF using Puppeteer
 * Return PDF buffer
 * Keep layout identical to original PDF
 */

const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Generate PDF from template with dynamic data
 * @param {Object} data - Key-value pairs for placeholder replacement
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generatePDF(data) {
  try {
    // Read the HTML template (works.html with placeholders)
    const templatePath = path.join(__dirname, 'templates', 'works.template.html');
    let html = await fs.readFile(templatePath, 'utf-8');

    // Format date if provided
    let prettyDate = '';
    if (data.date) {
      const d = new Date(data.date);
      prettyDate = d.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    }

    // Replace all {{key}} placeholders using Object.entries()
    html = html.replaceAll('{{brigade}}', data.brigade || '');
    html = html.replaceAll('{{unitName}}', data.unitName || '');
    html = html.replaceAll('{{financialYear}}', data.financialYear || '');
    html = html.replaceAll('{{brigadeName}}', data.brigadeName || '');
    html = html.replaceAll('{{letterNo}}', data.letterNo || '');
    html = html.replaceAll('{{date}}', prettyDate || '');
    html = html.replaceAll('{{remarks}}', data.remarks || '');

    // Launch Puppeteer to generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Use system Chrome
    });

    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF with A4 format and background graphics enabled
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
}

module.exports = { generatePDF };
