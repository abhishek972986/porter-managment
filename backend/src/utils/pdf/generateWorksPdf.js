import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

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

const fileExists = async (filePath) => {
  if (!filePath) return false;
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const resolveExecutablePath = async () => {
  const envExecutable =
    process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || process.env.GOOGLE_CHROME_BIN;

  if (await fileExists(envExecutable)) {
    return envExecutable;
  }

  const platformCandidates = process.platform === 'win32'
    ? [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      ]
    : [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
      ];

  for (const candidate of platformCandidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return undefined;
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

  const executablePath = await resolveExecutablePath();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(executablePath ? { executablePath } : {}),
  });

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
