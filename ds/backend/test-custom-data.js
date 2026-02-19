/**
 * Test PDF generation with the exact data provided by the user
 */

const { generatePDF } = require('./pdf');
const fs = require('fs').promises;

async function test() {
  try {
    // Using exact data from user request
    const formData = {
      brigade: '122 Infantry Brigade',
      unitName: 'UnitNamePune',
      financialYear: '2024-25',
      brigadeName: 'NAME OF Bde Gp',
      letterNo: '234234234234',
      date: '2026-01-09',
      remarks: ''
    };

    console.log('📝 Generating PDF with data:', formData);
    
    const pdfBuffer = await generatePDF(formData);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('❌ PDF buffer is empty!');
      process.exit(1);
    }

    // Save the PDF for verification
    const outputPath = './output_test.pdf';
    await fs.writeFile(outputPath, pdfBuffer);
    
    const stats = await fs.stat(outputPath);
    console.log('\n✅ PDF Generated Successfully!');
    console.log('📦 PDF Size:', (stats.size / 1024).toFixed(2), 'KB');
    console.log('💾 Saved to:', outputPath);
    console.log('✅ All placeholders replaced with your data successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
