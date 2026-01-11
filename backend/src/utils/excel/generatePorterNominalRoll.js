import ExcelJS from 'exceljs';

export async function generatePorterExcel(data, month) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Nominal Roll');

  // Title
  sheet.mergeCells('A1:H1');
  sheet.getCell('A1').value = `NOMINAL ROLL OF PORTER MONTH OF ${month.toUpperCase()}`;
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  // Headers (row 2)
  const headerRow = [
    'S No',
    'Account No',
    'Name of Porter',
    'Father Name',
    'No of Days',
    'Per Day Rate',
    'Total Amount',
    'Remarks',
  ];

  sheet.addRow([]);
  const r = sheet.addRow(headerRow);
  r.font = { bold: true };

  // Data rows
  data.forEach((p, idx) => {
    const total = (p.totalAmount || 0);
    const days = p.daysWorked || 0;
    const perDay = p.perDayRate || (days ? Math.round(total / days) : 0);
    sheet.addRow([
      idx + 1,
      p.accountNo || p.porterUid || '',
      p.name || p.porterName || '',
      p.fatherName || '',
      days,
      perDay,
      total,
      '',
    ]);
  });

  // Apply borders and widths
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  sheet.columns.forEach((col) => (col.width = 20));

  return workbook;
}
