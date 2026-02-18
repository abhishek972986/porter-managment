import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.resolve(__dirname, '../../templates/works.template.html');

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB');
};

const replacePlaceholder = (html, key, value) => {
  const placeholder = `{{${key}}}`;
  return html.replaceAll(placeholder, value ?? '');
};

export const generateWorksPdf = async (payload) => {
  let html = await fs.readFile(templatePath, 'utf-8');

  const formattedDate = formatDate(payload.date);

  html = replacePlaceholder(html, 'brigade', payload.brigade || '');
  html = replacePlaceholder(html, 'unitName', payload.unitName || '');
  html = replacePlaceholder(html, 'unit_name', payload.unitName || '');
  html = replacePlaceholder(html, 'financialYear', payload.financialYear || '');
  html = replacePlaceholder(html, 'brigadeName', payload.brigadeName || '');
  html = replacePlaceholder(html, 'letterNo', payload.letterNo || '');
  html = replacePlaceholder(html, 'date', formattedDate || '');
  html = replacePlaceholder(html, 'remarks', payload.remarks || '');

  let browser;
  const isLinux = process.platform === 'linux';
  
  if (isLinux) {
    // Production on Linux (Render/AWS) - use serverless chromium
    const puppeteerCore = (await import('puppeteer-core')).default;
    const chromium = (await import('@sparticuz/chromium')).default;
    
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local development (Windows/Mac) - use regular puppeteer
    const puppeteer = (await import('puppeteer')).default;
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};
