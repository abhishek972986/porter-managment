const { generatePDF } = require('./pdf');

// Test data
const testData = {
  brigade: 'Brigade A',
  unitName: 'Unit Alpha',
  financialYear: '2025-26',
  brigadeName: 'Brigade Commander',
  letterNo: '508/Q/S&S/1',
  date: new Date().toLocaleDateString('en-GB'),
  remarks: 'Test document'
};

// Generate PDF
generatePDF(testData)
  .then(pdfBuffer => {
    console.log('✅ PDF Generated Successfully!');
    console.log(`📦 PDF Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`✅ Placeholders replaced successfully`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ PDF Generation Failed:', error.message);
    process.exit(1);
  });
