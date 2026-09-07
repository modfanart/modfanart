const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const inputFile = './src/scripts/data/dev-log.xlsx';
const outputFile = './output.json';

if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

try {
  const workbook = XLSX.readFile(inputFile);

  const result = {};

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    result[sheetName] = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: true,
    });
  });

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

  console.log('Excel → JSON conversion successful!');
  console.log(`Input: ${path.resolve(inputFile)}`);
  console.log(`Output: ${path.resolve(outputFile)}`);
  console.log(`Sheets: ${workbook.SheetNames.length}`);

  workbook.SheetNames.forEach((sheetName) => {
    console.log(`✓ ${sheetName}: ${result[sheetName].length} rows`);
  });
} catch (error) {
  console.error('Failed to convert Excel file:');
  console.error(error.message);
  process.exit(1);
}
